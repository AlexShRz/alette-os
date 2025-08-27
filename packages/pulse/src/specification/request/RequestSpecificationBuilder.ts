import { MiddlewareCategory, RequestCategory } from "../specTypes";
import { RequestSpecification } from "./RequestSpecification";

export const requestSpecification = () => new RequestSpecificationBuilder();

export class RequestSpecificationBuilder<
	Categories extends RequestCategory[] = [],
	ApplicableTo extends MiddlewareCategory[] = [],
	NotApplicableTo extends MiddlewareCategory[] = [],
> {
	protected categories: RequestCategory[] = [];
	protected accepted: MiddlewareCategory[] = [];
	protected prohibited: MiddlewareCategory[] = [];

	categorizedAs<T extends RequestCategory[]>(
		...categories: [...T]
	): RequestSpecificationBuilder<T, ApplicableTo, NotApplicableTo> {
		this.categories = [...categories];
		return this as any;
	}

	accepts<T extends MiddlewareCategory[]>(
		...accepted: [...T]
	): RequestSpecificationBuilder<Categories, T, NotApplicableTo> {
		this.accepted = [...accepted];
		return this as any;
	}

	prohibits<T extends MiddlewareCategory[]>(
		...prohibited: [...T]
	): RequestSpecificationBuilder<Categories, ApplicableTo, T> {
		this.prohibited = [...prohibited];
		return this as any;
	}

	build(): RequestSpecification<Categories, ApplicableTo, NotApplicableTo> {
		return new RequestSpecification({
			categories: this.categories,
			accepts: this.accepted,
			prohibits: this.prohibited,
		}) as any;
	}
}
