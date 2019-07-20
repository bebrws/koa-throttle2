var PassThrough = require('stream').PassThrough;
const Stream = require('stream');

async function mdelay(duration) {
    await new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve();
      }, duration)
    });  
}

module.exports = function(options) {
  options || (options = {});

  if (options.rate === undefined || !options.chunk === undefined) {
    throw new Error('missed rate and chunk option for Throttle');
  } else if (!options.rate || !options.chunk) {
    return async function throttler(next) {
      await next;
    };
  }

  return async function throttler(ctx, next) {
    await next();

    function setupPiping() {
      var r = new PassThrough();
      r._read = function() { };
      
      // Not sure why but piping the stream as well as overwriting 
      // ctx.body seamed to fix an issue where the response headers 
      // were not being sent.
      // It looks like in the latest version of koa this is unneccessary?
      //r.pipe(ctx.res);
      ctx.body = r;    

      return r;
    }    
    
    async function throttleString(str) {
      let start = 0;
      let part = 0;

      let r = setupPiping();
      
      do {
        part = str.slice(start, start + options.chunk);
        r.push(part);

        // For debugging sending a new line will help as curl will show
        // the data coming over line by line
        if (options.debug) {
          r.push('\n');
        }
        start += options.chunk;
        await mdelay(options.rate);
      } while (part.length);
      r.push(null);
    }

    async function throttleBuffer(buffer) {
      let start = 0;
      let len = buffer.length;

      let r = setupPiping();

      while (start < len) {
        let part = buffer.slice(start, start + options.chunk);
        r.push(part);
        start += options.chunk;
        await mdelay(options.rate);
      }
      r.push(null);
    }

    async function throttleStream(stream) {
      let buf;
      stream.on('data', function(c) {
        buf = buf ? Buffer.concat([buf, c], buf.length + c.length) : c;
      });

      await new Promise(function(resolve, reject){
        stream.on('end', function() {
          resolve();
        });
      });

      await throttleBuffer(buf);
    }

    if (ctx.body instanceof Stream) {
      await throttleStream(ctx.body);
    } else if (Buffer.isBuffer(ctx.body)) {
      await throttleBuffer(ctx.body);
    } else if ('string' == typeof ctx.body) {
      await throttleString(ctx.body);
    } else {
      // This should never happen as Koa's ctx.body should be either a string,
      // Buffer, or Stream
      // https://github.com/koajs/koa/blob/master/lib/application.js#L218
      return;
    }
  };
};