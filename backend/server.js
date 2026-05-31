const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let trips = [];
let tripId = 1;

// Create trip
app.post('/api/trips', (req, res) => {
  const { destination, startDate, endDate, budget } = req.body;
  const trip = { id: tripId++, destination, startDate, endDate, budget, createdAt: new Date() };
  trips.push(trip);
  res.json(trip);
});

// Get all trips
app.get('/api/trips', (req, res) => res.json(trips));

// Generate itinerary
app.post('/api/trips/:id/itinerary', (req, res) => {
  const attractions = {
    Paris: [
      { name: 'Eiffel Tower', duration: 3, cost: 15 },
      { name: 'Louvre', duration: 4, cost: 20 },
      { name: 'Notre-Dame', duration: 2, cost: 0 }
    ],
    'New York': [
      { name: 'Statue of Liberty', duration: 3, cost: 25 },
      { name: 'Times Square', duration: 2, cost: 0 },
      { name: 'Central Park', duration: 3, cost: 0 }
    ],
    Tokyo: [
      { name: 'Senso-ji', duration: 2, cost: 5 },
      { name: 'Shibuya', duration: 1, cost: 0 },
      { name: 'Meiji Shrine', duration: 2, cost: 0 }
    ]
  };

  const trip = trips.find(t => t.id == req.params.id);
  const cityAttrs = attractions[trip.destination] || attractions.Paris;
  const itinerary = [];
  let idx = 0;

  for (let day = 1; day <= 3; day++) {
    const activities = [];
    let duration = 0;
    while (duration < 8 && idx < cityAttrs.length) {
      const attr = cityAttrs[idx];
      activities.push({ ...attr, time: `${9 + duration}:00` });
      duration += attr.duration;
      idx++;
    }
    itinerary.push({ day, activities, cost: activities.reduce((s, a) => s + a.cost, 0) });
  }

  res.json({ tripId: trip.id, itinerary });
});

// WebSocket
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    wss.clients.forEach(c => c.readyState === 1 && c.send(msg));
  });
});

server.listen(5000, () => console.log('🚀 Server on :5000'));
