import { Button, Divider, Grid, TextField, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { Controller, useForm } from "react-hook-form";

export interface FormProps {
	onSubmit: (query: { email: string; hash: string }) => void;
}

interface FormInputs {
	email: string;
	hash: string;
	commitHash: string;
	logIndex: string;
	entryUUID: string;
}

export function RekorSearchForm({ onSubmit }: FormProps) {
	const { handleSubmit, control } = useForm<FormInputs>();

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Paper sx={{ p: 2 }}>
				<Grid
					container
					spacing={2}
				>
					<Grid
						item
						xs={12}
						md={6}
					>
						<Controller
							name="email"
							control={control}
							rules={{
								pattern: {
									value: /\S+@\S+\.\S+/,
									message: "Entered value does not match email format",
								},
							}}
							render={({ field, fieldState }) => (
								<TextField
									sx={{ width: 1 }}
									size="small"
									{...field}
									label="Email"
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<Controller
							name="hash"
							control={control}
							rules={{
								pattern: {
									value:
										/^(sha256:)?[0-9a-fA-F]{64}$|^(sha1:)?[0-9a-fA-F]{40}$/,
									message: "Entered value does not match hash format",
								},
							}}
							render={({ field, fieldState }) => (
								<TextField
									sx={{ width: 1 }}
									size="small"
									{...field}
									label="Hash"
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<Controller
							name="commitHash"
							control={control}
							rules={{
								pattern: {
									value: /^(sha1:)?[0-9a-fA-F]{40}$/,
									message: "Entered value does not match hash format",
								},
							}}
							render={({ field, fieldState }) => (
								<TextField
									sx={{ width: 1 }}
									size="small"
									{...field}
									label="Commit hash"
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<Controller
							name="entryUUID"
							control={control}
							rules={{
								pattern: {
									value: /^[0-9a-fA-F]{64}|[0-9a-fA-F]{80}$/,
									message: "Entered value does not match entryUUID format",
								},
							}}
							render={({ field, fieldState }) => (
								<TextField
									sx={{ width: 1 }}
									size="small"
									{...field}
									label="Entry UUID"
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<Controller
							name="logIndex"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									sx={{ width: 1 }}
									size="small"
									{...field}
									label="Log index"
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
					<Grid
						item
						xs={12}
					>
						<Button
							type="submit"
							variant="contained"
						>
							Search
						</Button>
					</Grid>
				</Grid>
			</Paper>
		</form>
	);
}
