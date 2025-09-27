export interface IRequestContext<
	T = {
		originalResultType: unknown;
		resultType: unknown;
		originalErrorType: unknown;
		errorType: unknown;
		/**
		 * 1. Used by the "retry" middleware family, etc.
		 * 2. The default type should be "{}" for easy
		 * handler type merging.
		 * */
		contextAdapter: {};
		recoverableErrors: unknown;
	},
	V = {},
	S = {},
	A = {},
	AM = {},
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
	/**
	 * Same as "accepts", but for mounted mode
	 * */
	acceptsMounted: AM;
}
