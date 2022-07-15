import { TextEncoder } from "util";
import {
  encodeArray,
  encodeBytes,
  encodeMap,
  encodeNone,
  encodeU32,
} from "./encoder";
import Kind from "./kind";

window.TextEncoder = TextEncoder;

describe("Encoder", () => {
  it("Can encode None", () => {
    const encoded = encodeNone(new Uint8Array());

    expect(encoded.length).toBe(1);
    expect(encoded[0]).toBe(Kind.None);
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
    const v = new TextEncoder().encode("Test String");

    const encoded = encodeBytes(new Uint8Array(), v);

    expect(encoded.length).toBe(1 + 1 + 4 + v.length);
    expect(encoded[0]).toBe(Kind.Bytes);
    expect(encoded.slice(6).buffer).toEqual(v.buffer);
  });
});
