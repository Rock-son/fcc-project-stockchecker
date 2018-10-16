/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var mongoose = require("mongoose");

const db = require("../db/controller");
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.Promise = global.Promise;
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, autoIndex: false });
mongoose.set('useFindAndModify', false);


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
		const { query: { stock, like } } = req;
		// TWO STOCK SENT /W OR /-W LIKE
		if (Array.isArray(stock)) {
			return db.updateMany(req, res);
		}
		else if (stock) {
			return db.updateOne(req, res);
		} else {
			return res.send({"error": "You didn't send any data"});
		}
	});
};


