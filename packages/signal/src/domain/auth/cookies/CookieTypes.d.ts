import { TRequestGlobalContext } from "../../context/typeUtils/RequestIOTypes";

export interface ICookieSupplierOptions<Credentials = unknown>
	extends TRequestGlobalContext {
	id: string;
	isInvalid: boolean;
	getCredentialsOrThrow: () => Promise<Credentials>;
	getCredentials: () => Promise<Credentials | null>;
}

export interface ICookieSupplier<Credentials = any> {
	(options: ICookieSupplierOptions<Credentials>): Promise<void> | void;
}
