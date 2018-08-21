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
    return;
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

    Vue.prototype.$prevent = function(prevented) {
      this._prevented = Boolean(prevented);
    };

    const originEmit = Vue.prototype.$emit;

    Vue.prototype.$emit = function(...args) {
      if (this._prevented) return this;

      return originEmit.apply(this, args);
    };

    Vue.mixin({ beforeCreate: modelInit });

    function modelInit() {
      this.$rootModel = collectRootModel(this.$options);
      this.$model = collectModel(this.$options) || this.$rootModel;
    }

    function collectRootModel(options) {
      let rootModel = typeof options.model === 'function'
        ? options.model()
        : isVuem(options.model)
          ? options.model
          : null;

      if (options.parent && options.parent.$rootModel) {
        rootModel = options.parent.$rootModel;
      }

      return rootModel;
    }

    function collectModel(options) {
      let model;

      if (options.parent && options.parent.$rootModel) {
        model = options.parent.$rootModel;
      }

      if (!options.model || isVuem(options.model)) return model;

      if (typeof options.model === 'string') {
        model = options.model === ''
          ? model
          : parsePath(options.model)(model);
      }
      else
      if (Array.isArray(options.model)) {
        if (options.model.length) {
          const wrapped = {};

          options.model.forEach((name) => {
            wrapped[name] = parsePath(name)(model);
          });

          model = wrapped;
        }
        else {
          model = this.$rootModel;
        }
      }
      else
      if (typeof options.model === 'object') {
        const wrapped = {};

        Object.keys(options.model).forEach((name) => {
          wrapped[name] = parsePath(options.model[name])(model);
        });

        model = wrapped;
      }

      return model;
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
  const opts = Object.assign(
    {
      mixins : [ {
        methods : {
          $dispatch(name, ...args) {
            function doAction() {
              return this.$actions[name].apply(this, args);
            }

            const actions = [];

            actions.push(doAction.call(this));

            this.$children.forEach((child) => {
              actions.push(doAction.call(child));
            });

            return Promise.all(actions);
          },
          $broadcast(event, ...args) {
            this.$root.$emit(event, ...args);
            
            return this;
          },
        },
      } ],
      computed  : {},
      models    : {},
      actions   : {},
      broadcast : {},
    },
    options
  );

  const vuem = new Vue(opts);

  const modelProperty = {
    enumerable : true,
    get        : () => {},
    set        : () => {},
  };

  Object.keys(opts.models).forEach((key) => {
    const model = createModel(
      Object.assign({ parent: vuem }, opts.models[key])
    );

    modelProperty.get = () => (model);
    Object.defineProperty(vuem, `$${key}`, modelProperty);
  });

  modelProperty.get = () => (opts.actions);
  Object.defineProperty(vuem, '$actions', modelProperty);

  Object.keys(opts.broadcast).forEach((key) => {
    this.$root.$on(key, opts.broadcast[key].bind(vuem));
  });

  vuem._isVuem = true;

  return vuem;
}

export default Vuem;
