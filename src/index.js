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
      },
    });
  }

  constructor() {
    super();

    this.root = this;
    this.d = {};
    this.env = process.env.NODE_ENV || 'development';
  }

  get(key) {
    return this.d[key];
  }

  set(key, val) {
    this.d[key] = val;
  }

  createContext(ns) {
    const context = super.createContext(ns);

    delete context.model;
    delete context.layer;

    context.kom = this;

    return context;
  }
}
