import { MiddlewareCategory, RequestCategory } from "../specTypes";

export interface IAnyMiddlewareSpecification
	extends MiddlewareSpecification<any, any> {}

export class MiddlewareSpecification<
	Categories extends MiddlewareCategory[] = [],
	NotApplicableTo extends RequestCategory[] = [],
> {
	constructor(
		protected config: {
			categories: Categories;
			notApplicableTo: NotApplicableTo;
		},
	) {}

	isApplicable(...requestCategories: RequestCategory[]) {
		return requestCategories.every((cat) => !this.isNotApplicable(cat));
	}

	isNotApplicable(request: RequestCategory) {
		return this.config.notApplicableTo.includes(request);
	}

	getNotApplicableTo(): RequestCategory[] {
		return this.config.notApplicableTo;
	}

	getCategories(): MiddlewareCategory[] {
		return this.config.categories;
	}
}
