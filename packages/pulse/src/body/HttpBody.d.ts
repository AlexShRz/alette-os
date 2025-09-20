export interface IJsonBody
	extends Record<
		string,
		string | number | boolean | null | undefined | IJsonBody
	> {}

export type THttpBody =
	| IJsonBody
	| string
	| Blob
	| Uint8Array
	| FormData
	| ArrayBuffer
	| URLSearchParams;
