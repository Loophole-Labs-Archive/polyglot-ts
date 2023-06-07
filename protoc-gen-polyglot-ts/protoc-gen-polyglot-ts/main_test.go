/*
	Copyright 2023 Loophole Labs

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

package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/bradleyjkemp/cupaloy"
	"github.com/loopholelabs/polyglot-ts/protoc-gen-polyglot-ts/protoc-gen-polyglot-ts/data"
)

func Test_main(t *testing.T) {
	files, err := data.FS.ReadDir(".")
	if err != nil {
		panic(err)
	}

	if output, err := exec.Command("go", "install", ".").CombinedOutput(); err != nil {
		panic(fmt.Errorf("could not compile protocol buffers with output: %s and error: %w", output, err))
	}

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".proto") {
			continue
		}

		srcDir, err := os.MkdirTemp(os.TempDir(), "")
		if err != nil {
			panic(err)
		}
		defer os.RemoveAll(srcDir)

		embeddedFile, err := data.FS.ReadFile(file.Name())
		if err != nil {
			panic(err)
		}

		srcFile := filepath.Join(srcDir, file.Name())
		if err := os.WriteFile(srcFile, embeddedFile, os.ModePerm); err != nil {
			panic(err)
		}

		t.Run("Can compile "+file.Name(), func(t *testing.T) {
			if output, err := exec.Command("protoc", "--polyglot-ts_out="+srcDir, "-I="+srcDir, "--polyglot-ts_opt=M"+file.Name()+"=.", file.Name()).CombinedOutput(); err != nil {
				panic(fmt.Errorf("could not compile protocol buffers with output: %s and error: %w", output, err))
			}

			dstFile, err := os.ReadFile(strings.TrimSuffix(srcFile, ".proto") + ".ts")
			if err != nil {
				panic(err)
			}

			cupaloy.SnapshotT(t, string(dstFile))
		})
	}
}
