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

import JSONBigint from "json-bigint";
import fetch from "node-fetch";
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
} from "./decoder";
import {
  encodeArray,
  encodeBool,
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

// TODO: Use release version here once test data has been released
const TEST_DATA_URL =
  "https://github.com/loopholelabs/polyglot-test-data/releases/download/unstable/polyglot-test-data.json";

interface ITestData {
  name: string;
  kind: Kind;
  decodedValue: any;
  encodedValue: Uint8Array;
}

const base64ToUint8Array = (base64: string) => {
  const buf = Buffer.from(base64, "base64");

  return new Uint8Array(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  );
};

describe("Integration test", () => {
  let testData: ITestData[] = [];

  beforeAll(async () => {
    const rawTestData = JSONBigint.parse(
      await (await fetch(TEST_DATA_URL)).text()
    );

    testData = (rawTestData as any[]).map((el: any) => {
      el.encodedValue = base64ToUint8Array(el.encodedValue);

      return el;
    });
  });

  it("Can run the decode tests from the test data", () => {
    testData.forEach((v) => {
      switch (v.kind) {
        case Kind.Null: {
          const decoded = decodeNull(v.encodedValue);

          if (v.decodedValue === null) {
            expect(decoded.value).toBe(true);
          } else {
            expect(decoded.value).toBe(false);
          }

          return;
        }

        case Kind.Boolean: {
          const decoded = decodeBoolean(v.encodedValue);

          expect(decoded.value).toBe(v.decodedValue);

          return;
        }

        case Kind.Uint8: {
          const decoded = decodeUint8(v.encodedValue);

          expect(decoded.value).toBe(v.decodedValue);

          return;
        }

        case Kind.Uint16: {
          const decoded = decodeUint16(v.encodedValue);

          expect(decoded.value).toBe(v.decodedValue);

          return;
        }

        case Kind.Uint32: {
          const decoded = decodeUint32(v.encodedValue);

          expect(decoded.value).toBe(v.decodedValue);

          return;
        }

        case Kind.Uint64: {
          const decoded = decodeUint64(v.encodedValue);

          expect(decoded.value).toBe(BigInt(v.decodedValue));

          return;
        }

        case Kind.Int32: {
          const decoded = decodeInt32(v.encodedValue);

          expect(decoded.value).toBe(v.decodedValue);

          return;
        }

        case Kind.Int64: {
          const decoded = decodeInt64(v.encodedValue);

          expect(decoded.value).toBe(BigInt(v.decodedValue));

          return;
        }

        case Kind.Float32: {
          const decoded = decodeFloat32(v.encodedValue);

          expect(decoded.value).toBeCloseTo(v.decodedValue, 2);

          return;
        }

        case Kind.Float64: {
          const decoded = decodeFloat64(v.encodedValue);

          expect(decoded.value).toBe(parseFloat(v.decodedValue));

          return;
        }

        case Kind.Array: {
          const { size, buf } = decodeArray(v.encodedValue);

          expect(size).toBe(v.decodedValue.length);

          let remainingBuf = buf;
          for (let i = 0; i < size; i += 1) {
            const { value, buf: newRemainingBuf } = decodeString(remainingBuf);

            expect(value).toBe(v.decodedValue[i]);

            remainingBuf = newRemainingBuf;
          }

          return;
        }

        case Kind.Map: {
          const { size, buf } = decodeMap(v.encodedValue);

          expect(size).toBe(Object.keys(v.decodedValue).length);

          let remainingBuf = buf;
          for (let i = 0; i < size; i += 1) {
            const { value: key, buf: keyBuf } = decodeString(remainingBuf);
            const { value, buf: valueBuf } = decodeUint32(keyBuf);

            expect(v.decodedValue[key.toString()]).toBe(value);

            remainingBuf = valueBuf;
          }

          return;
        }

        case Kind.Uint8Array: {
          const decoded = decodeUint8Array(v.encodedValue);

          expect(decoded.value).toEqual(base64ToUint8Array(v.decodedValue));

          return;
        }

        case Kind.String: {
          const decoded = decodeString(v.encodedValue);

          expect(decoded.value).toBe(v.decodedValue);

          return;
        }

        case Kind.Error: {
          const decoded = decodeError(v.encodedValue);

          expect(decoded.value).toEqual(new Error(v.decodedValue));

          return;
        }

        default:
          throw new Error(
            "Unimplemented decoder for  kind " + v.kind + " and test " + v.name
          );
      }
    });
  });

  it("Can run the encode tests from the test data", () => {
    testData.forEach((v) => {
      switch (v.kind) {
        case Kind.Null: {
          const encoded = encodeNull(new Uint8Array());

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Boolean: {
          const encoded = encodeBool(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Uint8: {
          const encoded = encodeUint8(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Uint16: {
          const encoded = encodeUint16(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Uint32: {
          const encoded = encodeUint32(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Uint64: {
          const encoded = encodeUint64(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Int32: {
          const encoded = encodeInt32(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Int64: {
          const encoded = encodeInt64(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Float32: {
          const encoded = encodeFloat32(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Float64: {
          const encoded = encodeFloat64(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Array: {
          let encoded = encodeArray(
            new Uint8Array(),
            v.decodedValue.length,
            Kind.String
          );
          v.decodedValue.forEach((el: string) => {
            encoded = encodeString(encoded, el);
          });

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Map: {
          let encoded = encodeMap(
            new Uint8Array(),
            Object.keys(v.decodedValue).length,
            Kind.String,
            Kind.Uint32
          );
          Object.entries(v.decodedValue)
            .sort(([prevKey], [currKey]) => prevKey.localeCompare(currKey))
            .forEach(([key, value]: any[]) => {
              encoded = encodeString(encoded, key);
              encoded = encodeUint32(encoded, value);
            });

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Uint8Array: {
          const encoded = encodeUint8Array(
            new Uint8Array(),
            base64ToUint8Array(v.decodedValue)
          );

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.String: {
          const encoded = encodeString(new Uint8Array(), v.decodedValue);

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        case Kind.Error: {
          const encoded = encodeError(
            new Uint8Array(),
            new Error(v.decodedValue)
          );

          expect(encoded).toEqual(v.encodedValue);

          return;
        }

        default:
          throw new Error(
            "Unimplemented encoder for  kind " + v.kind + " and test " + v.name
          );
      }
    });
  });
});
