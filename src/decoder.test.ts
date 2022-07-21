import { TextDecoder, TextEncoder } from "util";
import {
  decodeArray,
  decodeBool,
  decodeBytes,
  decodeError,
  decodeF32,
  decodeF64,
  decodeI32,
  decodeI64,
  decodeMap,
  decodeNone,
  decodeString,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  InvalidArrayError,
  InvalidBoolError,
  InvalidBytesError,
  InvalidErrorError,
  InvalidF32Error,
  InvalidF64Error,
  InvalidI32Error,
  InvalidI64Error,
  InvalidMapError,
  InvalidStringError,
  InvalidU16Error,
  InvalidU32Error,
  InvalidU64Error,
  InvalidU8Error,
} from "./decoder";
import {
  encodeArray,
  encodeBool,
  encodeBytes,
  encodeError,
  encodeF32,
  encodeF64,
  encodeI32,
  encodeI64,
  encodeMap,
  encodeNone,
  encodeString,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU8,
} from "./encoder";
import { Kind } from "./kind";

window.TextEncoder = TextEncoder;
window.TextDecoder = TextDecoder as typeof window["TextDecoder"];

describe("Decoder", () => {
  it("Can decode None", () => {
    const encoded = encodeNone(new Uint8Array());

    const { value, buf } = decodeNone(encoded);

    expect(value).toBe(true);
    expect(buf.length).toBe(0);

    const decodedNext = decodeNone(buf);
    expect(decodedNext.value).toBe(false);
  });

  it("Can decode true Bool", () => {
    const expected = true;

    const encoded = encodeBool(new Uint8Array(), expected);

    const { value, buf } = decodeBool(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeBool(buf)).toThrowError(InvalidBoolError);
  });

  it("Can decode false Bool", () => {
    const expected = false;

    const encoded = encodeBool(new Uint8Array(), expected);

    const { value, buf } = decodeBool(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeBool(buf)).toThrowError(InvalidBoolError);
  });

  it("Can decode U8", () => {
    const expected = 32;

    const encoded = encodeU8(new Uint8Array(), expected);

    const { value, buf } = decodeU8(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeU8(buf)).toThrowError(InvalidU8Error);
  });

  it("Can decode U16", () => {
    const expected = 1024;

    const encoded = encodeU16(new Uint8Array(), expected);

    const { value, buf } = decodeU16(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeU16(buf)).toThrowError(InvalidU16Error);
  });

  it("Can decode U32", () => {
    const expected = 4294967290;

    const encoded = encodeU32(new Uint8Array(), expected);

    const { value, buf } = decodeU32(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeU32(buf)).toThrowError(InvalidU32Error);
  });

  it("Can decode U64", () => {
    const expected = 18446744073709551610n;

    const encoded = encodeU64(new Uint8Array(), expected);

    const { value, buf } = decodeU64(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeU64(buf)).toThrowError(InvalidU64Error);
  });

  it("Can decode I32", () => {
    const expected = -2147483648;

    const encoded = encodeI32(new Uint8Array(), expected);

    const { value, buf } = decodeI32(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeI32(buf)).toThrowError(InvalidI32Error);
  });

  it("Can decode I64", () => {
    const expected = -9223372036854775808n;

    const encoded = encodeI64(new Uint8Array(), expected);

    const { value, buf } = decodeI64(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeI64(buf)).toThrowError(InvalidI64Error);
  });

  it("Can decode F32", () => {
    const expected = -214648.34432;

    const encoded = encodeF32(new Uint8Array(), expected);

    const { value, buf } = decodeF32(encoded);

    expect(value).toBeCloseTo(expected, 2);
    expect(buf.length).toBe(0);

    expect(() => decodeF32(buf)).toThrowError(InvalidF32Error);
  });

  it("Can decode F64", () => {
    const expected = -922337203685.2345;

    const encoded = encodeF64(new Uint8Array(), expected);

    const { value, buf } = decodeF64(encoded);

    expect(value).toBeCloseTo(expected, 4);
    expect(buf.length).toBe(0);

    expect(() => decodeF64(buf)).toThrowError(InvalidF64Error);
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
      Kind.U32
    );
    expected.forEach((value, key) => {
      encoded = encodeU32(encodeString(encoded, key), value);
    });

    const { size, buf } = decodeMap(encoded);

    expect(size).toBe(expected.size);

    let remainingBuf = buf;
    for (let i = 0; i < size; i += 1) {
      const { value: key, buf: keyBuf } = decodeString(remainingBuf);
      const { value, buf: valueBuf } = decodeU32(keyBuf);

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

  it("Can decode Bytes", () => {
    const expected = new TextEncoder().encode("Test String");

    const encoded = encodeBytes(new Uint8Array(), expected);

    const { value, buf } = decodeBytes(encoded);

    expect(value.buffer).toEqual(expected.buffer);
    expect(buf.length).toBe(0);

    expect(() => decodeBytes(buf)).toThrowError(InvalidBytesError);
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
  });
});
