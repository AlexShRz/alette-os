export interface IRequestContext<
	T extends Record<string, any> = {
		resultType: unknown;
		errorType: unknown;
	},
	V extends Record<string, any> = {},
	M extends Record<string, any> = {},
	S extends Record<string, any> = {},
	A extends Record<string, any> = {},
> {
	/**
	 * 1. Non-existent in the code itself (ts types only).
	 * 2. Used for storing and propagating useful type info,
	 * like final result type, final error type, etc.
	 * */
	types: T;
	/**
	 * Readonly request state (can be provided by the core system).
	 * For example: origin, isOffline, etc.
	 * */
	value: V;
	/**
	 * Actual js values that are not visible to users (private request state)
	 * */
	meta: M;
	/**
	 * Middleware can allow users to tweak their behaviour
	 * during each request execution. These behavioural settings
	 * are stored here and can be changed by users via request.execute(...), etc.
	 * */
	settings: S;
	/**
	 * 1. Determines what our current request can accept
	 * as arguments for its "execute" method.
	 * 2. This is useful for fine-tuning the type without touching
	 * the "value" or "settings" types. For example, if we have
	 * passed a default arg provider somewhere, we can mark "args" as
	 * optional, without modifying the type our middleware use during
	 * their configuration (client side).
	 * */
	accepts: A;
}
