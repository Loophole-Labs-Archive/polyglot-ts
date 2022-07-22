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

import fetch from "node-fetch";
import { decodeBoolean, decodeNull } from "./decoder";
import { Kind } from "./kind";

// TODO: Use release version here once test data has been released
const TEST_DATA_URL =
  "https://github.com/loopholelabs/polyglot-test-data/releases/download/unstable/polyglot-test-data.json";

interface ITestData {
  name: string;
  kind: Kind;
  decodedValue: any;
  encodedValue: Uint8Array;
}

describe("Integration test", () => {
  let testData: ITestData[] = [];

  beforeAll(async () => {
    const rawTestData = await (await fetch(TEST_DATA_URL)).json();

    testData = (rawTestData as any[]).map((el: any) => {
      el.encodedValue = Buffer.from(el.encodedValue, "base64");

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
      }
    });
  });
});
