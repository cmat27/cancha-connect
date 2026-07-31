import http from 'http';
import { URL } from 'url';
import { handler } from './src/index.js';

const PORT = process.env.PORT || 3000;

// Local HTTP Server mimicking AWS API Gateway HTTP API v2
const server = http.createServer((req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    const fullUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const queryParams = {};
    fullUrl.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const event = {
      rawPath: fullUrl.pathname,
      requestContext: {
        http: {
          method: req.method,
        },
      },
      headers: req.headers,
      queryStringParameters: Object.keys(queryParams).length > 0 ? queryParams : null,
      body: body || null,
      isBase64Encoded: false,
    };

    try {
      const response = await handler(event);

      const headers = response.headers || { 'Content-Type': 'application/json' };
      res.writeHead(response.statusCode || 200, headers);
      res.end(response.body || '');
    } catch (error) {
      console.error('Local Server Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Local Server Internal Error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n⚽️ CanchaConnect API is running locally!`);
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`\nAvailable Endpoints:`);
  console.log(`  - POST /teams                       Create team`);
  console.log(`  - GET  /teams                       Get all teams`);
  console.log(`  - GET  /teams/:id                   Get team details`);
  console.log(`  - POST /teams/:id/players           Add player to roster`);
  console.log(`  - GET  /teams/:id/players           Get team roster`);
  console.log(`  - POST /players                     Create player`);
  console.log(`  - GET  /players                     Get all players`);
  console.log(`  - POST /tournaments                 Create tournament`);
  console.log(`  - GET  /tournaments                 Get all tournaments`);
  console.log(`  - POST /tournaments/:id/teams       Register team for tournament\n`);
});
