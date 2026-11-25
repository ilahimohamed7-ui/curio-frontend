# ADR 2: Fachbereiche und Schichten mit Sheriff

Status: angenommen

## Kontext

In der ersten Version lagen Komponenten und Services in allgemeinen Ordnern.
Dabei sind ungewollte Abhängigkeiten entstanden, zum Beispiel hat der Login
direkt einen Service aus dem Feed benutzt.

## Entscheidung

Der Code ist nach Fachbereichen gegliedert (`auth`, `feed`) und darin nach
Schichten (`feature`, `ui`, `data`). Abhängigkeiten gehen nur nach unten,
Fachbereiche greifen nicht aufeinander zu. Sheriff prüft diese Regeln beim
Linten.

## Folgen

Verstöße fallen sofort auf. Beim Einrichten hat Sheriff zwei echte Fehler
gefunden. Wer neue Ordner anlegt, muss die Konfiguration in
`sheriff.config.ts` kennen.

Quellen: Angular Style Guide <https://angular.dev/style-guide>,
Sheriff <https://github.com/softarc-consulting/sheriff>
