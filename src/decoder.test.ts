import { decodeNone, decodeU32, InvalidU32Error } from "./decoder";
import { encodeNone, encodeU32 } from "./encoder";

describe("Decoder", () => {
  it("Can decode None", () => {
    const encoded = encodeNone(new Uint8Array());

    const decoded = decodeNone(encoded);

    expect(decoded.value).toBe(true);
    expect(decoded.buf.length).toBe(0);

    const decodedNext = decodeNone(decoded.buf);
    expect(decodedNext.value).toBe(false);
  });

  it("Can decode U32", () => {
    const expected = 4294967290;

    const encoded = encodeU32(new Uint8Array(), expected);

    const { value, buf } = decodeU32(encoded);

    expect(value).toBe(expected);
    expect(buf.length).toBe(0);

    expect(() => decodeU32(buf)).toThrowError(InvalidU32Error);
  });
});
