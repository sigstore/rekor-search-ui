import { decodex509 } from "./decode";
import { X509Certificate } from "@peculiar/x509";
import { toRelativeDateString } from "../utils/date";
import { EXTENSIONS_CONFIG } from "./extensions";

jest.mock("@peculiar/x509", () => ({
	X509Certificate: jest.fn(),
}));

jest.mock("../utils/date", () => ({
	toRelativeDateString: jest.fn(),
}));

jest.mock("./extensions", () => ({
	EXTENSIONS_CONFIG: {
		"1.2.3.4.5": {
			name: "Mock Extension",
			toJSON: jest.fn().mockReturnValue({ mockKey: "mockValue" }),
		},
	},
}));

describe("decodex509", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(toRelativeDateString as jest.Mock).mockImplementation(
			date => `Relative date for ${date}`,
		);
		(X509Certificate as unknown as jest.Mock).mockImplementation(() => ({
			serialNumber: "123456",
			issuer: "Issuer Name",
			notBefore: new Date("2020-01-01"),
			notAfter: new Date("2022-01-01"),
			publicKey: {
				algorithm: "rsaEncryption",
			},
			subjectName: "Subject Name",
			extensions: [
				{
					type: "1.2.3.4.5",
					critical: false,
					value: new ArrayBuffer(8),
				},
			],
		}));
	});

	it("should decode a raw X.509 certificate", () => {
		const rawCertificate = "rawCertificateString";
		const decoded = decodex509(rawCertificate);
		expect(decoded).toBeDefined();
		expect(decoded.Signature.Issuer).toBe("Issuer Name");
	});

	// simulate an extension not found
	// @ts-ignore
	EXTENSIONS_CONFIG["unknownExtensionType"] = undefined;

	it("converts ArrayBuffer to hex string for unknown extension types", () => {
		(X509Certificate as unknown as jest.Mock).mockImplementation(() => ({
			// mock certificate fields as above, adjusting for this specific test
			serialNumber: "654321",
			issuer: "New Issuer",
			notBefore: new Date("2021-01-01"),
			notAfter: new Date("2023-01-01"),
			publicKey: {
				algorithm: "ecdsa",
			},
			subjectName: "New Subject",
			extensions: [
				{
					type: "unknownExtensionType",
					critical: true,
					value: new Uint8Array([1, 2, 3, 4]).buffer, // tests bufferToHex
				},
			],
		}));

		const rawCertificate = "anotherRawCertificateString";
		const decoded = decodex509(rawCertificate);

		// asserts the hex string format of the ArrayBuffer
		expect(
			decoded["X509v3 extensions"]["unknownExtensionType (critical)"],
		).toBe("01:02:03:04");
	});
});
