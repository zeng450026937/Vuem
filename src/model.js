import Vue from 'vue';
import Layer from './layer';

const strategies = Vue.config.optionMergeStrategies;

strategies.middleware = strategies.methods;
strategies.subscribe = strategies.methods;

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

    this.parent = null;
    this.submodel = {};
    this.mixins = [];
    this.data = {};
    this.computed = {};
    this.watch = {};
    this.trigger = {};
    this.vm = null;
  }

  get root() {
    return this.parent ? this.parent.root : this;
  }

  initialized() {
    return !!this.vm;
  }

  mount(key, model) {
    if (!(model instanceof Model)) throw new TypeError('model must be an instance of Model');

    if (this.submodel[key]) {
      console.warn(`already has model for ${key}`);
    }
    
    model.setNS(this.genNS(key));
    model.setParent(this);

    this.submodel[key] = model;

    return this;
  }

  model(key) {
    if (!key) return this;

    let model = this.submodel[key];

    if (!model) {
      model = new Model();
      this.mount(key, model);
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

  subscribe(key, fn) {
    if (this.initialized()) {
      this.vm.$root.$on(key, (...args) => fn.apply(this.vm, args));

      return this;
    }
    
    this.trigger[key] = this.trigger[key] || [];
    this.trigger[key].push(fn);

    return this;
  }

  broadcast(...args) {
    if (this.initialized()) {
      this.vm.$root.$emit(...args);

      return this;
    }

    console.warn('broadcast() can only be used when initialized');

    return this;
  }
  
  getVM(ns) {
    if (!this.initialized()) {
      console.warn('getVM() can only be used when initialized');

      return;
    }

    let m = this.vm;

    if (ns) {
      m = ns.split('.').reduce((acc, val) => acc[val], m);
    }

    return m;
  }

  setNS(ns = false) {
    this.ns = ns;

    Object.keys(this.submodel).forEach(key => {
      this.submodel[key].setNS(this.genNS(key));
    });
  }

  setParent(parent) {
    this.parent = parent;
  }

  genNS(key) {
    let ns = key;

    if (this.ns !== false) {
      ns = `${this.ns}.${key}`;
    }

    return ns;
  }

  genVM(parent) {
    const model = this;

    return new Vue({
      parent,
      mixins   : this.mixins,
      data     : this.data,
      computed : this.computed,
      watch    : this.watch,
      beforeCreate() {
        this.$kom = model.root;
        this.$getVM = model.root.getVM.bind(model.root);
        this.$dispatch = model.root.dispatch.bind(model.root);
        this.$broadcast = model.broadcast.bind(model);
      },
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

    const { middleware, subscribe } = this.vm.$options;
    
    if (middleware) {
      Object.keys(middleware).forEach(
        name => this.register(name, middleware[name])
      );
    }
    if (subscribe) {
      Object.keys(subscribe).forEach(
        name => this.subscribe(name, subscribe[name])        
      );
    }

    Object.entries(this.trigger).forEach(([ event, fns ]) => {
      fns.forEach(fn => this.subscribe(event, fn));
    });

    keys.forEach(key => {
      const sub = this.submodel[key];

      sub.init();
      this.use(sub.callback());
      this.data[key] = sub.vm;
    });

    return this;
  }

  destroy() {
    if (!this.initialized()) return;

    Object.keys(this.submodel).forEach(key => this.submodel[key].destroy());
    
    this.vm.$destroy();
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
