import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { RunOnMountMiddleware } from "./RunOnMountMiddleware";
import { runOnMountMiddlewareSpecification } from "./runOnMountMiddlewareSpecification";

export class RunOnMountMiddlewareFactory extends Middleware(
	"RunOnMountMiddlewareFactory",
)(
	(getMiddleware: () => RunOnMountMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[RunOnMountMiddleware],
									[getMiddleware()],
								);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <Context extends IRequestContext>(isEnabled?: boolean) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof runOnMountMiddlewareSpecification
			>(() => new RunOnMountMiddleware(isEnabled));
		};
	}
}
