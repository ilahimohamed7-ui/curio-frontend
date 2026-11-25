// Supabase Edge Function: erzeugt täglich neue Wissensbeiträge mit Gemini.
//
// Ablauf pro Kategorie:
//   1. Prüfen, ob heute schon KI-Beiträge erzeugt wurden (dann überspringen)
//   2. Titel der letzten Beiträge laden, damit Gemini keine Themen wiederholt
//   3. Gemini um N neue Beiträge als JSON bitten (strukturierte Ausgabe)
//   4. Antwort prüfen und in die Tabelle `posts` schreiben
//
// Aufruf: täglich per pg_cron (siehe Migration ..._ai_generated_posts.sql).
// Geschützt durch den Header `x-cron-secret`, damit niemand Fremdes
// auf deine Kosten Beiträge erzeugen kann.
//
// Benötigte Secrets (Supabase → Edge Functions → Secrets):
//   GEMINI_API_KEY      API-Schlüssel aus Google AI Studio
//   CRON_SECRET         beliebige lange Zufallszeichenfolge
// Optional:
//   GEMINI_MODEL           Standard: gemini-flash-latest
//   GEMINI_FALLBACK_MODEL  Standard: gemini-flash-lite-latest
//   POSTS_PER_CATEGORY     Standard: 5
//
// SUPABASE_URL und SUPABASE_SECRET_KEYS stellt Supabase automatisch bereit
// (Fallback für ältere Projekte: SUPABASE_SERVICE_ROLE_KEY).

import { createClient } from 'npm:@supabase/supabase-js@2';

const CATEGORIES = ['Wissenschaft', 'Technologie', 'Psychologie'] as const;
type Category = (typeof CATEGORIES)[number];

const COLORS = ['purple', 'blue', 'orange'] as const;
type Color = (typeof COLORS)[number];

const CATEGORY_HINTS: Record<Category, string> = {
  Wissenschaft: 'Physik, Biologie, Chemie, Astronomie, Geologie, Medizin',
  Technologie: 'Informatik, Internet, KI, Erfindungen, Technikgeschichte, Ingenieurwesen',
  Psychologie: 'Lernen, Gedächtnis, Wahrnehmung, Verhalten, Emotionen, Denkfehler'
};

interface GeneratedPost {
  title: string;
  description: string;
  source: string;
  emoji: string;
}

/** Relevanter Ausschnitt der Antwort von generateContent. */
interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

const env = (name: string, fallback?: string): string => {
  const value = Deno.env.get(name) ?? fallback;
  if (!value) throw new Error(`Secret ${name} fehlt.`);
  return value;
};

/**
 * Server-Schlüssel mit Schreibrechten. Bevorzugt die neuen Secret Keys
 * (JSON-Objekt, z. B. {"default": "sb_secret_..."}), sonst den alten
 * Service-Role-Key.
 */
function serverKey(): string {
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string, string>;
    const key = keys['default'] ?? Object.values(keys)[0];
    if (key) return key;
  } catch {
    // ungültiges JSON → Fallback
  }
  return env('SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(env('SUPABASE_URL'), serverKey(), {
  auth: { persistSession: false }
});

/** Statuscodes, bei denen sich ein erneuter Versuch lohnt. */
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS_PER_MODEL = 2;
/** Abbruch einer einzelnen Gemini-Anfrage, damit das Laufzeitlimit hält. */
const REQUEST_TIMEOUT_MS = 30_000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

Deno.serve(async request => {
  if (request.headers.get('x-cron-secret') !== env('CRON_SECRET')) {
    return json({ error: 'Nicht autorisiert.' }, 401);
  }

  const force = new URL(request.url).searchParams.get('force') === 'true';

  // Kategorien parallel verarbeiten: Die Gesamtdauer entspricht der
  // langsamsten Kategorie statt der Summe (wichtig für das Laufzeitlimit).
  const settled = await Promise.allSettled(
    CATEGORIES.map(category => generateForCategory(category, force))
  );

  const results: Record<string, string> = {};
  settled.forEach((outcome, index) => {
    const category = CATEGORIES[index];
    if (outcome.status === 'fulfilled') {
      results[category] = outcome.value;
    } else {
      console.error(`Fehler bei ${category}:`, outcome.reason);
      const reason = outcome.reason;
      results[category] = `Fehler: ${reason instanceof Error ? reason.message : String(reason)}`;
    }
  });

  return json({ results });
});

