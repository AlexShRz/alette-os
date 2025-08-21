import { Constraint } from "./Constraint";
import { MiddlewareConstraintCollection } from "./constrainCollection/MiddlewareContraintCollection";
import { MiddlewareLabel } from "./labels/MiddlewareLabel";
import { RequestLabel } from "./labels/RequestLabel";

export class MiddlewareConstraint<
	SelfLabels extends string[] = [],
	IncompatibleWith extends string[] = [],
> extends Constraint {
	protected selfLabels: MiddlewareLabel[] = [];
	protected _incompatibleWith: RequestLabel[] = [];

	static from() {
		return new MiddlewareConstraint();
	}

	as<const NewLabels extends string[]>(
		...labels: { [K in keyof NewLabels]: MiddlewareLabel<NewLabels[K]> }
	): MiddlewareConstraint<[...SelfLabels, ...NewLabels], IncompatibleWith> {
		this.selfLabels = [...this.selfLabels, ...labels];
		return this as any;
	}

	incompatibleWith<const NewLabels extends string[]>(
		...labels: { [K in keyof NewLabels]: RequestLabel<NewLabels[K]> }
	): MiddlewareConstraint<SelfLabels, [...IncompatibleWith, ...NewLabels]> {
		this._incompatibleWith = [...this._incompatibleWith, ...labels];
		return this as any;
	}

	clone() {
		return this.cloneWith<MiddlewareConstraint<SelfLabels, IncompatibleWith>>(
			(self) => {
				self._incompatibleWith = this._incompatibleWith.map((label) =>
					label.clone(),
				);
				self.selfLabels = this.selfLabels.map((label) => label.clone());
				return self;
			},
		);
	}

	build() {
		return new MiddlewareConstraintCollection()
			.setIncompatible(this._incompatibleWith)
			.setLabelsForSelf(this.selfLabels);
	}
}
