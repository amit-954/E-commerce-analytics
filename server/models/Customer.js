const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
	id: Number,
	email: String,
	created_at: Date,
	default_address: {
		city: String,
		country: String,
		
	},
	
});

module.exports = mongoose.model("Customer", CustomerSchema, "shopifyCustomers");
