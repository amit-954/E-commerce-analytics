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

const NewCustomersChart = () => {
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [interval, setInterval] = useState("monthly");
	const [averageNewCustomers, setAverageNewCustomers] = useState(0);

	useEffect(() => {
		fetchData();
	}, [interval]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`http://localhost:5000/api/analytics/new-customers?interval=${interval}`,
			);
			const data = response.data;

			if (data && data.length > 0) {
				const labels = data.map((item) => item._id);
				const newCustomers = data.map((item) => item.newCustomers);

				setChartData({
					labels,
					datasets: [
						{
							label: `New Customers (${interval})`,
							data: newCustomers,
							fill: false,
							backgroundColor: "rgba(255,159,64,0.6)",
							borderColor: "rgba(255,159,64,1)",
						},
					],
				});

				// Calculate the average number of new customers
				const totalNewCustomers = newCustomers.reduce(
					(sum, count) => sum + count,
					0,
				);
				const average = Math.round(
					totalNewCustomers / (data.length > 0 ? data.length : 1) + 1,
				);

				const formattedAverage = new Intl.NumberFormat("en-IN").format(
					average,
				);
				setAverageNewCustomers(formattedAverage);
			} else {
				setChartData({});
				setAverageNewCustomers(0);
			}
			setError(null);
		} catch (error) {
			console.error("Error fetching new customers data:", error);
			setError("Failed to fetch new customers data.");
			setChartData({});
			setAverageNewCustomers(0);
		} finally {
			setLoading(false);
		}
	};

	const handleButtonClick = (intervalValue) => {
		setInterval(intervalValue);
	};

	return (
		<div>
			<Box sx={{ marginBottom: 2 }}>
				<Typography variant="h4" sx={{ marginBottom: 2 }}>
					New Customers Over Time
				</Typography>

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginRight: 3,
					}}
				>
					<ButtonGroup
						variant="outlined"
						aria-label="Basic button group"
					>
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
								interval === "monthly"
									? "contained"
									: "outlined"
							}
						>
							Monthly
						</Button>
						<Button
							onClick={() => handleButtonClick("quarterly")}
							variant={
								interval === "quarterly"
									? "contained"
									: "outlined"
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
						Average New Customers = {averageNewCustomers}
					</Typography>
				</Box>
			</Box>

			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p>{error}</p>
			) : chartData.labels && chartData.labels.length > 0 ? (
				<div
					style={{
						width: "100%",
						height: "calc(100vh - 200px)",
					}}
				>
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

export default NewCustomersChart;
