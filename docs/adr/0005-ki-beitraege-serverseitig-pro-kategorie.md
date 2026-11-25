# ADR 5: KI-Beiträge serverseitig und pro Kategorie

Status: angenommen

## Kontext

Nutzer sollen jeden Tag neue Beiträge zu ihren Themen sehen. Die Texte erzeugt
Gemini. Der API-Schlüssel darf nicht ins Frontend, weil dort alles öffentlich
lesbar ist.

## Entscheidung

Eine Supabase Edge Function ruft Gemini einmal täglich über `pg_cron` auf und
erzeugt fünf Beiträge pro Kategorie, nicht pro Nutzer. Bei Überlastung
versucht sie es erneut und weicht auf ein kleineres Modell aus. Die Antwort
wird vor dem Speichern geprüft, und jeder Beitrag ist als "KI-generiert"
markiert.

## Folgen

Die Kosten hängen nicht von der Zahl der Nutzer ab, und der Feed lädt ohne
Wartezeit. Alle Nutzer mit gleichem Interesse sehen dieselben Beiträge.
Sprachmodelle können falsche Fakten erzeugen, eine Prüfung der Inhalte fehlt
noch.

Quellen: <https://ai.google.dev/gemini-api/docs/structured-output>,
<https://supabase.com/docs/guides/functions/schedule-functions>,
Ji et al. (2023), Survey of Hallucination in Natural Language Generation
<https://doi.org/10.1145/3571730>
