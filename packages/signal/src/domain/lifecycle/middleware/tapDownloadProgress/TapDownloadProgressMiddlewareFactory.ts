import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { IDownloadProgressData } from "../../events/DownloadProgressReceived";
import { TapDownloadProgressMiddleware } from "./TapDownloadProgressMiddleware";
import { tapDownloadProgressMiddlewareSpecification } from "./tapDownloadProgressMiddlewareSpecification";

export type TTapDownloadProgressArgs<
	C extends IRequestContext = IRequestContext,
> = (
	downloadProgressData: IDownloadProgressData,
	requestContext: TGetAllRequestContext<C>,
) => void | Promise<void>;

export class TapDownloadProgressMiddlewareFactory extends Middleware(
	"TapDownloadProgressMiddlewareFactory",
)(
	(getMiddleware: () => TapDownloadProgressMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.addMiddleware(getMiddleware());
							}

							return yield* context.next(event);
						});
					},
				};
			}),
) {
	static toFactory() {
		return <Context extends IRequestContext>(
			args: TTapDownloadProgressArgs<Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapDownloadProgressMiddlewareSpecification
			>(
				() =>
					new TapDownloadProgressMiddlewareFactory(
						() =>
							new TapDownloadProgressMiddleware(
								args as TTapDownloadProgressArgs,
							),
					),
			);
		};
	}
}
