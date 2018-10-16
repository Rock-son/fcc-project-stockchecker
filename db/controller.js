"use strict";

var axios = require("axios");
const { StockModel } = require("../db/model");
const apiUri = "https://api.iextrading.com/1.0/stock/";

exports.updateMany = function(req, res, next) {
	const { query: { stock, like: userLiked } } = req;
	const ip =  (req.headers['x-forwarded-for'] || "").split(',').pop() || req.connection.remoteAddress ||
					req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);

	const stockDbPromise = StockModel.find({ $or: [ { stock: (stock[0] || "").toUpperCase() }, { stock: (stock[1] ||"").toUpperCase() } ] });
	const stockApiPromise1 = axios.get(`${apiUri}${stock[0].trim()}/price`);
	const stockApiPromise2 = axios.get(`${apiUri}${stock[1].trim()}/price`);

	Promise.all([stockDbPromise, stockApiPromise1, stockApiPromise2])
		.then(function(values) {
			const result = values.map(item => item.data ? item.data : item);
			const addStock = stock.filter(item => !result[0].map(item => item.stock).includes(item.toUpperCase()) ); // FILTER ANY MISSING STOCK IN DB
			const stockData = result[0].concat(addStock.map(item => ({ stock: item, likes: [] }))); // REPOPULATE STOCK DATA WITH DEFAULT VALUES FOR UPDATING/INSERTING
			const stockPromises = [];

			if (stockData.length) {
				stockData.forEach(item => {
					const likes = item.likes ? item.likes : [];
					const updatedLikes = likes.includes(ip) ? likes : likes.concat([ip]);

					stockPromises.push(StockModel.findOneAndUpdate(
						{ stock: item.stock },	//	WHERE
						{ stock: item.stock, likes: userLiked ? updatedLikes : likes },					//	UPDATE
						{ upsert: true, setDefaultsOnInsert: true, new: true }))	//	OPTIONS
				});
				Promise.all(stockPromises)
						.then((docs) => {
							return res.send({ stockData: [
								{ stock: docs[0].stock, price: result[1], rel_likes: docs[0].likes.length - docs[1].likes.length },
								{ stock: docs[1].stock, price: result[2], rel_likes: docs[1].likes.length - docs[0].likes.length }
							]});
						})
						.catch(err => console.log(err))
				return;
			}


			return res.send();
		})
		.catch(err => console.log(err))  ;
}

exports.updateOne = function(req, res) {
	const { query: { stock, like: userLiked } } = req;
	const ip =  (req.headers['x-forwarded-for'] || "").split(',').pop() || req.connection.remoteAddress ||
					req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);

	const stockDbPromise = StockModel.find({ stock: stock.toUpperCase() });
	const stockApiPromise = axios.get(`${apiUri}${stock.trim()}/price`);

	Promise.all([stockDbPromise, stockApiPromise])
		.then(function(values) {
			const result = values.map(item => item.data ? item.data : item);
			const stockData = result[0].length ? ({ stock: stock, likes: [] }) : result[0].slice(); // PREPARE DATA FOR INSERTION IF NEEDED
			const stockPromises = [];

			if (stockData) {
					const likes = stockData.likes ? stockData.likes : [];
					const updatedLikes = likes.includes(ip) ? likes : likes.concat([ip]);

					StockModel.findOneAndUpdate(
						{ stock: stockData.stock },											//	WHAT
						{ stock: stockData.stock, likes: userLiked ? updatedLikes : likes },	//	UPDATE
						{ upsert: true, setDefaultsOnInsert: true, new: true },			// 	OPTIONS
						function(err, doc) {
							if (err) { return next(err); }

							return res.send({ stockData: { stock: doc.stock, price: result[1], likes: doc.likes.length }});
						});
				return;
			} else {
				return res.send({ error: "no stock supplied"});
			}
		})
		.catch(err => console.log(err))  ;
}
