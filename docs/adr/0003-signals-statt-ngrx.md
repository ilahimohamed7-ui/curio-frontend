# ADR 3: Signals statt NgRx

Status: angenommen

## Kontext

Angular 21 läuft standardmäßig ohne zone.js. Die Anzeige wird dann nur noch
aktualisiert, wenn sich ein Signal ändert. Genau deshalb blieb der Login am
Anfang bei "Einen Moment" hängen. Der Zustand der App selbst ist klein.

## Entscheidung

Zustand liegt in Signals, Serverdaten werden mit `rxResource` geladen. NgRx
setze ich nicht ein.

## Folgen

Weniger Code, und Lade- und Fehlerzustände kommen direkt von Angular. Wenn
später mehrere Features denselben Zustand teilen, sollte man sich NgRx
SignalStore ansehen.

Quellen: <https://angular.dev/guide/signals>, <https://angular.dev/guide/zoneless>
