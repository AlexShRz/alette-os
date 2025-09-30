import { IHeaders } from "@alette/pulse";
import { Token } from "../../../../application";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import {
	IRequestHeaders,
	TGetRequestHeaders,
} from "../../../preparation/context/headers/RequestHeaders";

export type TBearerTokenHeaders<
	C extends IRequestContext,
	PassedToken extends Token,
	Headers = TGetRequestHeaders<C>,
> = Headers extends IHeaders
	? IRequestHeaders<
			TMergeRecords<Headers, Awaited<ReturnType<PassedToken["toHeaders"]>>>
		>
	: /**
		 * If we have no headers...
		 * */
		IRequestHeaders<Awaited<ReturnType<PassedToken["toHeaders"]>>>;
