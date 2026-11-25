# 0003 – Signals und Resource-API statt NgRx

Status: angenommen · November 2026

## Kontext

Seit Angular 21 laufen neue Projekte ohne zone.js. Angular aktualisiert die
Anzeige dann nur noch, wenn sich ein Signal ändert, ein Template-Event auftritt
oder `markForCheck` aufgerufen wird.

Das hatte praktische Folgen: In der ersten Version blieben Login und
Interessen-Auswahl bei "Einen Moment …" hängen. Die Komponenten setzten nach
einem `await` normale Klassenfelder, und Angular bekam die Änderung nicht mit.

Der Zustand in Curio ist überschaubar: angemeldeter Nutzer, gewählte
Interessen, gewählte Kategorie, geladene Beiträge.

## Entscheidung

- Komponentenzustand liegt in `signal()`, abgeleiteter Zustand in `computed()`.
- Serverdaten werden mit `rxResource` geladen. Lade- und Fehlerzustand kommen
  damit aus Angular selbst und müssen nicht von Hand gepflegt werden.
- App-weiter Zustand (angemeldeter Nutzer) liegt als Signal in einem Service
  (`AuthService`).
- Alle Komponenten verwenden `OnPush`.
- Kein NgRx Store und kein NgRx SignalStore.

## Alternativen

- **NgRx Store (Redux-Muster).** Bewährt, gut für große Teams mit viel geteiltem
  Zustand. Für vier Zustandswerte entsteht aber mehr Code für Actions, Reducer
  und Effects als für die eigentliche Funktion.
- **NgRx SignalStore.** Moderner und schlanker. Würde sich lohnen, sobald
  mehrere Features denselben Zustand ändern. Das ist aktuell nicht der Fall.

## Konsequenzen

- Der Bug mit der hängenden Anzeige ist an der Ursache behoben, nicht mit
  `markForCheck` überdeckt.
- Die Feed-Seite brauchte kein manuelles `loadPosts()` mehr. Neu laden passiert,
  weil die Resource von der Kategorie abhängt.
- Wenn der geteilte Zustand wächst (z. B. Likes, die an mehreren Stellen
  angezeigt werden), sollte die Entscheidung neu bewertet werden. SignalStore
  baut auf denselben Signals auf, ein Wechsel wäre schrittweise möglich.

## Quellen

- Angular: Signals, <https://angular.dev/guide/signals>
- Angular: Zoneless, <https://angular.dev/guide/zoneless>
- Angular: Async reactivity with resources, <https://angular.dev/guide/signals/resource>
- NgRx: SignalStore, <https://ngrx.io/guide/signals>
