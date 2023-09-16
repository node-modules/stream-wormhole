import { strict as assert } from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import wormhole from '../src/index.js';
import { sendToWormhole } from '../src/index.js';

describe('test/index.test.ts', () => {
  const bigtext = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/big.txt');

  it('should work with read stream', () => {
    const stream = fs.createReadStream(bigtext);
    return wormhole(stream);
  });

  it('should call multi times work', async () => {
    const stream = fs.createReadStream(bigtext);
    await sendToWormhole(stream);
    await sendToWormhole(stream);
    return await sendToWormhole(stream);
  });

  it('should work with read stream after pipe', done => {
    let writeSize = 0;
    class PauseStream extends Writable {
      _write(...args: any[]) {
        console.log('PauseStream1 write buffer size: %d', args[0].length);
        writeSize += args[0].length;
        // do nothing
      }
    }

    const stream = fs.createReadStream(bigtext);
    stream.pipe(new PauseStream());
    // mock delay
    setTimeout(() => {
      assert(writeSize > 0);
      sendToWormhole(stream).then(done);
    }, 100);
  });

  it('should work with read stream after listening readable', () => {
    const stream = fs.createReadStream(bigtext);
    let data: any;
    stream.on('readable', () => {
      if (!data) {
        data = stream.read();
        console.log('read data %d', data && data.length);
      }
    });
    return sendToWormhole(stream).then(() => {
      assert(!data);
    });
  });

  it('should work with read stream after readable emitted', done => {
    const stream = fs.createReadStream(bigtext);
    let data: any;
    stream.on('readable', () => {
      if (!data) {
        data = stream.read();
        console.log('read data %d', data && data.length);
      }
    });
    setTimeout(() => {
      sendToWormhole(stream).then(() => {
        assert(data);
        done();
      });
    }, 500);
  });

  it('should call multi times work with read stream after pipe', done => {
    let writeSize = 0;
    class PauseStream extends Writable {
      _write(...args: any[]) {
        console.log('PauseStream2 write buffer size: %d', args[0].length);
        writeSize += args[0].length;
        // do nothing
      }
    }

    const stream = fs.createReadStream(bigtext);
    stream.pipe(new PauseStream());
    // mock delay
    setTimeout(() => {
      assert(writeSize > 0);
      sendToWormhole(stream).then(() => {
        sendToWormhole(stream).then(() => {
          sendToWormhole(stream).then(done);
        });
      });
    }, 100);
  });

  it('should not throw error by default when stream error', () => {
    const stream = fs.createReadStream(bigtext + '-not-exists');
    return sendToWormhole(stream);
  });

  it('should throw error when stream error', done => {
    const stream = fs.createReadStream(bigtext + '-not-exists');
    sendToWormhole(stream, true).catch(err => {
      assert.equal(err.code, 'ENOENT');
      done();
    });
  });

  it('should pass ended', done => {
    const stream = fs.createReadStream(bigtext);
    stream.resume();
    stream.on('end', () => {
      sendToWormhole(stream).then(done);
    });
  });

  it('should mock destroyed', () => {
    const stream = {
      destroyed: true,
      resume() {
        // ignore
      },
    };
    return sendToWormhole(stream as any);
  });

  it('should mock fake read stream', () => {
    const stream = {};
    return sendToWormhole(stream as any);
  });

  it('should mock readable = false', () => {
    const stream = {
      readable: false,
      resume() {
        // ignore
      },
    };
    return sendToWormhole(stream as any);
  });

  it('should work on Promise', async () => {
    const stream = fs.createReadStream(bigtext);
    await sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
    // again should work
    await sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
    await sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
    await sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
  });
});
