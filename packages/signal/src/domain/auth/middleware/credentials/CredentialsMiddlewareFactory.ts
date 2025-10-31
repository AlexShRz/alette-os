import { TIsExactlyLeft } from "@alette/type-utils";
import * as E from "effect/Effect";
import { IRequestContext } from "../../../context/IRequestContext";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { MiddlewareFacade } from "../../../middleware/facade/MiddlewareFacade";
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
			InContext extends IRequestContext,
			CredentialType extends TCredentialArgs,
		>(
			args?: CredentialType,
		) => {
			return new MiddlewareFacade<
				InContext,
				typeof credentialsMiddlewareSpecification,
				CredentialType | undefined,
				[
					IRequestContextPatch<{
						value: {
							credentials: TIsExactlyLeft<
								TCredentialArgs,
								CredentialType
							> extends true
								? "include"
								: CredentialType;
						};
					}>,
				]
			>({
				name: "credentials",
				lastArgs: args || ("include" as CredentialType),
				middlewareSpec: credentialsMiddlewareSpecification,
				middlewareFactory: (args) =>
					new CredentialsMiddlewareFactory(
						() => new CredentialsMiddleware(args),
					),
			});
		};
	}
}
