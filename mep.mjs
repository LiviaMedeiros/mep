const mepMap = Symbol();
const mepExtract = Symbol();
const mepDebug = Symbol();

class Mep {
  #Map = new Map;
  #bridge = Object.freeze(
    Object.defineProperties(
      Object.assign(
        Object.create(Map.prototype),
        {
          toJSON: () =>
            Object.fromEntries(this.#Map),
          [Symbol.toPrimitive]: hint =>
            hint === 'number'? this.#Map.size:
            JSON.stringify(this.#bridge)
        },
        Object.fromEntries([
          ...[
            'get', 'set', 'has', 'delete'
          ].map(method =>
            [method, (key, ...$) =>
              this.#Map[method](`${key}`, ...$)]
          ),
          ...[
            'entries', 'forEach', 'values',
            'keys', 'clear', Symbol.iterator
          ].map(method =>
            [method, this.#Map[method].bind(this.#Map)]
          )
        ])
      ),
      {
        size: {
          get: () =>
            this.#Map.size
        }
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
          key === Symbol.toStringTag? 'Mep':
          key === Symbol.iterator? this.#Map[Symbol.iterator].bind(this.#Map):
          key === Symbol.toPrimitive? hint =>
            hint === 'number'? this.#Map.size:
            JSON.stringify(this.#bridge):
          key === mepMap? this.#bridge:
          key === mepExtract? (revoke(), this.#Map):
          key === mepDebug? this.#Map:
          this.#Map.get(`${key}`),
        set: (_, key, value) =>
          this.#Map.set(`${key}`, value),
        has: (_, key) =>
          this.#Map.has(`${key}`),
        deleteProperty: (_, key) =>
          this.#Map.delete(`${key}`),
        ownKeys: () =>
          [...this.#Map.keys()],
        getOwnPropertyDescriptor: (_, key) =>
          this.#Map.has(`${key}`)? {
            writable: true,
            enumerable: true,
            configurable: true
          }:
          undefined,
      }
    );
    return proxy;
  }
  static Map(mep) {
    if (mep instanceof Mep)
      return mep[mepMap];
    throw new TypeError('mep is not an instance of Mep', { cause: { mep } });
  }
  static extract(mep) {
    if (mep instanceof Mep)
      return mep[mepExtract];
    throw new TypeError('mep is not an instance of Mep', { cause: { mep } });
  }
};

export {
  Mep,
  mepMap,
  mepExtract,
};
