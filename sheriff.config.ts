import { noDependencies, sameTag, SheriffConfig } from '@softarc/sheriff-core';

/**
 * Architekturregeln für Curio – geprüft bei jedem `npm run lint`.
 *
 * Jeder Ordner unter `domains/<domain>/` ist ein Modul mit zwei Tags:
 * der Domäne (z. B. `domain:feed`) und der Schicht (z. B. `type:ui`).
 *
 *   feature  →  ui  →  data  →  util      (nur von oben nach unten)
 *
 * Domänen greifen nicht aufeinander zu. App-weite Dienste liegen in `core`.
 */
export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  enableBarrelLess: true,

  modules: {
    'src/environments': ['scope:config'],
    'src/app/core/<name>': ['scope:core'],
    'src/app/domains/<domain>': {
      'feature-<feature>': ['domain:<domain>', 'type:feature'],
      ui: ['domain:<domain>', 'type:ui'],
      data: ['domain:<domain>', 'type:data'],
      util: ['domain:<domain>', 'type:util']
    }
  },

  depRules: {
    // App-Wurzel (app.config.ts, app.routes.ts) setzt alles zusammen.
    root: ['*'],

    // Konfiguration (Supabase-URL usw.) hat keine Abhängigkeiten.
    'scope:config': noDependencies,

    // Core: nur untereinander und auf die Konfiguration, nie auf Domänen.
    'scope:core': ['scope:core', 'scope:config'],

    // Domänen: nur innerhalb der eigenen Domäne plus core.
    'domain:*': [sameTag, 'scope:core'],

    // Schichten: nur von oben nach unten.
    'type:feature': ['type:ui', 'type:data', 'type:util', 'scope:core'],
    'type:ui': ['type:data', 'type:util'],
    'type:data': ['type:util', 'scope:core'],
    'type:util': noDependencies
  }
};
