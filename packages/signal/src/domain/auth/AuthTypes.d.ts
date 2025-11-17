import { TRequestGlobalContext } from "../context/typeUtils/RequestIOTypes";

export type TAuthEntityType = "token" | "cookie";

export type TAuthEntityCredentialSupplier<Credentials = unknown> = (
	options: TRequestGlobalContext & { previous: NoInfer<Credentials> | null },
) => Promise<Credentials>;

export type TAuthEntityStatus = "invalid" | "valid" | "uninitialized";
