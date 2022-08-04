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
import { version } from "../package.json";
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

const isProtoTypeComposite = (protoTypeName: string) => {
  switch (protoTypeName) {
    case "double":
    case "float":
    case "int32":
    case "uint32":
    case "sint32":
    case "fixed32":
    case "sfixed32":
    case "int64":
    case "uint64":
    case "sint64":
    case "fixed64":
    case "sfixed64":
    case "bool":
    case "string":
    case "bytes":
      return false;

    default:
      return true;
  }
};

const getTypeScriptTypeFromProtoType = (protoTypeName: string) => {
  switch (protoTypeName) {
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
      return protoTypeName; // Is reference of other type
  }
};

const getPolyglotEncoderFromProtoType = (
  protoTypeName: string,
  fieldName: string
) => {
  switch (protoTypeName) {
    case "double":
      return "encodeFloat64";
    case "float":
      return "encodeFloat32";
    case "int32":
      return "encodeInt32";
    case "uint32":
      return "encodeUint32";
    case "sint32":
      return "encodeUint32";
    case "fixed32":
      return "encodeInt32";
    case "sfixed32":
      return "encodeInt32";

    case "int64":
      return "encodeInt64";
    case "uint64":
      return "encodeUint64";
    case "sint64":
      return "encodeUint64";
    case "fixed64":
      return "encodeInt64";
    case "sfixed64":
      return "encodeInt64";

    case "bool":
      return "encodeBoolean";

    case "string":
      return "encodeString";

    case "bytes":
      return "encodeUint8Array";

    default:
      return `${fieldName}.encode`; // Is reference of other type
  }
};

const fieldTypes = new Map<string, null>();
types.forEach((type) =>
  type.fields.forEach((field) => {
    if (isProtoTypeComposite(field.typeName)) {
      return;
    }

    fieldTypes.set(getPolyglotEncoderFromProtoType(field.typeName, ""), null);
  })
);

sourceFile.addImportDeclaration({
  moduleSpecifier: "polyglot-ts",
  namedImports: Array.from(fieldTypes.keys()),
});

types.forEach((type) => {
  const classDeclaration = rootNamespace.addClass({
    name: type.typeName,
    isExported: true,
  });

  classDeclaration.addConstructor({
    parameters: type.fields.map((field) => {
      const typescriptType = getTypeScriptTypeFromProtoType(field.typeName);

      return {
        name: field.fieldName,
        type: typescriptType,
      };
    }),
    statements: type.fields.map(
      (field) => `this._${field.fieldName} = ${field.fieldName}`
    ),
  });

  type.fields.forEach((field) => {
    const typescriptType = getTypeScriptTypeFromProtoType(field.typeName);

    classDeclaration.addProperty({
      name: `private _${field.fieldName}`,
      type: typescriptType,
    });

    classDeclaration.addGetAccessor({
      name: field.fieldName,
      returnType: typescriptType,
      statements: `return this._${field.fieldName}`,
    });

    classDeclaration.addSetAccessor({
      name: field.fieldName,
      parameters: [
        {
          name: field.fieldName,
          type: typescriptType,
        },
      ],
      statements: `this._${field.fieldName} = ${field.fieldName}`,
    });
  });

  classDeclaration.addMethod({
    name: "encode",
    returnType: "Uint8Array",
    parameters: [
      {
        name: "buf",
        type: "Uint8Array",
      },
    ],
    statements: [
      `let encoded = buf`,
      ...type.fields.map((field) => {
        if (isProtoTypeComposite(field.typeName)) {
          return `encoded = ${getPolyglotEncoderFromProtoType(
            field.typeName,
            `this._${field.fieldName}`
          )}(encoded)`;
        }

        return `encoded = ${getPolyglotEncoderFromProtoType(
          field.typeName,
          `this._${field.fieldName}`
        )}(encoded, this._${field.fieldName})`;
      }),
      `return encoded`,
    ],
  });
});

sourceFile.insertStatements(
  0,
  `// Code generated by protoc-gen-ts-polyglot ${version}. DO NOT EDIT.`
);

process.stdout.write(sourceFile.getFullText());
