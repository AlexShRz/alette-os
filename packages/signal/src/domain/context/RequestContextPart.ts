export abstract class RequestContextPart<
	State = any,
	Settings extends Record<string, any> = Record<string, any>,
> {
	protected constructor(
		protected state: State,
		protected settings: Settings,
	) {}

	getState() {
		return this.state;
	}

	getSettings() {
		return this.settings;
	}

	getAdapter() {
		return {};
	}

	abstract clone(): any;

	/**
	 * Used to get all state from the context,
	 * and provide it to middleware functions.
	 * */
	toRecord(): Record<string, unknown> {
		return {};
	}

	/**
	 * Used for inferring state from raw params
	 * passed to us from "request(...)", etc.
	 * */
	fromRecord(record: Record<string, unknown>) {}
}
