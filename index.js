let Vue;

function checkVueVersion(requiredVue) {
  const vueDep = requiredVue || '^2.5.10';
  const required = vueDep.split('.', 3).map((v) => Number.parseInt(v.replace(/\D/g, ''), 10));
  const actual = Vue.version.split('.', 3).map((n) => Number.parseInt(n, 10));
  // Simple semver caret range comparison
  const passes = actual[0] === required[0] && ( // major matches
    // minor is greater
    (actual[1] > required[1])
    // or minor is eq and patch is >=
    || (actual[1] === required[1] && actual[2] >= required[2])
  );

  assert(passes, `Vuem requires Vue version ${vueDep}.`);
}

function assert(condition, msg) {
  if (!condition) throw new Error(`[Vuem] ${msg}`);
}

function remove(arr, item) {
  if (arr && arr.length && item) {
    const index = arr.indexOf(item);

    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

const noop = () => {};

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

const bailRE = /[^\w.$]/;

function parsePath(path) {
  if (bailRE.test(path)) {
    return () => {};
  }
  const segments = path.split('.');

  return function(obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    
    return obj;
  };
}

function isVuem(inst) {
  return inst instanceof Vue && inst._isVuem;
}

class Vuem {
  static install(_Vue) {
    if (Vue && _Vue === Vue) return;

    Vue = _Vue;

    checkVueVersion();

    // add $prevent method
    Vue.prototype.$prevent = function(prevented) {
      this._prevented = Boolean(prevented);
    };

    const originEmit = Vue.prototype.$emit;

    Vue.prototype.$emit = function(...args) {
      if (this._prevented) return this;

      return originEmit.apply(this, args);
    };

    // inject mixin
    Vue.mixin({ 
      beforeCreate() {
        iniModel(this);
      },
    });

    function iniModel(vm) {
      const options = vm.$options;
      const { model, parent } = options;
      const parentModel = parent ? parent.$model : null;

      // TODO
      // check whether the parent is vuem instance 

      if (!model) {
        vm.$model = parentModel ? parentModel.$root : null;

        return;
      }

      vm.$model = typeof model === 'function'
        ? model.call(vm)
        : isVuem(model)
          ? model
          : null;

      if (vm.$model) return;
      if (!parentModel) return;

      const rootModel = parentModel.$root;

      let parser;

      if (typeof model === 'string') {
        parser = parsePath(model);
        vm.$model = parser(rootModel) || rootModel;
      }
      else {
        const isArray = Array.isArray(model);
        const wrapped = {};

        Object.keys(model).forEach((key) => {
          const value = model[key];

          parser = parsePath(value);
          wrapped[isArray ? value : key] = parser(rootModel);
        });

        vm.$model = createModel({ data: wrapped, parent: parentModel });
      }
    }
  }

  constructor(options) {
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      Vuem.install(window.Vue);
    }

    assert(Vue, 'must call Vue.use(Vuem) before creating a Vuem instance.');
    checkVueVersion();

    return createModel(options);
  }
}

function createModel(options = {}) {
  options.mixins = options.mixins || [];
  options.mixins.push({
    beforeCreate() {
      this._models = {};
      this._actions = {};
      this._subscribe = {};
    },
    destroyed() {
      this._models = null;
      this._actions = null;
      this._subscribe = null;
    },
    methods : {
      $register(name, model) {
        if (!isVuem(model)) return;

        if (model.$parent !== this) {
          remove(model.$parent, model);
          model.$parent = this;
          this.$children.push(model);
        }
        if (model.$root !== this.$root) {
          model.$root = this.$root;
          Object.keys(model._subscribe).forEach((event) => {
            model.$subscribe(event, model._subscribe[event].raw);
          });
        }

        this._models[name] = model;
        proxy(this, '_models', name);
      },
      $unregister(model) {
        if (!isVuem(model)) {
          model = this[model];
        }
        if (!model) return;

        model.$parent = null;
        remove(this.$children, model);
        delete this._models[name];
      },
      $dispatch(name, ...args) {
        const actions = [];

        if (this._actions[name]) {
          actions.push(this._actions[name].apply(this, args));
        }

        this.$children.forEach((child) => {
          actions.push(child.$dispatch(name, ...args));
        });

        return Promise.all(actions);
      },
      $broadcast(event, ...args) {
        this.$root.$emit(event, ...args);
        
        return this;
      },
      $subscribe(event, fn) {
        this.$unsubscribe(event);

        const delegate = (...args) => {
          return fn.apply(this, args);
        }
        delegate.raw = fn;
        this._subscribe[event] = delegate;
        this.$root.$on(event, delegate);

        return this;
      },
      $unsubscribe(event) {
        const delegate = this._subscribe[event];
        if (delegate) {
          this.$root.$off(event, delegate);
          delete this._subscribe[event];
        }

        return this;
      },
    },
  });

  const vuem = new Vue(options);

  vuem._isVuem = true;

  const { actions, models, subscribe } = options;

  if (actions) {
    vuem._actions = actions;
  }

  if (models) {
    Object.keys(models).forEach((key) => {
      vuem.$register(key, createModel(
        Object.assign(models[key], { parent: vuem })
      ));
    });
  }

  if (subscribe) {
    Object.keys(subscribe).forEach((key) => {
      vuem.$subscribe(key, subscribe[key]);
    });
  }

  return vuem;
}

export default Vuem;
