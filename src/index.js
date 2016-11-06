const http = require('http');
const Request = require('./Request');
const Response = require('./Response');
const { compileURL, matchURL } = require('./urlUtils');

class Superhero {
  constructor (options = {}) {
    this.options = {};
    this.handlers = {};
    this.name = options.name;

    this.server = http.createServer(this._requestListener.bind(this));

    if (options.cdn) {
      this.handlers.get = {};
      this.get = (path, handler) => {
        path = compileURL({ url: path });
        if (!this.handlers['get'][path]) this.handlers['get'][path] = {};
        this.handlers['get'][path] = { path, handler };
      }
    } else {
      const methods = ['get', 'put', 'post', 'del', 'patch', 'head', 'delete'];
      for (const method of methods) {
        this[method] = (path, handler) => {
          path = compileURL({ url: path });
          const m = (method === 'delete' ? 'del' : method);
          if (!this.handlers[m]) this.handlers[m] = {};
          if (!this.handlers[m][path]) this.handlers[m][path] = {};
          this.handlers[m][path] = { path, handler };
        };
      }
    }
  }

  listen (port) {
    this.port = port;
    return this.server.listen(port);
  }

  _requestListener (req, res) {
    req = new Request(this, req);
    res = new Response(this, res);

    const handlers = this.handlers[req.method.toLowerCase()];
    const failed = [];
    for (const handler in handlers) {
      const match = matchURL(handlers[handler].path, req);
      if (match) {
        req.params = match;
        handlers[handler].handler(req, res);
      } else {
        failed.push(match);
      }
      if (failed.length === Object.keys(handlers).length) {
        return res.send(404);
      }
    }
  }
}

Superhero.Router = require('./Router');

module.exports = Superhero;
