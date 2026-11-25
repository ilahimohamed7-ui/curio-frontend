-- Beispiel-Beiträge für eine frisch eingerichtete Datenbank.
-- Wird nur ausgeführt, wenn die Tabelle posts noch leer ist.

INSERT INTO public.posts (category, title, description, source, emoji, color, likes, comments)
SELECT * FROM (VALUES
  -- Wissenschaft
  ('Wissenschaft',
   'Saturn könnte auf Wasser schwimmen',
   'Saturn hat eine mittlere Dichte von etwa 0,69 g/cm³ – weniger als Wasser. In einer ausreichend großen Badewanne würde er theoretisch schwimmen.',
   'NASA', '🪐', 'purple', 248, 32),
  ('Wissenschaft',
   'Oktopusse haben drei Herzen',
   'Zwei Herzen pumpen Blut durch die Kiemen, das dritte versorgt den restlichen Körper. Ihr Blut ist durch das kupferhaltige Hämocyanin bläulich.',
   'Smithsonian Ocean', '🐙', 'blue', 197, 21),
  ('Wissenschaft',
   'Honig verdirbt praktisch nie',
   'Wenig Wasser, ein saurer pH-Wert und Wasserstoffperoxid machen Honig für Mikroorganismen lebensfeindlich. Richtig gelagert bleibt er sehr lange genießbar.',
   'Smithsonian Magazine', '🍯', 'orange', 156, 18),

  -- Technologie
  ('Technologie',
   'Wie lernt künstliche Intelligenz?',
   'KI-Modelle erkennen Muster in großen Datenmengen. Beim Training werden Millionen Parameter so angepasst, dass die Vorhersagen immer weniger Fehler machen.',
   'Grundlagen des maschinellen Lernens', '🤖', 'orange', 312, 47),
  ('Technologie',
   'Der erste „Bug“ war eine echte Motte',
   '1947 fand das Team um Grace Hopper eine Motte in einem Relais des Harvard Mark II und klebte sie ins Logbuch – mit dem Vermerk „first actual case of bug being found“.',
   'Smithsonian National Museum of American History', '🦋', 'purple', 221, 29),
  ('Technologie',
   'QR-Codes kommen aus der Autoindustrie',
   'Der QR-Code wurde 1994 von Denso Wave entwickelt, um Bauteile in der Fahrzeugproduktion schneller zu erfassen als mit klassischen Barcodes.',
   'Denso Wave', '🔳', 'blue', 143, 12),

  -- Psychologie
  ('Psychologie',
   'Warum liebt unser Gehirn Geschichten?',
   'Geschichten verbinden Informationen mit Emotionen und Zusammenhängen. Dadurch können wir sie leichter einordnen und uns besser an sie erinnern.',
   'Kognitionspsychologie', '🧠', 'blue', 186, 24),
  ('Psychologie',
   'Verteiltes Lernen schlägt Pauken',
   'Wer Lernstoff über mehrere Tage verteilt wiederholt, behält ihn deutlich länger als beim Lernen am Stück. Bekannt ist das als Spacing-Effekt, erstmals beschrieben von Hermann Ebbinghaus.',
   'Ebbinghaus, Über das Gedächtnis (1885)', '📚', 'purple', 174, 19),
  ('Psychologie',
   'Unerledigtes bleibt im Kopf',
   'Bluma Zeigarnik beobachtete, dass Menschen sich an unterbrochene Aufgaben oft besser erinnern als an abgeschlossene. Spätere Studien bestätigen den Effekt allerdings nicht immer.',
   'Zeigarnik (1927)', '⏳', 'orange', 132, 15)
) AS seed (category, title, description, source, emoji, color, likes, comments)
WHERE NOT EXISTS (SELECT 1 FROM public.posts);
