const http = require('http');
const Superhero = require('../src');

const router = new Superhero();

router.use((req, res) => {
  console.log(req.path);
});

const server = http.createServer(router.requestListener);

server.listen(3000);
