const mepMap = Symbol();
const mepExtract = Symbol();
const mepDebug = Symbol();

class Mep {
  #Map = new Map;
  #bridge = Object.freeze(
    Object.defineProperty(
      Object.assign(
        Object.create(null),
        {
          get: key =>
            this.#Map.get(`${key}`),
          set: (key, value) =>
            this.#Map.set(`${key}`, value),
          has: key =>
            this.#Map.has(`${key}`),
          delete: key =>
            this.#Map.delete(`${key}`),
        },
        Object.fromEntries([
            'entries', 'forEach', 'values',
            'keys', 'clear', Symbol.iterator
          ].map(name =>
            [name, this.#Map[name].bind(this.#Map)]
          )
        )
      ), 'size', {
        get: () =>
          this.#Map.size
      }
    )
  );
  constructor(iterable) {
    for (const [key, value] of iterable)
      this.#Map.set(`${key}`, value);
    const { proxy, revoke } = Proxy.revocable(
      this,
      {
        get: (_, key) =>
          key === mepMap? this.#bridge:
          key === mepExtract? (revoke(), this.#Map):
          key === mepDebug? this.#Map:
          this.#Map.get(key),
        set: (_, key, value) =>
          this.#Map.set(`${key}`, value),
        has: (_, key) =>
          this.#Map.has(key),
        deleteProperty: (_, key) =>
          this.#Map.delete(key),
        ownKeys: () =>
          [...this.#Map.keys()],
        getOwnPropertyDescriptor: (_, key) =>
          this.#Map.has(key)? {
            writable: true,
            enumerable: true,
            configurable: true
          }:
          undefined
      }
    );
    return proxy;
  }
};

export {
  Mep,
  mepMap,
  mepExtract,
};
