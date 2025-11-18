import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import React from "react";
import { TestComponent2 } from "./utils/TestComponent2";
import { testUrl } from "./utils/api";
import { boundary, server } from "./utils/server";

test(
	"it allows to execute requests manually if no dependencies were passed",
	boundary(async () => {
		let triggeredTimes = 0;
		const expectedReturn = "hello";

		server.use(
			http.get(testUrl.build(), async () => {
				return HttpResponse.json(expectedReturn);
			}),
		);

		const WrapperComponent = () => {
			return (
				<TestComponent2
					onRequestSuccess={() => {
						triggeredTimes++;
					}}
				/>
			);
		};

		const page = render(<WrapperComponent />);

		await waitFor(() => {
			expect(triggeredTimes).toEqual(0);
		});

		await userEvent.click(await page.findByTestId("execute"));
		expect(await page.findByTestId("data")).toHaveTextContent(expectedReturn);

		await waitFor(() => {
			expect(triggeredTimes).toEqual(1);
		});
	}),
);
