import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { bind, Subscribe } from "@react-rxjs/core";
import { createSignal, suspend } from "@react-rxjs/utils";
import { useRouter } from "next/router";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import {
	skip,
	startWith,
	switchMap,
	takeUntil,
	throttleTime,
} from "rxjs/operators";
import {
	Attribute,
	isAttribute,
	rekorRetrieve,
	SearchQuery,
} from "../api/rekor_api";
import { useDestroyed$ } from "../utils/rxjs";
import { Entry } from "./Entry";
import { FormInputs, SearchForm } from "./SearchForm";

const [queryChange$, setQuery] = createSignal<SearchQuery>();

const [useRekorIndexList, rekorIndexList$] = bind(
	queryChange$.pipe(
		throttleTime(200),
		switchMap(query => suspend(rekorRetrieve(query))),
		startWith(undefined)
	)
);

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	rekorIndexList$
		.pipe(
			// A value will always be returned on subscribe. Wait for a new search to take
			// place before resetting the error.
			skip(1),
			takeUntil(useDestroyed$())
		)
		.subscribe(resetErrorBoundary);

	return (
		<Alert
			sx={{ mt: 3 }}
			severity="error"
			variant="filled"
		>
			{error?.message}
		</Alert>
	);
}

function RekorList() {
	const rekorEntries = useRekorIndexList();

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
		<div>
			<SearchForm
				defaultValues={formInputs}
				onSubmit={setQueryParams}
			/>

			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<Suspense fallback={<LoadingIndicator />}>
					<Subscribe source$={rekorIndexList$}>
						<RekorList></RekorList>
					</Subscribe>
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}
