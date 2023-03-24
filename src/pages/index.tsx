import SettingsIcon from "@mui/icons-material/Settings";
import {
	Box,
	Container,
	CssBaseline,
	IconButton,
	Link,
	ThemeProvider,
	Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { RekorClientProvider } from "../modules/api/context";
import { Explorer } from "../modules/components/Explorer";
import { Settings } from "../modules/components/Settings";
import { REKOR_SEARCH_THEME } from "../modules/theme/theme";

const Home: NextPage = () => {
	const [settingsOpen, setSettingsOpen] = useState(false);

	return (
		<>
			<Head>
				<title>Rekor Search</title>
				<meta
					name="description"
					content="Search the Rekor public transparency log"
				/>
				<link
					rel="icon"
					href="/logo.png"
				/>
			</Head>

			<ThemeProvider theme={REKOR_SEARCH_THEME}>
				<CssBaseline />

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						paddingX: 4,
						paddingY: 2,
						background: "white",
						borderBottom: "1px solid #E3E0E6",
					}}
				>
					<Box sx={{ height: 41, width: 198, position: "relative" }}>
						<Link
							href="https://sigstore.dev"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image
								src="/sigstore_rekor-horizontal-color.svg"
								alt="Rekor Logo"
								fill
							/>
						</Link>
					</Box>

					<Typography variant="h4">Rekor Search</Typography>

					<Box
						sx={{
							width: 198,
							display: "flex",
							justifyContent: "flex-end",
							alignItems: "center",
						}}
					>
						<IconButton
							sx={{ mr: 2 }}
							aria-label="settings"
							color="inherit"
							size="small"
							onClick={() => setSettingsOpen(true)}
						>
							<SettingsIcon />
						</IconButton>
						<Link
							href="https://github.com/sigstore/rekor-search-ui"
							target="_blank"
							rel="noopener noreferrer"
							sx={{ lineHeight: 0 }}
						>
							<Image
								src="/github.svg"
								alt="GitHub"
								color="white"
								width={24}
								height={24}
							/>
						</Link>
					</Box>
				</Box>

				<Settings
					open={settingsOpen}
					onClose={() => setSettingsOpen(false)}
				/>

				<Container
					sx={{
						mt: 4,
						display: "flex",
						flexDirection: "column",
						gap: 3,
					}}
				>
					<Explorer />

					<Box
						component="footer"
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							mb: 3,
							pt: 2,
						}}
					>
					</Box>
				</Container>
			</ThemeProvider>
		</>
	);
};

const Page: NextPage = () => (
	<RekorClientProvider>
		<Home />
	</RekorClientProvider>
);
export default Page;
