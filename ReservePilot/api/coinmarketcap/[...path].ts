import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(request: IncomingMessage & { query?: Record<string, string | string[]> }, response: ServerResponse) {
  const apiKey = process.env.VITE_CMC_API_KEY;
  if (!apiKey) {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ status: { error_message: 'VITE_CMC_API_KEY is not configured.' } }));
    return;
  }

  const query = new URLSearchParams();
  Object.entries(request.query || {}).forEach(([key, value]) => query.set(key, Array.isArray(value) ? value.join(',') : value));
  const upstream = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?${query.toString()}`, { headers: { 'X-CMC_PRO_API_KEY': apiKey } });
  response.statusCode = upstream.status;
  response.setHeader('Content-Type', 'application/json');
  response.end(await upstream.text());
}