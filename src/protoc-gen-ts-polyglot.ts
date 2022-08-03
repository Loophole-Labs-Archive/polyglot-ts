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

import fs from "fs";
import protobuf from "protobufjs";
import { ModuleDeclaration, Project } from "ts-morph";
import { getRootAndNamespace, getTypes } from "./ast";

const proto = protobuf.parse(fs.readFileSync(0, "utf8")).root.toJSON().nested!;

const { root, namespace } = getRootAndNamespace(proto);
const types = getTypes(root);

const project = new Project();

const sourceFile = project.createSourceFile("generated.ts");

const rootNamespace = namespace.reduce(
  (prev, curr) =>
    prev.addModule({
      name: curr,
      isExported: true,
    }),
  sourceFile as unknown as ModuleDeclaration
);

types.forEach((type) => {
  const classDeclaration = rootNamespace.addClass({
    name: type.typeName,
    isExported: true,
  });

  type.fields.forEach((field) =>
    classDeclaration.addProperty({
      name: field.fieldName,
      type: (() => {
        switch (field.typeName) {
          case "double":
          case "float":
          case "int32":
          case "uint32":
          case "sint32":
          case "fixed32":
          case "sfixed32":
            return "number";

          case "int64":
          case "uint64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            return "bigint";

          case "bool":
            return "boolean";

          case "string":
            return "string";

          case "bytes":
            return "Uint8Array";

          default:
            return field.typeName; // Is reference of other type
        }
      })(),
    })
  );
});

process.stdout.write(sourceFile.getText());
