export default class Context {
  toJSON() {
    return {
      ns      : this.ns,
      method  : this.method,
      payload : this.payload,
    };
  }
}
