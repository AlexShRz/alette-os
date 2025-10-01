import { MiddlewareCategory, RequestCategory } from "../specTypes";
import { MiddlewareSpecification } from "./MiddlewareSpecification";

export const middlewareSpecification = () =>
	new MiddlewareSpecificationBuilder();

/**
 * 1. All middleware are applicable BY DEFAULT for
 * every request.
 * 2. If we want to prohibit a middleware for some custom middleware
 * we should do that manually inside that request specification
 * */
export class MiddlewareSpecificationBuilder<
	Categories extends MiddlewareCategory[] = [],
	ApplicableTo extends RequestCategory[] = [],
	NotApplicableTo extends RequestCategory[] = [],
> {
	protected categories: MiddlewareCategory[] = [];
	protected notApplicable: RequestCategory[] = [];

	categorizedAs<T extends MiddlewareCategory[]>(
		...categories: [...T]
	): MiddlewareSpecificationBuilder<T, ApplicableTo, NotApplicableTo> {
		this.categories = [...categories];
		return this as any;
	}

	notApplicableTo<T extends RequestCategory[]>(
		...notApplicableTo: [...T]
	): MiddlewareSpecificationBuilder<Categories, ApplicableTo, T> {
		this.notApplicable = [...notApplicableTo];
		return this as any;
	}

	build(): MiddlewareSpecification<Categories, NotApplicableTo> {
		return new MiddlewareSpecification({
			notApplicableTo: this.notApplicable,
			categories: this.categories,
		}) as any;
	}
}
