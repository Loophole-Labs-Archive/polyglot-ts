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

import path from "path";
import protobuf from "protobufjs";
import { getEnums, getRootAndNamespace, getTypes } from "./ast";

describe("AST", () => {
  it("Can get root and namespace from simple protobuf", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "simple.proto"))
      .toJSON().nested!;

    const { root, namespace } = getRootAndNamespace(proto);

    expect(namespace).toEqual([
      "io",
      "loopholelabs",
      "polyglot",
      "test",
      "data",
      "simple",
    ]);
    expect(root).toMatchSnapshot();
  });

  it("Can get AST from simple protobuf", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "simple.proto"))
      .toJSON().nested!;

    const { root } = getRootAndNamespace(proto);
    const types = getTypes(root);

    expect(types).toMatchSnapshot();
  });

  it("Can get root and namespace from complex, unordered protobuf", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "complex.proto"))
      .toJSON().nested!;

    const { root, namespace } = getRootAndNamespace(proto);

    expect(namespace).toEqual([
      "io",
      "loopholelabs",
      "polyglot",
      "test",
      "data",
      "complex",
    ]);
    expect(root).toMatchSnapshot();
  });

  it("Can get AST from complex, unordered protobuf", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "complex.proto"))
      .toJSON().nested!;

    const { root } = getRootAndNamespace(proto);

    const types = getTypes(root);
    expect(types).toMatchSnapshot();

    const enums = getEnums(root);
    expect(enums).toMatchSnapshot();
  });

  it("Can get AST from protobuf with array", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "array.proto"))
      .toJSON().nested!;

    const { root } = getRootAndNamespace(proto);

    const types = getTypes(root);
    expect(types).toMatchSnapshot();

    const enums = getEnums(root);
    expect(enums).toMatchSnapshot();
  });

  it("Can get AST from protobuf with map", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "map.proto"))
      .toJSON().nested!;

    const { root } = getRootAndNamespace(proto);

    const types = getTypes(root);
    expect(types).toMatchSnapshot();

    const enums = getEnums(root);
    expect(enums).toMatchSnapshot();
  });

  it("Can get AST from protobuf with enum", () => {
    const proto = protobuf
      .loadSync(path.join(__dirname, "..", "data", "enum.proto"))
      .toJSON().nested!;

    const { root } = getRootAndNamespace(proto);

    const types = getTypes(root);
    expect(types).toMatchSnapshot();

    const enums = getEnums(root);
    expect(enums).toMatchSnapshot();
  });
});
