import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const GeographicalDistributionChart = () => {
	const [geoData, setGeoData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				"http://localhost:5000/api/analytics/geographical-distribution",
			);
			setGeoData(response.data);
			setError(null);
		} catch (error) {
			console.error(
				"Error fetching geographical distribution data:",
				error,
			);
			setError("Failed to fetch geographical distribution data.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div style={{ marginBottom: "10px", fontSize: "30px" }}>
				<label>Geographical Distribution of Customers</label>
			</div>
			<br />

			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p>{error}</p>
			) : (
				<MapContainer
					center={[20, 0]}
					zoom={2}
					style={{
						width: "100%",
						height: "calc(100vh - 200px)",
					}}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					{geoData.map((location, index) => {
						const { lat, lng, name, customerCount } = location;
						if (lat && lng) {
							return (
								<Marker
									key={index}
									position={[lat, lng]}
									icon={
										new L.Icon({
											iconUrl:
												"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
											iconSize: [25, 41],
											iconAnchor: [12, 41],
											popupAnchor: [1, -34],
											shadowSize: [41, 41],
										})
									}
								>
									<Tooltip
										direction="top"
										offset={[0, -20]}
										opacity={1}
									>
										<strong>{name}</strong> <br />{" "}
										Customers: {customerCount}
									</Tooltip>
								</Marker>
							);
						}
						return null;
					})}
				</MapContainer>
			)}
		</div>
	);
};

export default GeographicalDistributionChart;
