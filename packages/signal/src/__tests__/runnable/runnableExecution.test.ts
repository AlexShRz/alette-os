import { expect, it } from "@effect/vitest";
import { Effect as E, Layer, ManagedRuntime } from "effect";
import { Runnable } from "../../runnable/Runnable.js";

it.scoped("can be executed only once", () =>
	E.gen(function* () {
		const runtime = ManagedRuntime.make(Layer.empty);
		let count = 0;

		const getValue = new Runnable(
			runtime,
			E.gen(function* () {
				count++;
			}),
		);

		getValue.spawn();
		getValue.spawn();
		getValue.spawn();
		getValue.spawn();
		getValue.spawn();

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
			runtime,
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

		getValue.spawn();
		getValue.spawn();
		getValue.spawn();
		getValue.spawn();
		getValue.spawn();

		const result = yield* getValue.result();

		expect(result).toBe(value);
	}),
);
