import { Subject } from "rxjs";
import { setContext } from "../../../application";
import {
	path,
	aboutUploadProgress,
	factory,
	tapUploadProgress,
} from "../../../domain";
import { IUploadProgressData } from "../../../domain/lifecycle/events/UploadProgressReceived";
import { createTestApi } from "../../../shared/testUtils/createTestApi";

test("it gets notifications about upload progress", async () => {
	const { custom } = createTestApi();
	const logger: any[] = [];
	let isLoading = false;
	const snapshot1: IUploadProgressData = {
		progress: 23,
		uploaded: 23,
		remaining: 213,
	};
	const snapshot2: IUploadProgressData = {
		progress: null,
		uploaded: 23,
		remaining: null,
	};
	const snapshot3: IUploadProgressData = {
		progress: 100,
		uploaded: 100,
		remaining: 0,
	};
	const progressDataSender = new Subject<IUploadProgressData>();

	const getData = custom(
		factory((_, { notify }) => {
			isLoading = true;
			progressDataSender.subscribe({
				next: (progress) => {
					notify(aboutUploadProgress(progress));
				},
			});

			return new Promise(() => {
				// never resolve
			});
		}),
		tapUploadProgress((progressSnapshot) => {
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
	const snapshot1: IUploadProgressData = {
		progress: 23,
		uploaded: 23,
		remaining: 213,
	};
	const snapshot2: IUploadProgressData = {
		progress: null,
		uploaded: 23,
		remaining: null,
	};
	const snapshot3: IUploadProgressData = {
		progress: 100,
		uploaded: 100,
		remaining: 0,
	};
	const progressDataSender = new Subject<IUploadProgressData>();

	const getData = custom(
		tapUploadProgress((progressSnapshot) => {
			logger.push(progressSnapshot);
		}),
		factory((_, { notify }) => {
			isLoading = true;
			progressDataSender.subscribe({
				next: (progress) => {
					notify(aboutUploadProgress(progress));
				},
			});

			return new Promise(() => {
				// never resolve
			});
		}),
		tapUploadProgress(async (progressSnapshot) => {
			logger.push(progressSnapshot);
		}),
		tapUploadProgress((progressSnapshot) => {
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

	const progressDataSender = new Subject<IUploadProgressData>();
	const snapshot1: IUploadProgressData = {
		progress: 23,
		uploaded: 23,
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
					notify(aboutUploadProgress(progress));
				},
			});

			return new Promise(() => {
				// never resolve
			});
		}),
		tapUploadProgress(async (_, { context, path }) => {
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
