const url = require('url');
const zlib = require('zlib');

module.exports = class Request {
  constructor (server, req, finished) {
    this.server = server;
    this.req = req;
    this.body = [];
    req.on('data', chunk => {
      this.body.push(chunk);
    }).on('end', () => {
      let buffer = Buffer.concat(this.body);
      if (req.headers.encoding === 'gzip') {
        zlib.gunzip(buffer, (err, decoded) => {
          if (err) return;
          this.body = decoded && decoded.toString();
          finished();
        });
      } else if (req.headers.encoding === 'deflate') {
        zlib.inflate(buffer, (err, decoded) => {
          if (err) return;
          this.body = decoded && decoded.toString();
          finished();
        });
      } else {
        this.body = buffer.toString();
        finished();
      }
    });
    this.status = req.statusCode;
    this.headers = req.headers;
    this.rawHeaders = req.rawHeaders;
    this.method = req.method;
    this.url = url.parse(req.url, true);
    this.path = this.url.href;
    this.query = this.url.query;
  }
}
