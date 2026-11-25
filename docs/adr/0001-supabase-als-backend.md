# 0001 – Supabase statt eigenem Backend

Status: angenommen · Oktober 2026

## Kontext

Curio braucht Benutzerkonten, eine relationale Datenbank mit Zugriffsschutz pro
Nutzer und später einen Ort, an dem serverseitiger Code laufen kann (für die
KI-Anbindung). Es gibt einen Entwickler und kein Budget für Hosting. Der
Schwerpunkt des Projekts ist das Angular-Frontend.

## Entscheidung

Supabase wird als Backend genutzt: Auth, PostgreSQL, Row Level Security und
Edge Functions. Ein eigener Applikationsserver wird nicht gebaut.

## Alternativen

- **Spring Boot oder NestJS mit eigener Datenbank.** Volle Kontrolle, aber
  Login, Passwort-Reset, Token-Handling und Hosting hätten einen großen Teil der
  Zeit gekostet, ohne etwas zum eigentlichen Ziel beizutragen.
- **Firebase.** Ähnlicher Funktionsumfang, aber Firestore ist eine
  Dokumentdatenbank. Für Nutzer, Interessen und Beiträge mit festen Beziehungen
  passt ein relationales Modell besser, und Zugriffsregeln lassen sich in
  PostgreSQL direkt mit SQL ausdrücken.

## Konsequenzen

- Positiv: Auth, Datenbank und Serverfunktionen sind ohne eigenen Betrieb
  verfügbar. Das Schema liegt trotzdem vollständig als SQL-Migrationen im
  Repository und ist damit versioniert und reproduzierbar.
- Positiv: Es ist normales PostgreSQL. Ein späterer Umzug auf eine eigene
  Datenbank ist möglich, ohne das Datenmodell neu zu denken.
- Negativ: Abhängigkeit von einem Anbieter, inklusive seiner Limits
  (z. B. Laufzeit von Edge Functions, siehe ADR 0005).
- Negativ: Geschäftslogik, die nicht in SQL oder eine Edge Function passt, hat
  keinen natürlichen Ort. Wird das häufiger, ist ein eigenes Backend hinter dem
  bestehenden Repository (ADR 0004) der nächste Schritt.

## Quellen

- Supabase Docs: Architecture, <https://supabase.com/docs/guides/getting-started/architecture>
- Supabase Docs: Row Level Security, <https://supabase.com/docs/guides/database/postgres/row-level-security>
