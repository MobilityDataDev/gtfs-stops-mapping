import express, { Request, Response, Application } from 'express';
import path from 'path';
import { getDatabasePool } from './getDatabasePool';

const app: Application = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));

const pool = getDatabasePool();

app.get('/', async (request: Request, response: Response) => {
  try {
    const stops = await pool.query(`
      SELECT stop_name, stop_lat, stop_lon
      FROM stop
    ;`);
    const geoJson = stops.rows.map((stop) => ({
      type: 'Feature',
      properties: { name: stop.stop_name },
      geometry: { type: 'Point', coordinates: [stop.stop_lon, stop.stop_lat] }
    }));
    response.render('index', { stops: JSON.stringify(geoJson) });
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
});

app.listen(4000, () => {
  console.log(`Server listening on http://localhost:4000/`);
});
