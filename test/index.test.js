'use strict';

const assert = require('assert');
const fs = require('fs');
const BlackHoleStream = require('black-hole-stream');
const sendToWormhole = require('..');

describe('index.test.js', () => {
  it('should work with read stream', () => {
    const stream = fs.createReadStream(__filename);
    return sendToWormhole(stream);
  });

  it('should work when stream error', done => {
    const stream = fs.createReadStream(__filename + '-not-exists');
    sendToWormhole(stream).catch(err => {
      assert.equal(err.code, 'ENOENT');
      done();
    });
  });

  it('should pass ended', done => {
    const stream = fs.createReadStream(__filename);
    const bh = new BlackHoleStream();
    stream.pipe(bh).on('finish', () => {
      sendToWormhole(stream).then(done);
    });
  });

  it('should mock destroyed', () => {
    const stream = {
      destroyed: true,
    };
    return sendToWormhole(stream);
  });

  it('should mock readable = false', () => {
    const stream = {
      readable: false,
    };
    return sendToWormhole(stream);
  });

  it('should work on co', function* () {
    const stream = fs.createReadStream(__filename);
    yield sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
  });
});
