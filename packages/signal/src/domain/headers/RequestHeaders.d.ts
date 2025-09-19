import { IHeaders } from "@alette/pulse";
import { IRequestContext } from "../context/IRequestContext";
import { TGetAllRequestContext } from "../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../context/typeUtils/TMergeRecords";

export interface IRequestHeaders<
	C extends IRequestContext,
	NewHeaders extends IHeaders,
	Supplier extends THeaderSupplier<NewHeaders, C>,
> {
	headers: TMergeRequestHeaders<C, NewHeaders, Supplier>;
}

export type TGetRequestHeaders<C extends IRequestContext> =
	C["value"]["headers"];

export type THeaderSupplier<
	Headers extends IHeaders = IHeaders,
	C extends IRequestContext = IRequestContext,
> =
	| ((
			headers: TGetRequestHeaders<C>,
			requestContext: TGetAllRequestContext<C>,
	  ) => Headers | Promise<Headers>)
	| Headers;

type TMergeRequestHeaders<
	C extends IRequestContext,
	NewHeaders extends IHeaders,
	Supplier extends THeaderSupplier<NewHeaders, C>,
	PrevHeaders = TGetRequestHeaders<C>,
> = Supplier extends Record<string, any>
	? TMergeRecords<
			PrevHeaders extends Record<string, any> ? PrevHeaders : {},
			NewHeaders
		>
	: NewHeaders;
