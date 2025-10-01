import { MiddlewareCategory, RequestCategory } from "../specTypes";

export interface IAnyRequestSpecification
	extends RequestSpecification<any, any, any> {}

export class RequestSpecification<
	Categories extends RequestCategory[] = [],
	Accepts extends MiddlewareCategory[] = [],
	Prohibits extends MiddlewareCategory[] = [],
> {
	constructor(
		protected config: {
			categories: Categories;
			accepts: Accepts;
			prohibits: Prohibits;
		},
	) {}

	isProhibited(middleware: MiddlewareCategory) {
		return this.config.prohibits.includes(middleware);
	}

	canAccept(...middlewareCategory: MiddlewareCategory[]) {
		return middlewareCategory.every(
			(cat) => this.config.accepts.includes(cat) && !this.isProhibited(cat),
		);
	}

	getAccepted(): MiddlewareCategory[] {
		return this.config.accepts;
	}

	getProhibited(): MiddlewareCategory[] {
		return this.config.prohibits;
	}

	getCategories(): RequestCategory[] {
		return this.config.categories;
	}
}
