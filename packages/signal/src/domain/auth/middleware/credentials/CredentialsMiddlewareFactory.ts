import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { TMergeRecords } from "../../../context/typeUtils/TMergeRecords";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { toMiddlewareFactory } from "../../../middleware/toMiddlewareFactory";
import { CredentialsMiddleware } from "./CredentialsMiddleware";
import { credentialsMiddlewareSpecification } from "./credentialsMiddlewareSpecification";

export type TCredentialArgs = RequestCredentials;

export class CredentialsMiddlewareFactory extends Middleware(
	"CredentialsMiddlewareFactory",
)(
	(getMiddleware: () => CredentialsMiddleware) =>
		({ parent, context }) =>
			E.gen(function* () {
				return {
					...parent,
					send(event) {
						return E.gen(this, function* () {
							if (event instanceof AggregateRequestMiddleware) {
								event.replaceMiddleware(
									[CredentialsMiddleware],
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
		return <
			Context extends IRequestContext,
			CredentialType extends TCredentialArgs = "include",
		>(
			args?: CredentialType,
		) => {
			return toMiddlewareFactory<
				Context,
				IRequestContext<
					Context["types"],
					TMergeRecords<Context["value"], { credentials: CredentialType }>,
					Context["settings"],
					Context["accepts"],
					Context["acceptsMounted"]
				>,
				typeof credentialsMiddlewareSpecification
			>(
				() =>
					new CredentialsMiddlewareFactory(
						() => new CredentialsMiddleware(args),
					),
			);
		};
	}
}
