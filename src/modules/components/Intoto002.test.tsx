import atobMock from "../../__mocks__/atobMock";
import decodex509Mock from "../../__mocks__/decodex509Mock";

import { render, screen } from "@testing-library/react";
import { IntotoViewer002 } from "./Intoto002";
import { IntotoV002Schema } from "rekor";

const pemCertificate = `-----BEGIN CERTIFICATE-----\n${Buffer.from(
	"Mocked Public Key",
).toString("base64")}\n-----END CERTIFICATE-----`;

jest.mock("../x509/decode", () => ({
	decodex509: decodex509Mock,
}));

describe("IntotoViewer", () => {
	beforeAll(() => {
		atobMock();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	const mockIntoto: IntotoV002Schema = {
		content: {
			envelope: {
				payloadType: "application/vnd.in-toto+json",
				signatures: [
					{
						publicKey: pemCertificate,
						sig: Buffer.from("signature content", "utf-8").toString("base64"),
					},
				],
			},
			payloadHash: {
				algorithm: "sha256",
				value: "hashValue",
			},
		},
	};

	it("renders the component with payload hash, signature, and certificate", () => {
		render(<IntotoViewer002 intoto={mockIntoto} />);

		// verify the hash link is rendered correctly
		expect(screen.getByText("Hash")).toBeInTheDocument();
		expect(screen.getByText("sha256:hashValue")).toBeInTheDocument();

		// verify the signature is rendered & decoded
		expect(screen.getByText("signature content")).toBeInTheDocument();
		expect(screen.getByText(/BEGIN CERTIFICATE/)).toBeInTheDocument();
	});
});
