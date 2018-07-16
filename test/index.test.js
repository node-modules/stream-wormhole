'use strict';

const assert = require('assert');
const fs = require('fs');
const sendToWormhole = require('..');

describe('index.test.js', () => {
  it('should work with read stream', () => {
    const stream = fs.createReadStream(__filename);
    return sendToWormhole(stream);
  });

  it('should not throw error by default when stream error', () => {
    const stream = fs.createReadStream(__filename + '-not-exists');
    return sendToWormhole(stream);
  });

  it('should throw error when stream error', done => {
    const stream = fs.createReadStream(__filename + '-not-exists');
    sendToWormhole(stream, true).catch(err => {
      assert.equal(err.code, 'ENOENT');
      done();
    });
  });

  it('should pass ended', done => {
    const stream = fs.createReadStream(__filename);
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
    const stream = fs.createReadStream(__filename);
    yield sendToWormhole(stream);
    assert.equal(stream.readable, false);
    assert(stream.destroyed);
  });
});
