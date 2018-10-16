/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {

      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
			const data = JSON.parse(res.text);

			assert.isNull(err)
			assert.equal(data.stockData.stock, "GOOG");

			done();
        });
      });

      test('1 stock with like', function(done) {
		chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
			const data = JSON.parse(res.text);

			assert.isNull(err);
			assert.equal(data.stockData.stock, "GOOG");
			assert.equal(data.stockData.likes, 1);

			done();
        });
      });

      test('1 stock with like again (ensure likes arent double counted)', function(done) {
		chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
			const data = JSON.parse(res.text);

			assert.isNull(err)
			assert.equal(data.stockData.stock, "GOOG");
			assert.equal(data.stockData.likes, 1);

			done();
        });
      });

      test('2 stocks', function(done) {
		chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'aapl']})
        .end(function(err, res){
			const data = JSON.parse(res.text);

			assert.isNull(err)
			assert.isArray(data.stockData)
			assert.isOk(data.stockData.map(item => item.stock).includes("GOOG"));
			assert.isOk(data.stockData.map(item => item.stock).includes("AAPL"));
			assert.equal(data.stockData[0].rel_likes, 0);
			assert.equal(data.stockData[1].rel_likes, 0);

			done();
        });
      });

      test('2 stocks with like', function(done) {
		chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'aapl'], like: true})
        .end(function(err, res){
			const data = JSON.parse(res.text);

			assert.isNull(err)
			assert.isArray(data.stockData)
			assert.isOk(data.stockData.map(item => item.stock).includes("GOOG"));
			assert.isOk(data.stockData.map(item => item.stock).includes("AAPL"));
			assert.equal(data.stockData[0].rel_likes, 0);
			assert.equal(data.stockData[1].rel_likes, 0);

			done();
        });
      });

    });

});
