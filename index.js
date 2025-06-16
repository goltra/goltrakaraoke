require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT ||  3000;
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const log = require('./log2file');

log('El puerto es ' + port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
const router = require('./router');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', ws => {
    log('Cliente WebSocket conectado');

    // Cuando el servidor recibe un mensaje de este cliente
    ws.on('message', message => {
        // Los mensajes de WebSocket son Buffers por defecto, convertir a string si es texto
        const messageString = message.toString();
        log(`Mensaje recibido del cliente: ${messageString}`);

        // Opcional: Reenviar el mensaje a todos los clientes conectados (ejemplo de "broadcast")
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`Eco: ${messageString}`);
            }
        });

        // Opcional: Responder al cliente que envió el mensaje
        ws.send(`Servidor recibió tu mensaje: ${messageString}`);
    });

    // Cuando el cliente cierra la conexión
    ws.on('close', () => {
        log('Cliente WebSocket desconectado');
    });

    // Manejo de errores
    ws.on('error', error => {
        log('Error en WebSocket:' + error);
    });

    // Enviar un mensaje de bienvenida al cliente recién conectado
    //ws.send('¡Bienvenido al servidor WebSocket!');
});
// Use the router
app.use('/', router);


server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
