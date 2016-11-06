const fs = require('fs');
const path = require('path');
const mime = require('mime');
const zlib = require('zlib');
const stream = require('stream');

class Response {
  constructor (server, req, res) {
    this.server = server;
    this.req = req;
    this.res = res;
    this.headers = {
      'Content-Type': 'text/plain'
    };
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

  redirect (code = 302, location) {
    if (!location || typeof code !== 'number') {
      this.headers.location = code;
    } else {
      this.headers.location = location;
      this.code = code;
    }
    this._send();
  }

  end (data) {
    this._send(data);
  }

  _send (data) {
    if (!data) {
      this.res.writeHead(this.code, this.headers);
      return this.res.end();
    }
    if (typeof data !== 'string') data = JSON.stringify(data);

    let acceptEncoding = this.req.headers['accept-encoding'];
    if (!acceptEncoding) acceptEncoding = '';

    let writeStream;

    if (acceptEncoding.match(/\bdeflate\b/)) {
      writeStream = zlib.createDeflate();
      this.headers['Content-Encoding'] = 'deflate';
    } else if (acceptEncoding.match(/\bgzip\b/)) {
      writeStream = zlib.createGzip();
      this.headers['Content-Encoding'] = 'gzip';
    } else {
      this.res.writeHead(this.status, this.headers);
      this.res.write(data);
      this.res.end();
      return;
    }

    const raw = new stream.Readable();
    raw.push(new Buffer(data));
    raw.push(null);

    let writable = true;

    writeStream.on('data', chunk => {
      if (writable) {
        if (this.res.write(chunk) === false) {
          writeStream.pause();
        }
      }
    });

    writeStream.on('end', () => {
      writable = false;
      this.res.end();
    });

    this.res.on('drain', () => {
      writeStream.resume();
    });

    raw.pipe(writeStream);

    this.res.writeHead(this.status, this.headers);
  }
}

module.exports = Response;
