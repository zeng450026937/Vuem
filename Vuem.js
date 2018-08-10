let Vue;

class Vuem {
  static install(_Vue) {
    if (Vue && _Vue === Vue) return;

    Vue = _Vue;

    checkVueVersion();

    Vue.mixin({ beforeCreate: modelInit });

    function modelInit() {
      const options = this.$options;

      if (options.model) {
        this.$model = typeof options.model === 'function'
          ? options.model()
          : options.model;
      }
      else
      if (options.parent && options.parent.$model) {
        this.$model = options.parent.$model;
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
  const opts = Object.assign(
    {
      name      : 'vuem',
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
    Object.defineProperty(vuem, key, modelProperty);
  });

  Object.keys(opts.actions).forEach((key) => {

  });

  return vuem;
}

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

export default Vuem;
