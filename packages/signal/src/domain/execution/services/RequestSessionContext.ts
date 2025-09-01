import * as E from "effect/Effect";
import * as Stream from "effect/Stream";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { RequestContextPart } from "../../context/RequestContextPart";
import { TKnownRequestContextKey } from "../../context/TKnownRequestContextKey";
import { RequestSession } from "./RequestSession";

interface IAllContext
	extends Record<
		TKnownRequestContextKey,
		SynchronizedRef.SynchronizedRef<RequestContextPart<any, any>>
	> {}

export class RequestSessionContext extends E.Service<RequestSessionContext>()(
	"RequestSessionContext",
	{
		scoped: E.gen(function* () {
			const session = yield* RequestSession;
			const context = yield* SynchronizedRef.make({} as IAllContext);

			yield* session.getRequestIdChanges().pipe(
				Stream.tap(() =>
					SynchronizedRef.set(
						context,
						/**
						 * Reset context on request id change
						 * */
						{} as IAllContext,
					),
				),
				Stream.runDrain,
				E.forkScoped,
			);

			return {
				has(key: TKnownRequestContextKey) {
					return context.get.pipe(E.andThen((v) => !!v[key]));
				},

				/**
				 * Always returns unknown because we
				 * cannot infer request context type here in any way.
				 * */
				getSnapshot() {
					return context.get.pipe(
						E.andThen((allContext) =>
							E.gen(function* () {
								let aggregated: Record<string, unknown> = {};

								for (const key of Object.keys(
									allContext,
								) as (keyof typeof allContext)[]) {
									const obtained = yield* SynchronizedRef.get(allContext[key]);
									aggregated = {
										...aggregated,
										...obtained.toRecord(),
									};
								}

								return aggregated;
							}),
						),
					);
				},

				getOrThrow<T extends RequestContextPart>(key: TKnownRequestContextKey) {
					return E.gen(function* () {
						const allContext = yield* context.get;
						const value = allContext[key];

						if (!value) {
							return yield* E.dieMessage(`Cannot find value with key "${key}"`);
						}

						return value as unknown as SynchronizedRef.SynchronizedRef<T>;
					});
				},

				getOrCreate<T extends RequestContextPart>(
					key: TKnownRequestContextKey,
					createContextPart: E.Effect<T>,
				) {
					return SynchronizedRef.getAndUpdateEffect(context, (allContext) =>
						E.gen(function* () {
							const current = allContext[key];

							if (current) {
								return allContext;
							}

							allContext[key] = yield* SynchronizedRef.make<RequestContextPart>(
								yield* createContextPart,
							);
							return allContext;
						}),
					).pipe(E.andThen(() => this.getOrThrow<T>(key)));
				},
			};
		}),
	},
) {}
