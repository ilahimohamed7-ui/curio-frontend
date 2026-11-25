# ADR 6: Zugriffsschutz über RLS

Status: angenommen

## Kontext

Die App spricht ohne eigenen Server mit der Datenbank. Prüfungen im Browser
lassen sich umgehen und schützen deshalb keine Daten.

## Entscheidung

Der Zugriff wird in PostgreSQL mit Row Level Security geregelt. Nutzer sehen
und ändern nur ihre eigenen Interessen. Beiträge dürfen sie lesen, schreiben
darf nur die Edge Function.

## Folgen

Auch ein Fehler im Frontend gibt keine fremden Daten frei. Die Regeln liegen
als SQL im Repo. Automatische Tests für die Regeln gibt es noch nicht.

Quelle: <https://supabase.com/docs/guides/database/postgres/row-level-security>
