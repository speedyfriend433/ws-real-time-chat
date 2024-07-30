const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentConnections = 0;
let totalConnections = 0;

wss.on('connection', (ws) => {
    currentConnections++;
    totalConnections++;

    ws.send(JSON.stringify({ type: 'stats', currentConnections, totalConnections }));

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'currentConnections', currentConnections }));
        }
    });

    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        currentConnections--;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'currentConnections', currentConnections }));
            }
        });
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
