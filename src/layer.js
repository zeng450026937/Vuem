import compose from './compose';
import Context from './context';

export default class Layer {
  constructor(ns = false) {
    this.ns = ns;
    this.middleware = [];
  }

  match(ns) {
    if (!this.ns) return true;

    return this.ns === ns;
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');

    this.middleware.push((ctx, next) => fn.call(this.vm, ctx, next));

    return this;
  }

  register(method, fn) {
    if (typeof fn === 'undefined') {
      fn = method;
      method = null;

      return this.use(fn);
    }
    
    const handlerRequest = (ctx, next) => {
      if (ctx.ns !== false && !this.ns.startsWith(ctx.ns)) return next();
      if (ctx.method !== method) return next();

      return fn.call(this.vm, ctx, next);
    };

    handlerRequest.method = method;

    return this.use(handlerRequest);
  }

  callback() {
    return (ctx, next) => {
      if (ctx.ns !== false && !this.match(ctx.ns)) return next ? next() : Promise.resolve();

      ctx.model = ctx.layer = this;
      ctx.vm = this.vm || ctx.vm;

      const fn = compose(this.middleware);

      return fn(ctx, next);
    };
  }

  dispatch(method, payload, ctx) {
    ctx = ctx || this.createContext();

    ctx.method = method;
    ctx.payload = payload || {};

    return this.callback()(ctx);
  }

  createContext() {    
    const context = new Context();

    context.layer = this;
    context.ns = this.ns;

    return context;
  }
}
