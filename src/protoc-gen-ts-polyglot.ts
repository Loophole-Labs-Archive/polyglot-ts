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
import { generateTypeScriptForProtobuf } from "./generator";

// Read request from `protoc`
const codeGenRequest = CodeGeneratorRequest.deserializeBinary(
  fs.readFileSync(0, null)
);
const codeGenResponse = new CodeGeneratorResponse();
codeGenResponse.setSupportedFeatures(
  CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL
);

// Respond with generated files
codeGenRequest.getFileToGenerateList().forEach((protoFilePath) => {
  const { typescriptSource, typescriptFilePath } =
    generateTypeScriptForProtobuf(
      fs.readFileSync(protoFilePath, "utf8"),
      protoFilePath
    );

  const generatedFile = new CodeGeneratorResponse.File();
  generatedFile.setName(typescriptFilePath);
  generatedFile.setContent(typescriptSource);

  codeGenResponse.addFile(generatedFile);

  process.stdout.write(Buffer.from(codeGenResponse.serializeBinary().buffer));
});
