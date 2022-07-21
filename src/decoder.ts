/* eslint-disable max-classes-per-file */
import { BOOL_TRUE } from "./encoder";
import {
  f32BigEndianToNum,
  f64BigEndianToNum,
  i32BigEndianToNum,
  i64BigEndianToNum,
  u16BigEndianToNum,
  u32BigEndianToNum,
  u64BigEndianToNum,
  u8BigEndianToNum,
} from "./endian";
import Kind from "./kind";

export class InvalidBoolError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidBoolError.prototype);
  }
}

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

export class InvalidI32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidI32Error.prototype);
  }
}

export class InvalidI64Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidI64Error.prototype);
  }
}

export class InvalidF32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidF32Error.prototype);
  }
}

export class InvalidF64Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidF64Error.prototype);
  }
}

export class InvalidArrayError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidArrayError.prototype);
  }
}

export class InvalidMapError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidMapError.prototype);
  }
}

export class InvalidBytesError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidBytesError.prototype);
  }
}

export class InvalidStringError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidStringError.prototype);
  }
}

export class InvalidErrorError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidErrorError.prototype);
  }
}

export const decodeNone = (buf: Uint8Array) => ({
  value: buf[0] === Kind.None,
  buf: buf.slice(1),
});

export const decodeBool = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Bool) {
    throw new InvalidBoolError();
  }

  return {
    value: buf[1] === BOOL_TRUE,
    buf: buf.slice(2),
  };
};

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

export const decodeI32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.I32) {
    throw new InvalidI32Error();
  }

  return {
    value: i32BigEndianToNum(buf.slice(1, 5)),
    buf: buf.slice(5),
  };
};

export const decodeI64 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.I64) {
    throw new InvalidI64Error();
  }

  return {
    value: i64BigEndianToNum(buf.slice(1, 9)),
    buf: buf.slice(9),
  };
};

export const decodeF32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.F32) {
    throw new InvalidF32Error();
  }

  return {
    value: f32BigEndianToNum(buf.slice(1, 5)),
    buf: buf.slice(5),
  };
};

export const decodeF64 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.F64) {
    throw new InvalidF64Error();
  }

  return {
    value: f64BigEndianToNum(buf.slice(1, 9)),
    buf: buf.slice(9),
  };
};

export const decodeArray = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Array) {
    throw new InvalidArrayError();
  }

  const valueKind = buf[1] as Kind;
  if (!(valueKind in Kind)) {
    throw new InvalidArrayError();
  }

  const { value: size, buf: remainingBuf } = decodeU32(buf.slice(2));

  return {
    size,
    buf: remainingBuf,
  };
};

export const decodeMap = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Map) {
    throw new InvalidMapError();
  }

  const keyKind = buf[1] as Kind;
  if (!(keyKind in Kind)) {
    throw new InvalidMapError();
  }

  const valueKind = buf[2] as Kind;
  if (!(valueKind in Kind)) {
    throw new InvalidMapError();
  }

  const { value: size, buf: remainingBuf } = decodeU32(buf.slice(3));

  return {
    size,
    buf: remainingBuf,
  };
};

export const decodeBytes = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Bytes) {
    throw new InvalidBytesError();
  }

  const { value: size, buf: remainingBuf } = decodeU32(buf.slice(1));

  return {
    value: remainingBuf.slice(0, size),
    buf: remainingBuf.slice(size),
  };
};

export const decodeString = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.String) {
    throw new InvalidStringError();
  }

  const { value: size, buf: remainingBuf } = decodeU32(buf.slice(1));

  const value = new TextDecoder().decode(remainingBuf.slice(0, size));

  return {
    value,
    buf: remainingBuf.slice(size),
  };
};

export const decodeError = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Error) {
    throw new InvalidErrorError();
  }

  const { value: size, buf: remainingBuf } = decodeU32(buf.slice(1));

  const value = new Error(
    new TextDecoder().decode(remainingBuf.slice(0, size))
  );

  return {
    value,
    buf: remainingBuf.slice(size),
  };
};
