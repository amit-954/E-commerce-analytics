import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Register Chart.js components
ChartJS.register(
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Legend,
);

const SalesGrowthRateChart = () => {
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [interval, setInterval] = useState("monthly");
	const [averageGrowthRate, setAverageGrowthRate] = useState(0);

	useEffect(() => {
		fetchData();
	}, [interval]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`http://localhost:5000/api/analytics/sales-growth-rate?interval=${interval}`,
			);
			const data = response.data;

			if (data && data.length > 0) {
				const labels = data.map((item) => item._id);
				const growthRate = data.map((item) => item.growthRate);

				setChartData({
					labels,
					datasets: [
						{
							label: `Sales Growth Rate (${interval})`,
							data: growthRate,
							fill: false,
							backgroundColor: "rgba(153,102,255,0.6)",
							borderColor: "rgba(153,102,255,1)",
						},
					],
				});

				// Calculate average sales growth rate
				const totalGrowthRate = growthRate.reduce(
					(sum, rate) => sum + rate,
					0,
				);
				let average =
					totalGrowthRate / (data.length > 0 ? data.length : 1);
				average = Math.round(average * 100) / 100;

				const formattedAverage = new Intl.NumberFormat("en-IN").format(
					average,
				);
				setAverageGrowthRate(formattedAverage);
			} else {
				setChartData({});
				setAverageGrowthRate(0);
			}
			setError(null);
		} catch (error) {
			console.error("Error fetching sales growth rate data:", error);
			setError("Failed to fetch sales growth rate data.");
			setChartData({});
			setAverageGrowthRate(0);
		} finally {
			setLoading(false);
		}
	};

	const handleButtonClick = (intervalValue) => {
		setInterval(intervalValue);
	};

	return (
		<div>
			<Box sx={{ marginBottom: 2, fontSize: "30px" }}>
				<label>Sales Growth Rate Over Time</label>
			</Box>

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 2,
					marginRight: 2,
				}}
			>
				<ButtonGroup variant="outlined" aria-label="Basic button group">
					<Button
						onClick={() => handleButtonClick("daily")}
						variant={
							interval === "daily" ? "contained" : "outlined"
						}
					>
						Daily
					</Button>
					<Button
						onClick={() => handleButtonClick("monthly")}
						variant={
							interval === "monthly" ? "contained" : "outlined"
						}
					>
						Monthly
					</Button>
					<Button
						onClick={() => handleButtonClick("quarterly")}
						variant={
							interval === "quarterly" ? "contained" : "outlined"
						}
					>
						Quarterly
					</Button>
					<Button
						onClick={() => handleButtonClick("yearly")}
						variant={
							interval === "yearly" ? "contained" : "outlined"
						}
					>
						Yearly
					</Button>
				</ButtonGroup>
				<Typography variant="h6" sx={{ marginLeft: 2 }}>
					Average Sales Growth Rate = {averageGrowthRate}%
				</Typography>
			</Box>

			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p>{error}</p>
			) : chartData.labels && chartData.labels.length > 0 ? (
				<div style={{ width: "100%", height: "calc(100vh - 200px)" }}>
					<Line
						data={chartData}
						options={{
							maintainAspectRatio: false,
							scales: {
								y: {
									beginAtZero: true,
								},
							},
							plugins: {
								legend: {
									display: false,
								},
							},
						}}
					/>
				</div>
			) : (
				<p>No data available</p>
			)}
		</div>
	);
};

export default SalesGrowthRateChart;
