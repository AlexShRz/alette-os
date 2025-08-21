import { Constraint } from "./Constraint";
import { RequestConstraintCollection } from "./constrainCollection/RequestConstraintCollection";
import { MiddlewareLabel } from "./labels/MiddlewareLabel";
import { RequestLabel } from "./labels/RequestLabel";

export class RequestConstraint<
	SelfLabels extends string[] = [],
	IncompatibleWith extends string[] = [],
	CompatibleWith extends string[] = [],
> extends Constraint {
	protected selfLabels: RequestLabel[] = [];
	protected _incompatibleWith: MiddlewareLabel[] = [];
	protected _compatibleWith: MiddlewareLabel[] = [];

	static from() {
		return new RequestConstraint();
	}

	as<const NewLabels extends string[]>(
		...labels: { [K in keyof NewLabels]: MiddlewareLabel<NewLabels[K]> }
	): RequestConstraint<[...SelfLabels, ...NewLabels], IncompatibleWith> {
		this.selfLabels = [...this.selfLabels, ...labels];
		return this as any;
	}

	compatibleWith<const NewLabels extends string[]>(
		...labels: { [K in keyof NewLabels]: RequestLabel<NewLabels[K]> }
	): RequestConstraint<SelfLabels, [...CompatibleWith, ...NewLabels]> {
		this._compatibleWith = [...this._compatibleWith, ...labels];
		return this as any;
	}

	incompatibleWith<const NewLabels extends string[]>(
		...labels: { [K in keyof NewLabels]: RequestLabel<NewLabels[K]> }
	): RequestConstraint<SelfLabels, [...IncompatibleWith, ...NewLabels]> {
		this._incompatibleWith = [...this._incompatibleWith, ...labels];
		return this as any;
	}

	clone() {
		return this.cloneWith<RequestConstraint<SelfLabels, IncompatibleWith>>(
			(self) => {
				self._incompatibleWith = this._incompatibleWith.map((label) =>
					label.clone(),
				);
				self._compatibleWith = this._compatibleWith.map((label) =>
					label.clone(),
				);
				self.selfLabels = this.selfLabels.map((label) => label.clone());
				return self;
			},
		);
	}

	build() {
		return new RequestConstraintCollection()
			.setCompatible(this._compatibleWith)
			.setIncompatible(this._incompatibleWith)
			.setLabelsForSelf(this.selfLabels);
	}
}
