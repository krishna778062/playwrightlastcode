const merge = require('lodash/merge');
const unset = require('lodash/unset');
const set = require('lodash/set');

type AnyObject = Record<string, any>;

export class FluentPayloadBuilder<T extends AnyObject> {
  private payload: AnyObject;

  constructor(basePayload: T) {
    // Deep clone to avoid mutation
    this.payload = JSON.parse(JSON.stringify(basePayload));
  }

  override(overrides: Partial<T>): this {
    merge(this.payload, overrides);
    return this;
  }

  remove(path: string): this {
    unset(this.payload, path);
    return this;
  }

  add(path: string, value: any): this {
    set(this.payload, path, value);
    return this;
  }

  get(): T {
    return this.payload as T;
  }
}

export function buildPayload<T extends AnyObject>(basePayload: T): FluentPayloadBuilder<T> {
  return new FluentPayloadBuilder(basePayload);
}
