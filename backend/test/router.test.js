import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../src/index.js';

describe('Lambda Router & API Handler Tests', () => {
  test('OPTIONS preflight returns 200 OK with CORS headers', async () => {
    const event = {
      rawPath: '/teams',
      requestContext: { http: { method: 'OPTIONS' } },
    };
    const res = await handler(event);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
    assert.equal(res.headers['Access-Control-Allow-Methods'], 'GET,POST,PUT,DELETE,OPTIONS');
  });

  test('GET /health returns 200 with service status', async () => {
    const event = {
      rawPath: '/health',
      requestContext: { http: { method: 'GET' } },
    };
    const res = await handler(event);
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.service, 'CanchaConnect API');
    assert.equal(body.status, 'UP');
  });

  test('POST /teams with empty body returns 400 Bad Request', async () => {
    const event = {
      rawPath: '/teams',
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify({}),
    };
    const res = await handler(event);
    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.match(body.error, /Team name is required/);
  });

  test('POST /players with invalid JSON returns 400 Bad Request', async () => {
    const event = {
      rawPath: '/players',
      requestContext: { http: { method: 'POST' } },
      body: 'invalid-json{',
    };
    const res = await handler(event);
    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.match(body.error, /Invalid JSON/);
  });

  test('GET /unknown-route returns 404 Not Found', async () => {
    const event = {
      rawPath: '/unknown-route',
      requestContext: { http: { method: 'GET' } },
    };
    const res = await handler(event);
    assert.equal(res.statusCode, 404);
  });
});
