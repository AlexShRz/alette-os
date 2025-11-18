import { THttpBody } from "@alette/pulse";

export interface IRequestBody<Body extends THttpBody> {
	body: Body;
}
