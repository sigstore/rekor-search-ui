import { SearchForm } from "./SearchForm";
import { render, screen } from "@testing-library/react";
import { RekorClientProvider } from "../api/context";

describe("SearchForm", () => {
	it("should render form with default values", () => {
		render(
			<RekorClientProvider>
				<SearchForm
					defaultValues={{ attribute: "email", value: "" }}
					isLoading={false}
					onSubmit={jest.fn()}
				/>
			</RekorClientProvider>,
		);

		expect(screen.getByLabelText("Attribute")).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: /email/i })).toHaveValue("");
		expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
	});
});
