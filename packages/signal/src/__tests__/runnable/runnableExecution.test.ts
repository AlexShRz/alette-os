import { expect, it } from "@effect/vitest";
import { Effect as E, Layer, ManagedRuntime } from "effect";
import { Runnable } from "../../runnable/Runnable.js";

it.scoped("can be executed only once", () =>
	E.gen(function* () {
		let count = 0;

		const getValue = new Runnable(
			E.gen(function* () {
				count++;
			}),
		);

		yield* getValue.spawn();
		yield* getValue.spawn();
		yield* getValue.spawn();
		yield* getValue.spawn();
		yield* getValue.spawn();

		yield* getValue.waitForCompletion();
		yield* getValue.waitForCompletion();
		yield* getValue.waitForCompletion();
		yield* getValue.waitForCompletion();

		expect(count).toBe(1);
	}),
);

it.scoped("can access services from passed runtime", () =>
	E.gen(function* () {
		const value = "asdasdasd";

		class Service1 extends E.Service<Service1>()("Service1", {
			effect: E.gen(function* () {
				return {
					getValue: () => value,
				};
			}),
		}) {}

		const runtime = ManagedRuntime.make(Layer.mergeAll(Service1.Default));

		const getValue = new Runnable(
			/**
			 * Makes sure effects are nested to verify
			 * that runtime context is not lost.
			 * */
			E.gen(function* () {
				return yield* E.gen(function* () {
					return yield* E.gen(function* () {
						const service = yield* E.serviceOptional(Service1);
						return service.getValue();
					});
				});
			}),
		);

		runtime.runFork(getValue.spawn());
		runtime.runFork(getValue.spawn());
		runtime.runFork(getValue.spawn());
		runtime.runFork(getValue.spawn());
		runtime.runFork(getValue.spawn());
		runtime.runFork(getValue.spawn());

		const result = yield* getValue.result();

		expect(result).toBe(value);
	}),
);
