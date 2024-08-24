const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
	id: Number,
	created_at: Date,
	total_price: Number,
	total_price_set: {
		shop_money: {
			amount: String,
			currency_code: String,
		},
		
	},
	customer: {
		id: Number,
		email: String,
		
	},
	
});

module.exports = mongoose.model("Order", OrderSchema, "shopifyOrders");
