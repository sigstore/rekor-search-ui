import { Box, Link, Typography } from "@mui/material";
import { dump } from "js-yaml";
import NextLink from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { DSSEV001Schema } from "rekor";
import { decodex509 } from "../x509/decode";

export function DSSEViewer({ dsse }: { dsse: DSSEV001Schema }) {
	const sig = dsse.signatures?.[0];
	const certContent = window.atob(sig?.verifier || "");

	const publicKey = {
		title: "Public Key",
		content: certContent,
	};
	if (certContent.includes("BEGIN CERTIFICATE")) {
		publicKey.title = "Public Key Certificate";
		publicKey.content = dump(decodex509(certContent), {
			noArrayIndent: true,
			lineWidth: -1,
		});
	}

	return (
		<Box>
			<Typography
				variant="h5"
				sx={{ py: 1 }}
			>
				<NextLink
					href={`/?hash=${dsse.payloadHash?.algorithm}:${dsse.payloadHash?.value}`}
					passHref
				>
					<Link component={"span"}>Hash</Link>
				</NextLink>
			</Typography>

			<SyntaxHighlighter
				language="text"
				style={atomDark}
			>
				{`${dsse.payloadHash?.algorithm}:${dsse.payloadHash?.value}`}
			</SyntaxHighlighter>

			<Typography
				variant="h5"
				sx={{ py: 1 }}
			>
				Signature
			</Typography>
			<SyntaxHighlighter
				language="text"
				style={atomDark}
			>
				{sig?.signature || ""}
			</SyntaxHighlighter>
			<Typography
				variant="h5"
				sx={{ py: 1 }}
			>
				{publicKey.title}
			</Typography>
			<SyntaxHighlighter
				language="yaml"
				style={atomDark}
			>
				{publicKey.content}
			</SyntaxHighlighter>
		</Box>
	);
}
