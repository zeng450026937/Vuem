import Model from './model';
import Layer from './layer';

export { Model, Layer };

let Vue;

export default class Kom extends Model {
  static install(_Vue) {
    if (Vue && Vue === _Vue) return;

    Vue = _Vue;

    Vue.mixin({
      beforeCreate() {
        const options = this.$options;
        const kom = options.kom || (options.parent && options.parent.$kom);

        if (!kom) return;

        const isKOM = kom instanceof Kom;

        if (!isKOM) return console.warn('only kom is accepted.');

        kom.init();

        this.$kom = kom;
        this.$model = kom.vm;
        this.$dispatch = kom.dispatch.bind(kom);
        this.$broadcast = kom.vm.$emit.bind(kom.vm);
        this.$subscribe = kom.vm.$on.bind(kom.vm);
        this.$unsubscribe = kom.vm.$off.bind(kom.vm);

        const subscribe = options.subscribe;

        if (subscribe) {
          this._subscribe = {};

          Object.keys(subscribe).forEach(name => {
            const fn = this._subscribe[name] = subscribe[name].bind(this);

            this.$subscribe(name, fn);
          });
        }

        let sketch = options.sketch;

        if (sketch) {
          if (!Array.isArray(sketch)) {
            sketch = [ sketch ];
          }

          sketch.forEach(sk => reflect(sk));
        }

        function reflect(sk) {
          const { ns, props = [] } = sk;

          let m = kom.vm;

          if (ns) {
            m = ns.split('.').reduce((acc, val) => acc[val], m);
          }

          if (props.length > 0) {
            options.computed = options.computed || {};
          }

          props.forEach(key => {
            if (options.computed[key]) return console.warn(`property duplicate: ${key}`);
                        
            options.computed[key] = {
              get() {
                return m[key];
              },
              set(val) {
                m[key] = val;
              },
            };
          });
        }
      },
      beforeDestroy() {
        const options = this.$options;
        const kom = options.kom || (options.parent && options.parent.$kom);

        if (!kom) return;
        
        const subscribe = this._subscribe;

        if (subscribe) {
          Object.keys(subscribe).forEach(name => {
            this.$unsubscribe(name, subscribe[name]);
          });
        }
      },
    });
  }

  constructor() {
    super();

    this.root = this;
    this.d = {};
  }

  get(key) {
    return this.d[key];
  }

  set(key, val) {
    this.d[key] = val;
  }

  createContext(ns) {
    const context = super.createContext(ns);

    context.kom = this;
    context.getVM = this.getVM.bind(this);
    context.isMatch = function() {
      return this.ns === this.model.ns;
    };

    return context;
  }
}
