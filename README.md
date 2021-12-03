# Watch Hotfolder and Do Something  

Dieses Template dient zur Hotfolder Überwachung. 
Bitte einfach die Funktion `processScan` anpassen.

Wenn man kein Node installiert hat, kann man es als Stand-Alone downloaden. 
Wemm man es als Dienst verwenden will, dann kann man hierzu http://nssm.cc/ nutzen


Die Start-Datei wird wie folgt benutzt:

```JS
// Dependency hinzufügen
const lib = require('./library');

// Beliebige Konfiguration
var config = {
    input: 'some/path'
};

// Alle Dateien verarbeiten
lib.start();
```

Übergabe einer JSON-Datei

```JS
// Dependency hinzufügen
const lib = require('./library');

// Alle Dateien verarbeiten
lib.start('config.json');
```
