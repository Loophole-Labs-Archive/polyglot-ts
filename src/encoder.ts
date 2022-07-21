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

import {
  numToF32BigEndian,
  numToF64BigEndian,
  numToI32BigEndian,
  numToI64BigEndian,
  numToU16BigEndian,
  numToU32BigEndian,
  numToU64BigEndian,
  numToU8BigEndian,
} from "./endian";
import { Kind } from "./kind";

export const BOOL_FALSE = 0x00;
export const BOOL_TRUE = 0x01;

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

export const encodeNone = (buf: Uint8Array) =>
  append(buf, Uint8Array.from([Kind.None]));

export const encodeBool = (buf: Uint8Array, value: boolean) =>
  append(buf, Uint8Array.from([Kind.Bool, value ? BOOL_TRUE : BOOL_FALSE]));

export const encodeU8 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.U8]), numToU8BigEndian(value));

export const encodeU16 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.U16]), numToU16BigEndian(value));

export const encodeU32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.U32]), numToU32BigEndian(value));

export const encodeU64 = (buf: Uint8Array, value: bigint) =>
  append(buf, Uint8Array.from([Kind.U64]), numToU64BigEndian(value));

export const encodeI32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.I32]), numToI32BigEndian(value));

export const encodeI64 = (buf: Uint8Array, value: bigint) =>
  append(buf, Uint8Array.from([Kind.I64]), numToI64BigEndian(value));

export const encodeF32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.F32]), numToF32BigEndian(value));

export const encodeF64 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.F64]), numToF64BigEndian(value));

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
