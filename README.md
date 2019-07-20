# koa-throttle2

## Description

Using the Koa framework, throttle the body of a response by specifying the rate or delay and chunk size. This middleware will stream the response chunk by chunk (size specified) with a specified delay in between in order to simulate a poor internet connection or latency.

Works with koa-static and should with any other middleware.


## Installation

For Koa 3 use the next branch:

```bash
npm install --save koa-throttle2 
```

For older versions of Koa using generators:

```bash
$ npm install --save koa-throttle2@koa1
```


## Usage

```js
const koa = require('koa');
const serve = require('koa-static');

const throttle = require('koa-throttle2');
let throttler = throttle({rate: 100, chunk: 2, debug: 1});

const app = new koa();

app.use(throttler);

app.use(serve(__dirname + '/public'));
app.use(function *test(next){
    this.body = 'This is a big test string that will be throttled';
  });
app.listen(4000);
```

## Options

* **rate**: the delay in milliseconds to wait before writing to the response
* **chunk**: the number of bytes to write to the response stream every rate number of milliseconds
* **debug**: If evalutes to true then a new line will be sent after each chunk of data written to the response so that you can see the data coming in if testing with curl. Default is false

## Testing

Run:
```cd test; npm install; node test.js```
Then to see the data throttled flow in:
```
curl http://localhost:3000/string
curl http://localhost:3000/buffer
curl http://localhost:3000/stream
curl http://localhost:3000/test/package.json
```