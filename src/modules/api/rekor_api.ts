import {
	EntriesService,
	Error,
	IndexService,
	LogEntry,
	SearchIndex,
} from "rekor";
import { combineLatest, from, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

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

export type SearchQuery =
	| {
			attribute: "email" | "hash" | "commitSha" | "uuid";
			query: string;
	  }
	| {
			attribute: "logIndex";
			query: number;
	  };

export interface RekorEntries {
	totalCount: number;
	entries: LogEntry[];
}

function isError<T extends {}>(response: T | Error): response is Error {
	const error = response as Error;
	return !!error.code || !!error.message;
}

function retrieveIndex(query: SearchIndex): Observable<string[]> {
	return from(IndexService.searchIndex({ query })).pipe(
		map(response => {
			if (isError(response)) {
				throw response;
			}
			return response;
		})
	);
}

function retrieveEntryByIndex(logIndex: number): Observable<LogEntry> {
	return from(EntriesService.getLogEntryByIndex({ logIndex })).pipe(
		map(response => {
			if (isError(response)) {
				throw response;
			}
			return response;
		})
	);
}

function retrieveEntryByUUID(entryUuid: string): Observable<LogEntry> {
	return from(EntriesService.getLogEntryByUuid({ entryUuid })).pipe(
		map(response => {
			if (isError(response)) {
				throw response;
			}
			return response;
		})
	);
}

function retrieveEntriesFromIndex(
	query: SearchIndex
): Observable<RekorEntries> {
	return retrieveIndex(query).pipe(
		map((logIndexes: string[]) => ({
			totalCount: logIndexes.length,
			indexes: logIndexes.slice(0, 20),
		})),
		switchMap(log => {
			if (log.indexes.length) {
				return combineLatest(
					log.indexes.map(logIndex => retrieveEntryByUUID(logIndex))
				).pipe(
					map(entries => ({
						totalCount: log.totalCount,
						entries,
					}))
				);
			}
			return of({ totalCount: 0, entries: [] });
		})
	);
}

async function digestMessage(message: string): Promise<string> {
	const msgUint8 = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	return `sha256:${hash}`;
}

export function rekorRetrieve(search: SearchQuery): Observable<RekorEntries> {
	switch (search.attribute) {
		case "logIndex":
			return retrieveEntryByIndex(search.query).pipe(
				map(entry => ({
					totalCount: 1,
					entries: [entry],
				}))
			);
		case "uuid":
			return retrieveEntryByUUID(search.query).pipe(
				map(entry => ({
					totalCount: 1,
					entries: [entry],
				}))
			);
		case "email":
			return retrieveEntriesFromIndex({
				email: search.query,
			});
		case "hash":
			let query = search.query;
			if (!query.startsWith("sha256:")) {
				query = `sha256:${query}`;
			}
			return retrieveEntriesFromIndex({
				hash: query,
			});
		case "commitSha":
			return from(digestMessage(search.query)).pipe(
				switchMap(hash => retrieveEntriesFromIndex({ hash }))
			);
	}
}
