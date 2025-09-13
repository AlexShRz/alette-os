import { IQueryParams, UrlQueryParamsBuilder, makeUrl } from "@alette/pulse";
import { RequestContextPart } from "../context/RequestContextPart";

export class UrlContext<
	QueryParams extends IQueryParams = IQueryParams,
> extends RequestContextPart<ReturnType<typeof makeUrl>, {}> {
	constructor() {
		super(makeUrl(), {});
	}

	override getAdapter() {
		const self = this;

		return {
			setQueryParams(params: QueryParams) {
				self.state.setParams(new UrlQueryParamsBuilder().set(params));
				return this;
			},
			setPath(path: string) {
				self.state.setPath(path);
				return this;
			},
			setOrigin(newOrigin: string) {
				self.state.setOrigin(newOrigin);
				return this;
			},
		};
	}

	override toRecord() {
		return {
			origin: this.state.getOrigin(),
			queryParams: this.state.getParams().get() as QueryParams,
			path: this.state.getPath(),
		};
	}

	clone() {
		const self = new UrlContext() as this;
		self.state = this.state.clone();
		self.settings = { ...this.settings };
		return self;
	}
}
