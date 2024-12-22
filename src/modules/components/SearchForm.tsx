import LoadingButton from "@mui/lab/LoadingButton";
import {
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { ReactNode, useEffect } from "react";
import { Controller, RegisterOptions, useForm } from "react-hook-form";
import { Attribute, ATTRIBUTES } from "../api/rekor_api";

export interface FormProps {
	defaultValues?: FormInputs;
	isLoading: boolean;
	onSubmit: (query: FormInputs) => void;
}

export interface FormInputs {
	attribute: Attribute;
	value: string;
}

type Rules = Omit<
	RegisterOptions,
	"valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
>;

interface InputConfig {
	name: string;
	helperText?: ReactNode;
	rules: Rules;
}

const inputConfigByAttribute: Record<FormInputs["attribute"], InputConfig> = {
	email: {
		name: "Email",
		rules: {
			pattern: {
				value: /\S+@\S+\.\S+/,
				message: "Entered value does not match the email format: 'S+@S+.S+'",
			},
		},
	},
	hash: {
		name: "Hash",
		rules: {
			pattern: {
				value: /^(sha256:)?[0-9a-fA-F]{64}$|^(sha1:)?[0-9a-fA-F]{40}$/,
				message:
					"Entered value does not match the hash format: '^(sha256:)?[0-9a-fA-F]{64}$|^(sha1:)?[0-9a-fA-F]{40}$'",
			},
		},
	},
	commitSha: {
		name: "Commit SHA",
		helperText: (
			<>
				Only compatible with{" "}
				<a
					href="https://github.com/sigstore/gitsign"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						textDecoration: "underline",
					}}
				>
					sigstore/gitsign
				</a>{" "}
				entries
			</>
		),
		rules: {
			pattern: {
				value: /^[0-9a-fA-F]{40}$/,
				message:
					"Entered value does not match the commit SHA format: '^[0-9a-fA-F]{40}$'",
			},
		},
	},
	uuid: {
		name: "Entry UUID",
		rules: {
			pattern: {
				value: /^[0-9a-fA-F]{64}|[0-9a-fA-F]{80}$/,
				message:
					"Entered value does not match the entry UUID format: '^[0-9a-fA-F]{64}|[0-9a-fA-F]{80}$'",
			},
		},
	},
	logIndex: {
		name: "Log Index",
		rules: {
			min: {
				value: 0,
				message: "Entered value must be larger than 0",
			},
			pattern: {
				value: /^\d+$/,
				message: "Entered value must be of type int64",
			},
		},
	},
};

export function SearchForm({ defaultValues, onSubmit, isLoading }: FormProps) {
	const { handleSubmit, control, watch, setValue, trigger } =
		useForm<FormInputs>({
			mode: "all",
			reValidateMode: "onChange",
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

	useEffect(() => {
		if (control.getFieldState("attribute").isTouched) {
			trigger();
		}
	}, [watchAttribute, trigger, control]);

	const rules = Object.assign(
		{
			required: {
				value: true,
				message: "A value is required",
			},
			pattern: undefined,
			min: undefined,
			deps: undefined,
		},
		inputConfigByAttribute[watchAttribute].rules,
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
												{inputConfigByAttribute[attribute].name}
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
						md={6}
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
									label={inputConfigByAttribute[watchAttribute].name}
									error={!!fieldState.error}
									helperText={
										fieldState.error?.message ||
										inputConfigByAttribute[watchAttribute].helperText
									}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={2}
					>
						<LoadingButton
							loading={isLoading}
							type="submit"
							variant="contained"
							fullWidth
						>
							Search
						</LoadingButton>
					</Grid>
				</Grid>
			</Paper>
		</form>
	);
}
