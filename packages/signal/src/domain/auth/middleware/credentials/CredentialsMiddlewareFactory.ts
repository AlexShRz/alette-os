import * as E from "effect/Effect";
import { AggregateRequestMiddleware } from "../../../execution/events/preparation/AggregateRequestMiddleware";
import { Middleware } from "../../../middleware/Middleware";
import { CredentialsMiddleware } from "./CredentialsMiddleware";

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
) {}
