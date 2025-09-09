import { DummyEvent } from "../testUtils/DummyEvent";
import { DummyEventEnvelope } from "../testUtils/DummyEventEnvelope";

test("it gets deeply wrapped event", () => {
	const event = new DummyEvent();
	const envelope = new DummyEventEnvelope(
		new DummyEventEnvelope(new DummyEventEnvelope(event)),
	);

	expect(envelope.getWrappedEvent()).toEqual(event);
});

test("it updates deeply wrapped event", () => {
	const event = new DummyEvent();
	const expected = [12312, 222];
	const envelope = new DummyEventEnvelope(
		new DummyEventEnvelope(new DummyEventEnvelope(event)),
	);

	envelope.updateValues(expected);
	expect(envelope.getValues()).toStrictEqual(expected);
});

test("it peels event envelope layers", () => {
	const event = new DummyEvent();
	const envelope = new DummyEventEnvelope(
		new DummyEventEnvelope(new DummyEventEnvelope(event)),
	);

	const e1 = envelope.peel();
	const e2 = (e1 as DummyEventEnvelope).peel();
	const e3 = (e2 as DummyEventEnvelope).peel();

	expect(e3).toEqual(event);
});

test("it iterates over all envelope layers while including the actual wrapped event", () => {
	const event = new DummyEvent();
	const envelope = new DummyEventEnvelope(
		new DummyEventEnvelope(new DummyEventEnvelope(event)),
	);

	let lastIndex = 0;
	let ranTimes = 0;
	const expected = [1, 2, 3];
	envelope.forEachLayer((e) => {
		if (e instanceof DummyEventEnvelope) {
			e.setOwnCount(expected[lastIndex]!);
		}

		if (e instanceof DummyEvent) {
			e.setValues([expected[lastIndex]!]);
		}

		lastIndex++;
		ranTimes++;
	});

	expect(envelope.getValuesFromAllLayers()).toStrictEqual(expected);
	expect(ranTimes).toEqual(3);
});
