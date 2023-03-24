import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails as MuiAccordionDetails,
	AccordionSummary,
	Box,
	Divider,
	DividerProps,
	Grid,
	Link,
	Paper,
	styled,
	Typography,
} from "@mui/material";
import { dump, load } from "js-yaml";
import NextLink from "next/link";
import { Convert } from "pvtsutils";
import { ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IntotoV002Schema, LogEntry, RekorSchema } from "rekor";
import { toRelativeDateString } from "../utils/date";
import { HashedRekordViewer } from "./HashedRekord";
import { IntotoViewer } from "./Intoto";

const DUMP_OPTIONS: jsyaml.DumpOptions = {
	replacer: (key, value) => {
		if (Convert.isBase64(value)) {
			try {
				return load(window.atob(value));
			} catch (e) {
				return value;
			}
		}
		return value;
	},
};

const AccordionDetails = styled(MuiAccordionDetails)({
	padding: 0,
});

/**
 * Return a parsed JSON object of the provided content.
 * If an error occurs, the provided content is returned as a raw string.
 */
function tryJSONParse(content?: string): unknown {
	if (!content) {
		return content;
	}
	try {
		return JSON.parse(content);
	} catch (e) {
		return content;
	}
}

export function Card({
	title,
	content,
	dividerSx = {},
}: {
	title: ReactNode;
	content: ReactNode;
	dividerSx?: DividerProps["sx"];
}) {
	return (
		<div
			style={{
				display: "flex",
			}}
		>
			<Divider
				orientation="vertical"
				flexItem
				sx={{
					mx: 1,
					...dividerSx,
				}}
			/>
			<Box>
				<Typography
					variant="button"
					component="h3"
				>
					{title}
				</Typography>
				<Typography
					variant="body2"
					component="p"
					sx={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "flex",
						alignItems: "center",
						justifyContent: "start",
					}}
				>
					{content}
				</Typography>
			</Box>
		</div>
	);
}

export function Entry({ entry }: { entry: LogEntry }) {
	const [uuid, obj] = Object.entries(entry)[0];

	const body = JSON.parse(window.atob(obj.body)) as {
		kind: string;
		apiVersion: string;
		spec: unknown;
	};

	// Extract the JSON payload of the attestation. Some attestations appear to be
	// double Base64 encoded. This loop will attempt to extract the content, with
	// a max depth as a safety gap.
	let rawAttestation = obj.attestation?.data as string | undefined;
	for (let i = 0; Convert.isBase64(rawAttestation) && i < 3; i++) {
		rawAttestation = window.atob(rawAttestation);
	}
	const attestation = tryJSONParse(rawAttestation);

	let parsed: ReactNode | undefined;
	switch (body.kind) {
		case "hashedrekord":
			parsed = <HashedRekordViewer hashedRekord={body.spec as RekorSchema} />;
			break;
		case "intoto":
			parsed = <IntotoViewer intoto={body.spec as IntotoV002Schema} />;
			break;
	}

	return (
		<Paper sx={{ mb: 2, p: 1 }}>
			<Typography
				variant="h5"
				component="h2"
				sx={{
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				Entry UUID:{" "}
				<Link
					component={NextLink}
					href={`/?uuid=${uuid}`}
					passHref
				>
					{uuid}
				</Link>
			</Typography>
			<Divider
				flexItem
				sx={{ my: 1 }}
			/>
			<Grid
				container
				sx={{ mb: 1 }}
				rowSpacing={1}
			>
				<Grid
					item
					xs={6}
					sm={3}
				>
					<Card
						title="Type"
						content={body.kind}
						dividerSx={{
							display: "none",
						}}
					/>
				</Grid>
				<Grid
					item
					xs={6}
					sm={3}
				>
					<Card
						title="Log Index"
						content={
							<Link
								component={NextLink}
								href={`/?logIndex=${obj.logIndex}`}
								passHref
							>
								{obj.logIndex}
							</Link>
						}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
				>
					<Card
						title="Integrated time"
						content={toRelativeDateString(new Date(obj.integratedTime * 1000))}
						dividerSx={{
							display: {
								xs: "none",
								sm: "block",
							},
						}}
					/>
				</Grid>
			</Grid>
			<Divider
				flexItem
				sx={{ my: 1 }}
			/>
			{parsed}
			<Box
				sx={{
					mt: 1,
					"& .MuiAccordion-root:not(:last-of-type)": {
						borderBottom: "none",
					},
				}}
			>
				<>
					<Accordion
						disableGutters
						defaultExpanded={!parsed}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls="body-content"
							id="body-header"
						>
							<Typography>Raw Body</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<SyntaxHighlighter
								language="yaml"
								style={atomDark}
							>
								{dump(body, DUMP_OPTIONS)}
							</SyntaxHighlighter>
						</AccordionDetails>
					</Accordion>
					{attestation && (
						<Accordion disableGutters>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="attestation-content"
								id="attestation-header"
							>
								<Typography>Attestation</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<SyntaxHighlighter
									language="yaml"
									style={atomDark}
								>
									{dump(attestation)}
								</SyntaxHighlighter>
							</AccordionDetails>
						</Accordion>
					)}
					{obj.verification && (
						<Accordion disableGutters>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="verification-content"
								id="verification-header"
							>
								<Typography>Verification</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<SyntaxHighlighter
									language="yaml"
									style={atomDark}
								>
									{dump(obj.verification)}
								</SyntaxHighlighter>
							</AccordionDetails>
						</Accordion>
					)}
				</>
			</Box>
		</Paper>
	);
}
