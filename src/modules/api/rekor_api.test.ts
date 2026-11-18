import { renderHook } from "@testing-library/react";
import { useRekorSearch } from "./rekor_api";
import { useRekorBaseUrl, useRekorClient, useRekorV2API } from "./context";

jest.mock("./context", () => ({
	useRekorClient: jest.fn(),
	useRekorBaseUrl: jest.fn(),
	useRekorV2API: jest.fn(),
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
		(useRekorBaseUrl as jest.Mock).mockReturnValue([
			"http://localhost",
			jest.fn(),
		]);
		(useRekorV2API as jest.Mock).mockReturnValue([false, jest.fn()]);

		const { result } = renderHook(() => useRekorSearch());

		await result.current({ attribute: "logIndex", query: 123 });

		expect(mockGetLogEntryByIndex).toHaveBeenCalledWith({ logIndex: 123 });
	});
});
