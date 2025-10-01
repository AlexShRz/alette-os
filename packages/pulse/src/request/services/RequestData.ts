import * as E from "effect/Effect";
import { THttpBody } from "../../body";
import { IHeaders } from "../../headers";
import { THttpMethod } from "../../method";
import { UrlBuilder } from "../../url";
import { RequestRouteNotProvidedError } from "../errors";

export interface IRequestDataProps {
	method: THttpMethod;
	route?: UrlBuilder;
	body?: THttpBody | null;
	headers?: IHeaders | null;
	mode: RequestInit["mode"];
	signal?: AbortSignal;
	credentials: RequestInit["credentials"];
}

export interface IFilledRequestData extends Omit<IRequestDataProps, "route"> {
	route: UrlBuilder;
}

export class RequestData extends E.Service<RequestData>()("RequestData", {
	accessors: true,
	scoped: E.gen(function* () {
		let config: IRequestDataProps = {
			method: "GET",
			mode: "cors",
			credentials: "omit",
		};

		return {
			get() {
				return config;
			},

			validateAndGet() {
				return E.gen(function* () {
					if (!config.route) {
						return yield* new RequestRouteNotProvidedError();
					}

					return config as IFilledRequestData;
				});
			},

			update(newConfig: Partial<IRequestDataProps>) {
				config = {
					...config,
					...newConfig,
				};
			},
		};
	}),
}) {}
