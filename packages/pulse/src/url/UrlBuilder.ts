import { AbstractBuilder } from "../utils/AbstractBuilder";
import { CannotCreateUrlError } from "./error/CannotCreateUrlError";
import { CannotCreateUrlFromInstanceError } from "./error/CannotCreateUrlFromInstanceError";
import { CannotSetHashError } from "./error/CannotSetHashError";
import { CannotSetHostError } from "./error/CannotSetHostError";
import { CannotSetOriginError } from "./error/CannotSetOriginError";
import { CannotSetPathError } from "./error/CannotSetPathError";
import { CannotSetPortError } from "./error/CannotSetPortError";
import { CannotSetProtocol } from "./error/CannotSetProtocolError";
import { IQueryParams } from "./queryParams/IQueryParams";
import { UrlQueryParamsBuilder } from "./queryParams/UrlQueryParamsBuilder";

export declare namespace UrlPart {
	// TODO: Add strict types
	type Path = `/${string}` | string;
	type Hash = `#${string}` | string;
	type Host = `${string}.${string}` | string;
	type Port = `${number}` | string;
	type Protocol = `${string}:` | string;
	type Origin =
		| `${Exclude<UrlPart.Protocol, "">}//${Exclude<UrlPart.Host, "">}`
		| `${Exclude<UrlPart.Protocol, "">}//${Exclude<UrlPart.Host, "">}:${Exclude<UrlPart.Port, "">}`
		| string;
}

export interface IUrlConstructor<QueryParams extends IQueryParams = any> {
	(options: {
		origin: string;
		port: string;
		hash: string;
		path: string;
		host: string;
		protocol: string;
		queryParams: UrlQueryParamsBuilder<QueryParams>;
	}): string;
}

export class UrlBuilder<
	QueryParams extends IQueryParams = any,
> extends AbstractBuilder<UrlBuilder<QueryParams>> {
	protected path = "";
	protected port = "";
	protected host = "";
	protected hash = "";
	protected protocol = "";
	protected searchParams = new UrlQueryParamsBuilder<QueryParams>();

	/**
	 * Actual url constructor - used for
	 * converting all url data to a proper URL string.
	 * */
	protected constructUrl: IUrlConstructor<QueryParams> = ({
		path,
		hash,
		port,
		host,
		queryParams,
		protocol,
	}) => {
		const protocolPart = protocol || "";
		const hostPart = host || "";
		const portPart = port ? `:${port}` : "";
		const pathPart = path || "";
		const queryString = queryParams.toString();
		const queryPart = queryString ? `${queryString}` : "";
		const hashPart = hash || "";

		return `${protocolPart}//${hostPart}${portPart}${pathPart}${queryPart}${hashPart}`;
	};

	static isValidUrl(urlValue: unknown) {
		try {
			new URL(urlValue as string);
			return true;
		} catch {
			return false;
		}
	}

	getOrigin() {
		try {
			return new URL(
				`${this.protocol}//${this.host}${this.port ? `:${this.port}` : ""}`,
			).origin;
		} catch (e) {
			return "";
		}
	}

	getProtocol() {
		return this.protocol;
	}

	getPort() {
		return this.port;
	}

	getPath() {
		return this.path;
	}

	getHash() {
		return this.hash;
	}

	getHost() {
		return this.host;
	}

	getParams() {
		return this.searchParams;
	}

	getRawParams() {
		return this.searchParams.get();
	}

	setOrigin(origin: UrlPart.Origin) {
		if (!origin) {
			this.host = "";
			this.port = "";
			this.protocol = "";
			return this;
		}

		try {
			const data = new URL(origin);
			return this.setProtocol(data.protocol as any)
				.setHost(data.hostname as any)
				.setPort(data.port as any);
		} catch (e) {
			throw new CannotSetOriginError(origin, e);
		}
	}

	setParams<UpdatedQueryParams extends IQueryParams>(
		params: UrlQueryParamsBuilder<UpdatedQueryParams>,
	): UrlBuilder<UpdatedQueryParams> {
		this.searchParams = params.clone() as any;
		return this as any;
	}

	setProtocol(protocol: UrlPart.Protocol) {
		if (!protocol) {
			this.protocol = protocol;
			return this;
		}

		try {
			this.protocol = new URL(`${protocol}//localhost:8888/`).protocol;
			return this;
		} catch (e) {
			throw new CannotSetProtocol(protocol, e);
		}
	}

	setPath(path: UrlPart.Path) {
		if (!path) {
			this.path = path;
			return this;
		}

		try {
			/**
			 * Make sure to use JUST the pathname, without any query params.
			 * If we pass something like "/path?param=hey" only "/path" will be set
			 * */
			this.path = new URL(`http://localhost:8888${path}`).pathname;
			return this;
		} catch (e) {
			throw new CannotSetPathError(path, e);
		}
	}

	setHash(hash: UrlPart.Hash) {
		if (!hash) {
			return this;
		}

		try {
			this.hash = new URL(`http://localhost:8888${hash}`).hash;
			return this;
		} catch (e) {
			throw new CannotSetHashError(hash, e);
		}
	}

	setHost(host: UrlPart.Host) {
		if (!host) {
			this.host = host;
			return this;
		}

		try {
			const data = new URL(`https://${host}:8888/`);
			this.host = data.hostname;
			return this;
		} catch (e) {
			throw new CannotSetHostError(host, e);
		}
	}

	setPort(port: UrlPart.Port) {
		if (!port) {
			return this;
		}

		try {
			this.port = new URL(`http://localhost:${port}/`).port;
			return this;
		} catch (e) {
			throw new CannotSetPortError(port, e);
		}
	}

	setConstructor(constructor: IUrlConstructor<QueryParams>) {
		this.constructUrl = constructor;
		return this;
	}

	static fromUrlInstance(urlInstance: URL) {
		try {
			return new UrlBuilder()
				.setOrigin(urlInstance.origin as UrlPart.Origin)
				.setPath(urlInstance.pathname as UrlPart.Path)
				.setHash(urlInstance.hash as UrlPart.Hash)
				.setHost(urlInstance.host as UrlPart.Host)
				.setPort(urlInstance.port as UrlPart.Port)
				.setProtocol(urlInstance.protocol as UrlPart.Protocol)
				.setParams(
					UrlQueryParamsBuilder.fromUrlParams(urlInstance.searchParams),
				);
		} catch (e) {
			throw new CannotCreateUrlFromInstanceError(urlInstance, e);
		}
	}

	static fromOrThrow(url: string, origin?: string) {
		try {
			return UrlBuilder.fromUrlInstance(new URL(url, origin));
		} catch (e) {
			throw new CannotCreateUrlError(url, e);
		}
	}

	clone() {
		return this.cloneWith((self) => {
			self.host = this.host;
			self.hash = this.hash;
			self.port = this.port;
			self.protocol = this.protocol;
			self.path = this.path;
			self.searchParams = this.searchParams.clone();
			self.constructUrl = this.constructUrl;
			return self;
		});
	}

	build() {
		return this.toString();
	}

	override toString() {
		return this.constructUrl({
			protocol: this.getProtocol(),
			host: this.getHost(),
			path: this.getPath(),
			origin: this.getOrigin(),
			queryParams: this.getParams(),
			hash: this.getHash(),
			port: this.getPort(),
		});
	}
}
