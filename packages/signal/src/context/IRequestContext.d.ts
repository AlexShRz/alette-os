export interface IRequestContext<
	T extends Record<string, any> = {},
	V extends Record<string, any> = {},
	S extends Record<string, any> = {},
	M extends Record<string, any> = {},
> {
	/**
	 * 1. Non-existent in the code itself (ts types only).
	 * 2. Used for storing and propagating useful type info,
	 * like accepted argument types, etc.
	 * */
	types: T;
	/**
	 * Readonly request state (can be provided by the core system).
	 * For example: origin, isOffline, etc.
	 * */
	value: V;
	/**
	 * A middleware can allow users to tweak its behaviour
	 * during each request execution. These settings
	 * are stored here and can be changed via request.execute(...), etc.
	 * */
	settings: S;
	/**
	 * Actual js values that are not visible to users (private request state)
	 * */
	meta: M;
}
