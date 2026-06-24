#!/usr/bin/env node
/**
 * ワークショップ用ミニ同期サーバー（同一Wi-Fi内で全員のピンを共有）
 * 起動: npm run ar:server
 * クライアント: VITE_AR_API_URL=http://<your-ip>:8787 npm run dev
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../.ar-sync-data.json');
const PORT = Number(process.env.AR_SYNC_PORT ?? 8787);

function readStore() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    }
  } catch {
    /* ignore */
  }
  return { annotations: [] };
}

function writeStore(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/annotations') {
    const lat = Number(url.searchParams.get('lat'));
    const lng = Number(url.searchParams.get('lng'));
    const radius = Number(url.searchParams.get('radius') ?? 1500);
    const store = readStore();
    const list = store.annotations.filter((a) => {
      if (!a?.worldPin) return false;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
      return haversineM({ lat, lng }, a.worldPin) <= radius;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/annotations') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const store = readStore();
    store.annotations = [body, ...store.annotations.filter((a) => a.id !== body.id)];
    writeStore(store);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
    return;
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/annotations/')) {
    const id = decodeURIComponent(url.pathname.slice('/annotations/'.length));
    const store = readStore();
    store.annotations = store.annotations.filter((a) => a.id !== id);
    writeStore(store);
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AR sync server http://0.0.0.0:${PORT}`);
});
