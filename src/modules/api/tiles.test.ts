import { formatTileIndex, getRekorTileEntryByIndex } from "./tiles";

describe("tiles API", () => {
	it("formatTileIndex correctly formats indexes", () => {
		expect(formatTileIndex(0)).toBe("000");
		expect(formatTileIndex(1)).toBe("001");
		expect(formatTileIndex(256)).toBe("256");
		expect(formatTileIndex(1000)).toBe("x001/000");
		expect(formatTileIndex(1234067)).toBe("x001/x234/067");
	});

	it("getRekorTileEntryByIndex fetches and parses entry correctly", async () => {
		// Mock fetch to return a binary bundle.
		// Tile index 0 contains 2 mock entries for testing.
		// Entry 0: length 4 (0x0004), data: "abcd"
		// Entry 1: length 5 (0x0005), data: "efghi"

		const buffer = new ArrayBuffer(2 + 4 + 2 + 5);
		const dataView = new DataView(buffer);

		let offset = 0;
		// Entry 0
		dataView.setUint16(offset, 4, false); // length
		offset += 2;
		const entry1 = "abcd";
		for (let i = 0; i < entry1.length; i++) {
			dataView.setUint8(offset++, entry1.charCodeAt(i));
		}

		// Entry 1
		dataView.setUint16(offset, 5, false); // length
		offset += 2;
		const entry2 = "efghi";
		for (let i = 0; i < entry2.length; i++) {
			dataView.setUint8(offset++, entry2.charCodeAt(i));
		}

		// Mock fetch
		global.fetch = jest.fn((url: string) => {
			if (url.endsWith("/checkpoint")) {
				return Promise.resolve({
					ok: true,
					text: () =>
						Promise.resolve("example.com/log\n1000\nrootHashRawBase64"),
				});
			} else {
				return Promise.resolve({
					ok: true,
					arrayBuffer: () => Promise.resolve(buffer),
				});
			}
		}) as jest.Mock;

		// Fetch logIndex = 1 (which falls into tile 0, entry index 1)
		const logEntry = await getRekorTileEntryByIndex("http://example.com", 1);

		const firstKey = Object.keys(logEntry)[0];
		expect(logEntry[firstKey].body).toBe(btoa("efghi"));
		expect(logEntry[firstKey].integratedTime).toBe(0);
		expect(logEntry[firstKey].logIndex).toBe(1);

		expect(global.fetch).toHaveBeenCalledWith("http://example.com/checkpoint");
		expect(global.fetch).toHaveBeenCalledWith(
			"http://example.com/tile/entries/000",
		);
	});
});
