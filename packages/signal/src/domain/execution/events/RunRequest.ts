import * as E from "effect/Effect";
import { RequestSession } from "../services/RequestSession";
import {
	IRequestSessionSettingSupplier,
	RequestSessionContext,
} from "../services/RequestSessionContext";
import { RequestSessionEvent } from "./RequestSessionEvent";

export class RunRequest extends RequestSessionEvent {
	constructor(
		protected config: {
			requestId: string;
			contextProvider: E.Effect<void, never, never>;
			settingSupplier: IRequestSessionSettingSupplier;
		},
	) {
		super(config.requestId);
		this.onComplete(() => this.provideRequestContext());
	}

	protected provideRequestContext() {
		return E.gen(this, function* () {
			const { requestId, settingSupplier, contextProvider } = this.config;

			const session = yield* E.serviceOptional(RequestSession);
			const sessionContext = yield* E.serviceOptional(RequestSessionContext);
			/**
			 * 1. Prepare initial request data.
			 * 2. Request id update should be first
			 * to prevent accidental data wipe.
			 * */
			yield* session.setRequestId(requestId).pipe(
				E.andThen(() => sessionContext.setSettingSupplier(settingSupplier)),
				/**
				 * 1. Must be last.
				 * 2. We need to make sure all context provide effects
				 * have access to latest request session data.
				 * */
				E.andThen(() => contextProvider),
			);
		}).pipe(E.orDie);
	}

	clone() {
		return new RunRequest({
			...this.config,
			/**
			 * Context provider should be wiped, there's no reason preserve it:
			 * 1. Because we transfer our requestId, the context
			 * will not be wiped if we dispatch the event again.
			 * 2. Because of that, calling contextProvider multiple times will
			 * result only in duplicate session data/accidental session data wipe.
			 * */
			contextProvider: E.void,
		}) as this;
	}
}
