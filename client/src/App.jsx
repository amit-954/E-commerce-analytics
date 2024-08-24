import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { PiChartLineBold } from "react-icons/pi";
import InsightsIcon from "@mui/icons-material/Insights";
import AddchartIcon from "@mui/icons-material/Addchart";
import { TbReportAnalytics } from "react-icons/tb";
import { GrMap } from "react-icons/gr";
import { TbPresentationAnalytics } from "react-icons/tb";
import TotalSalesChart from "./components/TotalSalesChart";
import SalesGrowthRateChart from "./components/SalesGrowthRateChart";
import NewCustomersChart from "./components/NewCustomersChart";
import RepeatCustomersChart from "./components/RepeatCustomersChart";
import GeographicalDistributionChart from "./components/GeographicalDistributionChart";
import CustomerLifetimeValueChart from "./components/CustomerLifetimeValueChart";

const drawerWidth = 80;

export default function App() {
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const [selectedComponent, setSelectedComponent] = React.useState(
		<TotalSalesChart />,
	);

	const handleIconClick = (index) => {
		setSelectedIndex(index);
		setSelectedComponent(components[index]);
	};

	const icons = [
		<PiChartLineBold key={0} />,
		<InsightsIcon key={1} />,
		<AddchartIcon key={2} />,
		<TbReportAnalytics key={3} />,
		<TbPresentationAnalytics key={4} />,
		<GrMap key={5} />,
	];

	const components = [
		<TotalSalesChart key={0} />,
		<SalesGrowthRateChart key={1} />,
		<NewCustomersChart key={2} />,
		<RepeatCustomersChart key={3} />,
		<CustomerLifetimeValueChart key={4} />,
		<GeographicalDistributionChart key={5} />,
	];

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				sx={{
					zIndex: (theme) => theme.zIndex.drawer + 1,
					backgroundColor: "#01579b",
					height: "60px",
				}}
			>
				<Toolbar>
					<Typography variant="h6" noWrap component="div">
						Analytics Dashboard
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				}}
			>
				<Toolbar />
				<Box sx={{ overflow: "auto" }}>
					<List>
						{icons.map((icon, index) => (
							<ListItem key={index} disablePadding>
								<ListItemButton
									onClick={() => handleIconClick(index)}
									selected={selectedIndex === index} // Highlight selected icon
									sx={{ marginBottom: 2 }} // Adds space between icons
								>
									<ListItemIcon
										sx={{
											justifyContent: "center",
											fontSize: "1.5rem",
											color:
												selectedIndex === index
													? "primary.main"
													: "inherit",
										}}
									>
										{icon}
									</ListItemIcon>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Box>
			</Drawer>
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar />
				{selectedComponent}
			</Box>
		</Box>
	);
}
