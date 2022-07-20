/* eslint-disable max-classes-per-file */
import {
  u16BigEndianToNum,
  u32BigEndianToNum,
  u64BigEndianToNum,
  u8BigEndianToNum,
} from "./endian";
import Kind from "./kind";

export class InvalidU8Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidU8Error.prototype);
  }
}

export class InvalidU16Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidU16Error.prototype);
  }
}

export class InvalidU32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidU32Error.prototype);
  }
}

export class InvalidU64Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidU64Error.prototype);
  }
}

export const decodeNone = (buf: Uint8Array) => ({
  value: buf[0] === Kind.None,
  buf: buf.slice(1),
});

export const decodeU8 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.U8) {
    throw new InvalidU8Error();
  }

  return {
    value: u8BigEndianToNum(buf.slice(1, 3)),
    buf: buf.slice(3),
  };
};

export const decodeU16 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.U16) {
    throw new InvalidU16Error();
  }

  return {
    value: u16BigEndianToNum(buf.slice(1, 4)),
    buf: buf.slice(4),
  };
};

export const decodeU32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.U32) {
    throw new InvalidU32Error();
  }

  return {
    value: u32BigEndianToNum(buf.slice(1, 5)),
    buf: buf.slice(5),
  };
};

export const decodeU64 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.U64) {
    throw new InvalidU64Error();
  }

  return {
    value: u64BigEndianToNum(buf.slice(1, 9)),
    buf: buf.slice(9),
  };
};
