#!/usr/bin/env node

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
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import protobuf from "protobufjs";
import { ModuleDeclaration, Project } from "ts-morph";
import { version } from "../package.json";
import { getEnums, getRootAndNamespace, getTypes } from "./ast";

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

const getTypeScriptTypeFromProtoType = (
  protoTypeName: string,
  protoKeyTypeName: string,
  isArray: boolean,
  isMap: boolean
) => {
  switch (protoTypeName) {
    case "double":
    case "float":
    case "int32":
    case "uint32":
    case "sint32":
    case "fixed32":
    case "sfixed32":
      if (isArray) {
        return "number[]";
      }

      if (isMap) {
        return `Map<${protoKeyTypeName}, number>`;
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

      if (isMap) {
        return `Map<${protoKeyTypeName}, bigint>`;
      }

      return "bigint";

    case "bool":
      if (isArray) {
        return "boolean[]";
      }

      if (isMap) {
        return `Map<${protoKeyTypeName}, boolean>`;
      }

      return "boolean";

    case "string":
      if (isArray) {
        return "string[]";
      }

      if (isMap) {
        return `Map<${protoKeyTypeName}, string>`;
      }

      return "string";

    case "bytes":
      if (isArray) {
        return "Uint8Array[]";
      }

      if (isMap) {
        return `Map<${protoKeyTypeName}, Uint8Array>`;
      }

      return "Uint8Array";

    default:
      if (isArray) {
        return `${protoTypeName}[]`;
      }

      if (isMap) {
        return `Map<${protoKeyTypeName}, ${protoTypeName}>`;
      }

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
    case "int32":
      return "Int32";
    case "uint32":
      return "Uint32";
    case "sint32":
      return "Int32";
    case "fixed32":
      return "Uint32";
    case "sfixed32":
      return "Int32";

    case "int64":
      return "Int64";
    case "uint64":
      return "Uint64";
    case "sint64":
      return "Int64";
    case "fixed64":
      return "Uint64";
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

const getPolyglotDecoderFromProtoType = (protoTypeName: string) => {
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
      return `decode${getPolyglotKindFromProtoType(
        protoTypeName,
        protoTypeName
      )}`;

    default:
      return `${getPolyglotKindFromProtoType(
        protoTypeName,
        protoTypeName
      )}.decode`; // Is reference of other type
  }
};

const codeGenRequest = CodeGeneratorRequest.deserializeBinary(
  fs.readFileSync(0, null)
);
const codeGenResponse = new CodeGeneratorResponse();
codeGenResponse.setSupportedFeatures(
  CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL
);

codeGenRequest.getFileToGenerateList().forEach((protoFilePath) => {
  const proto = protobuf
    .parse(fs.readFileSync(protoFilePath, "utf8"))
    .root.toJSON().nested!;

  const { root, namespace } = getRootAndNamespace(proto);
  const types = getTypes(root);
  const enums = getEnums(root);

  const project = new Project();

  const sourceFilePath = `${protoFilePath.substring(
    0,
    protoFilePath.lastIndexOf(".")
  )}.ts`;

  const sourceFile = project.createSourceFile(sourceFilePath, "", {
    overwrite: true,
  });

  const rootNamespace = namespace.reduce(
    (prev, curr) =>
      prev.addModule({
        name: curr,
        isExported: true,
      }),
    sourceFile as unknown as ModuleDeclaration
  );

  const namedImports = new Map<string, null>();
  types.forEach((type) =>
    type.fields.forEach((field) => {
      if (!isProtoTypeComposite(field.typeName)) {
        namedImports.set(
          getPolyglotEncoderFromProtoType(field.typeName, ""),
          null
        );
        namedImports.set(getPolyglotDecoderFromProtoType(field.typeName), null);
      }

      if (!isProtoTypeComposite(field.keyTypeName)) {
        namedImports.set(
          getPolyglotEncoderFromProtoType(field.keyTypeName, ""),
          null
        );
        namedImports.set(
          getPolyglotDecoderFromProtoType(field.keyTypeName),
          null
        );
      }
    })
  );

  enums.forEach((e) => {
    rootNamespace.addEnum({
      name: e.enumName,
      members: e.values.map((v, i) => ({
        name: v,
        value: i,
      })),
    });
  });

  types.forEach((type) => {
    const classDeclaration = rootNamespace.addClass({
      name: type.typeName,
      isExported: true,
    });

    classDeclaration.addConstructor({
      parameters: type.fields.map((field) => {
        const typescriptType = getTypeScriptTypeFromProtoType(
          field.typeName,
          field.keyTypeName,
          field.isArray,
          field.isMap
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
        field.keyTypeName,
        field.isArray,
        field.isMap
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
            if (
              isProtoTypeComposite(field.typeName) &&
              enums.find((e) => e.enumName === field.typeName)
            ) {
              namedImports.set("encodeUint8", null);
            }

            if (field.isArray) {
              namedImports.set("encodeArray", null);
              namedImports.set("Kind", null);

              return [
                isProtoTypeComposite(field.typeName)
                  ? `encoded = encodeArray(encoded, this._${field.fieldName}.length, Kind.Any)`
                  : `encoded = encodeArray(encoded, this._${
                      field.fieldName
                    }.length, Kind.${getPolyglotKindFromProtoType(
                      field.typeName,
                      field.fieldName
                    )})`,
                isProtoTypeComposite(field.typeName)
                  ? `this._${field.fieldName}.forEach(() => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.typeName,
                    `field`
                  )}(encoded);
                })`
                  : enums.find((e) => e.enumName === field.typeName)
                  ? `this._${field.fieldName}.forEach(field => {
                  encoded = encodeUint8(encoded, field as number);
                })`
                  : `this._${field.fieldName}.forEach(field => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.typeName,
                    `field`
                  )}(encoded, field);
                })`,
              ];
            }

            if (field.isMap) {
              namedImports.set("encodeMap", null);
              namedImports.set("Kind", null);

              return [
                isProtoTypeComposite(field.typeName)
                  ? `encoded = encodeMap(encoded, this._${field.fieldName}.size,
              Kind.${getPolyglotKindFromProtoType(
                field.keyTypeName,
                field.fieldName
              )}, Kind.Any)`
                  : `encoded = encodeMap(encoded, this._${field.fieldName}.size,
              Kind.${getPolyglotKindFromProtoType(
                field.keyTypeName,
                field.fieldName
              )},
              Kind.${getPolyglotKindFromProtoType(
                field.typeName,
                field.fieldName
              )})`,
                isProtoTypeComposite(field.typeName)
                  ? enums.find((e) => e.enumName === field.typeName)
                    ? `this._${field.fieldName}.forEach((value, key) => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.keyTypeName,
                    `key`
                  )}(encoded, key);
                  encoded = encodeUint8(encoded, value as number);
                })`
                    : `this._${field.fieldName}.forEach((value, key) => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.keyTypeName,
                    `key`
                  )}(encoded, key);
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.typeName,
                    `value`
                  )}(encoded);
                })`
                  : `this._${field.fieldName}.forEach((value, key) => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.keyTypeName,
                    `key`
                  )}(encoded, key);
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.typeName,
                    `value`
                  )}(encoded, value);
                })`,
              ];
            }

            if (isProtoTypeComposite(field.typeName)) {
              if (enums.find((e) => e.enumName === field.typeName)) {
                return [
                  `encoded = encodeUint8(encoded, this._${field.fieldName} as number)`,
                ];
              }

              return [
                `encoded = ${getPolyglotEncoderFromProtoType(
                  field.typeName,
                  `this._${field.fieldName}`
                )}(encoded)`,
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

    classDeclaration.addMethod({
      name: "decode",
      isStatic: true,
      returnType: `{
      buf: Uint8Array,
      value: ${type.typeName}
    }`,
      parameters: [
        {
          name: "buf",
          type: "Uint8Array",
        },
      ],
      statements: [
        `let decoded = buf`,
        ...type.fields
          .map((field) => {
            if (
              isProtoTypeComposite(field.typeName) &&
              enums.find((e) => e.enumName === field.typeName)
            ) {
              namedImports.set("decodeUint8", null);
            }

            if (field.isArray) {
              namedImports.set("decodeArray", null);

              return [
                `const ${field.fieldName}Array = decodeArray(decoded)`,
                `decoded = ${field.fieldName}Array.buf`,
                `const ${
                  field.fieldName
                }: { value: ${getTypeScriptTypeFromProtoType(
                  field.typeName,
                  field.keyTypeName,
                  field.isArray,
                  field.isMap
                )} } = {
                  value: [],
                }`,
                isProtoTypeComposite(field.typeName) &&
                enums.find((e) => e.enumName === field.typeName)
                  ? `for (let i = 0; i < ${field.fieldName}Array.size; i++) {
                  const element = decodeUint8(decoded);
                  decoded = element.buf;
                  ${field.fieldName}.value.push(element.value as ${field.typeName});
                }`
                  : `for (let i = 0; i < ${field.fieldName}Array.size; i++) {
                  const element = ${getPolyglotDecoderFromProtoType(
                    field.typeName
                  )}(decoded);
                  decoded = element.buf;
                  ${field.fieldName}.value.push(element.value);
                }`,
              ];
            }

            if (field.isMap) {
              namedImports.set("decodeMap", null);

              return [
                `const ${field.fieldName}Map = decodeMap(decoded)`,
                `decoded = ${field.fieldName}Map.buf`,
                `const ${
                  field.fieldName
                }: { value: ${getTypeScriptTypeFromProtoType(
                  field.typeName,
                  field.keyTypeName,
                  field.isArray,
                  field.isMap
                )} } = {
                  value: new ${getTypeScriptTypeFromProtoType(
                    field.typeName,
                    field.keyTypeName,
                    field.isArray,
                    field.isMap
                  )}(),
                }`,
                isProtoTypeComposite(field.typeName) &&
                enums.find((e) => e.enumName === field.typeName)
                  ? `for (let i = 0; i < ${field.fieldName}Map.size; i++) {
                  const key = ${getPolyglotDecoderFromProtoType(
                    field.keyTypeName
                  )}(decoded);
                  decoded = key.buf;
                  const value = decodeUint8(decoded);
                  decoded = value.buf;
                  ${field.fieldName}.value.set(key.value, value.value as ${
                      field.typeName
                    });
                }`
                  : `for (let i = 0; i < ${field.fieldName}Map.size; i++) {
                  const key = ${getPolyglotDecoderFromProtoType(
                    field.keyTypeName
                  )}(decoded);
                  decoded = key.buf;
                  const value = ${getPolyglotDecoderFromProtoType(
                    field.typeName
                  )}(decoded);
                  decoded = value.buf;
                  ${field.fieldName}.value.set(key.value, value.value);
                }`,
              ];
            }

            if (
              isProtoTypeComposite(field.typeName) &&
              enums.find((e) => e.enumName === field.typeName)
            ) {
              return [
                `const ${field.fieldName}Uint8 = decodeUint8(decoded)`,
                `const ${field.fieldName} = { value: ${field.fieldName}Uint8.value as ${field.typeName} }`,
                `decoded = ${field.fieldName}Uint8.buf`,
              ];
            }

            return [
              `const ${field.fieldName} = ${getPolyglotDecoderFromProtoType(
                field.typeName
              )}(decoded)`,
              `decoded = ${field.fieldName}.buf`,
            ];
          })
          .reduce((prev, curr) => [...prev, ...curr], []),
        `return {
      buf: decoded,
      value: new ${type.typeName}(${type.fields
          .map((field) => `${field.fieldName}.value`)
          .join(",")})
    }`,
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

  const generatedFile = new CodeGeneratorResponse.File();
  generatedFile.setName(sourceFilePath);
  generatedFile.setContent(sourceFile.getFullText());

  codeGenResponse.addFile(generatedFile);

  process.stdout.write(Buffer.from(codeGenResponse.serializeBinary().buffer));
});
