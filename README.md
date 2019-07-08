# koa-throttle2

Using the Koa framework, throttle the body of a response by specifying the rate or delay and chunk size. This middleware will stream the response chunk by chunk (size specified) with a specified delay in between in order to simulate a poor internet connection or latency. Throttling static file streaming is now fixed in thanks to gitgrimbo. I have commited his pull request from the original repository mentioned below into this new repository.

## Install

```bash
$ npm install koa-throttle2 --save
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

## Contributors and Attribution

This package was originally hosted here:

```https://github.com/bbarrows/koa-throttle```

Due to circumstances I had to create a new GitHub account and move the repo over here to:

```https://github.com/bradebarrows/koa-throttle2```

Because of this I was not able to merge in a very helpful pull request by a user @gitgrimbo 
I just manually commited his changes into this fork of my old repository.

This is a link to his pull request if you are interested:
```https://github.com/bbarrows/koa-throttle/pull/2```
And his account page so I don't take credit for his fix:
```https://github.com/gitgrimbo```

I wanted to give him attribution for fixing a project I did not think would garner much use and therefore did not test an edge case which he fixed. He also did a little bit of code clean up which is nice.

Thank you!
