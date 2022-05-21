import { createTheme } from "@mui/material/styles";

export const REKOR_SEARCH_THEME = createTheme({
	typography: {
		fontFamily: ["Inter", "sans-serif"].join(","),
		h4: {
			fontWeight: 300,
			fontSize: "1.5rem",
			color: "#444444",
		},
		h5: {
			fontWeight: 300,
			fontSize: "0.9rem",
			color: "#444444",
		},
	},
	palette: {
		background: {
			default: "rgba(255, 234, 215, 1)",
		},
		primary: {
			main: "#444444",
		},
		secondary: {
			main: "#ffc398",
		},
		info: {
			main: "#444444",
		},
		error: {
			light: "#cb4445",
			main: "#ff5555",
		},
	},
});
