const express = require('express');
const fs = require("fs");
const router = express.Router();
const search = require('./search');

// Define a route for the home page
router.get('/', (req, res) => {
    const htmlData = readHtml('./html/welcome.html');
    res.send(htmlData);
});

router.post('/search', (req, res) => {
    const {title, name} = req.body;
    search(title).then(data => {
        const result = data.map(item => {
            const titulo = item.title;
            const id = item.id.videoId;
            return '<button data-title="' + titulo + '" data-name="' + name + '" id="' + id + '" onclick="add(event)">  ' +
                titulo +
                '</button>';
        });
        let htmlData = readHtml('./html/searchresults.html');
        htmlData = htmlData.replace('{{videos}}', result.join('<br>'));
        htmlData = htmlData.replace('{{singer}}', name);
        res.send(htmlData);
    })
})

router.get('/play', (req, res) => {
    const {t} = req.query;
    // si te no esta definida, debe volver a cargar /play pero pasando el parametro t con un timestamp
    if (!t) {
        res.redirect('/play?t=' + new Date().getTime());
        return;
    }
    const {id,title,singer} = nextSong();
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
    const resultWrite = addToList(req.body.name, req.body.video_id, req.body.title);
    if (resultWrite) {
        const result = {'ok': true, 'reason': 'video added to list'};
        res.send(JSON.stringify(result));
    } else {
        const result = {'ok': false, 'reason': 'error adding video to list'};
        res.send(JSON.stringify(result));
    }
});

router.get('/canciones-pedidas', (req, res) => {
    let htmlData = readHtml('./html/canciones-pedidas.html');
    let result = "";
    const list = readList();
    list.forEach(item => {
        if (item === '') return;
        i = item.split('\t');
        result += '<div class="cancion"><p style="padding-top:0"><strong><u> Cantante:</u> </strong><br>' + i[1] + '</p><p style="margin-top: 0; padding-top:0"><strong><u>Canción:</u></strong><br>' + i[3] + '</p></div>';
    });

    htmlData = htmlData.replace('{{canciones_pedidas}}', result);
    res.send(htmlData);
});

router.get('/next', (req, res) => {
    const result = nextSong();
    res.header('Content-Type', 'application/json')
    res.send(result);
});

const readHtml = (htmlFileName) => {
    const css =fs.readFileSync('./html/styles.css', 'utf8');
    const menu = fs.readFileSync('./html/menu.html', 'utf8');
    let data = fs.readFileSync(htmlFileName, 'utf8');

    data =  data.replace('{{stylesheet}}', css);
    data = data.replace('{{menu}}', menu);
    return data;
};

const addToList = (name, video_id, titulo) => {
    const date = new Date();
    try {
        fs.writeFileSync('list.txt', date.toISOString() + '\t' + name + '\t' + video_id + '\t' + titulo + '\n',
            {
                flag: 'a',
                encoding: 'utf8'
            }
        );
        return true
    } catch (error) {
        console.log('error', error);
        return false;
    }
};

const readList = () => {
    try {
        const data = fs.readFileSync('list.txt', 'utf8').split('\n');
        return data;
    } catch (error) {
        console.log('error', error);
        return [];
    }
};

/**
 * devuelve el primer id de la lista de reproducción y borra la linea del fichero list.txt
 */
const nextSong = () => {
    try {
        const list = readList();
        if (list.length === 0) return null;
        const nextSong = list.shift();
        const id = nextSong.split('\t')[2];
        const title = nextSong.split('\t')[3];
        const singer = nextSong.split('\t')[1];
        fs.writeFileSync('list.txt', list.join('\n'));
        console.log('nextSong', id)
       return {id, title, singer};
    } catch (error) {
        console.log('error nextSong', error);
        return null;
    }
}

module.exports = router;
