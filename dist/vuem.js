(function(t,e){"object"===typeof exports&&"object"===typeof module?module.exports=e(require("vue")):"function"===typeof define&&define.amd?define([],e):"object"===typeof exports?exports["Vuem"]=e(require("vue")):t["Vuem"]=e(t["Vue"])})(window,function(t){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([function(e,n){e.exports=t},function(t,e,n){"use strict";n.r(e);var r=n(0),i=n.n(r);function o(t){if(!Array.isArray(t))throw new TypeError("Middleware stack must be an array!");return t.forEach(function(t){if("function"!==typeof t)throw new TypeError("Middleware must be composed of functions!")}),function(e,n){var r=-1;return i(0);function i(o){if(o<=r)return Promise.reject(new Error("next() called multiple times"));r=o;var u=t[o];if(o===t.length&&(u=n),!u)return Promise.resolve();try{return Promise.resolve(u(e,i.bind(null,o+1)))}catch(a){return Promise.reject(a)}}}}function u(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function c(t,e,n){return e&&a(t.prototype,e),n&&a(t,n),t}var s=function(){function t(){u(this,t)}return c(t,[{key:"toJSON",value:function(){return{ns:this.ns,method:this.method,payload:this.payload}}}]),t}();function f(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function h(t,e,n){return e&&l(t.prototype,e),n&&l(t,n),t}var p=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];f(this,t),this.ns=e,this.middleware=[]}return h(t,[{key:"match",value:function(t){return!this.ns||this.ns===t}},{key:"use",value:function(t){if("function"!==typeof t)throw new TypeError("middleware must be a function!");return this.middleware.push(t),this}},{key:"register",value:function(t,e){var n=this;if("undefined"===typeof e)return e=t,t=null,this.use(e);var r=function(r,i){return!1===r.ns||n.ns.startsWith(r.ns)?r.method!==t?i():e.call(n.vm,r,i):i()};return r.method=t,this.use(r)}},{key:"callback",value:function(){var t=this;return function(e,n){if(!1!==e.ns&&!t.match(e.ns))return n?n():Promise.resolve();e.model=e.layer=t,e.vm=t.vm||e.vm;var r=o(t.middleware);return r(e,n)}}},{key:"dispatch",value:function(t,e,n){return n=n||this.createContext(),n.method=t,n.payload=e||{},this.callback()(n)}},{key:"createContext",value:function(){var t=new s;return t.layer=this,t.ns=this.ns,t}}]),t}();function d(t){return d="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},d(t)}function y(t,e){return m(t)||v(t,e)||b()}function b(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function v(t,e){var n=[],r=!0,i=!1,o=void 0;try{for(var u,a=t[Symbol.iterator]();!(r=(u=a.next()).done);r=!0)if(n.push(u.value),e&&n.length===e)break}catch(c){i=!0,o=c}finally{try{r||null==a["return"]||a["return"]()}finally{if(i)throw o}}return n}function m(t){if(Array.isArray(t))return t}function w(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function g(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function k(t,e,n){return e&&g(t.prototype,e),n&&g(t,n),t}function O(t,e){return!e||"object"!==d(e)&&"function"!==typeof e?j(t):e}function j(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function x(t,e,n){return x="undefined"!==typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=E(t,e);if(r){var i=Object.getOwnPropertyDescriptor(r,e);return i.get?i.get.call(n):i.value}},x(t,e,n||t)}function E(t,e){while(!Object.prototype.hasOwnProperty.call(t,e))if(t=P(t),null===t)break;return t}function P(t){return P=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},P(t)}function S(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&_(t,e)}function _(t,e){return _=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},_(t,e)}var $=i.a.config.optionMergeStrategies;$.middleware=$.methods,$.subscribe=$.methods;var M,T=function(t){function e(){var t,n=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return w(this,e),t=O(this,P(e).call(this,n)),t.root=null,t.parent=null,t.submodel={},t.mixins=[],t.data={},t.computed={},t.watch={},t.trigger={},t.vm=null,t}return S(e,t),k(e,[{key:"initialized",value:function(){return!!this.vm}},{key:"mount",value:function(t,n){if(!(n instanceof e))throw new TypeError("model must be an instance of Model");return this.submodel[t]&&console.warn("already has model for ".concat(t)),n.setNS(this.genNS(t)),n.parent=this,n.root=this.root,this.submodel[t]=n,this}},{key:"model",value:function(t){if(!t)return this;var n=this.submodel[t];return n||(n=new e,this.mount(t,n)),n}},{key:"up",value:function(){return this.parent||this}},{key:"provide",value:function(t,e){return t&&"undefined"===typeof e&&(this.mixins.push(t),t=null),t?(this.computed[t]&&console.warn("duplicate provided key"),"function"===typeof e?this.computed[t]=e:this.data[t]=e,this):this}},{key:"hook",value:function(t,e){return this.initialized()?(this.vm.$watch(t,e),this):(this.watch[t]=this.watch[t]||[],this.watch[t].push(e),this)}},{key:"subscribe",value:function(t,e){var n=this;return this.initialized()?(this.vm.$root.$on(t,function(){for(var t=arguments.length,r=new Array(t),i=0;i<t;i++)r[i]=arguments[i];return e.apply(n,r)}),this):(this.trigger[t]=this.trigger[t]||[],this.trigger[t].push(e),this)}},{key:"broadcast",value:function(){var t;return this.initialized()?((t=this.vm.$root).$emit.apply(t,arguments),this):(console.warn("broadcast() can only be used when initialized"),this)}},{key:"getVM",value:function(t){if(this.initialized()){var e=this.vm;return t&&(e=t.split(".").reduce(function(t,e){return t[e]},e)),e}console.warn("getVM() can only be used when initialized")}},{key:"setNS",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.ns=e,Object.keys(this.submodel).forEach(function(e){t.submodel[e].setNS(t.genNS(e))})}},{key:"genNS",value:function(t){var e=t;return!1!==this.ns&&(e="".concat(this.ns,".").concat(t)),e}},{key:"genVM",value:function(t){return new i.a({parent:t,mixins:this.mixins,data:this.data,computed:this.computed,watch:this.watch})}},{key:"init",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(!this.initialized()||e){this.vm&&(this.middleware=this.middleware.filter(function(t){return!t.method}));var n=Object.keys(this.submodel);n.forEach(function(e){t.data[e]=t.data[e]}),this.vm=this.genVM(this.parent&&this.parent.vm);var r=this.vm.$options,i=r.middleware,o=r.subscribe;return i&&Object.keys(i).forEach(function(e){return t.register(e,i[e])}),o&&Object.keys(o).forEach(function(e){return t.subscribe(e,o[e])}),Object.entries(this.trigger).forEach(function(e){var n=y(e,2),r=n[0],i=n[1];i.forEach(function(e){return t.subscribe(r,e)})}),n.forEach(function(e){var n=t.submodel[e];n.init(),t.use(n.callback()),t.data[e]=n.vm}),this}}},{key:"match",value:function(t){return x(P(e.prototype),"match",this).call(this,t)||t.startsWith(this.ns)||this.ns.startsWith(t)}},{key:"dispatch",value:function(t,n,r){var i=-1;t&&(i=t.lastIndexOf(".")),"undefined"===typeof r&&-1!==i&&(r=t.substring(0,i),t=t.substring(i+1));var o=this.createContext(r||!1);return x(P(e.prototype),"dispatch",this).call(this,t,n,o)}},{key:"createContext",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.ns;t&&this.ns&&!t.startsWith(this.ns)&&(t="".concat(this.ns,".").concat(t));var n=x(P(e.prototype),"createContext",this).call(this);return n.model=this,n.vm=this.vm,n.ns=t,n}}]),e}(p);function C(t){return C="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},C(t)}function V(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function z(t,e){return!e||"object"!==C(e)&&"function"!==typeof e?J(t):e}function R(t,e,n){return R="undefined"!==typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=A(t,e);if(r){var i=Object.getOwnPropertyDescriptor(r,e);return i.get?i.get.call(n):i.value}},R(t,e,n||t)}function A(t,e){while(!Object.prototype.hasOwnProperty.call(t,e))if(t=N(t),null===t)break;return t}function N(t){return N=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},N(t)}function W(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function D(t,e,n){return e&&W(t.prototype,e),n&&W(t,n),t}function q(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&I(t,e)}function I(t,e){return I=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},I(t,e)}function J(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}n.d(e,"default",function(){return L}),n.d(e,"Model",function(){return T}),n.d(e,"Layer",function(){return p});var L=function(t){function e(){var t;return V(this,e),t=z(this,N(e).call(this)),t.root=J(J(t)),t.d={},t}return q(e,t),D(e,null,[{key:"install",value:function(t){M&&M===t||(M=t,M.mixin({beforeCreate:function(){var t=this,n=this.$options,r=n.kom||n.parent&&n.parent.$kom;if(r){var i=r instanceof e;if(!i)return console.warn("only kom is accepted.");r.init(),this.$kom=r,this.$model=r.vm,this.$dispatch=r.dispatch.bind(r),this.$broadcast=r.vm.$emit.bind(r.vm),this.$subscribe=r.vm.$on.bind(r.vm),this.$unsubscribe=r.vm.$off.bind(r.vm);var o=n.subscribe;o&&(this._subscribe={},Object.keys(o).forEach(function(e){var n=t._subscribe[e]=o[e].bind(t);t.$subscribe(e,n)}));var u=n.sketch;u&&(Array.isArray(u)||(u=[u]),u.forEach(function(t){return a(t)}))}function a(t){var e=t.ns,i=t.props,o=void 0===i?[]:i,u=r.vm;e&&(u=e.split(".").reduce(function(t,e){return t[e]},u)),o.length>0&&(n.computed=n.computed||{}),o.forEach(function(t){if(n.computed[t])return console.warn("property duplicate: ".concat(t));n.computed[t]={get:function(){return u[t]},set:function(e){u[t]=e}}})}},beforeDestroy:function(){var t=this,e=this.$options,n=e.kom||e.parent&&e.parent.$kom;if(n){var r=this._subscribe;r&&Object.keys(r).forEach(function(e){t.$unsubscribe(e,r[e])})}}}))}}]),D(e,[{key:"get",value:function(t){return this.d[t]}},{key:"set",value:function(t,e){this.d[t]=e}},{key:"createContext",value:function(t){var n=R(N(e.prototype),"createContext",this).call(this,t);return n.kom=this,n.getVM=this.getVM.bind(this),n.isMatch=function(){return this.ns===this.model.ns},n}}]),e}(T)}])});