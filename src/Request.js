const url = require('url');

module.exports = class Request {
  constructor (server, req) {
    this.server = server;
    this.req = req;
    this.body = [];
    if (!server.options.cdn) {
      req.on('data', chunk => {
        this.body.push(chunk);
      }).on('end', () => {
        this.body = Buffer.concat(this.body).toString();
      });
    }
    this.status = req.statusCode;
    this.headers = req.headers;
    this.rawHeaders = req.rawHeaders;
    this.method = req.method;
    this.url = url.parse(req.url, true);
    this.path = this.url.href;
    this.query = this.url.query;
  }
}
