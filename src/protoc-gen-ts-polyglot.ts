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
    case "int":
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

const getTypeScriptTypeFromProtoType = (
  protoTypeName: string,
  isArray: boolean
) => {
  switch (protoTypeName) {
    case "double":
    case "float":
    case "int":
    case "int32":
    case "uint32":
    case "sint32":
    case "fixed32":
    case "sfixed32":
      if (isArray) {
        return "number[]";
      }

      return "number";

    case "int64":
    case "uint64":
    case "sint64":
    case "fixed64":
    case "sfixed64":
      if (isArray) {
        return "bigint[]";
      }

      return "bigint";

    case "bool":
      if (isArray) {
        return "boolean[]";
      }

      return "boolean";

    case "string":
      if (isArray) {
        return "string[]";
      }

      return "string";

    case "bytes":
      if (isArray) {
        return "Uint8Array[]";
      }

      return "Uint8Array";

    default:
      return protoTypeName; // Is reference of other type
  }
};

const getPolyglotKindFromProtoType = (
  protoTypeName: string,
  fieldName: string
) => {
  switch (protoTypeName) {
    case "double":
      return "Float64";
    case "float":
      return "Float32";
    case "int":
      return "Int32";
    case "int32":
      return "Int32";
    case "uint32":
      return "Uint32";
    case "sint32":
      return "Uint32";
    case "fixed32":
      return "Int32";
    case "sfixed32":
      return "Int32";

    case "int64":
      return "Int64";
    case "uint64":
      return "Uint64";
    case "sint64":
      return "Uint64";
    case "fixed64":
      return "Int64";
    case "sfixed64":
      return "Int64";

    case "bool":
      return "Boolean";

    case "string":
      return "String";

    case "bytes":
      return "Uint8Array";

    default:
      return fieldName; // Is reference of other type
  }
};

const getPolyglotEncoderFromProtoType = (
  protoTypeName: string,
  fieldName: string
) => {
  switch (protoTypeName) {
    case "double":
    case "float":
    case "int":
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
      return `encode${getPolyglotKindFromProtoType(protoTypeName, fieldName)}`;

    default:
      return `${getPolyglotKindFromProtoType(protoTypeName, fieldName)}.encode`; // Is reference of other type
  }
};

const namedImports = new Map<string, null>();
types.forEach((type) =>
  type.fields.forEach((field) => {
    if (isProtoTypeComposite(field.typeName)) {
      return;
    }

    namedImports.set(getPolyglotEncoderFromProtoType(field.typeName, ""), null);
  })
);

types.forEach((type) => {
  const classDeclaration = rootNamespace.addClass({
    name: type.typeName,
    isExported: true,
  });

  classDeclaration.addConstructor({
    parameters: type.fields.map((field) => {
      const typescriptType = getTypeScriptTypeFromProtoType(
        field.typeName,
        field.isArray
      );

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
    const typescriptType = getTypeScriptTypeFromProtoType(
      field.typeName,
      field.isArray
    );

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
      ...type.fields
        .map((field) => {
          if (isProtoTypeComposite(field.typeName)) {
            return [
              `encoded = ${getPolyglotEncoderFromProtoType(
                field.typeName,
                `this._${field.fieldName}`
              )}(encoded)`,
            ];
          }

          if (field.isArray) {
            namedImports.set("encodeArray", null);
            namedImports.set("Kind", null);

            return [
              `encoded = encodeArray(encoded, this._${
                field.fieldName
              }.length, Kind.${getPolyglotKindFromProtoType(
                field.typeName,
                field.fieldName
              )})`,
              `this._${field.fieldName}.forEach(field => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.typeName,
                    `field`
                  )}(encoded, field);
                })`,
            ];
          }

          return [
            `encoded = ${getPolyglotEncoderFromProtoType(
              field.typeName,
              `this._${field.fieldName}`
            )}(encoded, this._${field.fieldName})`,
          ];
        })
        .reduce((prev, curr) => [...prev, ...curr], []),
      `return encoded`,
    ],
  });
});

sourceFile.addImportDeclaration({
  moduleSpecifier: "polyglot-ts",
  namedImports: Array.from(namedImports.keys()),
});

sourceFile.insertStatements(
  0,
  `// Code generated by protoc-gen-ts-polyglot ${version}. DO NOT EDIT.`
);

process.stdout.write(sourceFile.getFullText());
