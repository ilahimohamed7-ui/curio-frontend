# ADR 1: Supabase statt eigenem Backend

Status: angenommen

## Kontext

Curio braucht Login, eine Datenbank und einen Ort für serverseitigen Code. Der
Schwerpunkt des Projekts ist das Angular-Frontend, und ich arbeite allein daran.

## Entscheidung

Ich nutze Supabase für Auth, PostgreSQL und Edge Functions. Einen eigenen
Server mit Spring Boot oder NestJS baue ich nicht.

## Folgen

Login und Datenbank waren schnell verfügbar, das Schema liegt trotzdem als
SQL-Migrationen im Repo. Dafür hänge ich von Supabase und dessen Limits ab.
Sollte später ein eigenes Backend nötig werden, kann es hinter dem bestehenden
Repository (ADR 4) eingebaut werden.

Quelle: <https://supabase.com/docs/guides/getting-started/architecture>
