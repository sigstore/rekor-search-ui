import "../../styles/globals.css";

import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Router } from "next/router";
import * as Fathom from "fathom-client";

// Record a pageview when route changes.
Router.events.on("routeChangeComplete", (as, routeProps) => {
	if (!routeProps.shallow) {
		Fathom.trackPageview();
	}
});

function App({ Component, pageProps }: AppProps) {
	useEffect(() => {
		Fathom.load("EKFJYRUD", {
			includedDomains: ["rekor.tlog.dev"],
		});
	}, []);

	return <Component {...pageProps} />;
}

export default App;
