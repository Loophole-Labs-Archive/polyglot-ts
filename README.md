# polyglot-ts

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-brightgreen.svg)][license]
[![hydrun CI](https://github.com/loopholelabs/polyglot-ts/actions/workflows/hydrun.yaml/badge.svg)](https://github.com/loopholelabs/polyglot-ts/actions/workflows/hydrun.yaml)
[![npm CI](https://github.com/loopholelabs/polyglot-ts/actions/workflows/npm.yaml/badge.svg)](https://github.com/loopholelabs/polyglot-ts/actions/workflows/docker.yaml)
![Go Version](https://img.shields.io/badge/go%20version-%3E=1.19-61CFDD.svg)
[![Go Reference](https://pkg.go.dev/badge/github.com/loopholelabs/polyglot-ts.svg)](https://pkg.go.dev/github.com/loopholelabs/polyglot-ts)
[![npm: @loopholelabs/polyglot-ts](https://img.shields.io/npm/v/@loopholelabs/polyglot-ts)](https://www.npmjs.com/package/@loopholelabs/polyglot-ts)
[![Docs](https://img.shields.io/badge/Docs-TypeDoc-blue.svg)][docs]

TypeScript library and `protoc` plugin used for encoding and decoding data types from a portable byte buffer, used in [fRPC](https://frpc.io)

## Installation

## `protoc` Plugin

Static binaries are available on [GitHub releases](https://github.com/loopholelabs/polyglot-ts/releases).

On Linux, you can install them like so:

```shell
$ curl -L -o /tmp/protoc-gen-polyglot-ts "https://github.com/loopholelabs/polyglot-ts/releases/latest/download/protoc-gen-polyglot-ts.linux-$(uname -m)"
$ sudo install /tmp/protoc-gen-polyglot-ts /usr/local/bin
```

On macOS, you can use the following:

```shell
$ curl -L -o /tmp/protoc-gen-polyglot-ts "https://github.com/loopholelabs/polyglot-ts/releases/latest/download/protoc-gen-polyglot-ts.darwin-$(uname -m)"
$ sudo install /tmp/protoc-gen-polyglot-ts /usr/local/bin
```

On Windows, the following should work (using PowerShell as administrator):

```shell
PS> Invoke-WebRequest https://github.com/loopholelabs/polyglot-ts/releases/latest/download/protoc-gen-polyglot-ts.windows-x86_64.exe -OutFile \Windows\System32\protoc-gen-polyglot-ts.exe
```

Use the plugin like so:

```shell
$ protoc --polyglot-ts_out=. definition.proto
```

You can also find binaries for more operating systems and architectures on [GitHub releases](https://github.com/loopholelabs/polyglot-ts/releases).

## Library

Using npm:

```shell
$ npm install --save @loopholelabs/polyglot-ts
```

Using Yarn:

```shell
$ yarn add @loopholelabs/polyglot-ts
```

See the [docs][docs] for usage information.

## Contributing

Bug reports and pull requests are welcome on GitHub at [https://github.com/loopholelabs/polyglot-ts][gitrepo]. For more contribution information check out [the contribution guide](./CONTRIBUTING.md).

## License

The Polyglot project is available as open source under the terms of the [Apache License, Version 2.0][license].

## Code of Conduct

Everyone interacting in the Polyglot project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [CNCF Code of Conduct](https://github.com/cncf/foundation/blob/master/code-of-conduct.md).

## Project Managed By:

[![https://loopholelabs.io][loopholelabs]](https://loopholelabs.io)

[license]: http://www.apache.org/licenses/LICENSE-2.0
[docs]: https://loopholelabs.github.io/polyglot-ts
[gitrepo]: https://github.com/loopholelabs/polyglot-ts
[loopholelabs]: https://cdn.loopholelabs.io/loopholelabs/LoopholeLabsLogo.svg
