const http = require('http');
const Request = require('./Request');
const Response = require('./Response');
const { compileURL, matchURL } = require('./urlUtils');

class Superhero {
  constructor (options = {}) {
    this.options = {};
    this.handlers = {};
    this.headers = options.headers || {};
    this.useables = [];
    this.name = options.name;

    this.server = http.createServer(this._requestListener.bind(this));

    this.methods = ['get', 'put', 'post', 'del', 'patch', 'head', 'delete'];

    for (const method of this.methods) {
      this[method] = (path, handler, opts = {}) => {
        path = compileURL({ url: path });
        const m = (method === 'delete' ? 'del' : method);
        if (['put', 'delete', 'post'].includes(m)) opts.body = true;
        if (!this.handlers[m]) this.handlers[m] = {};
        if (!this.handlers[m][path]) this.handlers[m][path] = {};
        this.handlers[m][path] = { path, handler, opts };
      };
    }
  }

  listen (...args) {
    this.server.listen(...args);
    this.port = args[0];
  }

  _requestListener (req, res) {
    res = new Response(this, req, res);
    const handlers = this.handlers[req.method.toLowerCase()];
    const failed = [];
    for (const handler in handlers) {
      const match = matchURL(handlers[handler].path, req);
      if (match) {
        for (const header in this.headers) {
          res.header(header, this.headers[header]);
        }
        req = new Request(this, req, res, match, handlers[handler].opts, () => {
          for (const useable of this.useables) useable(req, res);
          handlers[handler].handler(req, res);
        });
        return;
      } else {
        failed.push(match);
      }
      if (failed.length === Object.keys(handlers).length) {
        return res.send(404, `Cannot ${req.method} ${req.url}`);
      }
    }
  }

  use (fn) {
    this.useables.push(fn);
  }

  defaultHeader (name, value) {
    this.headers[name] = value;
  }
}

Superhero.Router = require('./Router');

module.exports = Superhero;
