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
