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
import {
	Attribute,
	isAttribute,
	RekorEntries,
	SearchQuery,
	useRekorSearch,
} from "../api/rekor_api";
import { Entry } from "./Entry";
import { FormInputs, SearchForm } from "./SearchForm";

function isApiError(error: unknown): error is ApiError {
	return !!error && typeof error === "object" && Object.hasOwn(error, "body");
}

function isRekorError(error: unknown): error is RekorError {
	return !!error && typeof error === "object";
}

function Error({ error }: { error: unknown }) {
	let title = "Unknown error";
	let detail: string | undefined;

	if (isApiError(error)) {
		if (isRekorError(error.body)) {
			title = `Code ${error.body.code}: ${error.body.message}`;
		}
		detail = `${error.url}: ${error.status}`;
	} else if (typeof error == "string") {
		title = error;
	} else if (error instanceof TypeError) {
		title = error.message;
		detail = error.stack;
	}

	return (
		<Alert
			sx={{ mt: 3 }}
			severity="error"
			variant="filled"
		>
			<AlertTitle>{title}</AlertTitle>
			{detail}
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
	const search = useRekorSearch();

	const [data, setData] = useState<RekorEntries>();
	const [error, setError] = useState<unknown>();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetch() {
			if (!query) {
				return;
			}
			setError(undefined);
			setLoading(true);
			try {
				setData(await search(query));
			} catch (e) {
				setError(e);
			}
			setLoading(false);
		}
		fetch();
	}, [query, search]);

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
				{ shallow: true },
			);
		},
		[router],
	);

	useEffect(() => {
		const attribute = Object.keys(router.query).find(key =>
			isAttribute(key),
		) as Attribute | undefined;
		const value = attribute && router.query[attribute];

		if (!value || Array.isArray(value)) {
			return;
		}
		setFormInputs({ attribute, value });
	}, [router.query]);

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
		<Box>
			<SearchForm
				defaultValues={formInputs}
				isLoading={loading}
				onSubmit={setQueryParams}
			/>

			{error ? (
				<Error error={error} />
			) : loading ? (
				<LoadingIndicator />
			) : (
				<RekorList rekorEntries={data} />
			)}
		</Box>
	);
}
