import { XmlHttpRequest as xmlPolyfill } from "./xhrPolyfill/xml-http-request";

export const setUpApiTestEnv = () => {
	const env = globalThis as unknown as {
		beforeEach: (callback: () => void) => void;
	};

	env.beforeEach(() => {
		globalThis.XMLHttpRequest = xmlPolyfill as any;
	});
};
