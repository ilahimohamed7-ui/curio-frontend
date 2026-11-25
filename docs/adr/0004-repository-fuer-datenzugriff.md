# 0004 – Repository als Grenze zum Datenzugriff

Status: angenommen · Oktober 2026

## Kontext

Komponenten sollen Beiträge anzeigen, ohne zu wissen, woher sie kommen. In
Tests soll die Datenquelle ohne Netzwerk ersetzt werden können. Und es war
absehbar, dass sich die Herkunft der Beiträge ändert (erst Handarbeit, später
KI).

## Entscheidung

Der Zugriff auf Beiträge läuft über die abstrakte Klasse `PostRepository` mit
zwei Implementierungen:

- `SupabasePostRepository` für den Betrieb,
- `InMemoryPostRepository` für Tests und lokale Experimente.

Welche Implementierung verwendet wird, steht an genau einer Stelle
(`app.config.ts`). Die Umwandlung von Datenbankfeldern (`created_at`,
`ai_generated`) in das Frontend-Modell (`createdAt`, `aiGenerated`) passiert im
Repository, nicht in Komponenten.

Das ist das Repository-Muster nach Fowler: eine Schnittstelle, die sich wie
eine Sammlung von Domänenobjekten verhält und die Details der Datenquelle
verbirgt.

## Alternativen

- **Supabase direkt in Komponenten aufrufen.** Weniger Dateien, aber jede
  Komponente wäre an Supabase gebunden und nur mit Netzwerk-Mocks testbar.

## Konsequenzen

- Als die KI-Anbindung dazukam, musste im Frontend nur das Repository zwei
  Felder mehr lesen. Feed-Seite und Karten blieben bis auf zwei Badges gleich.
- Ein Wechsel zu einer eigenen API (z. B. Spring Boot) würde eine neue
  Repository-Klasse bedeuten, keinen Umbau der Oberfläche.
- Für `user_interests` gibt es noch kein eigenes Repository; der
  `InterestService` spricht Supabase direkt an. Das ist eine bewusste
  Abkürzung, weil es dort nur zwei Aufrufe gibt.

## Quellen

- M. Fowler (2002): Patterns of Enterprise Application Architecture,
  Repository, <https://martinfowler.com/eaaCatalog/repository.html>
