import { ISchema, validateSchema } from "@alette/pulse";
import * as E from "effect/Effect";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { GlobalContext } from "../context/services/GlobalContext";
import { panic } from "../errors/utils/panic";
import { AuthEntityCredentialConfig } from "./AuthEntityCredentialConfig";
import { TAuthEntityCredentialSupplier, TAuthEntityType } from "./AuthTypes";
import {
	AuthEntityCredentialValidationError,
	AuthEntityCredentialsNotSetError,
} from "./errors";

export class AuthEntityCredentials extends E.Service<AuthEntityCredentials>()(
	"AuthEntityCredentials",
	{
		scoped: E.fn(function* (
			authEntityType: TAuthEntityType,
			config: AuthEntityCredentialConfig,
		) {
			const globalContext = yield* GlobalContext;
			const state = yield* SynchronizedRef.make<{
				credentials: unknown | null;
				schema: ReturnType<AuthEntityCredentialConfig["getSchema"]>;
			}>({
				credentials: null,
				schema: config.getSchema(),
			});

			return {
				getId() {
					return config.getId();
				},

				get() {
					return E.gen(this, function* () {
						const { credentials } = yield* state.get;
						return credentials;
					});
				},

				getOrThrow<Credentials = unknown>() {
					return E.gen(this, function* () {
						const credentials = yield* this.get();

						if (credentials === null) {
							return yield* new AuthEntityCredentialsNotSetError(
								authEntityType,
							);
						}

						return credentials as Credentials;
					});
				},

				set(credentialSupplier: TAuthEntityCredentialSupplier) {
					return SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
						E.gen(function* () {
							const context = yield* globalContext.get();
							const newCredentials = yield* E.promise(() =>
								credentialSupplier({
									context,
								}),
							);

							const { schema } = currentState;

							try {
								const validatedCredentials = validateSchema(
									schema,
									newCredentials,
								);
								return {
									...currentState,
									supplier: credentialSupplier,
									credentials: validatedCredentials,
								};
							} catch (e) {
								return yield* panic(
									new AuthEntityCredentialValidationError(
										authEntityType,
										newCredentials,
									),
								);
							}
						}),
					);
				},

				setSchema<In, Out>(newSchema: ISchema<In, Out>) {
					return SynchronizedRef.getAndUpdateEffect(state, (currentState) =>
						E.gen(function* () {
							return {
								...currentState,
								schema: newSchema,
							};
						}),
					);
				},
			};
		}),
	},
) {}
