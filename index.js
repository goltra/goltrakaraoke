require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const {join} = require("node:path");
const {nextSongToProcess} = require('./processSong');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/videos', express.static(join(__dirname, 'downloads')));

const router = require('./router');
const {ProcessStatusSong} = require("./constants");

// Use the router
app.use('/', router);

setTimeout(nextSongToProcess, 5000);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
