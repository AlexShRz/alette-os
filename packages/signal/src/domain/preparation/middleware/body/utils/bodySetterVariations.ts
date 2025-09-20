import { setBody } from "./setBody";

const CONTENT_TYPE = "Content-Type";

export const setTextBody = setBody({
	[CONTENT_TYPE]: "text/plain;charset=UTF-8",
});

export const setJsonBody = setBody({
	[CONTENT_TYPE]: "application/json;charset=UTF-8",
});

export const setUrlEncodedBody = setBody({
	[CONTENT_TYPE]: "application/x-www-form-urlencoded;charset=UTF-8",
});

export const setByteBody = setBody({
	[CONTENT_TYPE]: "application/octet-stream",
});

/**
 * Important - never set headers here,
 * XHR and fetch do that automatically
 * */
export const setFormDataBody = setBody();
