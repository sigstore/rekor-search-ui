import { renderHook } from "@testing-library/react";
import { useRekorSearch } from "./rekor_api";
import { useRekorClient } from "./context";

jest.mock("./context", () => ({
	useRekorClient: jest.fn(),
}));

Object.defineProperty(global.self, "crypto", {
	value: {
		subtle: {
			digest: jest.fn().mockImplementation(async () => {
				const hashBuffer = new ArrayBuffer(32);
				const hashArray = new Uint8Array(hashBuffer);
				hashArray.fill(0);
				return hashBuffer;
			}),
		},
	},
});

describe("useRekorSearch", () => {
	it("searches by logIndex", async () => {
		const mockGetLogEntryByIndex = jest.fn().mockResolvedValue(0);

		(useRekorClient as jest.Mock).mockReturnValue({
			entries: { getLogEntryByIndex: mockGetLogEntryByIndex },
		});

		const { result } = renderHook(() => useRekorSearch());

		await result.current({ attribute: "logIndex", query: 123 });

		expect(mockGetLogEntryByIndex).toHaveBeenCalledWith({ logIndex: 123 });
	});

	it("searches by subject (SAN URI)", async () => {
		const mockSearchIndex = jest.fn().mockResolvedValue([]);

		(useRekorClient as jest.Mock).mockReturnValue({
			index: { searchIndex: mockSearchIndex },
			entries: { getLogEntryByUuid: jest.fn() },
		});

		const { result } = renderHook(() => useRekorSearch());

		const sanURI =
			"https://github.com/owner/repo/.github/workflows/build.yml@refs/heads/main";
		await result.current({ attribute: "subject", query: sanURI });

		expect(mockSearchIndex).toHaveBeenCalledWith({
			query: { subject: sanURI },
		});
	});
});
