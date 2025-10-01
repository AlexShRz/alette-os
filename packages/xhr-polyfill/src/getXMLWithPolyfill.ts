import { XmlHttpRequest as poly } from "./xml-http-request";

export const getXMLWithPolyfill = (): XMLHttpRequest => {
	return poly as any;
};
