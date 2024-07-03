import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/proxy', async (req, res) => {
    try {
        const response = await fetch(process.env.URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
            agent: new https.Agent({rejectUnauthorized: false}) 
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const result = await response.json();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error en la solicitud de pago', details: error.message });
    }
});

app.get('/env', (req, res) => {
    res.json({
        apiUrl: process.env.URL,
        apiKey: process.env.API_KEY,
        signature: process.env.SIGNATURE,
        service: process.env.SERVICE,
        checkout: process.env.CHECKOUT
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});