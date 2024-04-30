import atobMock from "../../__mocks__/atobMock";
import decodex509Mock from "../../__mocks__/decodex509Mock";

import { render, screen } from "@testing-library/react";
import { IntotoViewer001 } from "./Intoto001";

const pemCertificate = `-----BEGIN CERTIFICATE-----\n${Buffer.from(
	"Mocked Public Key",
).toString("base64")}\n-----END CERTIFICATE-----`;

jest.mock("../x509/decode", () => ({
	decodex509: decodex509Mock,
}));

describe("IntotoViewer001", () => {
	beforeAll(() => {
		atobMock();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it("should render the payload hash and provide a link to the hash page", () => {
		const intoto = {
			content: {
				payloadHash: {
					algorithm: "sha256",
					value: "abc123",
				},
			},
			publicKey: "123",
		};

		// @ts-ignore
		render(<IntotoViewer001 intoto={intoto} />);

		const hashLink = screen.getByText("Hash");
		expect(hashLink).toBeInTheDocument();

		const hashValue = screen.getByText("sha256:abc123");
		expect(hashValue).toBeInTheDocument();
	});
});
