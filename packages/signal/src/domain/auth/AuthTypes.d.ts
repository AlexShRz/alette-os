import { TRequestGlobalContext } from "../context/typeUtils/RequestIOTypes";

export type TAuthEntityType = "token" | "cookie";

export type TAuthEntityCredentialSupplier<Credentials = unknown> = (
	options: TRequestGlobalContext,
) => Promise<Credentials>;
