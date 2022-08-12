# polyglot-ts

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-brightgreen.svg)][license]
[![npm: @loopholelabs/polyglot-ts](https://img.shields.io/npm/v/@loopholelabs/polyglot-ts)](https://www.npmjs.com/package/@loopholelabs/polyglot-ts)
[![Docs](https://img.shields.io/badge/Docs-TypeDoc-blue.svg)][docs]

TypeScript library and `protoc` plugin used for encoding and decoding data types from a portable byte buffer, used in [FRPC](https://github.com/loopholelabs/frisbee)

## Installation

## `protoc` Plugin

Using npm:

```shell
$ npm install --global @loopholelabs/polyglot-ts
```

Using Yarn:

```shell
$ yarn global add @loopholelabs/polyglot-ts
```

You can use the plugin like so:

```shell
$ protoc --ts-polyglot_out=. definition.proto
```

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
