import http from 'http';
import { handler } from './src/index.js';

const PORT = process.env.PORT || 3000;

// This server mimics AWS API Gateway locally
const server = http.createServer((req, res) => {
  let body = '';

  // Collect data chunks from the request
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  // Once the entire request is received
  req.on('end', async () => {
    // 1. Construct an event object that looks exactly like what API Gateway sends
    const event = {
      rawPath: req.url.split('?')[0], // ignore query strings for the route matching
      requestContext: {
        http: {
          method: req.method,
        },
      },
      headers: req.headers,
      body: body || null,
      isBase64Encoded: false,
    };

    try {
      // 2. Pass the mocked event to your Lambda handler
      const response = await handler(event);

      // 3. Translate the Lambda response back to a standard HTTP response
      res.writeHead(
        response.statusCode || 200,
        response.headers || { 'Content-Type': 'application/json' },
      );
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
  console.log(
    `\nTry it out: curl -X POST http://localhost:${PORT}/teams -d '{"name": "Local FC", "coach": "Mister"}'\n`,
  );
});
