import { Callable } from "@alette/shared";
import { IRequestContext } from "../../context";
import { TAnyMiddlewareFacadeWithoutValidation } from "../TAnyMiddlewareFacade";
import { ISlotChain } from "./ISlotChain";

export class Slot<
	Context extends IRequestContext,
	Middleware extends TAnyMiddlewareFacadeWithoutValidation<any, any>[],
> extends Callable<() => Middleware> {
	constructor(protected middleware = [] as unknown as Middleware) {
		super(() => this.middleware);
	}

	with: ISlotChain<Context>["with"] = (
		...middleware: TAnyMiddlewareFacadeWithoutValidation<any, any>[]
	) => {
		return new Slot([...middleware]) as any;
	};

	static toFactory() {
		const slot = new Slot();
		return slot.with.bind(slot);
	}
}

export const slot = Slot.toFactory();
