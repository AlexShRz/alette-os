import { IRequestContext } from "../IRequestContext";
import { RequestContextPart } from "../RequestContextPart";
import { TMergeRecords } from "./TMergeRecords";

export type TMergeContextAdapters<
	C extends IRequestContext,
	ContextPart extends RequestContextPart,
> = TMergeRecords<
	C["types"],
	{
		contextAdapter: TMergeRecords<
			C["types"]["contextAdapter"],
			ReturnType<ContextPart["getAdapter"]>
		>;
	}
>;
