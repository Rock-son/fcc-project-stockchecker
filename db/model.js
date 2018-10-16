"use strict";

const mongoose = require("mongoose");
const { Schema } = require("mongoose");

// DEFINE MODELS
const stockSchema = new Schema({

	stock: {
		type: String, required: true, trim: true, uppercase: true
	},
	likes: {
		type: [ { type: String, unique: true } ], default: []
	}
});

module.exports.StockModel = mongoose.model("StockModel", stockSchema, "stockproject");