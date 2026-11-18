import { SubjectAlternativeNameExtension } from "@peculiar/x509";
import { EXTENSIONS_CONFIG } from "./extensions";

describe("EXTENSIONS_CONFIG['2.5.29.17']", () => {
	it("projects SAN GeneralNames into {type, value} entries", () => {
		const built = new SubjectAlternativeNameExtension([
			{
				type: "url",
				value:
					"https://github.com/owner/repo/.github/workflows/build.yml@refs/heads/main",
			},
			{ type: "dns", value: "foo.example" },
		]);

		const out = EXTENSIONS_CONFIG["2.5.29.17"].toJSON({
			rawData: built.rawData,
		} as unknown as Parameters<
			(typeof EXTENSIONS_CONFIG)[string]["toJSON"]
		>[0]);

		expect(out).toEqual([
			{
				type: "url",
				value:
					"https://github.com/owner/repo/.github/workflows/build.yml@refs/heads/main",
			},
			{ type: "dns", value: "foo.example" },
		]);
	});
});
