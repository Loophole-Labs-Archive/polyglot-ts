/*
	Copyright 2022 Loophole Labs

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		   http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

import { BOOLEAN_TRUE } from "./encoder";
import {
  float32BigEndianToNum,
  float64BigEndianToNum,
  int32BigEndianToNum,
  int64BigEndianToNum,
  uint16BigEndianToNum,
  uint32BigEndianToNum,
  uint64BigEndianToNum,
  uint8BigEndianToNum,
} from "./endian";
import { Kind } from "./kind";

export class InvalidBooleanError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidBooleanError.prototype);
  }
}

export class InvalidUint8Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidUint8Error.prototype);
  }
}

export class InvalidUint16Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidUint16Error.prototype);
  }
}

export class InvalidUint32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidUint32Error.prototype);
  }
}

export class InvalidUint64Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidUint64Error.prototype);
  }
}

export class InvalidInt32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidInt32Error.prototype);
  }
}

export class InvalidInt64Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidInt64Error.prototype);
  }
}

export class InvalidFloat32Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidFloat32Error.prototype);
  }
}

export class InvalidFloat64Error extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidFloat64Error.prototype);
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

export class InvalidUint8ArrayError extends Error {
  constructor() {
    super();

    Object.setPrototypeOf(this, InvalidUint8ArrayError.prototype);
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

export const decodeNull = (buf: Uint8Array) => ({
  value: buf[0] === Kind.Null,
  buf: buf.slice(1),
});

export const decodeAny = (buf: Uint8Array) => ({
  value: buf[0] === Kind.Any,
  buf: buf.slice(1),
});

export const decodeBoolean = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Boolean) {
    throw new InvalidBooleanError();
  }

  return {
    value: buf[1] === BOOLEAN_TRUE,
    buf: buf.slice(2),
  };
};

export const decodeUint8 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Uint8) {
    throw new InvalidUint8Error();
  }

  return {
    value: uint8BigEndianToNum(buf.slice(1, 3)),
    buf: buf.slice(3),
  };
};

export const decodeUint16 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Uint16) {
    throw new InvalidUint16Error();
  }

  return uint16BigEndianToNum(buf);
};

export const decodeUint32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Uint32) {
    throw new InvalidUint32Error();
  }

  return uint32BigEndianToNum(buf);
};

export const decodeUint64 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Uint64) {
    throw new InvalidUint64Error();
  }

  return uint64BigEndianToNum(buf);
};

export const decodeInt32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Int32) {
    throw new InvalidInt32Error();
  }

  return int32BigEndianToNum(buf);
};

export const decodeInt64 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Int64) {
    throw new InvalidInt64Error();
  }

  return int64BigEndianToNum(buf);
};

export const decodeFloat32 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Float32) {
    throw new InvalidFloat32Error();
  }

  return {
    value: float32BigEndianToNum(buf.slice(1, 5)),
    buf: buf.slice(5),
  };
};

export const decodeFloat64 = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Float64) {
    throw new InvalidFloat64Error();
  }

  return {
    value: float64BigEndianToNum(buf.slice(1, 9)),
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

  const { value: size, buf: remainingBuf } = decodeUint32(buf.slice(2));

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

  const { value: size, buf: remainingBuf } = decodeUint32(buf.slice(3));

  return {
    size,
    buf: remainingBuf,
  };
};

export const decodeUint8Array = (buf: Uint8Array) => {
  const kind = buf[0] as Kind;
  if (kind !== Kind.Uint8Array) {
    throw new InvalidUint8ArrayError();
  }

  const { value: size, buf: remainingBuf } = decodeUint32(buf.slice(1));

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

  const { value: size, buf: remainingBuf } = decodeUint32(buf.slice(1));

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

  const nestedType = buf[1] as Kind;
  if (nestedType !== Kind.String) {
    throw new InvalidErrorError();
  }

  const { value: size, buf: remainingBuf } = decodeUint32(buf.slice(2));

  const value = new Error(
    new TextDecoder().decode(remainingBuf.slice(0, size))
  );

  return {
    value,
    buf: remainingBuf.slice(size),
  };
};
