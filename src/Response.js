const fs = require('fs');
const path = require('path');
const mime = require('mime');

class Response {
  constructor (server, res) {
    this.server = server;
    this.res = res;
    this.headers = {};
    this.status = 200;
  }

  status (status) {
    this.status = status;
    return this;
  }

  header (name, content) {
    this.headers[name] = content;
    return this;
  }

  send (status, data) {
    if (data) {
      this.status = status;
      this._send(data)
    } else {
      if (typeof status === 'number') {
        this.status = status;
        this._send();
      } else {
        this._send(status);
      }
    }
  }

  sendFile (file) {
    file = path.resolve(file);
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return this._send({'error': 'InternalError', 'message': err.message});
      this.headers['Content-Type'] = mime.lookup(file);
      this._send(data);
    });
  }

  end (data) {
    this._send(data);
  }

  _send (data) {
    this.res.writeHead(this.status, this.headers);
    if (data) {
      if (typeof data !== 'string') data = JSON.stringify(data);
      this.res.write(data);
    }
    this.res.end();
  }
}

module.exports = Response;
