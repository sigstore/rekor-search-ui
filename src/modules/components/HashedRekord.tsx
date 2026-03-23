import { Box, Link, Typography } from "@mui/material";
import { dump } from "js-yaml";
import NextLink from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { RekorSchema } from "rekor";
import { decodex509 } from "../x509/decode";

export function HashedRekordViewer({
	hashedRekord,
}: {
	hashedRekord: RekorSchema;
}) {
	const certContent = window.atob(
		hashedRekord.signature.publicKey?.content || "",
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
				<Link
					component={NextLink}
					href={`/?hash=${hashedRekord.data.hash?.algorithm}:${hashedRekord.data.hash?.value}`}
					passHref
				>
					Hash
				</Link>
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

export function HashedRekordV002Viewer({
	hashedRekord,
}: {
	hashedRekord: any;
}) {
	let actualRekord = hashedRekord;
	if (
		actualRekord &&
		typeof actualRekord === "object" &&
		!actualRekord.data &&
		!actualRekord.Data &&
		!actualRekord.signature &&
		!actualRekord.Signature
	) {
		const keys = Object.keys(actualRekord);
		if (keys.length === 1 && typeof actualRekord[keys[0]] === "object") {
			actualRekord = actualRekord[keys[0]];
		}
	}

	const sig = actualRekord?.signature || actualRekord?.Signature;
	const verifier =
		sig?.verifier ||
		sig?.Verifier ||
		actualRekord.verifier ||
		actualRekord.Verifier;

	const rawKey =
		verifier?.publicKey?.rawBytes ||
		verifier?.public_key?.raw_bytes ||
		verifier?.PublicKey?.RawBytes ||
		verifier?.x509Certificate?.rawBytes ||
		verifier?.x509_certificate?.raw_bytes ||
		verifier?.X509Certificate?.RawBytes ||
		verifier?.publicKey?.content ||
		verifier?.PublicKey?.Content ||
		verifier?.publicKey ||
		verifier?.PublicKey ||
		verifier?.x509Certificate ||
		verifier?.X509Certificate ||
		"";

	const isCert = !!(
		verifier?.x509Certificate ||
		verifier?.x509_certificate ||
		verifier?.X509Certificate
	);

	let certContent = "";
	if (rawKey) {
		try {
			if (
				rawKey.includes("BEGIN CERTIFICATE") ||
				rawKey.includes("BEGIN PUBLIC KEY")
			) {
				certContent = rawKey;
			} else if (isCert) {
				const formatted = rawKey.replace(/(.{64})/g, "$1\n");
				certContent = `-----BEGIN CERTIFICATE-----\n${formatted.trim()}\n-----END CERTIFICATE-----\n`;
			} else {
				// Assume raw public key
				const formatted = rawKey.replace(/(.{64})/g, "$1\n");
				certContent = `-----BEGIN PUBLIC KEY-----\n${formatted.trim()}\n-----END PUBLIC KEY-----\n`;
			}
		} catch (e) {
			certContent = rawKey;
		}
	}

	const publicKey = {
		title: isCert ? "Public Key Certificate" : "Public Key",
		content: certContent,
	};

	if (certContent.includes("BEGIN CERTIFICATE")) {
		try {
			publicKey.content = dump(decodex509(certContent), {
				noArrayIndent: true,
				lineWidth: -1,
			});
		} catch {
			// If decodex509 fails, fallback to rendering the PEM contents
		}
	}

	let hexDigest = "";
	const data = actualRekord.data || actualRekord.Data || {};
	const payloadDigest =
		data?.hash?.value ||
		data?.Hash?.Value ||
		data?.digest ||
		data?.Digest ||
		"";

	if (payloadDigest) {
		if (/^[0-9a-fA-F]+$/.test(payloadDigest) && payloadDigest.length >= 40) {
			hexDigest = payloadDigest;
		} else {
			try {
				const rawDigest = window.atob(payloadDigest);
				for (let i = 0; i < rawDigest.length; i++) {
					hexDigest += rawDigest.charCodeAt(i).toString(16).padStart(2, "0");
				}
			} catch (e) {
				hexDigest = payloadDigest;
			}
		}
	}

	const algorithm = (
		data?.hash?.algorithm ||
		data?.Hash?.Algorithm ||
		data?.algorithm ||
		data?.Algorithm ||
		""
	).toLowerCase();

	const sigContent =
		sig?.content || sig?.Content || (typeof sig === "string" ? sig : "");

	return (
		<Box>
			<Typography
				variant="h5"
				sx={{ py: 1 }}
			>
				<Link
					component={NextLink}
					href={`/?hash=${algorithm}:${hexDigest}`}
					passHref
				>
					Hash
				</Link>
			</Typography>

			<SyntaxHighlighter
				language="text"
				style={atomDark}
			>
				{`${algorithm}:${hexDigest}`}
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
				{sigContent}
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
