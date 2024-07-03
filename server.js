import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const result = await response.json();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error en /proxy:', error.message);
        res.status(500).json({ error: 'Error en la solicitud de pago' });
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});