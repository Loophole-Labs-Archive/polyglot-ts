import {
  decodeNone,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  InvalidU16Error,
  InvalidU32Error,
  InvalidU64Error,
  InvalidU8Error,
} from "./decoder";
import {
  encodeNone,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU8,
} from "./encoder";

describe("Decoder", () => {
  it("Can decode None", () => {
    const encoded = encodeNone(new Uint8Array());

    const { value, buf } = decodeNone(encoded);

    expect(value).toBe(true);
    expect(buf.length).toBe(0);

    const decodedNext = decodeNone(buf);
    expect(decodedNext.value).toBe(false);
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
});
