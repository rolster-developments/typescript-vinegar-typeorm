function normalizeValue(value: any): any {
  return typeof value === 'object' && value !== null
    ? Array.isArray(value)
      ? value.map((item) => normalizeValue(item))
      : normalize(value)
    : value;
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
