import * as Chunk from "effect/Chunk";
import * as E from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

/**
 * 1. Useful for passing plugin scope to things
 * like controllers.
 * 2. When our plugin is deactivated, the scope must be closed.
 * 3. When we activate the plugin, we should create the scope again.
 * */
export class PluginScope extends E.Service<PluginScope>()("PluginScope", {
	accessors: true,
	scoped: E.gen(function* () {
		const serviceScope = yield* E.scope;
		const activeScope =
			yield* SubscriptionRef.make<Scope.CloseableScope | null>(null);

		yield* E.addFinalizer(
			E.fn(function* () {
				const scope = yield* activeScope.get;

				if (scope) {
					yield* Scope.close(scope, Exit.void);
				}
			}),
		);

		return {
			get() {
				return activeScope.changes.pipe(
					Stream.filter((scope) => !!scope),
					Stream.take(1),
					Stream.runCollect,
					E.andThen((c) => Chunk.unsafeGet(c, 0)),
				);
			},
			set(newScope: Scope.CloseableScope) {
				return SubscriptionRef.getAndUpdateEffect(
					activeScope,
					E.fn(function* (pluginScope) {
						if (pluginScope) {
							yield* Scope.close(pluginScope, Exit.void).pipe(
								E.forkIn(serviceScope),
							);
						}

						return newScope;
					}),
				);
			},
		};
	}),
}) {}
