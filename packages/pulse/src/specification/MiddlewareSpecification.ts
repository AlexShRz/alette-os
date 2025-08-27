import { MiddlewareCategory, RequestCategory } from "./specTypes";

export class MiddlewareSpecification<
	Categories extends MiddlewareCategory[] = [],
	ApplicableTo extends RequestCategory[] = [],
	NotApplicableTo extends RequestCategory[] = [],
> {
	constructor(
		protected config: {
			categories: Categories;
			applicableTo: ApplicableTo;
			notApplicableTo: NotApplicableTo;
		},
	) {}

	isApplicable(...requestCategories: RequestCategory[]) {
		return requestCategories.every(
			(cat) =>
				this.config.applicableTo.includes(cat) && !this.isNotApplicable(cat),
		);
	}

	isNotApplicable(request: RequestCategory) {
		return this.config.notApplicableTo.includes(request);
	}

	getApplicableTo(): RequestCategory[] {
		return this.config.applicableTo;
	}

	getNotApplicableTo(): RequestCategory[] {
		return this.config.notApplicableTo;
	}

	getCategories(): MiddlewareCategory[] {
		return this.config.categories;
	}
}
