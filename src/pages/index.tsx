import {
	Box,
	Card,
	CardActionArea,
	Container,
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
				<Container
					sx={{
						mt: 3,
						display: "flex",
						flexDirection: "column",
						gap: 3,
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Typography
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								gap: 2,
							}}
							variant="h5"
							component="h1"
						>
							<Image
								src="/rekor-logo.svg"
								alt="Rekor"
								width={124}
								height={40}
							/>
							search
						</Typography>

						<a
							href="https://github.com/chainguard-dev/rekor-search-ui"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image
								src="/github.svg"
								alt="GitHub"
								width={40}
								height={40}
							/>
						</a>
					</Box>

					<Explorer />

					<Box
						component="footer"
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							borderTop: 2,
							borderColor: "secondary.main",
							mb: 3,
							pt: 2,
						}}
					>
						<Typography
							variant="overline"
							sx={{ color: "secondary.dark" }}
						>
							Brought to you by
						</Typography>
						<Card>
							<CardActionArea sx={{ p: 1 }}>
								<a
									href="https://chainguard.dev"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Image
										src="/chainguard-logo.svg"
										alt="Chainguard Logo"
										width={123}
										height={42}
									/>
								</a>
							</CardActionArea>
						</Card>
					</Box>
				</Container>
			</ThemeProvider>
		</>
	);
};

export default Home;
