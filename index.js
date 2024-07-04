require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = require('./router');

// Use the router
app.use('/', router);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
