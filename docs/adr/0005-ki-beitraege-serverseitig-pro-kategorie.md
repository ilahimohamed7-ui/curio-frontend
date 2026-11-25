# 0005 – KI-Beiträge serverseitig und pro Kategorie

Status: angenommen · November 2026

## Kontext

Nutzer sollen täglich neue Beiträge zu ihren gewählten Themen sehen. Die Texte
erzeugt ein Sprachmodell (Google Gemini). Dabei waren vier Fragen zu klären:
wo der API-Schlüssel liegt, wann erzeugt wird, für wen erzeugt wird und wie man
mit Ausfällen und falschen Antworten umgeht.

## Entscheidung

**Wo:** Gemini wird nur aus einer Supabase Edge Function aufgerufen. Der
Schlüssel liegt als Secret in Supabase. Alles, was im Angular-Bundle steht, ist
für jeden lesbar. Ein Schlüssel im Frontend wäre also öffentlich.

**Wann:** Einmal täglich um 05:00 UTC über `pg_cron`. Die Funktion merkt sich
nichts, prüft aber vor dem Erzeugen, ob für die Kategorie heute schon Beiträge
existieren. Ein doppelter Aufruf erzeugt deshalb keine doppelten Beiträge.

**Für wen:** Pro Kategorie, nicht pro Nutzer. Jede Kategorie bekommt fünf
Beiträge am Tag; jeder Nutzer sieht die Kategorien, die er gewählt hat. Die
Zahl der Modellaufrufe bleibt damit bei drei pro Tag, egal wie viele Nutzer es
gibt, und der Feed lädt ohne Wartezeit.

**Wie mit Fehlern umgegangen wird:**

- Gemini bekommt ein JSON-Schema vorgegeben (Structured Output). Die Antwort
  wird trotzdem geprüft: Pflichtfelder, Maximallängen, keine Titel, die es
  schon gab.
- Bei Überlastung (HTTP 429, 5xx) oder Zeitüberschreitung wird nach kurzer
  Wartezeit erneut versucht, danach auf ein kleineres Ersatzmodell
  ausgewichen. Fehler wie 400 oder 403 werden nicht wiederholt, weil ein
  zweiter Versuch daran nichts ändert.
- Die drei Kategorien laufen parallel. Beim ersten Test liefen sie
  nacheinander und überschritten mit den Wiederholungen das Laufzeitlimit der
  Edge Function (HTTP 546).
- Jeder erzeugte Beitrag ist in der Datenbank (`ai_generated`) und im Feed
  ("KI-generiert") gekennzeichnet.

## Alternativen

- **Erzeugen beim Öffnen des Feeds, pro Nutzer.** Persönlicher, aber jeder
  Seitenaufruf würde Sekunden warten und Kosten verursachen. Bei Überlastung
  des Modells wäre der Feed leer.
- **Button "Neue Beiträge erzeugen".** Gut für eine Demo, aber angreifbar
  (Kosten durch wiederholtes Klicken) und für den eigentlichen Zweck nicht
  nötig.

## Konsequenzen

- Inhalte können sachlich falsch sein. Halluzinationen sind bei Sprachmodellen
  gut dokumentiert (Ji et al., 2023). Der Prompt verlangt belegte Fakten und
  eine Quelle, prüft sie aber nicht. Die Kennzeichnung im Feed macht das für
  Nutzer sichtbar und orientiert sich an den Transparenzpflichten für
  KI-erzeugte Inhalte in Art. 50 der EU-KI-Verordnung.
- Wiederholung mit wachsender Wartezeit ist ein etabliertes Muster gegen
  Überlast (Google SRE Book; Brooker, 2015). Ein Zufallsanteil (Jitter) fehlt
  noch. Bei einem Aufruf pro Tag spielt das keine Rolle, bei vielen
  gleichzeitigen Aufrufern schon.
- Alle Nutzer mit gleichem Interesse sehen dieselben Beiträge. Echte
  Personalisierung wäre ein eigener Schritt.

## Quellen

- Gemini API: Structured output, <https://ai.google.dev/gemini-api/docs/structured-output>
- Supabase: Scheduling Edge Functions, <https://supabase.com/docs/guides/functions/schedule-functions>
- Supabase: Edge Function Limits, <https://supabase.com/docs/guides/functions/limits>
- OWASP: Secrets Management Cheat Sheet,
  <https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html>
- Z. Ji et al. (2023): Survey of Hallucination in Natural Language Generation.
  ACM Computing Surveys 55(12). <https://doi.org/10.1145/3571730>
- Google SRE Book, Kap. 22: Addressing Cascading Failures,
  <https://sre.google/sre-book/addressing-cascading-failures/>
- M. Brooker (2015): Exponential Backoff and Jitter. AWS Architecture Blog,
  <https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/>
- Verordnung (EU) 2024/1689 (KI-Verordnung), Art. 50,
  <https://eur-lex.europa.eu/eli/reg/2024/1689/oj>
