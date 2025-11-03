import { Callable } from "../../../shared/Callable";
import { IRequestContext } from "../../context";
import { TAnyMiddlewareFacade } from "../facade/TAnyMiddlewareFacade";
import { ISlotChain } from "./ISlotChain";

export class Slot<
	Context extends IRequestContext,
	Middleware extends TAnyMiddlewareFacade<any, any, any, any, any>[],
> extends Callable<[], Middleware> {
	constructor(protected middleware = [] as unknown as Middleware) {
		super(() => this.middleware);
	}

	with: ISlotChain<Context>["with"] = (
		...middleware: TAnyMiddlewareFacade<any, any, any, any, any>[]
	) => {
		return new Slot([...middleware]) as any;
	};

	static toFactory() {
		const slot = new Slot();
		return slot.with.bind(slot);
	}
}

export const slot = Slot.toFactory();
