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

ChartJS.register(
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Legend,
);

const TotalSalesChart = () => {
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [interval, setInterval] = useState("monthly");
	const [averageSales, setAverageSales] = useState(0);

	useEffect(() => {
		fetchData();
	}, [interval]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`https://analytics-server-kklo.onrender.com/api/analytics/total-sales?interval=${interval}`,
			);
			const data = response.data;

			if (data && data.length > 0) {
				const labels = data.map((item) => item._id);
				const sales = data.map((item) => item.totalSales);

				setChartData({
					labels,
					datasets: [
						{
							label: `Total Sales (${interval})`,
							data: sales,
							fill: false,
							backgroundColor: "rgba(75,192,192,0.6)",
							borderColor: "rgba(75,192,192,1)",
						},
					],
				});

				const totalSales = sales.reduce((sum, sale) => sum + sale, 0);
				const average = Math.round(
					totalSales / (data.length > 0 ? data.length : 1),
				);

				const formattedAverage = new Intl.NumberFormat("en-IN").format(
					average,
				);
				setAverageSales(formattedAverage);
			} else {
				setChartData({});
				setAverageSales(0);
			}
			setError(null);
		} catch (error) {
			console.error("Error fetching sales data:", error);
			setError("Failed to fetch sales data.");
			setChartData({});
			setAverageSales(0);
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
					Total Sales Over Time
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
						Average Total Sale = {averageSales}
					</Typography>
				</Box>
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

export default TotalSalesChart;
