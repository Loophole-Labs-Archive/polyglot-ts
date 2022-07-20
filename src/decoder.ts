import Kind from "./kind";

// eslint-disable-next-line import/prefer-default-export
export const decodeNone = (buf: Uint8Array) => ({
  value: buf[0] === Kind.None,
  buf: buf.slice(1),
});
