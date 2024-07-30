const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentConnections = 0;
let totalConnections = 0;

const statsFilePath = path.join(__dirname, 'stats.json');

// Load totalConnections from file
if (fs.existsSync(statsFilePath)) {
    const stats = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'));
    totalConnections = stats.totalConnections || 0;
}

// Save totalConnections to file
const saveStats = () => {
    fs.writeFileSync(statsFilePath, JSON.stringify({ totalConnections }), 'utf8');
};

wss.on('connection', (ws) => {
    currentConnections++;
    totalConnections++;

    // Save stats when a new connection is made
    saveStats();

    ws.send(JSON.stringify({ type: 'stats', currentConnections, totalConnections }));

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'currentConnections', currentConnections }));
        }
    });

    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', text: message }));
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
