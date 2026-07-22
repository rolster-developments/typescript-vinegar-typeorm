function valueIsPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function normalizeValue(value: any): any {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (valueIsPlainObject(value)) {
    return normalize(value);
  }

  return value;
}

export function normalize(payload: LiteralObject): LiteralObject {
  return Object.entries(payload).reduce(
    (result: LiteralObject, [key, value]) => {
      if (typeof value !== 'undefined') {
        result[key] = normalizeValue(value);
      }

      return result;
    },
    {}
  );
}
