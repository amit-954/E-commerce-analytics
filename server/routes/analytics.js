const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const axios = require("axios");




// Utility function to format date based on interval
const getDateFormat = (interval) => {
	switch (interval) {
		case "daily":
			return {
				$dateToString: { format: "%Y-%m-%d", date: "$created_at" },
			};
		case "monthly":
			return { $dateToString: { format: "%Y-%m", date: "$created_at" } };
		case "quarterly":
			return {
				$concat: [
					{ $toString: { $year: "$created_at" } },
					"-Q",
					{
						$toString: {
							$ceil: { $divide: [{ $month: "$created_at" }, 3] },
						},
					},
				],
			};
		case "yearly":
			return { $dateToString: { format: "%Y", date: "$created_at" } };
		default:
			return {
				$dateToString: { format: "%Y-%m-%d", date: "$created_at" },
			};
	}
};




// Total Sales Over Time
// GET /api/analytics/total-sales?interval=daily
router.get("/total-sales", async (req, res) => {
	try {
		const interval = req.query.interval || "monthly";
		const dateFormat = getDateFormat(interval);

		const salesData = await Order.aggregate([
			{
				$addFields: {
					created_at: { $toDate: "$created_at" },
				},
			},
			{
				$group: {
					_id: dateFormat,
					totalSales: {
						$sum: {
							$toDouble: "$total_price_set.shop_money.amount",
						},
					},
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		const roundedSalesData = salesData.map((item) => ({
			...item,
			totalSales: Math.round(item.totalSales),
		}));

		res.json(roundedSalesData);

	} catch (error) {
		console.error("Error fetching total sales:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});




// Sales Growth Rate Over Time
// GET /api/analytics/sales-growth-rate?interval=monthly
router.get("/sales-growth-rate", async (req, res) => {
	try {
		const interval = req.query.interval || "monthly";
		const dateFormat = getDateFormat(interval);

		const salesData = await Order.aggregate([
			{
				$addFields: {
					created_at: { $toDate: "$created_at" },
				},
			},
			{
				$group: {
					_id: dateFormat,
					totalSales: {
						$sum: {
							$toDouble: "$total_price_set.shop_money.amount",
						},
					},
				},
			},
			{
				$sort: { _id: 1 },
			},
			{
				$setWindowFields: {
					sortBy: { _id: 1 },
					output: {
						previousSales: {
							$shift: {
								output: "$totalSales",
								by: -1,
							},
						},
					},
				},
			},
			{
				$addFields: {
					growthRate: {
						$cond: [
							{ $eq: ["$previousSales", null] },
							0,
							{
								$cond: [
									{ $eq: ["$previousSales", 0] },
									null,
									{
										$multiply: [
											{
												$divide: [
													{
														$subtract: [
															"$totalSales",
															"$previousSales",
														],
													},
													"$previousSales",
												],
											},
											100,
										],
									},
								],
							},
						],
					},
				},
			},
			{
				$project: {
					_id: 1,
					totalSales: 1,
					growthRate: 1,
				},
			},
		]);

		const roundedSalesData = salesData.map((item) => ({
			...item,
			totalSales: Math.round(item.totalSales),
			growthRate:
				item.growthRate === null
					? null
					: Math.round(item.growthRate * 100) / 100,
		}));

		res.json(roundedSalesData);
	} catch (error) {
		console.error("Error fetching sales growth rate:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});




// New Customers Added Over Time
// GET /api/analytics/new-customers?interval=monthly
router.get("/new-customers", async (req, res) => {
	try {
		const interval = req.query.interval || "monthly";
		const dateFormat = getDateFormat(interval);

		const newCustomersData = await Customer.aggregate([
			{
				$addFields: {
					created_at: { $toDate: "$created_at" },
				},
			},
			{
				$group: {
					_id: dateFormat,
					newCustomers: { $sum: 1 },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		res.json(newCustomersData);
	} catch (error) {
		console.error("Error fetching new customers:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});




// Number of Repeat Customers
// GET /api/analytics/repeat-customers?interval=monthly
router.get("/repeat-customers", async (req, res) => {
	try {
		const interval = req.query.interval || "monthly";
		const dateFormat = getDateFormat(interval);

		const repeatCustomersData = await Order.aggregate([
			{
				$addFields: {
					created_at: { $toDate: "$created_at" },
				},
			},
			{
				$group: {
					_id: {
						customerId: "$customer.id",
						date: dateFormat,
					},
					orderCount: { $sum: 1 },
				},
			},
			{
				$match: {
					orderCount: { $gt: 1 },
				},
			},
			{
				$group: {
					_id: "$_id.date",
					repeatCustomers: { $sum: 1 },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		res.json(repeatCustomersData);
	} catch (error) {
		console.error("Error fetching repeat customers:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});





// Customer Lifetime Value by Cohorts
// GET /api/analytics/customer-lifetime-value
router.get("/customer-lifetime-value", async (req, res) => {
	try {
		const interval = req.query.interval || "monthly";
		const dateFormat = getDateFormat(interval);

		const customerLifetimeValueData = await Order.aggregate([
			{
				$lookup: {
					from: "shopifyCustomers",
					localField: "customer.id",
					foreignField: "id",
					as: "customer",
				},
			},
			{ $unwind: "$customer" },
			{
				$addFields: {
					created_at: { $toDate: "$created_at" },
					total_price: { $toDouble: "$total_price" },
				},
			},
			{
				$group: {
					_id: {
						customerId: "$customer.id",
						cohort: {
							$dateToString: {
								format: "%Y-%m",
								date: { $toDate: "$customer.created_at" },
							},
						},
					},
					lifetimeValue: { $sum: "$total_price" },
				},
			},
			{
				$group: {
					_id: {
						cohort: "$_id.cohort",
						date: dateFormat,
					},
					totalLifetimeValue: { $sum: "$lifetimeValue" },
				},
			},
			{
				$addFields: {
					totalLifetimeValue: { $round: ["$totalLifetimeValue", 0] },
				},
			},
			{
				$sort: { "_id.cohort": 1 },
			},
		]);

		res.json(customerLifetimeValueData);
	} catch (error) {
		console.error("Error fetching customer lifetime value:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});






// Geographical Distribution of Customers
// GET /api/analytics/geographical-distribution
router.get("/geographical-distribution", async (req, res) => {
	try {
		const geoDistributionData = await Customer.aggregate([
			{
				$group: {
					_id: "$default_address.city",
					customerCount: { $sum: 1 },
				},
			},
			{
				$sort: { customerCount: -1 },
			},
		]);

		const geoDataWithCoordinates = await Promise.all(
			geoDistributionData.map(async (location) => {
				const { _id: cityName, customerCount } = location;
				const coords = await fetchCityCoordinates(cityName);

				return {
					name: cityName,
					customerCount: customerCount,
					lat: coords.lat,
					lng: coords.lng,
				};
			}),
		);

		res.json(geoDataWithCoordinates);
	} catch (error) {
		console.error(
			"Error fetching geographical distribution:",
			error.message,
		);
		res.status(500).json({ error: "Internal server error" });
	}
});

const fetchCityCoordinates = async (cityName) => {
	const apiKey = process.env.MAP_API;
	try {
		const response = await axios.get(
			`https://api.opencagedata.com/geocode/v1/json`,
			{
				params: {
					q: cityName,
					key: apiKey,
				},
			},
		);
		const results = response.data.results;
		if (results.length > 0) {
			return {
				lat: results[0].geometry.lat,
				lng: results[0].geometry.lng,
			};
		} else {
			return { lat: 0, lng: 0 };
		}
	} catch (error) {
		console.error(`Error fetching coordinates for ${cityName}:`, error);
		return { lat: 0, lng: 0 };
	}
};



module.exports = router;
