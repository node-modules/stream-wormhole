'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const Writable = require('stream').Writable;
const sendToWormhole = require('..');

const bigtext = path.join(__dirname, 'fixtures/big.txt');

describe('test/index.test.js', () => {
  it('should work with read stream', () => {
    const stream = fs.createReadStream(bigtext);
    return sendToWormhole(stream);
  });

  it('should call multi times work', () => {
    const stream = fs.createReadStream(bigtext);
    return sendToWormhole(stream).then(() => {
      return sendToWormhole(stream).then(() => {
        return sendToWormhole(stream);
      });
    });
  });

  it('should work with read stream after pipe', done => {
    let writeSize = 0;
    class PauseStream extends Writable {
      _write(/* chunk, encoding, callback */) {
        console.log('PauseStream1 write buffer size: %d', arguments[0].length);
        writeSize += arguments[0].length;
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

  it('should call multi times work with read stream after pipe', done => {
    let writeSize = 0;
    class PauseStream extends Writable {
      _write(/* chunk, encoding, callback */) {
        console.log('PauseStream2 write buffer size: %d', arguments[0].length);
        writeSize += arguments[0].length;
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
      resume() {},
    };
    return sendToWormhole(stream);
  });

  it('should mock fake read stream', () => {
    const stream = {};
    return sendToWormhole(stream);
  });

  it('should mock readable = false', () => {
    const stream = {
      readable: false,
      resume() {},
    };
    return sendToWormhole(stream);
  });

  it('should work on co', function* () {
    const stream = fs.createReadStream(bigtext);
    yield sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
    // again should work
    yield sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
    yield sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
    yield sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
  });
});
