jest.mock("next/router");
jest.mock("react-syntax-highlighter/dist/cjs/styles/prism");

import decodex509Mock from "../../__mocks__/decodex509Mock";

jest.mock("../x509/decode", () => ({
	decodex509: decodex509Mock,
}));

import { HashedRekordViewer } from "./HashedRekord";
import { render, screen } from "@testing-library/react";
import { HashedRekorV001Schema } from "rekor";

describe("HashedRekordViewer", () => {
	it("renders the component with a public key", () => {
		const mockedRekord: HashedRekorV001Schema = {
			data: {
				hash: {
					algorithm: "sha256",
					value: "mockedHashValue",
				},
			},
			signature: {
				content: "mockedSignatureContent",
				publicKey: {
					content: window.btoa("mockedPublicKeyContent"), // base64 encode
				},
			},
		};

		render(<HashedRekordViewer hashedRekord={mockedRekord} />);

		expect(screen.getByText("Hash")).toBeInTheDocument();
		expect(screen.getByText("sha256:mockedHashValue")).toBeInTheDocument();
		expect(screen.getByText("mockedSignatureContent")).toBeInTheDocument();
		expect(screen.getByText("mockedPublicKeyContent")).toBeInTheDocument();
	});

	it("renders the component with a public key certificate", () => {
		const mockedRekordWithCert = {
			// simulate a certificate
			data: {},
			signature: {
				publicKey: {
					content: window.btoa(
						"-----BEGIN CERTIFICATE-----certContent-----END CERTIFICATE-----",
					), // base64 encode
				},
			},
		};

		render(<HashedRekordViewer hashedRekord={mockedRekordWithCert} />);

		expect(
			screen.getByText(
				/'-----BEGIN CERTIFICATE-----Mocked Certificate-----END CERTIFICATE-----'/,
			),
		).toBeInTheDocument();
	});
});

import { HashedRekordV002Viewer } from "./HashedRekord";

describe("HashedRekordV002Viewer", () => {
	it("renders the component bridging a full oneOf snake_case spec payload", () => {
		const fakeHex = "a".repeat(64);
		const mockedV002SnakeCase = {
			hashed_rekord_v002: {
				data: {
					hash: {
						algorithm: "sha256",
						value: fakeHex,
					},
				},
				signature: {
					content: "mockedV002SignatureContent",
					verifier: {
						public_key: {
							raw_bytes: window.btoa("mockedV002PublicKeyBytes"),
						},
					},
				},
			},
		};

		render(<HashedRekordV002Viewer hashedRekord={mockedV002SnakeCase} />);

		expect(screen.getByText("Hash")).toBeInTheDocument();
		expect(screen.getByText(`sha256:${fakeHex}`)).toBeInTheDocument();
		expect(screen.getByText("mockedV002SignatureContent")).toBeInTheDocument();
		expect(screen.getByText("Public Key")).toBeInTheDocument();
		expect(
			screen.getByText(/bW9ja2VkVjAwMlB1YmxpY0tleUJ5dGVz/),
		).toBeInTheDocument(); // raw base64 rendered within BEGIN/END PUBLIC KEY tags
	});

	it("renders the component with a generated valid PEM wrapping for raw binary certificates", () => {
		const mockedFlatCert = {
			data: {
				digest: window.btoa("hexValueDigestRaw"),
			},
			signature: {
				content: "flatSigContent",
			},
			verifier: {
				x509Certificate: {
					rawBytes: window.btoa("derBinaryBytes"),
				},
			},
		};

		render(<HashedRekordV002Viewer hashedRekord={mockedFlatCert} />);

		// Verify digest parses correctly
		expect(screen.getByText("flatSigContent")).toBeInTheDocument();

		// Ensure it hits our decoding logic branch mocked out in decodex509Mock
		// (which by default injects the phrase 'Mocked Certificate' into the dumped JSON strings in the test)
		expect(
			screen.getByText(
				/'-----BEGIN CERTIFICATE-----Mocked Certificate-----END CERTIFICATE-----'/,
			),
		).toBeInTheDocument();
		expect(screen.getByText("Public Key Certificate")).toBeInTheDocument();
	});
});
