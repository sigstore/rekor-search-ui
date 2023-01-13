import {
	Box,
	Container,
	CssBaseline,
	Link,
	ThemeProvider,
	Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Explorer } from "../modules/components/Explorer";
import { REKOR_SEARCH_THEME } from "../modules/theme/theme";

const Home: NextPage = () => {
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
							href="https://chainguard.dev"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image
								src="/chainguard-logo.svg"
								alt="Chainguard Logo"
								fill
							/>
						</Link>
					</Box>

					<Typography variant="h4">Rekor Search</Typography>

					<Box sx={{ width: 198, textAlign: "right" }}>
						<Link
							href="https://github.com/chainguard-dev/rekor-search-ui"
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
						<Typography fontSize="small">
							Built with ❤️ by{" "}
							<Link
								href="https://chainguard.dev"
								target="_blank"
								rel="noopener noreferrer"
							>
								Chainguard
							</Link>
						</Typography>
					</Box>
				</Container>
			</ThemeProvider>
		</>
	);
};

export default Home;
