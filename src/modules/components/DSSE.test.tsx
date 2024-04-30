import atobMock from "../../__mocks__/atobMock";
import decodex509Mock from "../../__mocks__/decodex509Mock";

jest.mock("next/router");

jest.mock("../x509/decode", () => ({
	decodex509: decodex509Mock,
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DSSEViewer } from "./DSSE";
import { DSSEV001Schema } from "rekor";

describe("DSSEViewer Component", () => {
	beforeAll(() => {
		jest.clearAllMocks();
		atobMock();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	const mockDSSE: DSSEV001Schema = {
		payloadHash: {
			algorithm: "sha256",
			value: "exampleHashValue",
		},
		signatures: [
			{
				signature: "exampleSignature",
				verifier:
					"-----BEGIN CERTIFICATE-----\nexamplePublicKey\n-----END CERTIFICATE-----",
			},
		],
	};

	it("renders without crashing", () => {
		render(<DSSEViewer dsse={mockDSSE} />);
		expect(screen.getByText("Hash")).toBeInTheDocument();
	});

	it("displays the payload hash correctly", () => {
		render(<DSSEViewer dsse={mockDSSE} />);
		expect(
			screen.getByText(
				`${mockDSSE.payloadHash?.algorithm}:${mockDSSE.payloadHash?.value}`,
			),
		).toBeInTheDocument();
	});

	it("displays the signature correctly", () => {
		render(<DSSEViewer dsse={mockDSSE} />);
		expect(
			screen.getByText(mockDSSE.signatures![0].signature),
		).toBeInTheDocument();
	});

	it("displays the public key certificate title and content correctly", () => {
		render(<DSSEViewer dsse={mockDSSE} />);
		expect(screen.getByText("Public Key Certificate")).toBeInTheDocument();
	});
});
