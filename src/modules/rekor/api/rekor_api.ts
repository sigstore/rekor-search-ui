import { combineLatest, from, Observable, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { map, switchMap } from "rxjs/operators";

export interface RekorIndexQuery {
	email?: string;
	hash?: string;
	commitSha?: string;
	uuid?: string;
	logIndex?: string;
}

export interface RekorEntry {
	key: string;
	content: unknown;
}

export interface RekorEntries {
	totalCount: number;
	entries: RekorEntry[];
}

function retrieveIndex(query: RekorIndexQuery): Observable<string[]> {
	return fromFetch("https://rekor.sigstore.dev/api/v1/index/retrieve", {
		method: "POST",
		body: JSON.stringify(query),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		selector: response => response.json(),
	}).pipe(
		map(response => {
			if (response.code) {
				throw new Error(`Failed to retrieve index: ${response.message}`);
			}
			return response;
		})
	);
}

function retrieveEntries(entryUUID?: string, logIndex?: string) {
	return fromFetch(
		`https://rekor.sigstore.dev/api/v1/log/entries${
			entryUUID ? "/" + entryUUID : ""
		}?logIndex=${logIndex ?? ""}`,
		{
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			selector: response => response.json(),
		}
	).pipe(
		map(response => {
			if (response.code) {
				throw new Error(`Failed to retrieve entries: ${response.message}`);
			}
			return response;
		})
	);
}

async function digestMessage(message: string) {
	const msgUint8 = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function buildIndexQuery(query: RekorIndexQuery) {
	return {
		hash:
			query.hash ?? (query.commitSha && (await digestMessage(query.commitSha))),
		email: query.email,
	};
}

export function rekorRetrieve(
	query: RekorIndexQuery
): Observable<RekorEntries> {
	if (query.uuid || query.logIndex) {
		return retrieveEntries(query.uuid, query.logIndex).pipe(
			map(result => {
				const [key, value] = Object.entries(result)[0];
				return {
					totalCount: 1,
					entries: [
						{
							key,
							content: value,
						},
					],
				};
			})
		);
	}

	return from(buildIndexQuery(query)).pipe(
		map(query => {
			if ((query.hash?.length ?? 0) > 0) {
				if (!query.hash?.startsWith("sha256:")) {
					query.hash = `sha256:${query.hash}`;
				}
			}
			return query;
		}),
		switchMap(params => retrieveIndex(params)),
		map((logIndexes: string[]) => ({
			totalCount: logIndexes.length,
			indexes: logIndexes.slice(0, 20),
		})),
		switchMap(log => {
			if (log.indexes.length) {
				return combineLatest(
					log.indexes.map(logIndex => retrieveEntries(logIndex))
				).pipe(
					map(results => {
						return {
							totalCount: log.totalCount,
							entries: results.map(result => {
								const [key, value] = Object.entries(result)[0];
								return {
									key,
									content: value,
								};
							}),
						};
					})
				);
			}
			return of({ totalCount: 0, entries: [] });
		})
	);
}
