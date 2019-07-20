const test = require('tape');
const request = require('supertest');
const koa = require('koa');
const serve = require('koa-static');
const throttle = require('../index');
//const throttle = require('koa-throttle2');

const app = new koa();

let throttler = throttle({rate: 100, chunk: 2, debug: 1});

//app.use(throttler);

app.use(serve(__dirname + '/public'));
app.use(function *(next) {
  this.body = 'This is a big test string that will be throttled';
});

// app.listen(4000);

test('root / route', async (assert) => {
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