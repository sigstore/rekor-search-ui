import {
	Alert,
	AlertTitle,
	Box,
	CircularProgress,
	Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { ApiError, RekorError } from "rekor";
import useSWR from "swr";
import {
	Attribute,
	isAttribute,
	RekorEntries,
	search,
	SearchQuery,
} from "../api/rekor_api";
import { Entry } from "./Entry";
import { FormInputs, SearchForm } from "./SearchForm";

function Error({ error }: { error: ApiError }) {
	const { code, message } = error.body as RekorError;

	return (
		<Alert
			sx={{ mt: 3 }}
			severity="error"
			variant="filled"
		>
			<AlertTitle>
				{code && <>Code {code}: </>} {message}
			</AlertTitle>
			{error.url} {error.status}
		</Alert>
	);
}

function RekorList({ rekorEntries }: { rekorEntries?: RekorEntries }) {
	if (!rekorEntries) {
		return <></>;
	}

	if (rekorEntries.entries.length === 0) {
		return (
			<Alert
				sx={{ mt: 3 }}
				severity="info"
				variant="filled"
			>
				No matching entries found
			</Alert>
		);
	}

	return (
		<>
			<Typography sx={{ my: 2 }}>
				Showing {rekorEntries.entries.length} of {rekorEntries?.totalCount}
			</Typography>

			{rekorEntries.entries.map(entry => (
				<Entry
					key={Object.values(entry)[0].logIndex}
					entry={entry}
				/>
			))}
		</>
	);
}

function LoadingIndicator() {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				flexDirection: "column",
				marginTop: 4,
			}}
		>
			<CircularProgress />
		</Box>
	);
}

export function Explorer() {
	const router = useRouter();
	const [formInputs, setFormInputs] = useState<FormInputs>();
	const [query, setQuery] = useState<SearchQuery>();
	const { data, error, isValidating, mutate } = useSWR<RekorEntries, ApiError>(
		query,
		search,
		{
			revalidateOnFocus: false,
			shouldRetryOnError: false,
			refreshWhenHidden: false,
		}
	);

	const setQueryParams = useCallback(
		(formInputs: FormInputs) => {
			router.push(
				{
					pathname: router.pathname,
					query: {
						[formInputs.attribute]: formInputs.value,
					},
				},
				`/?${formInputs.attribute}=${formInputs.value}`,
				{ shallow: true }
			);
		},
		[router]
	);

	useEffect(() => {
		const attribute = Object.keys(router.query).find(key =>
			isAttribute(key)
		) as Attribute | undefined;
		const value = attribute && router.query[attribute];

		if (!value || Array.isArray(value)) {
			return;
		}
		setFormInputs({ attribute, value });
		mutate();
	}, [router.query, mutate]);

	useEffect(() => {
		if (formInputs) {
			switch (formInputs.attribute) {
				case "logIndex":
					const query = parseInt(formInputs.value);
					if (!isNaN(query)) {
						// Ignore invalid numbers.
						setQuery({
							attribute: formInputs.attribute,
							query,
						});
					}
					break;
				default:
					setQuery({
						attribute: formInputs.attribute,
						query: formInputs.value,
					});
			}
		}
	}, [formInputs]);

	return (
		<div>
			<SearchForm
				defaultValues={formInputs}
				isLoading={isValidating}
				onSubmit={setQueryParams}
			/>

			{error && <Error error={error} />}

			{isValidating ? <LoadingIndicator /> : <RekorList rekorEntries={data} />}
		</div>
	);
}
