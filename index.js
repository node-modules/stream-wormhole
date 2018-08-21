'use strict';

module.exports = (stream, throwError) => {
  return new Promise((resolve, reject) => {
    if (typeof stream.resume !== 'function') {
      return resolve();
    }

    if (stream.listenerCount && stream.listenerCount('readable') > 0) {
      // https://npm.taobao.org/mirrors/node/latest/docs/api/stream.html#stream_readable_resume
      // node 10.0.0: The resume() has no effect if there is a 'readable' event listening.
      stream.removeAllListeners('readable');
      // unpipe it
      stream.unpipe && stream.unpipe();
      // enable resume first
      stream.resume();
      // call resume again in nextTick
      process.nextTick(() => stream.resume());
    } else {
      // unpipe it
      stream.unpipe && stream.unpipe();
      // enable resume first
      stream.resume();
    }


    if (stream._readableState && stream._readableState.ended) {
      return resolve();
    }
    if (!stream.readable || stream.destroyed) {
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

    function onError(err) {
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
};
