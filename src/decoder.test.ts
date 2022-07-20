import { decodeNone } from "./decoder";
import { encodeNone } from "./encoder";

describe("Decoder", () => {
  it("Can decode None", () => {
    const encoded = encodeNone(new Uint8Array());

    const decoded = decodeNone(encoded);

    expect(decoded.value).toBe(true);
    expect(decoded.buf.length).toBe(0);

    const decodedNext = decodeNone(decoded.buf);
    expect(decodedNext.value).toBe(false);
  });
});
