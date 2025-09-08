import * as E from "effect/Effect";
import { RequestSession } from "../../services/RequestSession";
import { IRequestSessionSettingSupplier } from "../../services/RequestSessionContext";
import { RequestSessionEvent } from "../RequestSessionEvent";

/**
 * Logic:
 * 1. The moment this event reaches our "execution" middleware,
 * all previously running requests are cancelled automatically.
 * 2. If we want to prevent this behaviour, the event must be cancelled
 * BEFORE it reaches the middleware.
 * */
export class RunRequest extends RequestSessionEvent {
	protected contextProvider: E.Effect<void, never, never> = E.void;

	constructor(
		protected settingSupplier: IRequestSessionSettingSupplier = () => ({}),
	) {
		super();
		this.onComplete(() => this.provideRequestContext());
	}

	getSettingSupplier() {
		return this.settingSupplier;
	}

	updateContextProvider(
		provider: (old: typeof this.contextProvider) => typeof this.contextProvider,
	) {
		this.contextProvider = provider(this.contextProvider);
		return this;
	}

	protected provideRequestContext() {
		return E.gen(this, function* () {
			const session = yield* E.serviceOptional(RequestSession);
			/**
			 * 1. Prepare initial request data.
			 * 2. Request id update should be first
			 * to prevent accidental data wipe.
			 * */
			yield* session.setRequestId(this.getRequestId()).pipe(
				/**
				 * 1. Must be last.
				 * 2. We need to make sure all context provide effects
				 * have access to latest request session data.
				 * */
				E.andThen(() => this.contextProvider),
			);
		}).pipe(E.orDie);
	}

	protected _clone() {
		/**
		 * Context provider should be wiped, there's no reason preserve it:
		 * 1. Because we transfer our requestId, the context
		 * will not be wiped if we dispatch the event again.
		 * 2. Because of that, calling contextProvider multiple times will
		 * result only in duplicate session data/accidental session data wipe.
		 * */
		const self = new RunRequest(this.settingSupplier);
		return self as this;
	}
}
