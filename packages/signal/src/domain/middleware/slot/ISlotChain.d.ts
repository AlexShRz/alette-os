import { IRequestContext } from "../../context";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../context/RequestContextPatches";
import { TAnyMiddlewareFacadeWithoutValidation } from "../TAnyMiddlewareFacade";
import { Slot } from "./Slot";

export interface ISlotChain<Context extends IRequestContext> {
	with<NC1 extends IRequestContextPatch<any, any>[]>(
		m1: TAnyMiddlewareFacadeWithoutValidation<Context, NC1>,
	): Slot<TApplyRequestContextPatches<Context, NC1>, [typeof m1]>;
}
