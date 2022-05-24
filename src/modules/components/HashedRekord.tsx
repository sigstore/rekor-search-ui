import { Box, Typography } from "@mui/material";
import { dump } from "js-yaml";
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

	return (
		<Box>
			<Typography
				variant="h5"
				sx={{ py: 1 }}
			>
				Hash
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
				Certificate
			</Typography>
			<SyntaxHighlighter
				language="yaml"
				style={atomDark}
			>
				{dump(decodex509(certContent))}
			</SyntaxHighlighter>
		</Box>
	);
}
