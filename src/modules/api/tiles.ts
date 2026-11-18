import { LogEntry } from "rekor";

export function formatTileIndex(tileIndex: number): string {
	let s = tileIndex.toString();
	// Pad to multiple of 3 digits
	while (s.length % 3 !== 0) {
		s = "0" + s;
	}
	const parts = [];
	for (let i = 0; i < s.length; i += 3) {
		parts.push(s.slice(i, i + 3));
	}
	for (let i = 0; i < parts.length - 1; i++) {
		parts[i] = "x" + parts[i];
	}
	return parts.join("/");
}

export async function getRekorTileEntryByIndex(
	baseUrl: string | undefined,
	logIndex: number,
): Promise<LogEntry> {
	if (!baseUrl) {
		throw new Error(
			"A custom override URL is required for the Rekor v2 API. Please configure one in Settings.",
		);
	}
	const base = baseUrl;
	const tileIndex = Math.floor(logIndex / 256);
	const entryIndexInTile = logIndex % 256;

	const tilePath = formatTileIndex(tileIndex);
	let url = `${base}/tile/entries/${tilePath}`;

	// In the C2SP tlog specification, the tail of the log is represented by "partial" tiles.
	// A partial tile is served with a `.p/W` suffix where W is the number of elements in the tile.
	// We always fetch the checkpoint first to find the exact tree size and reconstruct the URL to avoid 404s.
	const cpResponse = await fetch(`${base}/checkpoint`);
	if (!cpResponse.ok) {
		throw new Error(`Failed to fetch checkpoint: ${cpResponse.statusText}`);
	}
	const cpText = await cpResponse.text();
	const lines = cpText.split("\n");
	if (lines.length < 2) {
		throw new Error("Invalid checkpoint format");
	}

	const treeSize = parseInt(lines[1], 10);
	if (logIndex >= treeSize) {
		throw new Error(
			`Log index ${logIndex} is out of bounds (Tree size: ${treeSize})`,
		);
	}

	const fullTilesCount = Math.floor(treeSize / 256);
	if (tileIndex === fullTilesCount) {
		const partialWidth = treeSize % 256;
		if (partialWidth > 0) {
			url = `${base}/tile/entries/${tilePath}.p/${partialWidth}`;
		}
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch rekor-tiles bundle: ${response.statusText} (${response.status}) at ${url}`,
		);
	}

	const buffer = await response.arrayBuffer();
	const dataView = new DataView(buffer);

	let offset = 0;
	for (let i = 0; i <= entryIndexInTile; i++) {
		if (offset >= buffer.byteLength) {
			throw new Error("Entry out of bounds in tile");
		}
		const length = dataView.getUint16(offset, false); // false = big-endian
		offset += 2;

		if (i === entryIndexInTile) {
			const entryBytes = new Uint8Array(buffer, offset, length);
			const entryStr = new TextDecoder().decode(entryBytes);

			// Wrap in a mock LogEntry object to align with Rekor API shape
			// We use a mock UUID since tile API doesn't return UUIDs
			const mockUuid =
				"0000000000000000000000000000000000000000000000000000000000000000";

			return {
				[mockUuid]: {
					body: btoa(entryStr),
					logIndex: logIndex,
					integratedTime: 0, // Fallback to epoch 0 to signify "unsupported"
				},
			} as any;
		}

		offset += length;
	}

	throw new Error("Entry not found in tile");
}
