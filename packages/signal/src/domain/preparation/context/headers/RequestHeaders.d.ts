import { IHeaders } from "@alette/pulse";
import { IRequestContext } from "../../../context/IRequestContext";

export interface IRequestHeaders<Headers extends IHeaders = IHeaders> {
	headers: Headers;
}

export type TGetRequestHeaders<C extends IRequestContext> =
	C["value"]["headers"];
