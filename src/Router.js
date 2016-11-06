class Router {
  constructor () {
    this.handlers = {};
    this.methods = ['get', 'put', 'post', 'del', 'patch', 'head', 'delete'];
    for (const method of this.methods) {
      this[method] = (path, handler) => {
        const m = (method === 'delete' ? 'del' : method);
        if (!this.handlers[m]) this.handlers[m] = {};
        if (!this.handlers[m][path]) this.handlers[m][path] = {};
        this.handlers[m][path] = { path, handler };
      };
    }
  }

  use (path, subRouter) {
    for (const group of Object.keys(subRouter.handlers)) {
      for (const handler of Object.values(subRouter.handlers[group])) {
        this[group]((path === '/' ? '' : path) + handler.path, handler.handler);
      }
    }
  }

  applyRoutes (server) {
    for (const group in this.handlers) {
      const handlers = this.handlers[group];
      for (const handler in handlers) {
        server[group](handlers[handler].path, handlers[handler].handler);
      }
    }
  }
}

module.exports = Router;
