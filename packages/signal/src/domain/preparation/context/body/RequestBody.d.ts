import { IHeaders, THttpBody } from "@alette/pulse";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestHeaders, TGetRequestHeaders } from "../headers/RequestHeaders";

export type TRequestBody<
	C extends IRequestContext,
	Body extends THttpBody,
	Headers = TGetRequestHeaders<C>,
> = Headers extends IHeaders
	? {
			body: Body;
		}
	: /**
		 * 1. If our headers are non-existent,
		 * set empty record to act as a header type.
		 * 2. This allows us to access this property in context
		 * without getting ts errors, while also keeping system
		 * injected body headers hidden from the type system.
		 * */
		IRequestHeaders & {
			body: Body;
		};
