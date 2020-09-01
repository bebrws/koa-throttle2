const test = require('tape');
const request = require('supertest');
const koa = require('koa');
const serve = require('koa-static');
const throttle = require('../index');
//const throttle = require('koa-throttle2');

const app = new koa();

let throttler = throttle({rate: 100, chunk: 2, debug: 1});

app.use(throttler);

app.use(serve(__dirname + '/public'));

// uncomment out one fo these to test:
// app.use(async (ctx, next) => {
//     ctx.body = 'This is a big test string that will be throttled';
// });

app.use(async (ctx, next) => {
    ctx.body = Buffer.from("This is a bufer string", 'utf8');
})

// Requests can be made to localhost:4000/string
// localhost:4000/test.html
// localhost:4000/buffer
// To test the different streaming types

app.listen(4000);
