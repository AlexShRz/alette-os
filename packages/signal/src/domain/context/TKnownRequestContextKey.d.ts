/**
 *  The & (string & {}) trick allows us to
 *  get autocompletion AND allow simple strings as keys
 * */
export type TKnownRequestContextKey = ("body" | "headers" | "url" | "args") &
	(string & {});
