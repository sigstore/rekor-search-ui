import { Box, Link, Typography } from "@mui/material";
import { dump } from "js-yaml";
import NextLink from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { HashedRekord } from "../api/generated/types/hashedrekord";
import { decodex509 } from "../x509/decode";

export function HashedRekordViewer({
	hashedRekord,
}: {
	hashedRekord: HashedRekord;
}) {
	const certContent = window.atob(
		hashedRekord.signature.publicKey?.content || ""
	);

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
					href={`/?hash=${hashedRekord.data.hash?.algorithm}:${hashedRekord.data.hash?.value}`}
					passHref
				>
					<Link>Hash</Link>
				</NextLink>
			</Typography>

			<SyntaxHighlighter
				language="text"
				style={atomDark}
			>
				{`${hashedRekord.data.hash?.algorithm}:${hashedRekord.data.hash?.value}`}
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
				{hashedRekord.signature.content || ""}
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
