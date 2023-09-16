import { Readable } from 'node:stream';

const READABLE_STATE_KEY = '_readableState';

export function sendToWormhole(stream: Readable, throwError = false) {
  return new Promise<void>((resolve, reject) => {
    if (typeof stream.resume !== 'function') {
      return resolve();
    }

    // unpipe it
    stream.unpipe && stream.unpipe();
    // enable resume first
    stream.resume();

    if (stream.listenerCount && stream.listenerCount('readable') > 0) {
      // https://npm.taobao.org/mirrors/node/latest/docs/api/stream.html#stream_readable_resume
      // node 10.0.0: The resume() has no effect if there is a 'readable' event listening.
      stream.removeAllListeners('readable');
      // call resume again in nextTick
      process.nextTick(() => stream.resume());
    }

    if (!stream.readable || stream.destroyed) {
      return resolve();
    }
    if (stream.closed || stream.readableEnded) {
      return resolve();
    }

    const readableState = Reflect.get(stream, READABLE_STATE_KEY);
    if (readableState?.ended) {
      return resolve();
    }

    function cleanup() {
      stream.removeListener('end', onEnd);
      stream.removeListener('close', onEnd);
      stream.removeListener('error', onError);
    }

    function onEnd() {
      cleanup();
      resolve();
    }

    function onError(err: Error) {
      cleanup();
      // don't throw error by default
      if (throwError) {
        reject(err);
      } else {
        resolve();
      }
    }

    stream.on('end', onEnd);
    stream.on('close', onEnd);
    stream.on('error', onError);
  });
}

export default sendToWormhole;
