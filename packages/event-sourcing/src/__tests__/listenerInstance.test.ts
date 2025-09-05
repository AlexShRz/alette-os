import { Effect as E } from "effect";
import { Listener } from "../listeners";

test("it differentiates between listeners", () => {
	class Listener1 extends Listener.as("Listener1")(
		() =>
			({ parent }) =>
				E.succeed({
					...parent,
				}),
	) {}

	class Listener2 extends Listener.as("Listener2")(
		() =>
			({ parent }) =>
				E.succeed({
					...parent,
				}),
	) {}

	const instance1: unknown = new Listener1();

	expect(instance1 instanceof Listener1).toBeTruthy();
	expect(instance1 instanceof Listener2).toBeFalsy();
});
