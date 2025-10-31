import { IUploadProgressData } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TFullRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
import { TapUploadProgressMiddleware } from "./TapUploadProgressMiddleware";
import { tapUploadProgressMiddlewareSpecification } from "./tapUploadProgressMiddlewareSpecification";

export type TTapUploadProgressArgs<
	C extends IRequestContext = IRequestContext,
> = (
	uploadProgressData: IUploadProgressData,
	requestContext: TFullRequestContext<C>,
) => void | Promise<void>;

export class TapUploadProgressMiddlewareFactory extends Middleware(
	"TapUploadProgressMiddlewareFactory",
)(
	(getMiddleware: () => TapUploadProgressMiddleware) =>
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
		return <InContext extends IRequestContext>(
			args: TTapUploadProgressArgs<InContext>,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof tapUploadProgressMiddlewareSpecification,
				TTapUploadProgressArgs<InContext>
			>({
				name: "tapUploadProgress",
				lastArgs: args,
				middlewareSpec: tapUploadProgressMiddlewareSpecification,
				middlewareFactory: (args) =>
					new TapUploadProgressMiddlewareFactory(
						() =>
							new TapUploadProgressMiddleware(args as TTapUploadProgressArgs),
					),
			});
		};
	}
}
