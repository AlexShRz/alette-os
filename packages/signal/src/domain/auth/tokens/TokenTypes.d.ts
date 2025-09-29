import { IHeaders } from "@alette/pulse";
import { TRequestGlobalContext } from "../../context/typeUtils/RequestIOTypes";

export interface ITokenSupplierOptions<Credentials = unknown>
	extends TRequestGlobalContext {
	prevToken: string;
	getCredentialsOrThrow: () => Promise<Credentials>;
	getCredentials: () => Promise<Credentials | null>;
}

export interface ITokenHeaderConverterOptions extends TRequestGlobalContext {
	token: string;
}

export interface ITokenHeaderConverter<Headers extends IHeaders = IHeaders> {
	(options: ITokenHeaderConverterOptions): Headers | Promise<Headers>;
}

export interface ITokenSupplier<Credentials = any> {
	(options: ITokenSupplierOptions<Credentials>): Promise<string> | string;
}

export type TTokenStatus = "invalid" | "valid";
