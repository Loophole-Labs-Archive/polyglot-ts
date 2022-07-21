import { TextEncoder } from "util";
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
import Kind from "./kind";

window.TextEncoder = TextEncoder;

describe("Encoder", () => {
  it("Can encode None", () => {
    const encoded = encodeNone(new Uint8Array());

    expect(encoded.length).toBe(1);
    expect(encoded[0]).toBe(Kind.None);
  });

  it("Can encode true Bool", () => {
    const encoded = encodeBool(new Uint8Array(), true);

    expect(encoded.length).toBe(2);
    expect(encoded[0]).toBe(Kind.Bool);
    expect(encoded[1]).toBe(0x01);
  });

  it("Can encode false Bool", () => {
    const encoded = encodeBool(new Uint8Array(), false);

    expect(encoded.length).toBe(2);
    expect(encoded[0]).toBe(Kind.Bool);
    expect(encoded[1]).toBe(0x00);
  });

  it("Can encode U8", () => {
    const encoded = encodeU8(new Uint8Array(), 32);

    expect(encoded.length).toBe(2);
    expect(encoded[0]).toBe(Kind.U8);
    expect(encoded[1]).toBe(32);
  });

  it("Can encode U16", () => {
    const encoded = encodeU16(new Uint8Array(), 1024);

    expect(encoded.length).toBe(3);
    expect(encoded[0]).toBe(Kind.U16);
    expect(encoded[1]).toBe(0x4);
    expect(encoded[2]).toBe(0x0);
  });

  it("Can encode U32", () => {
    const encoded = encodeU32(new Uint8Array(), 4294967290);

    expect(encoded.length).toBe(5);
    expect(encoded[0]).toBe(Kind.U32);
    expect(encoded[1]).toBe(0xff);
    expect(encoded[2]).toBe(0xff);
    expect(encoded[3]).toBe(0xff);
    expect(encoded[4]).toBe(0xfa);
  });

  it("Can encode U64", () => {
    const encoded = encodeU64(new Uint8Array(), 18446744073709551610n);

    expect(encoded.length).toBe(9);
    expect(encoded[0]).toBe(Kind.U64);
    expect(encoded[1]).toBe(0xff);
    expect(encoded[2]).toBe(0xff);
    expect(encoded[3]).toBe(0xff);
    expect(encoded[4]).toBe(0xff);
    expect(encoded[5]).toBe(0xff);
    expect(encoded[6]).toBe(0xff);
    expect(encoded[7]).toBe(0xff);
    expect(encoded[8]).toBe(0xfa);
  });

  it("Can encode I32", () => {
    const encoded = encodeI32(new Uint8Array(), -2147483648);

    expect(encoded.length).toBe(5);
    expect(encoded[0]).toBe(Kind.I32);
    expect(encoded[1]).toBe(0x80);
    expect(encoded[2]).toBe(0x00);
    expect(encoded[3]).toBe(0x00);
    expect(encoded[4]).toBe(0x00);
  });

  it("Can encode I64", () => {
    const encoded = encodeI64(new Uint8Array(), -9223372036854775808n);

    expect(encoded.length).toBe(9);
    expect(encoded[0]).toBe(Kind.I64);
    expect(encoded[1]).toBe(0x80);
    expect(encoded[2]).toBe(0x00);
    expect(encoded[3]).toBe(0x00);
    expect(encoded[4]).toBe(0x00);
    expect(encoded[5]).toBe(0x00);
    expect(encoded[6]).toBe(0x00);
    expect(encoded[7]).toBe(0x00);
    expect(encoded[8]).toBe(0x00);
  });

  it("Can encode F32", () => {
    const encoded = encodeF32(new Uint8Array(), -214648.34432);

    expect(encoded.length).toBe(5);
    expect(encoded[0]).toBe(Kind.F32);
    expect(encoded[1]).toBe(0xc8);
    expect(encoded[2]).toBe(0x51);
    expect(encoded[3]).toBe(0x9e);
    expect(encoded[4]).toBe(0x16);
  });

  it("Can encode F64", () => {
    const encoded = encodeF64(new Uint8Array(), -922337203685.2345);

    expect(encoded.length).toBe(9);
    expect(encoded[0]).toBe(Kind.F64);
    expect(encoded[1]).toBe(0xc2);
    expect(encoded[2]).toBe(0x6a);
    expect(encoded[3]).toBe(0xd7);
    expect(encoded[4]).toBe(0xf2);
    expect(encoded[5]).toBe(0x9a);
    expect(encoded[6]).toBe(0xbc);
    expect(encoded[7]).toBe(0xa7);
    expect(encoded[8]).toBe(0x81);
  });

  it("Can encode Array", () => {
    const encoded = encodeArray(new Uint8Array(), 32, Kind.String);

    expect(encoded.length).toBe(1 + 1 + 1 + 4);
    expect(encoded[0]).toBe(Kind.Array);
    expect(encoded[1]).toBe(Kind.String);
    expect(encoded[2]).toBe(Kind.U32);
  });

  it("Can encode Map", () => {
    const encoded = encodeMap(new Uint8Array(), 32, Kind.String, Kind.U32);

    expect(encoded.length).toBe(1 + 1 + 1 + 1 + 4);
    expect(encoded[0]).toBe(Kind.Map);
    expect(encoded[1]).toBe(Kind.String);
    expect(encoded[2]).toBe(Kind.U32);
    expect(encoded[3]).toBe(Kind.U32);
  });

  it("Can encode Bytes", () => {
    const expected = new TextEncoder().encode("Test String");

    const encoded = encodeBytes(new Uint8Array(), expected);

    expect(encoded.length).toBe(1 + 1 + 4 + expected.length);
    expect(encoded[0]).toBe(Kind.Bytes);
    expect(encoded.slice(6).buffer).toEqual(expected.buffer);
  });

  it("Can encode String", () => {
    const expected = "Test String";

    const encoded = encodeString(new Uint8Array(), expected);

    expect(encoded.length).toBe(1 + 1 + 4 + expected.length);
    expect(encoded[0]).toBe(Kind.String);
    expect(encoded.slice(6).buffer).toEqual(
      new TextEncoder().encode(expected).buffer
    );
  });

  it("Can encode Error", () => {
    const expected = new Error("Test String");

    const encoded = encodeError(new Uint8Array(), expected);

    expect(encoded.length).toBe(1 + 1 + 4 + expected.message.length);
    expect(encoded[0]).toBe(Kind.Error);
    expect(encoded.slice(6).buffer).toEqual(
      new TextEncoder().encode(expected.message).buffer
    );
  });
});
