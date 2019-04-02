export default function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');

  middleware.forEach(fn => {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  });

  return function(context, next) {
    // last called middleware #
    let index = -1;

    return dispatch(0);
    
    async function dispatch(i) {
      if (i <= index) throw new Error('next() called multiple times');

      index = i;

      let fn = middleware[i];

      if (i === middleware.length) fn = next;

      if (!fn) return;

      return fn(context, dispatch.bind(null, i + 1));
    }
  };
}
