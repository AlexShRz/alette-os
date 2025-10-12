import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { IRequestContext } from "../../context";
import { RequestContextPart } from "../../context/RequestContextPart";
import { TKnownRequestContextKey } from "../../context/TKnownRequestContextKey";
import { GlobalContext } from "../../context/services/GlobalContext";
import { TRequestSettings } from "../../context/typeUtils/RequestIOTypes";

interface IAllContext
	extends Record<
		TKnownRequestContextKey,
		SynchronizedRef.SynchronizedRef<RequestContextPart<any, any>>
	> {}

export interface IRequestSettingSupplier<
	Context extends IRequestContext = IRequestContext,
> {
	(): TRequestSettings<Context>;
}

export class RequestSessionContext extends E.Service<RequestSessionContext>()(
	"RequestSessionContext",
	{
		scoped: E.gen(function* () {
			const globalContext = yield* GlobalContext;
			const context = yield* SynchronizedRef.make({} as IAllContext);
			const settingSupplierHolder =
				yield* SynchronizedRef.make<IRequestSettingSupplier>(() => ({}));

			const getSessionContextWithoutGlobalContext = E.fn(function* (
				allContext: IAllContext,
			) {
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
			});

			return {
				has(key: TKnownRequestContextKey) {
					return context.get.pipe(E.andThen((v) => !!v[key]));
				},

				getSettingSupplier() {
					return settingSupplierHolder.get;
				},

				/**
				 * Always returns unknown because we
				 * cannot infer request context type here in any way.
				 * */
				getSnapshot() {
					return context.get.pipe(
						E.andThen((allContext) =>
							E.gen(function* () {
								const aggregated =
									yield* getSessionContextWithoutGlobalContext(allContext);
								return { ...aggregated, context: yield* globalContext.get() };
							}),
						),
					);
				},

				getSnapshotWithoutGlobalContext() {
					return context.get.pipe(
						E.andThen((allContext) =>
							getSessionContextWithoutGlobalContext(allContext),
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

				setSettingSupplier(supplier: IRequestSettingSupplier) {
					return SynchronizedRef.getAndUpdate(
						settingSupplierHolder,
						() => supplier,
					);
				},

				reset() {
					return SynchronizedRef.set(
						context,
						/**
						 * Reset context on request id change
						 * */
						{} as IAllContext,
					);
				},
			};
		}),
	},
) {}
