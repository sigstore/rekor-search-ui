import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails as MuiAccordionDetails,
	AccordionSummary,
	Divider,
	DividerProps,
	Grid,
	Paper,
	styled,
	Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { dump, load } from "js-yaml";
import moment from "moment";
import { Convert } from "pvtsutils";
import { ReactNode } from "react";
import Highlight from "react-highlight";
import { LogEntry } from "../api/generated";

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

const SecondarySpan = styled("span")(({ theme }) => ({
	color: theme.palette.info.main,
	paddingInlineStart: theme.spacing(1),
}));

const AccordionDetails = styled(MuiAccordionDetails)({
	padding: 0,
});

function RelativeDate({ date }: { date: Date }) {
	return (
		<>
			{moment().to(date)}
			<SecondarySpan>({moment(date).format()})</SecondarySpan>
		</>
	);
}

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

export function Entry({ entry }: { entry: LogEntry }) {
	const [uuid, obj] = Object.entries(entry)[0];

	const body = JSON.parse(window.atob(obj.body)) as {
		kind: string;
		spec: string;
	};

	// Extract the JSON payload of the attestation. Some attestations appear to be
	// double Base64 encoded. This loop will attempt to extract the content, with
	// a max depth as a safety gap.
	let rawAttestation = obj.attestation?.data as string | undefined;
	for (let i = 0; Convert.isBase64(rawAttestation) && i < 3; i++) {
		rawAttestation = window.atob(rawAttestation);
	}
	const attestation = tryJSONParse(rawAttestation);

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
				Entry UUID: {uuid}
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
						content={obj.logIndex}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
				>
					<Card
						title="Integrated time"
						content={
							<span>
								<RelativeDate date={new Date(obj.integratedTime * 1000)} />
							</span>
						}
						dividerSx={{
							display: {
								xs: "none",
								sm: "block",
							},
						}}
					/>
				</Grid>
			</Grid>
			<Highlight className="yaml">{dump(body.spec, DUMP_OPTIONS)}</Highlight>
			<Box sx={{ mt: 1 }}>
				<>
					{attestation && (
						<Accordion disableGutters>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="panel2a-content"
								id="panel2a-header"
							>
								<Typography>Attestation</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Highlight className="yaml">{dump(attestation)}</Highlight>
							</AccordionDetails>
						</Accordion>
					)}
					{obj.verification && (
						<Accordion disableGutters>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="panel2a-content"
								id="panel2a-header"
							>
								<Typography>Verification</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Highlight className="yaml">{dump(obj.verification)}</Highlight>
							</AccordionDetails>
						</Accordion>
					)}
				</>
			</Box>
		</Paper>
	);
}