async function generateForCategory(category: Category, force: boolean): Promise<string> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  if (!force) {
    const { count, error } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('category', category)
      .eq('ai_generated', true)
      .gte('created_at', startOfDay.toISOString());

    if (error) throw error;
    if ((count ?? 0) > 0) return 'Heute bereits erzeugt – übersprungen.';
  }

  const { data: recent, error: recentError } = await supabase
    .from('posts')
    .select('title')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(50);

  if (recentError) throw recentError;

  const count = Number(env('POSTS_PER_CATEGORY', '5'));
  const generated = await askGemini(category, count, (recent ?? []).map(r => r.title));
  const rows = generated.map((post, index) => ({
    category,
    title: post.title,
    description: post.description,
    source: post.source,
    emoji: post.emoji,
    color: COLORS[index % COLORS.length] satisfies Color,
    ai_generated: true
  }));

  if (rows.length === 0) return 'Gemini hat keine gültigen Beiträge geliefert.';

  const { error: insertError } = await supabase.from('posts').insert(rows);
  if (insertError) throw insertError;

  return `${rows.length} Beiträge erzeugt.`;
}

async function askGemini(
  category: Category,
  count: number,
  avoidTitles: string[]
): Promise<GeneratedPost[]> {
  const prompt = [
    `Erzeuge ${count} kurze, überraschende und sachlich korrekte Wissensfakten zur Kategorie "${category}" (z. B. ${CATEGORY_HINTS[category]}).`,
    'Zielgruppe: neugierige Erwachsene in einer Wissens-App. Sprache: Deutsch, du-Form vermeiden, sachlich-lebendig.',
    'Regeln:',
    '- title: höchstens 70 Zeichen, neugierig machend, keine Clickbait-Übertreibung',
    '- description: 2 bis 3 Sätze, höchstens 300 Zeichen, erklärt den Fakt verständlich',
    '- source: eine reale, seriöse Quelle oder Institution (z. B. NASA, Max-Planck-Gesellschaft, Fachbuch). Nichts erfinden.',
    '- emoji: genau ein passendes Emoji',
    '- Nur gut belegte Fakten. Bei Unsicherheit einen anderen Fakt wählen.',
    avoidTitles.length > 0
      ? `Diese Themen gab es schon, bitte nicht wiederholen:\n${avoidTitles.map(t => `- ${t}`).join('\n')}`
      : ''
  ].join('\n');

  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            description: { type: 'STRING' },
            source: { type: 'STRING' },
            emoji: { type: 'STRING' }
          },
          required: ['title', 'description', 'source', 'emoji']
        }
      }
    }
  });

  const data = await callGeminiWithRetry(body);
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Leere Antwort von Gemini.');

  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Antwort von Gemini ist keine Liste.');

  const known = new Set(avoidTitles.map(t => t.toLowerCase()));
  return parsed.filter(isValidPost).filter(post => !known.has(post.title.toLowerCase()));
}

/**
 * Ruft Gemini robust auf: Bei Überlastung (429/5xx) oder Zeitüberschreitung
 * wird nach kurzer Wartezeit erneut versucht. Bleibt das Hauptmodell
 * überlastet, wird auf ein Ersatzmodell ausgewichen.
 */
async function callGeminiWithRetry(body: string): Promise<GeminiResponse> {
  const models = [
    env('GEMINI_MODEL', 'gemini-flash-latest'),
    env('GEMINI_FALLBACK_MODEL', 'gemini-flash-lite-latest')
  ];
  let lastError = '';

  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env('GEMINI_API_KEY')
          },
          body,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        }
      ).catch((error: unknown) => {
        // Zeitüberschreitung oder Netzwerkfehler wie eine Überlastung behandeln.
        console.warn(`${model}: Anfrage abgebrochen`, error);
        return new Response(String(error), { status: 504 });
      });

      if (response.ok) return (await response.json()) as GeminiResponse;

      lastError = `${model} antwortete mit ${response.status}: ${await response.text()}`;

      if (!RETRYABLE_STATUS.has(response.status)) {
        // z. B. 400 (ungültige Anfrage) oder 403 (Schlüssel): Wiederholen hilft nicht.
        throw new Error(lastError);
      }

      console.warn(`Versuch ${attempt} fehlgeschlagen: ${lastError}`);
      if (attempt < MAX_ATTEMPTS_PER_MODEL) {
        await sleep(1000 * 2 ** (attempt - 1));
      }
    }
  }

  throw new Error(`Gemini ist derzeit nicht erreichbar. Letzter Fehler: ${lastError}`);
}

/** Prüft die KI-Antwort, bevor sie in die Datenbank geschrieben wird. */
function isValidPost(value: unknown): value is GeneratedPost {
  if (typeof value !== 'object' || value === null) return false;
  const post = value as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof post[key] === 'string' &&
    (post[key] as string).trim().length > 0 &&
    (post[key] as string).length <= max;

  return text('title', 120) && text('description', 500) && text('source', 150) && text('emoji', 16);
}
