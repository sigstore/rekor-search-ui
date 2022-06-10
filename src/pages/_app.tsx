import "../../styles/globals.css";

import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import * as Fathom from "fathom-client";

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	useEffect(() => {
		Fathom.load("EKFJYRUD", {
			includedDomains: ["rekor.tlog.dev"],
		});

		function onRouteChangeComplete() {
			Fathom.trackPageview();
		}
		// Record a pageview when route changes
		router.events.on("routeChangeComplete", onRouteChangeComplete);

		// Unassign event listener
		return () => {
			router.events.off("routeChangeComplete", onRouteChangeComplete);
		};
	}, [router]);

	return <Component {...pageProps} />;
}

export default App;
