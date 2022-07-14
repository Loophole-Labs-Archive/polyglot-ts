import { encodeNone } from "./encoder";
import Kind from "./kind";

describe("Encoder", () => {
  it("Can encode None", () => {
    const encoded = encodeNone(new Uint8Array());

    expect(encoded.length).toBe(1);
    expect(encoded[0]).toBe(Kind.None);
  });
});
