import * as E from "effect/Effect";
import { RequestSession } from "../../services/RequestSession";
import {
	IRequestSettingSupplier,
	RequestSessionContext,
} from "../../services/RequestSessionContext";
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
	protected afterContextExecutor: E.Effect<void, never, never> = E.void;

	constructor(protected settingSupplier: IRequestSettingSupplier = () => ({})) {
		super();
		this.onComplete(() => this.provideRequestContext());
	}

	getSettingSupplier() {
		return this.settingSupplier;
	}

	executeLazy(
		provider: (
			old: typeof this.contextProvider,
			getSelf: () => this,
		) => typeof this.contextProvider,
	) {
		this.contextProvider = provider(this.contextProvider, () => this);
		return this;
	}

	executeLazyLast(
		provider: (
			old: typeof this.contextProvider,
			getSelf: () => this,
		) => typeof this.contextProvider,
	) {
		this.afterContextExecutor = provider(this.afterContextExecutor, () => this);
		return this;
	}

	protected provideRequestContext() {
		return E.gen(this, function* () {
			const session = yield* E.serviceOptional(RequestSession);
			const requestContext = yield* E.serviceOptional(RequestSessionContext);
			/**
			 * 1. Prepare initial request data.
			 * 2. Request id update should be first
			 * to prevent accidental data wipe.
			 * */
			yield* session.setRequestId(this.getRequestId()).pipe(
				E.andThen(() =>
					E.gen(this, function* () {
						/**
						 * Set setting provider first
						 * */
						yield* requestContext.setSettingSupplier(this.settingSupplier);
						/**
						 * 1. Must be second.
						 * 2. We need to make sure all context provide effects
						 * have access to latest request session data.
						 * */
						yield* this.contextProvider;
						/**
						 * Must be last
						 * */
						yield* this.afterContextExecutor;
					}),
				),
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
