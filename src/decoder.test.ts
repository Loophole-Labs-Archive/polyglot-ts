import { TextEncoder } from "util";
import {
  decodeArray,
  decodeBool,
  decodeF32,
  decodeF64,
  decodeI32,
  decodeI64,
  decodeNone,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  InvalidBoolError,
  InvalidF32Error,
  InvalidF64Error,
  InvalidI32Error,
  InvalidI64Error,
  InvalidU16Error,
  InvalidU32Error,
  InvalidU64Error,
  InvalidU8Error,
} from "./decoder";
import {
  encodeArray,
  encodeBool,
  encodeF32,
  encodeF64,
  encodeI32,
  encodeI64,
  encodeNone,
  encodeString,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU8,
} from "./encoder";
import Kind from "./kind";

window.TextEncoder = TextEncoder;

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

    const { size /* , buf */ } = decodeArray(encoded);

    expect(size).toBe(expected.length);

    // let remainingBuf = buf;
    // for (let i = 0; i < size; i += 1) {
    //   const { value, buf } = decodeString(remainingBuf);

    //   expected(value).toBe(expected[i]);

    //   remainingBuf = buf;
    // }

    // expect(remainingBuf.length).toBe(0);

    // expect(() => decodeF64(remainingBuf)).toThrowError(InvalidArrayError);
  });
});
