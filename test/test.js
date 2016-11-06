const Superhero = require('../src');
const Router = Superhero.Router;

const server = new Superhero();

const router = new Router();

router.get('/', (req, res) => {
  res.send('ROOT!');
});

router.get('/params/:x', (req, res) => {
  console.log('PARAMS', req.params);
  console.log('BODY', req.body);
  res.send(req.params.x);
}, { body: true });

router.post('/post', (req, res) => {
  console.log(req.body);
  res.send({'OMG': 'HELP'});
});

router.applyRoutes(server);

server.listen(3000);
