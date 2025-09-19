import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TGetAllRequestContext } from "../../../context/typeUtils/RequestIOTypes";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { IUploadProgressData } from "../../events/UploadProgressReceived";
import { TapUploadProgressMiddleware } from "./TapUploadProgressMiddleware";
import { tapUploadProgressMiddlewareSpecification } from "./tapUploadProgressMiddlewareSpecification";

export type TTapUploadProgressArgs<
	C extends IRequestContext = IRequestContext,
> = (
	uploadProgressData: IUploadProgressData,
	requestContext: TGetAllRequestContext<C>,
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
		return <Context extends IRequestContext>(
			args: TTapUploadProgressArgs<Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				Context,
				typeof tapUploadProgressMiddlewareSpecification
			>(
				() =>
					new TapUploadProgressMiddlewareFactory(
						() =>
							new TapUploadProgressMiddleware(args as TTapUploadProgressArgs),
					),
			);
		};
	}
}
