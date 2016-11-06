const Superhero = require('../src');
const Router = Superhero.Router;

const server = new Superhero({ cdn: true });

const router = new Router();

router.get('/', (req, res) => {
  res.send('ROOT!');
});

router.get('/params/:x', (req, res) => {
  res.send(req.params.x);
});

router.applyRoutes(server);

server.listen(3000);
