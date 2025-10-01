import { IDownloadProgressData } from "@alette/pulse";
import { Subject } from "rxjs";
import { setContext } from "../../../application";
import {
	path,
	aboutDownloadProgress,
	factory,
	tapDownloadProgress,
} from "../../../domain";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it gets notifications about download progress", async () => {
	const { custom } = createTestApi();
	const logger: any[] = [];
	let isLoading = false;
	const snapshot1: IDownloadProgressData = {
		progress: 23,
		downloaded: 23,
		remaining: 213,
	};
	const snapshot2: IDownloadProgressData = {
		progress: null,
		downloaded: 23,
		remaining: null,
	};
	const snapshot3: IDownloadProgressData = {
		progress: 100,
		downloaded: 100,
		remaining: 0,
	};
	const progressDataSender = new Subject<IDownloadProgressData>();

	const getData = custom(
		factory((_, { notify }) => {
			isLoading = true;
			progressDataSender.subscribe({
				next: (progress) => {
					notify(aboutDownloadProgress(progress));
				},
			});

			return new Promise(() => {
				// never resolve
			});
		}),
		tapDownloadProgress((progressSnapshot) => {
			logger.push(progressSnapshot);
		}),
	);

	getData.execute().catch((e) => e);
	await vi.waitFor(() => {
		expect(isLoading).toBeTruthy();
	});

	progressDataSender.next(snapshot1);
	await vi.waitFor(() => {
		expect(logger[0]).toStrictEqual(snapshot1);
	});
	progressDataSender.next(snapshot2);
	await vi.waitFor(() => {
		expect(logger[1]).toStrictEqual(snapshot2);
	});
	progressDataSender.next(snapshot3);
	await vi.waitFor(() => {
		expect(logger[2]).toStrictEqual(snapshot3);
	});
});

test("it can be combined", async () => {
	const { custom } = createTestApi();
	const logger: any[] = [];
	let isLoading = false;
	const snapshot1: IDownloadProgressData = {
		progress: 23,
		downloaded: 23,
		remaining: 213,
	};
	const snapshot2: IDownloadProgressData = {
		progress: null,
		downloaded: 23,
		remaining: null,
	};
	const snapshot3: IDownloadProgressData = {
		progress: 100,
		downloaded: 100,
		remaining: 0,
	};
	const progressDataSender = new Subject<IDownloadProgressData>();

	const getData = custom(
		tapDownloadProgress((progressSnapshot) => {
			logger.push(progressSnapshot);
		}),
		factory((_, { notify }) => {
			isLoading = true;
			progressDataSender.subscribe({
				next: (progress) => {
					notify(aboutDownloadProgress(progress));
				},
			});

			return new Promise(() => {
				// never resolve
			});
		}),
		tapDownloadProgress(async (progressSnapshot) => {
			logger.push(progressSnapshot);
		}),
		tapDownloadProgress((progressSnapshot) => {
			logger.push(progressSnapshot);
		}),
	);

	getData.execute().catch((e) => e);
	await vi.waitFor(() => {
		expect(isLoading).toBeTruthy();
	});

	progressDataSender.next(snapshot1);
	await vi.waitFor(() => {
		expect(logger[0]).toStrictEqual(snapshot1);
		expect(logger[1]).toStrictEqual(snapshot1);
		expect(logger[2]).toStrictEqual(snapshot1);
	});
	progressDataSender.next(snapshot2);
	await vi.waitFor(() => {
		expect(logger[3]).toStrictEqual(snapshot2);
		expect(logger[4]).toStrictEqual(snapshot2);
		expect(logger[5]).toStrictEqual(snapshot2);
	});
	progressDataSender.next(snapshot3);
	await vi.waitFor(() => {
		expect(logger[6]).toStrictEqual(snapshot3);
		expect(logger[7]).toStrictEqual(snapshot3);
		expect(logger[8]).toStrictEqual(snapshot3);
	});
});

test("it can access request props and context", async () => {
	const { api, custom } = createTestApi();
	const context = { asdasdnasd: "asdas" };
	let isLoading = false;
	let caughtContext: typeof context | null = null;
	let caughtPath: string | null = null;

	const progressDataSender = new Subject<IDownloadProgressData>();
	const snapshot1: IDownloadProgressData = {
		progress: 23,
		downloaded: 23,
		remaining: 213,
	};

	api.tell(setContext(context));

	const pathValue = "/asdads";

	const getData = custom(
		path(pathValue),
		factory((_, { notify }) => {
			isLoading = true;
			progressDataSender.subscribe({
				next: (progress) => {
					notify(aboutDownloadProgress(progress));
				},
			});

			return new Promise(() => {
				// never resolve
			});
		}),
		tapDownloadProgress(async (_, { context, path }) => {
			caughtContext = context as any;
			caughtPath = path;
		}),
	);

	getData.execute().catch((e) => e);
	await vi.waitFor(() => {
		expect(isLoading).toBeTruthy();
	});

	progressDataSender.next(snapshot1);
	await vi.waitFor(
		() => {
			expect(caughtContext).toBe(context);
			expect(caughtPath).toBe(pathValue);
		},
		{ timeout: 3000 },
	);
});
