const fs = require('fs');
const {ProcessStatusSong} = require('./constants');
const Loki = require('lokijs');
const LokiFsAdapter = Loki.LokiFsAdapter;
const adapter = new LokiFsAdapter();
const db = new Loki('karaoke.db', {
    adapter: adapter,
    autoload: true, // Cargar automáticamente los datos al iniciar
    autosave: true, // Guardar automáticamente los cambios
    autoloadCallback: databaseInitialize, // Función de inicialización
    autosaveInterval: 1000, // Guardar cada 4 segundos
});
let songs = null;

function databaseInitialize() {
    songs = db.getCollection('songs');
    if (!songs) {
        songs = db.addCollection('songs');
    }
}


const insert = async (item) => {
    songs.insert(item);
}

const readList = async () => {
    try {
        return songs.find();
    } catch (error) {
        console.error('error', error);
        return [];
    }
};

const findOne = (filter) => {
    return songs.findOne(filter);
}

const addToList = (name, video_id, titulo, semitones = 0) => {
    try {
        console.log('addToList semitones is numeric', !isNaN(semitones))
        const item = {
            singer: name,
            id: video_id,
            title: titulo,
            semitones: isNaN(semitones) ? 0 : semitones,
            status: ProcessStatusSong.Unprocessed,
            filename: `${video_id}_${semitones}.mp4`
        }

        const result = songs.insert(item);
        console.log('addToList result', result);
        return true;
    } catch (error) {
        console.log('addToList error', error);
        return false;
    }
};

/**
 * devuelve el primer id de la lista de reproducción y borra la linea del fichero list.txt
 */
const nextSong = async (status = ProcessStatusSong.Processed) => {
    try {
        const song = findOne({status: status});
        if (!song) return null;
        if (status === ProcessStatusSong.Processed) {
            console.log('nextSong borrando', song);
            //await del(song.index);
        }
        return song;
    } catch (error) {
        return null;
    }
};

const update = async (documento) => {
    try {
        const result = songs.update(documento);
        return true;
    } catch (err) {
        console.error('error updating documento', err);
        return false;
    }
}
const del = async (lokiId) => {
    try {
        const songToDelete = songs.findOne(lokiId);
        await songs.remove(songToDelete);
        return true;
    } catch (error) {
        console.error('error deleting song', error);
        return false;
    }
}


module.exports = {readList, addToList, nextSong, insert, del, update};
