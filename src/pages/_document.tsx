import Document, { Head, Html, Main, NextScript } from "next/document";

class AppDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head></Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default AppDocument;
