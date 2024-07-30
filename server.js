const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chat', { useNewUrlParser: true, useUnifiedTopology: true });

const connectionSchema = new mongoose.Schema({
    totalConnections: { type: Number, default: 0 }
});

const Connection = mongoose.model('Connection', connectionSchema);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentConnections = 0;

wss.on('connection', (ws) => {
    currentConnections++;

    Connection.findOneAndUpdate({}, { $inc: { totalConnections: 1 } }, { new: true, upsert: true }, (err, doc) => {
        if (err) console.error(err);
        ws.send(JSON.stringify({ type: 'stats', currentConnections, totalConnections: doc.totalConnections }));
    });

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
