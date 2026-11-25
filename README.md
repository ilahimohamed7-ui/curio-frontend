# Curio – Deine Welt des Wissens

Curio ist ein personalisierter Wissens-Feed. Nutzer melden sich an, wählen ihre Interessen
(Wissenschaft, Technologie, Psychologie) und bekommen kurze, spannende Wissensbeiträge passend
zu diesen Themen angezeigt.

> Screenshots und Live-Demo folgen.

## Funktionen

- Registrierung und Login per E-Mail und Passwort (Supabase Auth)
- Geschützte Routen über einen Auth-Guard
- Onboarding: Auswahl der Interessen beim ersten Login
- Wissens-Feed mit Kategorie-Filter, gefiltert nach den eigenen Interessen
- Interessen jederzeit im Feed änderbar, serverseitig validiert gespeichert
- **Täglich neue, KI-generierte Beiträge** pro Kategorie (Google Gemini), gekennzeichnet als „KI-generiert“

## Tech-Stack

| Bereich  | Technologie                                                     |
| -------- | --------------------------------------------------------------- |
| Frontend | Angular 21 (Standalone Components, Signals, zoneless)           |
| Backend  | Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions) |
| KI       | Google Gemini API (strukturierte JSON-Ausgabe)                  |
| Tests    | Vitest                                                          |
| Qualität | ESLint (angular-eslint), Sheriff, Prettier                      |

## KI-generierte Beiträge

```text
pg_cron (täglich 05:00 UTC)
  └─▶ Edge Function generate-daily-posts   ← hält GEMINI_API_KEY serverseitig
        ├─▶ Gemini API: N neue Fakten pro Kategorie (JSON-Schema)
        └─▶ Tabelle posts (ai_generated = true)
                └─▶ Angular-Feed liest wie gewohnt über das PostRepository
```

- Der API-Schlüssel liegt ausschließlich als Secret in Supabase, nie im Frontend.
- Beiträge werden **pro Kategorie** statt pro Nutzer erzeugt: Die Kosten bleiben unabhängig
  von der Nutzerzahl konstant, und der Feed lädt ohne Wartezeit.
- Die Funktion schickt die Titel der letzten Beiträge mit, um Wiederholungen zu vermeiden,
  und prüft jede KI-Antwort, bevor sie gespeichert wird.
- Pro Kategorie und Tag wird höchstens einmal erzeugt (idempotent).
- Durch das Repository-Pattern musste das Frontend dafür kaum angepasst werden.

## Projektstruktur

Die Struktur folgt einem domänenorientierten Ansatz: Code wird nach Fachbereich
(Domain) gruppiert und innerhalb jeder Domain in Schichten aufgeteilt.

```text
src/app/
├── core/                        # App-weite Singletons
│   ├── auth/                    # AuthService, Auth-Guard
│   └── supabase/                # Supabase-Client
└── domains/
    ├── auth/
    │   └── feature-login/       # Login und Registrierung
    └── feed/
        ├── feature-feed/        # Feed-Seite
        ├── feature-onboarding/  # Interessen-Auswahl nach dem ersten Login
        ├── ui/                  # PostCard, CategoryFilter, InterestPicker
        └── data/                # Modelle, Repositories, Services, Kategorien
supabase/
└── migrations/                  # SQL-Migrationen
```

| Schicht   | Aufgabe                                                   | Darf zugreifen auf |
| --------- | --------------------------------------------------------- | ------------------ |
| `feature` | Anwendungsfall, steuert den Ablauf (Smart Components)     | ui, data, util     |
| `ui`      | Wiederverwendbare Darstellungskomponenten                 | util               |
| `data`    | Datenmodelle, Datenzugriff, State                         | util               |
| `util`    | Technische Hilfsfunktionen                                | –                  |

Domänen greifen nicht direkt aufeinander zu; app-weite Dienste liegen in `core`.
Alle Seiten werden per Lazy Loading erst bei Bedarf geladen.

Diese Regeln werden automatisch mit [Sheriff](https://github.com/softarc-consulting/sheriff)
geprüft (`sheriff.config.ts`). Ein Verstoß, etwa ein Import von `ui` in `data` oder von
der Auth- in die Feed-Domäne, führt bei `npm run lint` zu einem Fehler.

Der Datenzugriff läuft über eine abstrakte `PostRepository`-Klasse. Die Supabase-Implementierung
lässt sich für Tests oder lokale Entwicklung durch eine In-Memory-Variante ersetzen.

## Lokale Einrichtung

Voraussetzungen: Node.js (LTS) und npm.

```bash
npm install
npm start
```

Die App läuft danach unter `http://localhost:4200/`.

Die Supabase-Verbindung wird in `src/environments/environment.ts` konfiguriert
(`supabaseUrl` und `supabasePublishableKey`). Der Publishable Key ist für den Einsatz im Browser
vorgesehen; der Datenschutz erfolgt über Row Level Security in der Datenbank.

### Datenbank einrichten

Das komplette Datenbankschema liegt als Migrationen in `supabase/migrations/`.
Für ein neues Supabase-Projekt die Dateien im **SQL Editor** in dieser Reihenfolge ausführen:

| Datei                                           | Inhalt                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| `20261020000000_initial_schema.sql`             | Tabellen `posts` und `user_interests`, RLS     |
| `20261106000000_save_user_interests.sql`        | Funktion zum atomaren Speichern der Interessen |
| `20261125000000_user_interests_constraints.sql` | Zugriffsregeln (Policies) für `user_interests` |
| `20261126000000_ai_generated_posts.sql`         | Spalte `ai_generated`, täglicher Cron-Job      |
| `supabase/seed.sql`                             | Beispiel-Beiträge (nur bei leerer Tabelle)     |

Alle Skripte sind idempotent und können gefahrlos mehrfach ausgeführt werden.
Alternativ mit der [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db push`.

**Sicherheitsmodell:** Angemeldete Benutzer dürfen alle Beiträge lesen, aber keine schreiben.
Interessen kann jeder Benutzer nur für sich selbst lesen und ändern.

## Skripte

| Befehl          | Beschreibung                        |
| --------------- | ----------------------------------- |
| `npm start`     | Entwicklungsserver starten          |
| `npm run build` | Production-Build nach `dist/`       |
| `npm test`      | Unit-Tests mit Vitest ausführen     |
| `npm run lint`  | ESLint inkl. Architekturregeln      |

## Roadmap

- [x] Design-System mit CSS-Variablen und barrierefreien Fokus-Styles
- [x] Umstellung auf Signals, OnPush, Resource-API und Reactive Forms
- [x] Vollständige Supabase-Migrationen inkl. Seed-Daten
- [x] KI-generierte Beiträge über eine Supabase Edge Function
- [x] ESLint und Architekturregeln mit Sheriff
- [ ] CI-Pipeline (GitHub Actions)
- [ ] Deployment mit Live-Demo
