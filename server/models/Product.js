const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	id: Number,
	title: String,
	created_at: Date,
	
});

module.exports = mongoose.model("Product", ProductSchema, "shopifyProducts");
