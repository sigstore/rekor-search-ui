import {
	Button,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useMemo } from "react";
import { Controller, RegisterOptions, useForm } from "react-hook-form";

export interface FormProps {
	onSubmit: (query: FormInputs) => void;
}

const TYPES = ["email", "hash", "commitSha", "uuid", "logIndex"] as const;

export interface FormInputs {
	type: typeof TYPES[number];
	value: string;
}

type Rules = Omit<
	RegisterOptions,
	"valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
>;

const nameByType: Record<FormInputs["type"], string> = {
	email: "Email",
	hash: "Hash",
	commitSha: "Commit SHA",
	uuid: "Entry UUID",
	logIndex: "Log Index",
};
const rulesByType: Record<FormInputs["type"], Rules> = {
	email: {
		pattern: {
			value: /\S+@\S+\.\S+/,
			message: "Entered value does not match the email format: 'S+@S+.S+'",
		},
	},
	hash: {
		pattern: {
			value: /^(sha256:)?[0-9a-fA-F]{64}$|^(sha1:)?[0-9a-fA-F]{40}$/,
			message:
				"Entered value does not match the hash format: '^(sha256:)?[0-9a-fA-F]{64}$|^(sha1:)?[0-9a-fA-F]{40}$'",
		},
	},
	commitSha: {
		pattern: {
			value: /^[0-9a-fA-F]{40}$/,
			message:
				"Entered value does not match the commit SHA format: '^[0-9a-fA-F]{40}$'",
		},
	},
	uuid: {
		pattern: {
			value: /^[0-9a-fA-F]{64}|[0-9a-fA-F]{80}$/,
			message:
				"Entered value does not match the entry UUID format: '^[0-9a-fA-F]{64}|[0-9a-fA-F]{80}$'",
		},
	},
	logIndex: {
		min: {
			value: 0,
			message: "Entered value must be larger than 0",
		},
	},
};

export function RekorSearchForm({ onSubmit }: FormProps) {
	const { handleSubmit, control, watch } = useForm<FormInputs>({
		mode: "all",
		defaultValues: {
			type: "email",
			value: "",
		},
	});

	const watchType = watch("type");

	const rules = Object.assign(
		{
			required: {
				value: true,
				message: "A value is required",
			},
		},
		rulesByType[watchType]
	);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Paper sx={{ p: 2 }}>
				<Grid
					container
					spacing={2}
				>
					<Grid
						item
						xs={4}
						md={2}
					>
						<Controller
							name="type"
							control={control}
							render={({ field }) => (
								<FormControl
									fullWidth
									size="small"
								>
									<InputLabel id="rekor-search-type-label">Field</InputLabel>
									<Select
										labelId="rekor-search-type-label"
										id="rekor-search-type"
										{...field}
										label="Field"
									>
										{TYPES.map(value => (
											<MenuItem
												key={value}
												value={value}
											>
												{nameByType[value]}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={8}
						md={8}
					>
						<Controller
							name="value"
							control={control}
							rules={rules}
							render={({ field, fieldState }) => (
								<TextField
									sx={{ width: 1 }}
									size="small"
									{...field}
									label={nameByType[watchType]}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={2}
					>
						<Button
							type="submit"
							variant="contained"
							fullWidth
						>
							Search
						</Button>
					</Grid>
				</Grid>
			</Paper>
		</form>
	);
}
