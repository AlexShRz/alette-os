import { IRequestContext } from "../../../context";
import { IRequestContextPatch } from "../../../context/RequestContextPatches";
import { MiddlewareFacade } from "../../../middleware/MiddlewareFacade";
import { CredentialsMiddleware } from "./CredentialsMiddleware";
import { CredentialsMiddlewareFactory } from "./CredentialsMiddlewareFactory";
import { credentialsMiddlewareSpecification } from "./credentialsMiddlewareSpecification";

export type TCredentialArgs = RequestCredentials;

export class Credentials<
	InContext extends IRequestContext,
	CredentialType extends TCredentialArgs,
> extends MiddlewareFacade<
	<
		_InContext extends IRequestContext,
		CredentialType extends TCredentialArgs = "include",
	>(
		args?: CredentialType,
	) => Credentials<_InContext, CredentialType>,
	InContext,
	[
		IRequestContextPatch<{
			value: {
				credentials: CredentialType;
			};
		}>,
	],
	typeof credentialsMiddlewareSpecification
> {
	protected middlewareSpec = credentialsMiddlewareSpecification;

	constructor(protected override lastArgs: TCredentialArgs = "include") {
		super((args) => new Credentials(args));
	}

	getMiddleware() {
		return new CredentialsMiddlewareFactory(
			() => new CredentialsMiddleware(this.lastArgs),
		);
	}
}

export const credentials = /* @__PURE__ */ new Credentials();
