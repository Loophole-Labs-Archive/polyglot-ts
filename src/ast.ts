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

export const isProtoTypeComposite = (protoTypeName: string) => {
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

interface ISrcAST {
  [k: string]: protobuf.AnyNestedObject;
}

interface ISrcType {
  fields: {
    [k: string]: ISrcField;
  };
  values: {
    [k: string]: number;
  };
  oneofs: {
    [k: string]: protobuf.OneOf;
  };
  nested: ISrcAST;
}

interface ISrcField {
  type: string;
  id: number;
  rule: string;
  keyType: string;
}

interface IDstType {
  typeName: string;
  fields: IDstField[];
}

interface IDstField {
  fieldName: string;
  typeName: string;
  keyTypeName: string;
  isArray: boolean;
  isMap: boolean;
}

interface IDstEnum {
  enumName: string;
  values: string[];
}

export const getKnownTypeAndEnumNames = (
  root: ISrcAST,
  knownTypeNames: string[] = [],
  prefix = ""
): string[] => [
  ...knownTypeNames,
  ...Object.keys(root)
    .filter((typeName) => (root[typeName] as ISrcType).fields)
    .map((typeName) => {
      const type = root[typeName] as ISrcType;

      if (type.nested) {
        return getKnownTypeAndEnumNames(
          type.nested,
          [prefix + typeName],
          prefix + typeName
        );
      }

      return [prefix + typeName];
    })
    .reduce((prev, curr) => [...prev, ...curr], []),
  ...Object.keys(root)
    .map((enumName) => {
      const enm = root[enumName] as ISrcType;

      if (!enm.values) {
        if (enm.nested) {
          return getKnownTypeAndEnumNames(enm.nested, [], prefix + enumName);
        }

        return [];
      }

      return [prefix + enumName];
    })
    .reduce((prev, curr) => [...prev, ...curr], []),
];

export const getTypes = (
  root: ISrcAST,
  knownTypeAndEnumNames: string[],
  knownTypes: IDstType[] = [],
  prefix = ""
): IDstType[] => [
  ...knownTypes,
  ...Object.keys(root)
    .filter((typeName) => (root[typeName] as ISrcType).fields)
    .map((typeName) => {
      const type = root[typeName] as ISrcType;

      const srcTypeFields = type.fields;

      const ownPrefix = prefix + typeName;
      const parsedType = {
        typeName: ownPrefix,
        fields: type.oneofs // Ignore oneofs
          ? []
          : Object.keys(srcTypeFields)
              .map((fieldName) => {
                const nestedTypeName = knownTypeAndEnumNames.find(
                  (t) => t === srcTypeFields[fieldName].type.replace(".", "")
                );

                return {
                  fieldName,
                  typeName: isProtoTypeComposite(srcTypeFields[fieldName].type)
                    ? nestedTypeName ||
                      ownPrefix + srcTypeFields[fieldName].type
                    : srcTypeFields[fieldName].type,
                  keyTypeName: srcTypeFields[fieldName].keyType,
                  index: srcTypeFields[fieldName].id,
                  isArray: srcTypeFields[fieldName].rule === "repeated",
                  isMap: !!srcTypeFields[fieldName].keyType,
                };
              })
              .sort((curr, prev) => curr.index - prev.index)
              .map((field) => ({
                fieldName: field.fieldName,
                typeName: field.typeName.replace(".", ""),
                keyTypeName: field.keyTypeName?.replace(".", ""),
                isArray: field.isArray,
                isMap: field.isMap,
              })),
      };

      if (type.nested) {
        return getTypes(
          type.nested,
          knownTypeAndEnumNames,
          [parsedType],
          parsedType.typeName
        );
      }

      knownTypes.push(parsedType);

      return [parsedType];
    })
    .reduce((prev, curr) => [...prev, ...curr], []),
];

export const getEnums = (
  root: ISrcAST,
  knownEnums: IDstEnum[] = [],
  knownEnumNames: string[] = [],
  prefix = ""
): IDstEnum[] => [
  ...knownEnums,
  ...Object.keys(root)
    .map((enumName) => {
      // Hoist known enum names
      knownEnumNames.push(prefix + enumName);

      return enumName;
    })
    .map((enumName) => {
      const type = root[enumName] as ISrcType;

      const srcEnumValues = (root[enumName] as ISrcType).values;
      const ownPrefix = prefix + enumName;
      if (!srcEnumValues) {
        if (type.nested) {
          return getEnums(type.nested, [], [ownPrefix], ownPrefix);
        }

        return [];
      }

      const parsedEnum = {
        enumName: ownPrefix,
        values: Object.keys(srcEnumValues)
          .map((field) => ({
            key: field,
            value: srcEnumValues[field],
          }))
          .sort((a, b) => a.value - b.value)
          .map((value) => value.key),
      };

      knownEnums.push(parsedEnum);
      knownEnumNames.push(parsedEnum.enumName);

      return [parsedEnum];
    })
    .reduce((prev, curr) => [...prev, ...curr], []),
];

export const getRootAndNamespace = (
  obj: any,
  objPath: string[] = [],
  lastObj: any = undefined
): { root: any; namespace: string[] } => {
  if (!obj || obj.fields || obj.methods) {
    return {
      root: lastObj,
      namespace: objPath.slice(0, -1),
    };
  }

  let nextKey = Object.keys(obj)[0];
  if (nextKey === "options") {
    nextKey = Object.keys(obj)[1];
  }

  if (nextKey === "nested") {
    return getRootAndNamespace(obj[nextKey], objPath, obj);
  }

  return getRootAndNamespace(obj[nextKey], [...objPath, nextKey], obj);
};
