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

import { TextDecoder, TextEncoder } from "util";
import {
  decodeArray,
  decodeBoolean,
  decodeError,
  decodeFloat32,
  decodeFloat64,
  decodeInt32,
  decodeInt64,
  decodeMap,
  decodeNull,
  decodeString,
  decodeUint16,
  decodeUint32,
  decodeUint64,
  decodeUint8,
  decodeUint8Array,
  InvalidArrayError,
  InvalidBooleanError,
  InvalidErrorError,
  InvalidFloat32Error,
  InvalidFloat64Error,
  InvalidInt32Error,
  InvalidInt64Error,
  InvalidMapError,
  InvalidStringError,
  InvalidUint16Error,
  InvalidUint32Error,
  InvalidUint64Error,
  InvalidUint8ArrayError,
  InvalidUint8Error,
} from "./decoder";
import {
  encodeArray,
  encodeBoolean,
  encodeError,
  encodeFloat32,
  encodeFloat64,
  encodeInt32,
  encodeInt64,
  encodeMap,
  encodeNull,
  encodeString,
  encodeUint16,
  encodeUint32,
  encodeUint64,
  encodeUint8,
  encodeUint8Array,
} from "./encoder";
import { Kind } from "./kind";

window.TextEncoder = TextEncoder;
window.TextDecoder = TextDecoder as typeof window["TextDecoder"];

