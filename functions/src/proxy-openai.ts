import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post('/openai', (req, res) => {
  (async () => {
    const prompt = req.body?.prompt;
    const apiKey = functions.config().openai.api_key;

    if (!prompt || !apiKey) {
      return res.status(400).json({ error: 'Hiányzó prompt vagy API kulcs' });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      console.error('OpenAI API hívás hiba:', err);
      res.status(500).json({ error: 'Hiba az OpenAI API-val való kommunikáció során' });
    }
  })();
});

export const proxyOpenai = functions.https.onRequest(app);
