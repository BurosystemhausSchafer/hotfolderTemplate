const fs = require('fs');


/**
 * NODE JS Skript zum Überwachen und verarbeiten eines Hotfolders. 
 * Dies dient als Vorlage 
 * 
 * 
 * 
 * 
 */
module.exports = {

    // Counter
    counter: 0,

    /**
     * Start
     * 
     * @param {Object} config Konfigurationsobjekt
     */
    start(config) {

        // Log Header
        console.log();
        console.log('😎 \x1b[33mWatch Hotfolder And Copy\x1b[0m');
        console.log('   ├── Version 1.0');
        console.log('   └── by Tobias Pitzer / Bürosystemhaus Schäfer GmbH & Co. KG');
        console.log();

        // Get Config
        me.getConfig(config);

        // Read Counter
        var me = this;

        // Überwachung starten
        me.all(function () {

            // Watch starten
            me.watch();
        });
    },

    /**
     * Read Config 
     * 
     */
    getConfig(config) {

        // Wenn die Config definiert ist
        if (typeof config != 'undefined') {

            // Wenn die Config bereits ein Objekt ist
            if (typeof config == 'object') {

                // Dannn die Config direkt wieder übernehmen
                me.config = config;

                // Wenn die Config ein String ist
            } else if (typeof config == 'string') {

                // Prüfen ob es ein Config-File ist
                if(me.isFile(config)) {

                    // Config File
                    me.config = JSON.parse(fs.readFileSync(config, 'utf8'));
                }
            }
        }
    },

    /**
     * Funktion zum Verarbeiten aller Dateien
     *
     * 
     * @param {*} cb 
     */
    all(cb) {

        console.log('> Process all Files');

        me = this;

        var i = 0;

        // Alle Dateien Scannen
        fs.readdir(me.path.input, (err, files) => {

            // Jede Datei verarbeiten
            files.forEach(file => {

                // Verarbeitung starten
                me.processScan(file);

                i++;
            });

            // Wenn es keine Dateien gibt / gab
            if (i == 0) {
                console.log('> No Files to Process');
            }

            console.log();

            // Callback, dass die Funktion fertig ist
            cb();

        });
    },

    /**
     * Die eigentliche Verarbeitung der Datei.
     * Wird von der All- und Watch-Funktion aufgerufen
     * 
     * @param {String} file Dateiname ohne Verzeichnis
     */
    processScan(file) {

        var me = this;

        console.log();
        console.log('⚡ Process >' + file + '<');


        // Alles in eine Try-Catch packen, damit an dieser Stelle nichts kaputt geht
        try {

            // Hier kann man, wenn man will prüfen ob nur bestimmte Dateien oder alle Dateien verarbeitet werden sollen
            // Regex - 
            var regex = /^[\s\S]*.(txt|pdf)/g;

            // Prüfen ob es sich um eine Datei handelt, die kopiert werden soll;
            if (file.toLowerCase().match(regex)) {

                console.log('   ├── Check if File is ready');

                // Check File is Ready  
                me.checkFileReady(me.path.input + "/" + file, function (isReady) {

                    // Hier findete dann die eigentliche Magie statt
                    if (isReady) {

                        console.log('       ├──  Do Something with the File for Example move it');

                        // Move File There
                        fs.renameSync(me.config.input + "/" + file, me.config.output + "/" + file);

                        console.log('       └── Moved File');

                        // Wenn die Datei nicht mehr gefunden wurde
                    } else {
                        console.log('       └── File has already been deleted');
                    }
                });

            } else {
                console.log('   └── Ignore File because it does not match');
            }

            // Exception abfangen
        } catch (ex) {
            console.log(ex);
        }


    },

    /**
     * Prüft ob eine Datei bereit ist. 
     * Dies ist notwendig, da die Datei schon beim schreiben des ersten Bytes hier auftaucht, dann aber noch nicht vollständig geschrieben wurde. 
     * Erst wenn der Prozess der die Datei erstellt, diese Datei wieder frei gibt, dann ruft diese Funktion den entsprechenden Callback auf.
     * 
     * @param {String} path Vollständiger Pfad zu Datei `/etc/some/myfile.pdf`
     * @param {Function} callback Der Callback der ausgführt wird. Hat als Parameter `true` oder `false` wenn die Datei ready ist
     */
    checkFileReady(path, callback) {

        var me = this;

        console.log('   ├── Waiting for File to be Complete');
        console.log('   └── ⌛ Asynchron...');

        // Prüfen ob die Datei Lesbar ist
        fs.open(path, 'r+', function (err, fd) {

            // Wenn die Datei noch in Bearbeitung ist
            if (err && err.code === 'EBUSY') {
                setTimeout(function () {
                    me.checkFileReady(path, callback);
                }, 500);

                // Wenn die Datei gelöscht wurde
            } else if (err && err.code === 'ENOENT') {
                callback(false);

                // Wenn die Datei verfügbar ist
            } else {
                fs.close(fd, function () {

                    // File is Ready
                    console.log();
                    console.log('       ⌛ Async Callback');
                    callback(true);
                });
            }
        });
    },



    /**
     * Dieser Task startet die Überwachung. 
     * Er reagiert, sobald ein Rename-Event stattgefunden hat.
     * 
     */
    watch() {

        var me = this;

        console.log();
        console.log('> ⏰ Start Watch');


        fs.watch(me.path.input, (eventType, filename) => {
            if (eventType == 'rename' && me.isFile(me.path.input + "/" + filename)) {

                console.log();
                console.log('📂 Input');
                me.processScan(filename);
            }
        });

    },

    /**
     * Hier wird geprüft ob es sich um eine Datei handelt.
     * 
     * @param {String} path Vollständiger Pfad zur Datei
     * @returns {Boolean} `true` wenn es eine Datei ist, `false` wenn nicht
     */
    isFile(path) {
        return fs.existsSync(path) && fs.lstatSync(path).isFile();
    }
}