# 0006 – Zugriffsschutz in der Datenbank (RLS)

Status: angenommen · Oktober 2026

## Kontext

Die Angular-App spricht direkt mit der Datenbank, ohne Server dazwischen. Sie
läuft im Browser des Nutzers. Wer will, kann jede Anfrage verändern oder selbst
schreiben. Prüfungen im Frontend (Guards, Formularvalidierung, deaktivierte
Buttons) helfen der Bedienung, schützen aber keine Daten.

## Entscheidung

Der Zugriffsschutz liegt in PostgreSQL, über Row Level Security:

| Tabelle | Lesen | Schreiben |
| --- | --- | --- |
| `posts` | angemeldete Nutzer | niemand aus dem Browser; nur die Edge Function mit Server-Schlüssel |
| `user_interests` | nur Zeilen mit `user_id = auth.uid()` | ebenso |

Interessen werden über die Datenbankfunktion `save_user_interests()`
gespeichert. Sie läuft mit den Rechten des aufrufenden Nutzers
(`SECURITY INVOKER`), prüft die Kategorien serverseitig und ersetzt die alte
Auswahl in einem Schritt. Ein halb gespeicherter Zustand ist damit nicht
möglich.

Im Frontend steht nur der Publishable Key, der laut Supabase für den Browser
vorgesehen ist, wenn RLS aktiv ist.

## Alternativen

- **Eigene API als Türsteher.** Üblicher Weg in klassischen Architekturen,
  bedeutet aber einen weiteren Dienst, der betrieben und abgesichert werden
  muss (siehe ADR 0001).
- **Prüfung nur im Frontend.** Nicht sicher, siehe Kontext.

## Konsequenzen

- Selbst bei einem Fehler im Frontend kann kein Nutzer fremde Interessen lesen
  oder Beiträge anlegen.
- Die Regeln stehen als SQL in den Migrationen und sind damit versioniert und
  im Review sichtbar.
- RLS-Regeln werden bisher nicht automatisch getestet. Ein nächster Schritt
  wären Datenbanktests, die mit verschiedenen Rollen gegen eine lokale
  Supabase-Instanz laufen.

## Quellen

- Supabase: Row Level Security, <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase: API Keys, <https://supabase.com/docs/guides/api/api-keys>
- PostgreSQL: Row Security Policies, <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
- OWASP Top 10 (2021), A01 Broken Access Control,
  <https://owasp.org/Top10/A01_2021-Broken_Access_Control/>
