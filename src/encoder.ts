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

const numToU32BigEndian = (num: number) => {
  const dataView = new DataView(Uint32Array.from([0]).buffer);

  dataView.setUint32(0, num, false);

  return new Uint8Array(dataView.buffer);
};

export const encodeNone = (buf: Uint8Array) =>
  append(buf, Uint8Array.from([Kind.None]));

export const encodeU32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.U32]), numToU32BigEndian(value));

export const encodeArray = (buf: Uint8Array, size: number, valueKind: Kind) =>
  append(
    buf,
    Uint8Array.from([Kind.Array, valueKind]),
    encodeU32(new Uint8Array(), size)
  );

export const encodeMap = (
  buf: Uint8Array,
  size: number,
  keyKind: Kind,
  valueKind: Kind
) =>
  append(
    buf,
    Uint8Array.from([Kind.Map, keyKind, valueKind]),
    encodeU32(new Uint8Array(), size)
  );

export const encodeBytes = (buf: Uint8Array, value: Uint8Array) =>
  append(
    buf,
    Uint8Array.from([Kind.Bytes]),
    encodeU32(new Uint8Array(), value.length),
    value
  );

export const encodeString = (buf: Uint8Array, value: string) => {
  const v = new TextEncoder().encode(value);

  return append(
    buf,
    Uint8Array.from([Kind.String]),
    encodeU32(new Uint8Array(), v.length),
    v
  );
};

export const encodeError = (buf: Uint8Array, value: Error) => {
  const v = new TextEncoder().encode(value.message);

  return append(
    buf,
    Uint8Array.from([Kind.Error]),
    encodeU32(new Uint8Array(), v.length),
    v
  );
};
