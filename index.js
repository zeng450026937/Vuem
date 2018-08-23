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

const bailRE = /[^\w.$]/;

function parsePath(path) {
  if (bailRE.test(path)) {
    return () => {};
  }
  const segments = path.split('.');

  return function(obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[`$${segments[i]}`];
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

      if (!model) {
        vm.$model = parentModel;

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
        const wrapped = Object.create(null);

        Object.keys(model).forEach((key) => {
          const value = model[key];

          parser = parsePath(value);
          wrapped[isArray ? value : key] = parser(rootModel);
        });

        vm.$model = wrapped;
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
    methods : {
      $dispatch(name, ...args) {
        function doAction(vm) {
          return vm._actions[name].apply(vm, args);
        }

        const actions = [];

        actions.push(doAction(this));

        this.$children.forEach((child) => {
          actions.push(doAction(child));
        });

        return Promise.all(actions);
      },
      $broadcast(event, ...args) {
        this.$root.$emit(event, ...args);
        
        return this;
      },
      $subscribe(event, fn) {
        this.$root.$on(event, fn);

        return this;
      },
    },
  });

  const vuem = new Vue(options);

  const modelProperty = {
    enumerable : true,
    get        : () => {},
    set        : () => {},
  };

  modelProperty.get = () => (options.actions);
  Object.defineProperty(vuem, '_actions', modelProperty);

  if (options.models) {
    Object.keys(options.models).forEach((key) => {
      const model = createModel(
        Object.assign(options.models[key], { parent: vuem })
      );

      modelProperty.get = () => (model);
      Object.defineProperty(vuem, `$${key}`, modelProperty);
    });
  }

  if (options.subscribe) {
    Object.keys(options.subscribe).forEach((key) => {
      vuem.$root.$on(key, options.subscribe[key].bind(vuem));
    });
  }

  vuem._isVuem = true;

  return vuem;
}

export default Vuem;
