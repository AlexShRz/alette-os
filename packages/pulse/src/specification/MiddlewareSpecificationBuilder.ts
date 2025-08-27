import { MiddlewareSpecification } from "./MiddlewareSpecification";
import { MiddlewareCategory, RequestCategory } from "./specTypes";

export const middlewareSpecification = () =>
	new MiddlewareSpecificationBuilder();

export class MiddlewareSpecificationBuilder<
	Categories extends MiddlewareCategory[] = [],
	ApplicableTo extends RequestCategory[] = [],
	NotApplicableTo extends RequestCategory[] = [],
> {
	protected categories: MiddlewareCategory[] = [];
	protected applicable: RequestCategory[] = [];
	protected notApplicable: RequestCategory[] = [];

	categorizedAs<T extends MiddlewareCategory[]>(
		...categories: [...T]
	): MiddlewareSpecificationBuilder<T, ApplicableTo, NotApplicableTo> {
		this.categories = [...categories];
		return this as any;
	}

	applicableTo<T extends RequestCategory[]>(
		...applicableTo: [...T]
	): MiddlewareSpecificationBuilder<Categories, T, NotApplicableTo> {
		this.applicable = [...applicableTo];
		return this as any;
	}

	notApplicableTo<T extends RequestCategory[]>(
		...notApplicableTo: [...T]
	): MiddlewareSpecificationBuilder<Categories, ApplicableTo, T> {
		this.notApplicable = [...notApplicableTo];
		return this as any;
	}

	build(): MiddlewareSpecification<Categories, ApplicableTo, NotApplicableTo> {
		return new MiddlewareSpecification({
			notApplicableTo: this.notApplicable,
			applicableTo: this.applicable,
			categories: this.categories,
		}) as any;
	}
}
