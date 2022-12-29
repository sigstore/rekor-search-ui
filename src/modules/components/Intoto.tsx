import { Box, Link, Typography } from "@mui/material";
import { dump } from "js-yaml";
import NextLink from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IntotoV001Schema } from "rekor";
import { decodex509 } from "../x509/decode";

export function IntotoViewer({ intoto }: { intoto: IntotoV001Schema }) {
	const certContent = window.atob(intoto.publicKey || "");

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
					href={`/?hash=${intoto.content.hash?.algorithm}:${intoto.content.hash?.value}`}
					passHref
				>
					<Link>Hash</Link>
				</NextLink>
			</Typography>

			<SyntaxHighlighter
				language="text"
				style={atomDark}
			>
				{`${intoto.content.hash?.algorithm}:${intoto.content.hash?.value}`}
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
				{intoto.publicKey || ""}
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
