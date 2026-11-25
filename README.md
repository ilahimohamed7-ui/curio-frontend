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

## Tech-Stack

| Bereich  | Technologie                                     |
| -------- | ----------------------------------------------- |
| Frontend | Angular 21 (Standalone Components), TypeScript  |
| Backend  | Supabase (PostgreSQL, Auth, Row Level Security) |
| Tests    | Vitest                                          |
| Format   | Prettier                                        |

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

Alle Seiten werden per Lazy Loading erst bei Bedarf geladen.

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

## Skripte

| Befehl          | Beschreibung                        |
| --------------- | ----------------------------------- |
| `npm start`     | Entwicklungsserver starten          |
| `npm run build` | Production-Build nach `dist/`       |
| `npm test`      | Unit-Tests mit Vitest ausführen     |

## Roadmap

- [ ] Design-System mit CSS-Variablen und barrierefreien Fokus-Styles
- [ ] Umstellung auf Signals, OnPush und Reactive Forms
- [ ] Vollständige Supabase-Migrationen inkl. Seed-Daten
- [ ] ESLint und CI-Pipeline (GitHub Actions)
- [ ] Deployment mit Live-Demo
