import Vue from 'vue';
import Layer from './layer';

/**
 * Expose `Model` class.
 *
 * @export
 * @class Model
 * @extends {Layer}
 */
export default class Model extends Layer {
  /**
   * Creates an instance of Model.
   *
   * @param {*} ns
   * @memberof Model
   */
  constructor(ns = false) {
    super(ns);

    this.root = null;
    this.parent = null;
    this.submodel = {};
    this.mixins = [];
    this.data = {};
    this.computed = {};
    this.watch = {};
    this.vm = null;
  }

  initialized() {
    return !!this.vm;
  }

  model(ns) {
    if (!ns) return this;

    const key = ns;

    if (this.ns !== false) {
      ns = `${this.ns}.${ns}`;
    }

    let model = this.submodel[ns];

    if (!model) {
      model = new Model(ns);
      model.parent = this;
      model.root = this.root;
      this.submodel[key] = model;
    }
    
    return model;
  }

  up() {
    return this.parent || this;
  }

  provide(key, val) {
    if (key && typeof val === 'undefined') {
      this.mixins.push(key);
      key = null;
    }

    if (!key) return this;
    if (this.computed[key]) console.warn('duplicate provided key');

    if (typeof val === 'function') {
      this.computed[key] = val;
    }
    else {
      this.data[key] = val;
    }

    return this;
  }
  
  hook(key, fn) {
    if (this.initialized()) {
      this.vm.$watch(key, fn);

      return this;
    }
    
    this.watch[key] = this.watch[key] || [];
    this.watch[key].push(fn);

    return this;
  }

  genVM(parent) {
    return new Vue({
      parent,
      mixins   : this.mixins,
      data     : this.data,
      computed : this.computed,
      watch    : this.watch,
    });
  }

  /**
   * initialize internal vm
   * 
   * @memberof Model
   * @api private
   */
  init(force = false) {
    if (this.initialized() && !force) return;

    if (this.vm) {
      this.middleware = this.middleware.filter(fn => !fn.method);
    }
    
    const keys = Object.keys(this.submodel);

    keys.forEach(key => {
      this.data[key] = this.data[key];
    });

    this.vm = this.genVM(this.parent && this.parent.vm);

    const { methods } = this.vm.$options;
    
    if (methods) {
      Object.keys(methods).forEach(name => this.register(name, methods[name]));
    }

    keys.forEach(key => {
      const sub = this.submodel[key];

      sub.init();
      this.use(sub.callback());
      this.data[key] = sub.vm;
    });

    return this;
  }

  match(ns) {
    return super.match(ns) || ns.startsWith(this.ns) || this.ns.startsWith(ns);
  }

  dispatch(method, payload, ns) {
    let lastIndex = -1;

    if (method) {
      lastIndex = method.lastIndexOf('.');
    }

    if (typeof ns === 'undefined' && lastIndex !== -1) {
      ns = method.substring(0, lastIndex);
      method = method.substring(lastIndex + 1);
    }

    const ctx = this.createContext(ns || false);

    return super.dispatch(method, payload, ctx);
  }

  createContext(ns = this.ns) {
    if (ns && this.ns && !ns.startsWith(this.ns)) {
      ns = `${this.ns}.${ns}`;
    }
    const context = super.createContext();

    context.model = this;
    context.vm = this.vm;
    context.ns = ns;

    return context;
  }
}
