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

interface ISrcTypes {
  [k: string]: protobuf.AnyNestedObject;
}

interface ISrcType {
  fields: {
    [k: string]: ISrcField;
  };
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

export const getTypes = (root: ISrcTypes): IDstType[] =>
  Object.keys(root).map((typeName) => {
    const srcTypeFields = (root[typeName] as ISrcType).fields;

    return {
      typeName,
      fields: Object.keys(srcTypeFields)
        .map((fieldName) => ({
          fieldName,
          typeName: srcTypeFields[fieldName].type,
          keyTypeName: srcTypeFields[fieldName].keyType,
          index: srcTypeFields[fieldName].id,
          isArray: srcTypeFields[fieldName].rule === "repeated",
          isMap: !!srcTypeFields[fieldName].keyType,
        }))
        .sort((curr, prev) => curr.index - prev.index)
        .map((field) => ({
          fieldName: field.fieldName,
          typeName: field.typeName,
          keyTypeName: field.keyTypeName,
          isArray: field.isArray,
          isMap: field.isMap,
        })),
    };
  });

export const getRootAndNamespace = (
  obj: any,
  objPath: string[] = [],
  lastObj: any = undefined
): { root: any; namespace: string[] } => {
  if (obj.fields) {
    return {
      root: lastObj,
      namespace: objPath.slice(0, -1),
    };
  }

  const nextKey = Object.keys(obj)[0];
  if (nextKey === "nested") {
    return getRootAndNamespace(obj[nextKey], objPath, obj);
  }

  return getRootAndNamespace(obj[nextKey], [...objPath, nextKey], obj);
};
