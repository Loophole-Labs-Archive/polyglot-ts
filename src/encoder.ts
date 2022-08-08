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
  numToFloat32BigEndian,
  numToFloat64BigEndian,
  numToInt32BigEndian,
  numToInt64BigEndian,
  numToUint16BigEndian,
  numToUint32BigEndian,
  numToUint64BigEndian,
  numToUint8BigEndian,
} from "./endian";
import { Kind } from "./kind";

export const BOOLEAN_FALSE = 0x00;
export const BOOLEAN_TRUE = 0x01;

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

export const encodeNull = (buf: Uint8Array) =>
  append(buf, Uint8Array.from([Kind.Null]));

export const encodeAny = (buf: Uint8Array) =>
  append(buf, Uint8Array.from([Kind.Any]));

export const encodeBoolean = (buf: Uint8Array, value: boolean) =>
  append(
    buf,
    Uint8Array.from([Kind.Boolean, value ? BOOLEAN_TRUE : BOOLEAN_FALSE])
  );

export const encodeUint8 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.Uint8]), numToUint8BigEndian(value));

export const encodeUint16 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.Uint16]), numToUint16BigEndian(value));

export const encodeUint32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.Uint32]), numToUint32BigEndian(value));

export const encodeUint64 = (buf: Uint8Array, value: bigint) =>
  append(buf, Uint8Array.from([Kind.Uint64]), numToUint64BigEndian(value));

export const encodeInt32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.Int32]), numToInt32BigEndian(value));

export const encodeInt64 = (buf: Uint8Array, value: bigint) =>
  append(buf, Uint8Array.from([Kind.Int64]), numToInt64BigEndian(value));

export const encodeFloat32 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.Float32]), numToFloat32BigEndian(value));

export const encodeFloat64 = (buf: Uint8Array, value: number) =>
  append(buf, Uint8Array.from([Kind.Float64]), numToFloat64BigEndian(value));

export const encodeArray = (buf: Uint8Array, size: number, valueKind: Kind) =>
  append(
    buf,
    Uint8Array.from([Kind.Array, valueKind]),
    encodeUint32(new Uint8Array(), size)
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
    encodeUint32(new Uint8Array(), size)
  );

export const encodeUint8Array = (buf: Uint8Array, value: Uint8Array) =>
  append(
    buf,
    Uint8Array.from([Kind.Uint8Array]),
    encodeUint32(new Uint8Array(), value.length),
    value
  );

export const encodeString = (buf: Uint8Array, value: string) => {
  const v = new TextEncoder().encode(value);

  return append(
    buf,
    Uint8Array.from([Kind.String]),
    encodeUint32(new Uint8Array(), v.length),
    v
  );
};

export const encodeError = (buf: Uint8Array, value: Error) => {
  const v = new TextEncoder().encode(value.message);

  return append(
    buf,
    Uint8Array.from([Kind.Error, Kind.String]),
    encodeUint32(new Uint8Array(), v.length),
    v
  );
};
