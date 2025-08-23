import { expect, it, vi } from "@effect/vitest";
import { Data, Effect as E, Exit, Fiber, PubSub, Stream } from "effect";
import { task } from "../../tasks/functions.js";

it.scoped("completes tasks only once", () =>
	E.gen(function* () {
		const logged: number[] = [];
		const runtime = yield* E.runtime();

		const command = yield* task(() =>
			E.gen(function* () {
				logged.push(1);
			}),
		)
			.runIn(runtime)
			.build();

		command.complete();
		command.complete();
		command.complete();
		command.complete();

		yield* E.promise(() => command.result());

		expect(command.isCompleted()).toBeTruthy();
		expect(logged).toEqual([1]);
	}),
);

it.scoped("fails tasks once", () =>
	E.gen(function* () {
		class MyError extends Data.TaggedError("MyError") {}

		const logged: MyError[] = [];
		const runtime = yield* E.runtime();

		const command = yield* task(() =>
			E.gen(function* () {
				const error = new MyError();
				logged.push(error);
				return yield* error;
			}),
		)
			.runIn(runtime)
			.build();

		command.complete();

		yield* Fiber.await(E.runFork(E.tryPromise(() => command.result())));

		expect(command.isCompleted()).toBeTruthy();
		expect(logged).toHaveLength(1);
	}),
);

it.scoped("cancel tasks once", () =>
	E.gen(function* () {
		const runtime = yield* E.runtime();
		const logged: number[] = [];
		const scope = yield* E.scope;

		const command = yield* task(() =>
			E.gen(function* () {
				const pubSub = yield* PubSub.unbounded();
				const stream = yield* Stream.fromPubSub(pubSub).pipe(
					Stream.runDrain,
					E.forkIn(scope),
				);

				yield* Fiber.join(stream);
			}),
		)
			.whenCancelled(() => {
				logged.push(1);
			})
			.runIn(runtime)
			.build();

		command.complete();
		command.cancel();
		command.cancel();
		command.cancel();

		yield* E.promise(async () => {
			const result = await command.resultSafe();

			expect(Exit.isInterrupted(result)).toBeTruthy();

			await vi.waitFor(() => {
				expect(logged).toEqual([1]);
			});
		});
	}),
);
