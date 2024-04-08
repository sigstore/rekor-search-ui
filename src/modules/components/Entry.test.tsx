jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({}));
jest.mock("../utils/date", () => ({
	toRelativeDateString: jest.fn().mockReturnValue("Some Date"),
}));
jest.mock("./HashedRekord", () => ({
	HashedRekordViewer: () => <div>MockedHashedRekordViewer</div>,
}));

import atobMock from "../../__mocks__/atobMock";

import { fireEvent, render, screen } from "@testing-library/react";
import { Entry, Card } from "./Entry";

describe("Entry", () => {
	beforeAll(() => {
		atobMock();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	const mockEntry = {
		someUuid: {
			body: Buffer.from(
				JSON.stringify({ kind: "hashedrekord", apiVersion: "v1", spec: {} }),
			).toString("base64"),
			attestation: { data: Buffer.from("{}").toString("base64") },
			logID: "123",
			logIndex: 123,
			integratedTime: 1618886400,
			publicKey: "mockedPublicKey",
			signature: {
				publicKey: {
					content: window.btoa(
						"-----BEGIN CERTIFICATE-----certContent-----END CERTIFICATE-----",
					), // base64 encode
				},
			},
		},
	};

	it("renders and toggles the accordion content", () => {
		render(<Entry entry={mockEntry} />);

		expect(screen.getByText("apiVersion")).not.toBeVisible();

		// check if UUID link is rendered
		expect(screen.getByText("someUuid")).toBeInTheDocument();

		// simulate clicking the accordion toggle
		const toggleButton = screen.getByText("Raw Body");
		fireEvent.click(toggleButton);

		// now the accordion content should be visible
		expect(screen.getByText("apiVersion")).toBeVisible();
	});
});

describe("Card", () => {
	it("renders the title and content", () => {
		render(
			<Card
				title="Test Title"
				content="Test Content"
			/>,
		);
		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});
});
