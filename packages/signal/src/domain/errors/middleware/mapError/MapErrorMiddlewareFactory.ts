import { ApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import {
	TFullRequestContext,
	TRequestError,
} from "../../../context/typeUtils/RequestIOTypes";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { MapErrorMiddleware } from "./MapErrorMiddleware";
import { IMappedErrorType } from "./MappedErrorType";
import { mapErrorMiddlewareSpecification } from "./mapErrorMiddlewareSpecification";

export type TMapErrorArgs<
	MappedError extends ApiError = ApiError,
	C extends IRequestContext = IRequestContext,
> = (
	requestError: TRequestError<C>,
	requestContext: TFullRequestContext<C>,
) => MappedError | Promise<MappedError>;

export class MapErrorMiddlewareFactory extends Middleware(
	"MapErrorMiddlewareFactory",
)(
	(getMiddleware: () => MapErrorMiddleware) =>
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
		return <Context extends IRequestContext, MappedError extends ApiError>(
			args: TMapErrorArgs<MappedError, Context>,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					TMergeRecords<Context["types"], IMappedErrorType<MappedError>>,
					Context["value"],
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof mapErrorMiddlewareSpecification
			>(
				() =>
					new MapErrorMiddlewareFactory(
						() => new MapErrorMiddleware(args as TMapErrorArgs),
					),
			);
		};
	}
}
