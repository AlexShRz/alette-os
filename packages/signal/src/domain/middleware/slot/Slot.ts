import { Callable } from "@alette/shared";
import { IRequestContext } from "../../context";
import {
	TAnyMiddlewareFacade,
	TAnyMiddlewareFacadeWithoutValidation,
} from "../TAnyMiddlewareFacade";
import { ISlotChain } from "./ISlotChain";

export class Slot<
	Context extends IRequestContext,
	const Middleware extends TAnyMiddlewareFacade<any, any, any, any>[],
> extends Callable<() => readonly [...Middleware]> {
	constructor(protected middleware = [] as unknown as Middleware) {
		super(() => this.middleware);
	}

	with: ISlotChain<Context>["with"] = (
		...middleware: TAnyMiddlewareFacadeWithoutValidation<any, any, any>[]
	) => {
		return new Slot([...middleware]) as any;
	};

	static toFactory() {
		const slot = new Slot();
		return slot.with.bind(slot);
	}
}

export const slot = /* @__PURE__ */ Slot.toFactory();
