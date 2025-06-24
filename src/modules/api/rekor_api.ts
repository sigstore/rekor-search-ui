import { useCallback } from "react";
import { LogEntry, RekorClient, SearchIndex } from "rekor";
import { useRekorClient } from "./context";

const PAGE_SIZE = 20;

export const ATTRIBUTES = [
	"email",
	"hash",
	"commitSha",
	"uuid",
	"logIndex",
] as const;
const ATTRIBUTES_SET = new Set<string>(ATTRIBUTES);

export type Attribute = (typeof ATTRIBUTES)[number];

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

export function useRekorSearch() {
	const client = useRekorClient();

	return useCallback(
		async (search: SearchQuery, page: number = 1): Promise<RekorEntries> => {
			switch (search.attribute) {
				case "logIndex":
					return {
						totalCount: 1,
						entries: [
							await client.entries.getLogEntryByIndex({
								logIndex: search.query,
							}),
						],
					};
				case "uuid":
					return {
						totalCount: 1,
						entries: [
							await client.entries.getLogEntryByUuid({
								entryUuid: search.query,
							}),
						],
					};
				case "email":
					return queryEntries(client, {
						email: search.query,
					}, page);
				case "hash":
					let query = search.query;
					if (!query.startsWith("sha256:")) {
						query = `sha256:${query}`;
					}
					return queryEntries(client, {
						hash: query,
					}, page);
				case "commitSha":
					const hash = await digestMessage(search.query);
					return queryEntries(client, { hash }, page);
			}
		},
		[client],
	);
}

async function queryEntries(
	client: RekorClient,
	query: SearchIndex,
	page: number,
): Promise<RekorEntries> {
	const logIndexes = await client.index.searchIndex({ query });

	// Preventing entries from jumping between pages on refresh
	logIndexes.sort();

	const startIndex = (page - 1) * PAGE_SIZE;
	const endIndex = startIndex + PAGE_SIZE;
	const uuidToRetrieve = logIndexes.slice(startIndex, endIndex);

	const entries = await Promise.all(
		uuidToRetrieve.map(entryUuid =>
			client.entries.getLogEntryByUuid({ entryUuid }),
		),
	);
	return {
		totalCount: logIndexes.length,
		entries,
	};
}

async function digestMessage(message: string): Promise<string> {
	const msgUint8 = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	return `sha256:${hash}`;
}
