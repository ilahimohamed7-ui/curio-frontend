# ADR 4: Repository für den Datenzugriff

Status: angenommen

## Kontext

Die Komponenten sollen Beiträge anzeigen, ohne zu wissen, woher sie kommen. In
Tests soll die Datenquelle ohne Netzwerk austauschbar sein.

## Entscheidung

Beiträge werden über die abstrakte Klasse `PostRepository` geladen. Es gibt
eine Implementierung für Supabase und eine In-Memory-Variante für Tests.

## Folgen

Als die KI-Beiträge dazukamen, musste im Frontend fast nur das Repository
angepasst werden. Für die Interessen gibt es noch kein eigenes Repository, dort
greift der Service direkt auf Supabase zu.

Quelle: Fowler, Repository <https://martinfowler.com/eaaCatalog/repository.html>
