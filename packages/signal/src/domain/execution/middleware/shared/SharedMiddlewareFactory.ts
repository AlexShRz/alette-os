import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { AggregateRequestMiddleware } from "../../events/preparation/AggregateRequestMiddleware";
import { ChooseRequestWorker } from "../../events/preparation/ChooseRequestWorker";
import { SharedMiddleware } from "./SharedMiddleware";
import { sharedMiddlewareSpecification } from "./sharedMiddlewareSpecification";

export class SharedMiddlewareFactory extends Middleware(
	"SharedMiddlewareFactory",
)(
	(getMiddleware: () => SharedMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				const selectReusedWorker = (event: ChooseRequestWorker) => {
					const allWorkers = event.getAvailableWorkerIds();
					const firstWorker = allWorkers[0];

					/**
					 * If we have no workers to choose from,
					 * leave everything as is.
					 * */
					if (!firstWorker) {
						return event;
					}

					/**
					 * 1. If we have available workers, choose
					 * the first one.
					 * 2. This makes sure no new workers are created.
					 * */
					event.setPreferredWorker(firstWorker);
					return event;
				};

				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof ChooseRequestWorker) {
								const updatedEvent = selectReusedWorker(event);
								return yield* context.next(updatedEvent);
							}

							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware([SharedMiddleware], [getMiddleware()]);
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <Context extends IRequestContext>() => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof sharedMiddlewareSpecification
			>(() => new SharedMiddlewareFactory(() => new SharedMiddleware()));
		};
	}
}
