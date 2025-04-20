import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
app.use(cors({ origin: true }));

app.get('/maps/api/distancematrix/json', (req: Request, res: Response) => {
  (async () => {
    const { origins, destinations, mode } = req.query;
    const apiKey = functions.config().googlemaps.key;

    if (!apiKey) {
      console.error('Nincs API kulcs a környezetben!');
      return res.status(500).json({ error: 'Hiányzó API kulcs' });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origins as string
    )}&destinations=${encodeURIComponent(
      destinations as string
    )}&mode=${mode}&key=${apiKey}`;

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url);
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      console.error('Google API hívás hiba:', err);
      res.status(500).json({ error: 'Google API hívás sikertelen' });
    }
  })();
});

export const proxyMaps = functions.https.onRequest(app);
export { proxyOpenai } from './proxy-openai';
