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

const CustomerLifetimeValueCohortsChart = () => {
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [averageLifetimeValue, setAverageLifetimeValue] = useState(0);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`http://localhost:5000/api/analytics/customer-lifetime-value`,
			);
			console.log("Response received:", response.data);

			const data = response.data;

			if (data && data.length > 0) {
				const labels = data.map((item) => item._id.cohort);
				const lifetimeValue = data.map(
					(item) => item.totalLifetimeValue,
				);

				setChartData({
					labels,
					datasets: [
						{
							label: "Customer Lifetime Value",
							data: lifetimeValue,
							fill: false,
							backgroundColor: "rgba(255,159,64,0.6)",
							borderColor: "rgba(255,159,64,1)",
						},
					],
				});

				
				const totalLifetimeValue = lifetimeValue.reduce(
					(sum, value) => sum + value,
					0,
				);
				const average = Math.round(
					totalLifetimeValue / (data.length > 0 ? data.length : 1),
				);

				const formattedAverage = new Intl.NumberFormat("en-IN").format(
					average,
				);
				setAverageLifetimeValue(formattedAverage);
			} else {
				console.log("No data received");
				setChartData({});
				setAverageLifetimeValue(0);
			}
			setError(null);
		} catch (error) {
			console.error(
				"Error fetching customer lifetime value by cohorts data:",
				error,
			);
			setError(
				"Failed to fetch customer lifetime value by cohorts data.",
			);
			setChartData({});
			setAverageLifetimeValue(0);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div style={{ fontSize: "30px" }}>
				<label>Customer Lifetime Value by Cohorts</label>
			</div>
			<br />

			
			{!loading && !error && (
				<Typography variant="h6" sx={{ marginBottom: 2 }}>
					Average Lifetime Value = {averageLifetimeValue}
				</Typography>
			)}

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
								x: {
									title: {
										display: true,
									},
								},
								y: {
									beginAtZero: true,
									title: {
										display: true,
									},
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

export default CustomerLifetimeValueCohortsChart;
