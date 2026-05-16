import server from '../dist/server/server.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url, `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.append(key, value);
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
      init.duplex = 'half';
    }

    const request = new Request(url.href, init);

    const response = await server.fetch(request, process.env, {});

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        res.appendHeader('set-cookie', value);
      } else {
        res.setHeader(key, value);
      }
    });

    res.statusCode = response.status;
    
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error('API Handler Error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
