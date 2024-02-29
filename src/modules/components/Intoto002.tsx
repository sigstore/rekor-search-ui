import { Box, Link, Typography } from "@mui/material";
import { dump } from "js-yaml";
import NextLink from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IntotoV002Schema } from "rekor";
import { decodex509 } from "../x509/decode";

export function IntotoViewer002({ intoto }: { intoto: IntotoV002Schema }) {
	const signature = intoto.content.envelope?.signatures[0];
	const certContent = window.atob(signature?.publicKey || "");

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
					href={`/?hash=${intoto.content.payloadHash?.algorithm}:${intoto.content.payloadHash?.value}`}
					passHref
				>
					<Link>Hash</Link>
				</NextLink>
			</Typography>

			<SyntaxHighlighter
				language="text"
				style={atomDark}
			>
				{`${intoto.content.payloadHash?.algorithm}:${intoto.content.payloadHash?.value}`}
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
				{window.atob(signature?.sig || "")}
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
