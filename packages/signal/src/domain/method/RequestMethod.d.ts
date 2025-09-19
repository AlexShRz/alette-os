import { THttpMethod } from "@alette/pulse";

export interface IRequestMethod<Method extends THttpMethod = THttpMethod> {
	method: Method;
}
