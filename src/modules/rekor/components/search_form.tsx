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
import { useEffect } from "react";
import { Controller, RegisterOptions, useForm } from "react-hook-form";

export interface FormProps {
	defaultValues?: FormInputs;
	onSubmit: (query: FormInputs) => void;
}

export const ATTRIBUTES = [
	"email",
	"hash",
	"commitSha",
	"uuid",
	"logIndex",
] as const;
const ATTRIBUTES_SET = new Set<string>(ATTRIBUTES);

export type Attribute = typeof ATTRIBUTES[number];

export function isAttribute(input: string): input is Attribute {
	return ATTRIBUTES_SET.has(input);
}

export interface FormInputs {
	attribute: Attribute;
	value: string;
}

type Rules = Omit<
	RegisterOptions,
	"valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
>;

const nameByAttribute: Record<FormInputs["attribute"], string> = {
	email: "Email",
	hash: "Hash",
	commitSha: "Commit SHA",
	uuid: "Entry UUID",
	logIndex: "Log Index",
};
const rulesByAttribute: Record<FormInputs["attribute"], Rules> = {
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

export function RekorSearchForm({ defaultValues, onSubmit }: FormProps) {
	const { handleSubmit, control, watch, setValue } = useForm<FormInputs>({
		mode: "all",
		defaultValues: {
			attribute: "email",
			value: "",
		},
	});

	useEffect(() => {
		if (defaultValues) {
			setValue("attribute", defaultValues.attribute);
			setValue("value", defaultValues.value);
		}
	}, [defaultValues, setValue]);

	const watchAttribute = watch("attribute");

	const rules = Object.assign(
		{
			required: {
				value: true,
				message: "A value is required",
			},
		},
		rulesByAttribute[watchAttribute]
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
							name="attribute"
							control={control}
							render={({ field }) => (
								<FormControl
									fullWidth
									size="small"
								>
									<InputLabel id="rekor-search-type-label">
										Attribute
									</InputLabel>
									<Select
										labelId="rekor-search-type-label"
										id="rekor-search-type"
										{...field}
										label="Attribute"
									>
										{ATTRIBUTES.map(attribute => (
											<MenuItem
												key={attribute}
												value={attribute}
											>
												{nameByAttribute[attribute]}
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
									label={nameByAttribute[watchAttribute]}
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
