import { RequestSpecification } from "@alette/pulse";
import { IRequestContext } from "../../context/IRequestContext";
import { ApiRequest } from "../ApiRequest";

export class OneShotRequest<
	PContext extends IRequestContext = IRequestContext,
	Context extends IRequestContext = IRequestContext,
	RequestSpec extends RequestSpecification = RequestSpecification,
> extends ApiRequest<PContext, Context, RequestSpec> {}
