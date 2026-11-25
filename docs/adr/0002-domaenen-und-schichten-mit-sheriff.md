# 0002 – Domänen und Schichten, geprüft mit Sheriff

Status: angenommen · November 2026

## Kontext

Die erste Version hatte die Ordner `core/` und `feed/components`,
`feed/services` usw. Bei drei Komponenten war das übersichtlich. Beim Ausbau
zeigten sich typische Probleme: Der Login importierte direkt einen Service aus
dem Feed, Kategorien standen an vier Stellen im Code, und die Interessen-Auswahl
war zweimal fast identisch gebaut.

Solche Abhängigkeiten entstehen nicht aus Absicht, sondern weil nichts sie
verhindert. Regeln, die nur in einer README stehen, werden erfahrungsgemäß
nicht eingehalten, sobald es schnell gehen muss.

## Entscheidung

1. Der Code wird nach Fachbereich gegliedert (`domains/auth`, `domains/feed`)
   und innerhalb davon nach Schicht: `feature`, `ui`, `data`, `util`.
   Das entspricht der Empfehlung im Angular Style Guide, nach Features zu
   ordnen, und dem Schichtenmodell aus Steyers "Enterprise Angular", das auf
   Ideen aus Domain-Driven Design (Evans) zurückgeht.
2. Abhängigkeiten dürfen nur nach unten zeigen
   (`feature → ui → data → util`). Domänen greifen nicht aufeinander zu.
3. Die Regeln werden mit Sheriff als ESLint-Regel durchgesetzt und laufen in der
   CI mit.

## Alternativen

- **Nur Konvention, keine Prüfung.** Kostet nichts, hält aber erfahrungsgemäß
  nicht. Der Login-Import aus Punkt 1 ist genau so entstanden.
- **Nx mit `enforce-module-boundaries`.** Gleiche Wirkung, verlangt aber ein
  Nx-Workspace. Für ein einzelnes Angular-Projekt ist das mehr Umbau als nötig.
  Sheriff arbeitet mit der normalen Angular-CLI.

## Konsequenzen

- Verstöße fallen beim Linten auf, nicht erst im Code-Review. Beim Einrichten
  hat Sheriff zwei echte Verstöße gefunden (ein Test in `core` importierte die
  App-Routen; `core` las die Environment-Datei ohne Regel).
- Die Entscheidung "Onboarding nötig?" musste aus dem Login in einen Guard der
  Feed-Domäne wandern. Das ist die sauberere Lösung, war aber Aufwand.
- Neue Ordner müssen zur Konfiguration passen. Wer eine neue Schicht oder Domäne
  anlegt, muss `sheriff.config.ts` kennen.

## Quellen

- Angular Style Guide, <https://angular.dev/style-guide>
- M. Steyer: Enterprise Angular, <https://leanpub.com/enterprise-angular>
- Angular Architects: Strategic Design with Sheriff, <https://www.angulararchitects.io/en/?p=7366>
- Sheriff, <https://github.com/softarc-consulting/sheriff>
- E. Evans (2003): Domain-Driven Design. Addison-Wesley.
