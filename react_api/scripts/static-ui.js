const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '../../react/build');
const port = Number(process.env.UI_PORT);
const apiPort = Number(process.env.API_PORT);
if (!Number.isInteger(port)) throw new Error('UI_PORT must be a numeric port');
if (!Number.isInteger(apiPort)) throw new Error('API_PORT must be a numeric port');
if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('React production build is missing; run npm --prefix react run build');
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const requested = path.resolve(root, `.${pathname}`);
  const candidate = requested.startsWith(`${root}${path.sep}`) && fs.existsSync(requested) && fs.statSync(requested).isFile()
    ? requested
    : path.join(root, 'index.html');
  const contentType = types[path.extname(candidate)] || 'application/octet-stream';
  if (path.extname(candidate) === '.js') {
    const content = fs.readFileSync(candidate, 'utf8').replaceAll('http://localhost:3001/api', `http://127.0.0.1:${apiPort}/api`);
    response.writeHead(200, { 'content-type': contentType, 'content-length': Buffer.byteLength(content), 'x-content-type-options': 'nosniff' });
    response.end(content);
    return;
  }
  response.writeHead(200, { 'content-type': contentType, 'x-content-type-options': 'nosniff' });
  fs.createReadStream(candidate).pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`Government Contracts UI listening on http://127.0.0.1:${port}`));
