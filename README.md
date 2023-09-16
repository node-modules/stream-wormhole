# stream-wormhole

[![NPM version][npm-image]][npm-url]
[![CI](https://github.com/node-modules/stream-wormhole/actions/workflows/nodejs.yml/badge.svg)](https://github.com/node-modules/stream-wormhole/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/stream-wormhole.svg?style=flat-square
[npm-url]: https://npmjs.org/package/stream-wormhole
[codecov-image]: https://codecov.io/github/node-modules/stream-wormhole/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/stream-wormhole?branch=master
[download-image]: https://img.shields.io/npm/dm/stream-wormhole.svg?style=flat-square
[download-url]: https://npmjs.org/package/stream-wormhole

Pipe `ReadStream` / `Readable` to a wormhole.

## Usage

```ts
import sendToWormhole from 'stream-wormhole';
import fs from 'node:fs';

const readStream = fs.createReadStream(__filename);

// ignore all error by default
sendToWormhole(readStream)
  .then(() => console.log('done'));

// throw error
sendToWormhole(readStream, true)
  .then(() => console.log('done'))
  .catch(err => console.error(err));
```

## License

[MIT](LICENSE)

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/1433247?v=4" width="100px;"/><br/><sub><b>denghongcai</b></sub>](https://github.com/denghongcai)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|
| :---: | :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Sat Sep 16 2023 14:11:38 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
