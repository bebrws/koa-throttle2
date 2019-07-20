const PassThrough = require('stream').PassThrough;
const Stream = require('stream');
const co = require('co');

module.exports = function(options) {
  options || (options = {});

  if (options.rate === undefined || !options.chunk === undefined) {
    throw new Error('missed rate and chunk option for Throttle');
  } else if (!options.rate || !options.chunk) {
    return function* throttler(next) {
      yield* next;
    };
  }

  return function* throttler(next) {
    let that = this;

    yield* next;

    let originalBody = this.body;

    function setupPiping() {
      let r = new PassThrough();
      r._read = function() { };
      r.pipe(that.res);
      that.body = r;    
      return r;
    }   

    function* throttleString(str) {
      let destination = setupPiping();
      co(function* () {
        let start = 0;
        let part = "";
        do {
          part = str.slice(start, start + options.chunk);
          destination.push(part);
          // For debugging sending a new line will help as curl will show
          // the data coming over line by line
          if (options.debug) {
            destination.push("\n");
          }
          start += options.chunk;
          yield delay(options.rate);
        } while (part.length);
        destination.push(null);
      });
    }

    function* throttleBuffer(buffer) {
      co(function* () {
        let destination = setupPiping();
        let start = 0;
        let len = buffer.length;
        while (start < len) {
          let part = buffer.slice(start, start + options.chunk);
          destination.push(part);
          start += options.chunk;
          yield delay(options.rate);
        }
        destination.push(null);
      });
    }

    function* throttleStream(stream) {
      co(function* () {
        let buf;
        stream.on('data', function(c) {
          buf = buf ? Buffer.concat([buf, c], buf.length + c.length) : c;
        });
        yield function(done) {
          stream.on('end', done);
        };
        if (buf) {
          yield throttleBuffer(buf);
        }
      });
    }

    if (originalBody instanceof Stream) {
      yield throttleStream(originalBody);
    } else if (Buffer.isBuffer(originalBody)) {      
      yield throttleBuffer(originalBody);
    } else if ('string' == typeof originalBody) {
      yield throttleString(originalBody);
    } else {
      // This should never happen as Koa's this.body should be either a string,
      // Buffer, or Stream
      // https://github.com/koajs/koa/blob/master/lib/application.js#L218
      return;
    }
  };
};