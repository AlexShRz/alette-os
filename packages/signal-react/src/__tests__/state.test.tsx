import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import React, { useState } from "react";
import { Subject } from "rxjs";
import { TestComponent } from "./utils/TestComponent";
import { testUrl } from "./utils/api";
import { boundary, server } from "./utils/server";

test(
	"it displays all states (uninitialized/loading/success/error)",
	boundary(async () => {
		const uiData = "hello";
		let serverReachedTimes = 0;
		const trigger = new Subject<void>();
		let wasUnmounted = false;

		server.use(
			http.get(testUrl.build(), async () => {
				if (!!serverReachedTimes) {
					serverReachedTimes++;
					return HttpResponse.json(null, { status: 401 });
				}

				serverReachedTimes++;
				await new Promise<void>((res) => {
					trigger.subscribe({
						next: () => res(),
					});
				});
				return HttpResponse.json(uiData);
			}),
		);

		const page = render(
			<TestComponent
				provided={uiData}
				onRequestUnmount={() => {
					wasUnmounted = true;
				}}
			/>,
		);

		/**
		 * Check uninitialized
		 * */
		await page.findByTestId("uninitialized");

		/**
		 * Check loading
		 * */
		await waitFor(async () => {
			expect(serverReachedTimes).toEqual(1);
			await page.findByTestId("loading");
		});

		/**
		 * Allow server to succeed with a value
		 * */
		trigger.next();

		/**
		 * Check success
		 * */
		await page.findByTestId("succeeded");
		const dataElement = await page.findByTestId("data");
		expect(dataElement).toHaveTextContent(uiData);

		const executeBtn = await page.findByTestId("execute");

		/**
		 * Check error
		 * */
		await userEvent.click(executeBtn);
		await waitFor(() => {
			expect(page.queryByTestId("succeeded")).not.toBeInTheDocument();
		});
		await page.findByTestId("failed");
		await page.findByTestId("error");

		/**
		 * Make sure our request was not unmounted
		 * in the process.
		 * */
		await vi.waitFor(() => {
			expect(wasUnmounted).toBeFalsy();
		});
	}),
);

test(
	"it can use props as request arguments",
	boundary(async () => {
		const uiData1 = "123";
		const uiData2 = "333";
		const uiData3 = "53252";

		server.use(
			http.get(testUrl.build(), async ({ request }) => {
				const url = new URL(request.url);
				return HttpResponse.json(url.searchParams.get("id"));
			}),
		);

		const WrapperComponent = () => {
			const [data, setNewData] = useState<string>(uiData1);

			return (
				<TestComponent
					provided={data}
					possibleData={[uiData2, uiData3]}
					onNewDataSelect={(newData) => {
						setNewData(newData);
					}}
				/>
			);
		};

		const page = render(<WrapperComponent />);

		await page.findByTestId("succeeded");
		expect(await page.findByTestId("data")).toHaveTextContent(uiData1);

		await userEvent.click(await page.findByTestId(`to-${uiData2}`));
		expect(await page.findByTestId("data")).toHaveTextContent(uiData2);

		await userEvent.click(await page.findByTestId(`to-${uiData3}`));
		expect(await page.findByTestId("data")).toHaveTextContent(uiData3);
	}),
);

test(
	"it registers request mount",
	boundary(async () => {
		const uiData = "123";
		let wasMounted = false;

		server.use(
			http.get(testUrl.build(), async () => {
				return HttpResponse.json(uiData);
			}),
		);

		render(
			<TestComponent
				provided={uiData}
				onRequestMount={() => {
					wasMounted = true;
				}}
			/>,
		);

		await waitFor(() => {
			expect(wasMounted).toBeTruthy();
		});
	}),
);

test(
	"it unmounts the request together with the component",
	boundary(async () => {
		const uiData = "123";
		let wasUnmounted = false;

		server.use(
			http.get(testUrl.build(), async () => {
				return HttpResponse.json(uiData);
			}),
		);

		const page = render(
			<TestComponent
				provided={uiData}
				onRequestUnmount={() => {
					wasUnmounted = true;
				}}
			/>,
		);

		await page.findByTestId("succeeded");
		expect(await page.findByTestId("data")).toHaveTextContent(uiData);

		page.unmount();

		await waitFor(() => {
			expect(wasUnmounted).toBeTruthy();
		});
	}),
);
