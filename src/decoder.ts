import Kind from "./kind";

export class InvalidU32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidU32Error.prototype);
  }
}

export const decodeNone = (buf: Uint8Array) => ({
  value: buf[0] === Kind.None,
  buf: buf.slice(1),
});

export const decodeU32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.U32) {
    throw new InvalidU32Error();
  }

  const dataView = new DataView(buf.slice(1, 5).buffer);

  return {
    value: dataView.getUint32(0, false),
    buf: buf.slice(5),
  };
};
