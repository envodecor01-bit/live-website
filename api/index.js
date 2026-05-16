export const config = {
  runtime: 'edge',
};

import server from '../dist/server/server.js';

export default function (req, event) {
  return server.fetch(req, process.env, event);
}
