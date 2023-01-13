import { createTheme } from "@mui/material/styles";

export const REKOR_SEARCH_THEME = createTheme({
	typography: {
		fontFamily: ["Helvetica Neue", "Arial", "sans-serif"].join(","),
		h4: {
			fontWeight: 300,
			fontSize: "1.8rem",
			color: "#2e2f71",
		},
		h5: {
			fontWeight: 300,
			fontSize: "0.9rem",
			color: "#444444",
		},
	},
	palette: {
		background: {
			default: "#F8F7FD",
		},
		primary: {
			main: "#444CE4",
		},
		secondary: {
			main: "#B938B4",
		},
		info: {
			main: "#2e2f71",
		},
		error: {
			main: "#B81E22",
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: `
				pre {
					font-size: 0.8rem;
					margin: 0 !important;
				}
		`,
		},
		MuiPaper: {
			defaultProps: {
				variant: "outlined",
			},
		},
	},
});
