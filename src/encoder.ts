import Kind from "./kind";

const append = (s: Uint8Array, ...vs: Uint8Array[]) => {
  const c = new Uint8Array(
    s.length + vs.reduce((prev, curr) => prev + curr.length, 0)
  );

  c.set(s, 0);

  let len = s.length;
  vs.forEach((arr) => {
    c.set(arr, len);

    len += arr.length;
  });

  return c;
};

// eslint-disable-next-line import/prefer-default-export
export const encodeNone = (buf: Uint8Array) =>
  append(buf, Uint8Array.from([Kind.None]));
