import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const apiKey = process.env.VITE_CMC_API_KEY;
  if (!apiKey) {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ status: { error_message: 'VITE_CMC_API_KEY is not configured.' } }));
    return;
  }

  try {
    const requestUrl = new URL(request.url || '', 'http://localhost');
    const limit = Math.min(Math.max(Number(requestUrl.searchParams.get('limit') || 100), 10), 100);
    const start = Math.max(Number(requestUrl.searchParams.get('start') || 1), 1);
    const upstream = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=USD`, {
      headers: { 'X-CMC_PRO_API_KEY': apiKey },
    });
    response.statusCode = upstream.status;
    response.setHeader('Content-Type', 'application/json');
    response.end(await upstream.text());
  } catch (error) {
    response.statusCode = 502;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ status: { error_message: error instanceof Error ? error.message : 'Market data request failed.' } }));
  }
}