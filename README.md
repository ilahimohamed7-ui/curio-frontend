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

```text
src/app/
├── core/
│   ├── auth/            # Login/Registrierung, AuthService, Auth-Guard
│   └── supabase.client.ts
└── feed/
    ├── components/      # Feed-Liste, Interessen-Auswahl
    ├── data-access/     # Repository-Schicht (Supabase + In-Memory)
    ├── models/          # Datenmodelle
    └── services/        # Feed- und Interessen-Logik
supabase/
└── migrations/          # SQL-Migrationen
```

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
