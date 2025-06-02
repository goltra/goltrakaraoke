const express = require('express');
const fs = require("fs");
const router = express.Router();
const search = require('./search');
const {readList, addToList, nextSong, del} = require('./fileshandler');

// Define a route for the home page
router.get('/', (req, res) => {
    const htmlData = readHtml('./html/welcome.html');
    res.send(htmlData);
});

router.post('/search', (req, res) => {
    const {title, name, semitones} = req.body;
    console.log('semitones',semitones,req.body)
    search(title).then(data => {
        const result = data.map(item => {
            console.log('semitones +1',semitones)
            const titulo = item.title;
            const id = item.id.videoId;
            return `<button data-semitones= "${semitones}" data-title= "${titulo}" data-name= "${name}" id= "${id}" onclick="add(event)"> ${titulo}</button>`;
        });
        let htmlData = readHtml('./html/searchresults.html');
        htmlData = htmlData.replace('{{videos}}', result.join('<br>'));
        htmlData = htmlData.replace('{{singer}}', name);
        res.send(htmlData);
    })
});

router.post('/lista-canciones', async (req, res) => {
    const lista = await readList();
    res.send(lista);
});

router.get('/play', (req, res) => {
    const {t} = req.query;
    // si te no esta definida, debe volver a cargar /play pero pasando el parametro t con un timestamp
    if (!t) {
        res.redirect('/play?t=' + new Date().getTime());
        return;
    }
    const {id, title, singer} = nextSong();
    if (!id) {
        let htmlData = readHtml('./html/no-song-to-play.html');
        res.send(htmlData);
        return;
    }

    let htmlData = readHtml('./html/player.html');
    // sustituir el id del video en la url de youtube
    htmlData = htmlData.replace('{{video_id}}', id);
    htmlData = htmlData.replace(/{{textToSpeak}}/g, 'Cantante: ' + singer + '. Canción: ' + title);
    res.send(htmlData);
});

router.post('/add', (req, res) => {
    console.log('get add', req.body);
    const resultWrite = addToList(req.body.name, req.body.video_id, req.body.title, req.body.semitones);
    if (resultWrite) {
        const result = {'ok': true, 'reason': 'video added to list'};
        res.send(JSON.stringify(result));
    } else {
        const result = {'ok': false, 'reason': 'error adding video to list'};
        res.send(JSON.stringify(result));
    }
});

router.get('/canciones-pedidas', async (req, res) => {
    let htmlData = readHtml('./html/canciones-pedidas.html');
    let result = "";
    const list = await readList();

    list.forEach((item, indice) => {
        result += `<div class="cancion" id="div-cancion_${indice}">
                    <p style="padding-top:0"><strong><u> Cantante:</u> </strong>
                        <button class="btn-delete-song" onclick="eliminarCancion(${item.$loki})" id="btn-delete-song_${indice}">x</button><br>${item.singer}
                    </p>
                    <p style="margin-top: 0; padding-top:0"><strong><u>Canción:</u></strong><br>${item.title}</p>
                    </div>`;
    });

    htmlData = htmlData.replace('{{canciones_pedidas}}', result);
    res.send(htmlData);
});

router.post('/delsong', async (req, res) => {
    const data = req.body;
    try {
        const result = await del(data.index);
        if (result)
            res.status(200).send({message: 'Canción eliminada exitosamente.'});
        else
            res.status(400).send({message: 'Ocurrió algún error al intentar eliminar la canción.'});
    } catch (error) {
        res.status(400).send({message: 'Ocurrió algún error al intentar eliminar la canción.'});
        return null;
    }
});

router.get('/next', (req, res) => {
    const result = nextSong();
    res.header('Content-Type', 'application/json')
    res.send(result);
});

const readHtml = (htmlFileName) => {
    const css = fs.readFileSync('./html/styles.css', 'utf8');
    const menu = fs.readFileSync('./html/menu.html', 'utf8');
    let data = fs.readFileSync(htmlFileName, 'utf8');

    data = data.replace('{{stylesheet}}', css);
    data = data.replace('{{menu}}', menu);
    return data;
};

module.exports = router;