describe("Decoder", () => {
  it("Can decode Null", () => {
    const encoded = encodeNull(new Uint8Array());

    const { value, buf } = decodeNull(encoded);

    expect(value).toBe(true);
    expect(buf.length).toBe(0);

    const decodedNext = decodeNull(buf);
    expect(decodedNext.value).toBe(false);
  });

  it("Can decode true Boolean", () => {
    const expected = true;

    const encoded = encodeBoolean(new Uint8Array(), expected);

    const { value, buf } = decodeBoolean(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeBoolean(buf)).toThrowError(InvalidBooleanError);
  });

  it("Can decode false Boolean", () => {
    const expected = false;

    const encoded = encodeBoolean(new Uint8Array(), expected);

    const { value, buf } = decodeBoolean(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeBoolean(buf)).toThrowError(InvalidBooleanError);
  });

  it("Can decode Uint8", () => {
    const expected = 32;

    const encoded = encodeUint8(new Uint8Array(), expected);

    const { value, buf } = decodeUint8(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeUint8(buf)).toThrowError(InvalidUint8Error);
  });

  it("Can decode Uint16", () => {
    const expected = 1024;

    const encoded = encodeUint16(new Uint8Array(), expected);

    const { value, buf } = decodeUint16(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeUint16(buf)).toThrowError(InvalidUint16Error);
  });

  it("Can decode Uint32", () => {
    const expected = 4294967290;

    const encoded = encodeUint32(new Uint8Array(), expected);

    const { value, buf } = decodeUint32(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeUint32(buf)).toThrowError(InvalidUint32Error);
  });

  it("Can decode Uint64", () => {
    const expected = 18446744073709551610n;

    const encoded = encodeUint64(new Uint8Array(), expected);

    const { value, buf } = decodeUint64(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeUint64(buf)).toThrowError(InvalidUint64Error);
  });

  it("Can decode Int32", () => {
    const expected = -2147483648;

    const encoded = encodeInt32(new Uint8Array(), expected);

    const { value, buf } = decodeInt32(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeInt32(buf)).toThrowError(InvalidInt32Error);
  });

  it("Can decode Int64", () => {
    const expected = -9223372036854775808n;

    const encoded = encodeInt64(new Uint8Array(), expected);

    const { value, buf } = decodeInt64(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeInt64(buf)).toThrowError(InvalidInt64Error);
  });

  it("Can decode Float32", () => {
    const expected = -214648.34432;

    const encoded = encodeFloat32(new Uint8Array(), expected);

    const { value, buf } = decodeFloat32(encoded);

    expect(value).toBeCloseTo(expected, 2);
    expect(buf.length).toBe(0);

    expect(() => decodeFloat32(buf)).toThrowError(InvalidFloat32Error);
  });

  it("Can decode Float64", () => {
    const expected = -922337203685.2345;

    const encoded = encodeFloat64(new Uint8Array(), expected);

    const { value, buf } = decodeFloat64(encoded);

    expect(value).toBeCloseTo(expected, 4);
    expect(buf.length).toBe(0);

    expect(() => decodeFloat64(buf)).toThrowError(InvalidFloat64Error);
  });

  it("Can decode Array", () => {
    const expected = ["1", "2", "3"];

    let encoded = encodeArray(new Uint8Array(), expected.length, Kind.String);
    expected.forEach((el) => {
      encoded = encodeString(encoded, el);
    });

    const { size, buf } = decodeArray(encoded);

    expect(size).toBe(expected.length);

    let remainingBuf = buf;
    for (let i = 0; i < size; i += 1) {
      const { value, buf: newRemainingBuf } = decodeString(remainingBuf);

      expect(value).toBe(expected[i]);

      remainingBuf = newRemainingBuf;
    }

    expect(remainingBuf.length).toBe(0);

    expect(() => decodeArray(remainingBuf)).toThrowError(InvalidArrayError);
    expect(() =>
      decodeArray(encodeArray(new Uint8Array(), 0, 999999))
    ).toThrowError(InvalidArrayError);
  });

  it("Can decode Map", () => {
    const expected = new Map<string, number>();
    expected.set("1", 1);
    expected.set("2", 2);
    expected.set("3", 3);

    let encoded = encodeMap(
      new Uint8Array(),
      expected.size,
      Kind.String,
      Kind.Uint32
    );
    expected.forEach((value, key) => {
      encoded = encodeUint32(encodeString(encoded, key), value);
    });

    const { size, buf } = decodeMap(encoded);

    expect(size).toBe(expected.size);

    let remainingBuf = buf;
    for (let i = 0; i < size; i += 1) {
      const { value: key, buf: keyBuf } = decodeString(remainingBuf);
      const { value, buf: valueBuf } = decodeUint32(keyBuf);

      expect(expected.get(key.toString())).toBe(value);

      remainingBuf = valueBuf;
    }

    expect(remainingBuf.length).toBe(0);

    expect(() => decodeMap(remainingBuf)).toThrowError(InvalidMapError);
    expect(() =>
      decodeMap(encodeMap(new Uint8Array(), 0, 999999, Kind.String))
    ).toThrowError(InvalidMapError);
    expect(() =>
      decodeMap(encodeMap(new Uint8Array(), 0, Kind.String, 999999))
    ).toThrowError(InvalidMapError);
    expect(() =>
      decodeMap(encodeMap(new Uint8Array(), 0, 999999, 999999))
    ).toThrowError(InvalidMapError);
  });

  it("Can decode Uint8Array", () => {
    const expected = new TextEncoder().encode("Test String");

    const encoded = encodeUint8Array(new Uint8Array(), expected);

    const { value, buf } = decodeUint8Array(encoded);

    expect(value.buffer).toEqual(expected.buffer);
    expect(buf.length).toBe(0);

    expect(() => decodeUint8Array(buf)).toThrowError(InvalidUint8ArrayError);
  });

  it("Can decode String", () => {
    const expected = "Test String";

    const encoded = encodeString(new Uint8Array(), expected);

    const { value, buf } = decodeString(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeString(buf)).toThrowError(InvalidStringError);
  });

  it("Can decode Error", () => {
    const expected = new Error("Test String");

    const encoded = encodeError(new Uint8Array(), expected);

    const { value, buf } = decodeError(encoded);

    expect(value).toEqual(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeError(buf)).toThrowError(InvalidErrorError);
    expect(() => {
      const encodedWithMissingStringKind = encodeError(
        new Uint8Array(),
        expected
      );

      encodedWithMissingStringKind[1] = 999999;

      decodeError(encodedWithMissingStringKind);
    }).toThrowError(InvalidErrorError);
  });
});
