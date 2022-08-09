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
import { getEnums, getRootAndNamespace, getTypes } from "./ast";

const proto = protobuf.parse(fs.readFileSync(0, "utf8")).root.toJSON().nested!;

const { root, namespace } = getRootAndNamespace(proto);
const types = getTypes(root);
const enums = getEnums(root);

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
    case "any":
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
    case "int":
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

    case "any":
      if (isArray) {
        return "any[]";
      }

      if (isMap) {
        return `Map<${protoKeyTypeName}, any>`;
      }

      return "any";

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
    case "int":
      return "Int32";
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

    case "any":
      return "Any";

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
    case "any":
      return `encode${getPolyglotKindFromProtoType(protoTypeName, fieldName)}`;

    default:
      return `${getPolyglotKindFromProtoType(protoTypeName, fieldName)}.encode`; // Is reference of other type
  }
};

const getPolyglotDecoderFromProtoType = (protoTypeName: string) => {
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
    case "any":
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
  const decodeInterface = rootNamespace.addInterface({
    name: `IDecoded${type.typeName}`,
  });

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
          if (field.isArray) {
            namedImports.set("encodeArray", null);
            namedImports.set("Kind", null);

            if (
              isProtoTypeComposite(field.typeName) &&
              enums.find((e) => e.enumName === field.typeName)
            ) {
              namedImports.set("encodeUint8", null);
            }

            return [
              isProtoTypeComposite(field.typeName)
                ? `encoded = encodeArray(encoded, this._${field.fieldName}.length, Kind.Any)`
                : `encoded = encodeArray(encoded, this._${
                    field.fieldName
                  }.length, Kind.${getPolyglotKindFromProtoType(
                    field.typeName,
                    field.fieldName
                  )})`,
              isProtoTypeComposite(field.typeName) || field.typeName === "any"
                ? field.typeName === "any"
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
                  )}(encoded);
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

            if (
              isProtoTypeComposite(field.typeName) &&
              enums.find((e) => e.enumName === field.typeName)
            ) {
              namedImports.set("encodeUint8", null);
            }

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
              isProtoTypeComposite(field.typeName) || field.typeName === "any"
                ? field.typeName === "any"
                  ? `this._${field.fieldName}.forEach((_, key) => {
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.keyTypeName,
                    `key`
                  )}(encoded, key);
                  encoded = ${getPolyglotEncoderFromProtoType(
                    field.typeName,
                    `value`
                  )}(encoded);
                })`
                  : enums.find((e) => e.enumName === field.typeName)
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

          if (
            isProtoTypeComposite(field.typeName) ||
            field.typeName === "any"
          ) {
            if (enums.find((e) => e.enumName === field.typeName)) {
              namedImports.set("encodeUint8", null);

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

  decodeInterface.addProperty({
    name: "buf",
    type: "Uint8Array",
  });

  decodeInterface.addProperty({
    name: "value",
    type: type.typeName,
  });

  classDeclaration.addMethod({
    name: "decode",
    isStatic: true,
    returnType: `IDecoded${type.typeName}`,
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
              `for (let i = 0; i < ${field.fieldName}Array.size; i++) {
                  const element = ${getPolyglotDecoderFromProtoType(
                    field.typeName
                  )}(decoded);
                  decoded = element.buf;
                  ${field.fieldName}.value.push(element.value);
                }`,
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

process.stdout.write(sourceFile.getFullText());
