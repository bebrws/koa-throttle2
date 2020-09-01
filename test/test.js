const test = require('tape');
const request = require('supertest');
const koa = require('koa');
const serve = require('koa-static');
const throttle = require('../index');

const app = new koa();

let throttler = throttle({rate: 100, chunk: 2, debug: 0});

app.use(throttler);

app.use(serve(__dirname + '/public'));
app.use(function *(next) {
  this.body = 'This is a big test string that will be throttled';
});

test('root / route string', async (assert) => {
  const response = request(app.callback())
    .get('/')
    .expect(200)
    .end(function (err, res) {
      console.log(res.text);
      assert.true(res.text === 'This is a big test string that will be throttled');
      assert.end();
    });
});


test('koa static', async (assert) => {
  const response = request(app.callback())
    .get('/test.html')
    .expect(200)
    .end(function (err, res) {
      assert.true(res.text.indexOf('</html>') !== -1);
      assert.end();
    });
})


const app2 = new koa();
let throttler2 = throttle({rate: 100, chunk: 2, debug: 0});
app2.use(throttler2);


app2.use(async (ctx, next) => {
  ctx.body = Buffer.from("This is a buffer string", 'utf8');
})

test('root / route buffer', async (assert) => {
  const response = request(app2.callback())
    .get('/')
    .expect(200)
    .end(function (err, res) {
      assert.true(res.body.toString('utf8') === 'This is a buffer string');
      assert.end();
    });
});
