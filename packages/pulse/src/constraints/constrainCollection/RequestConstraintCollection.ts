import { MiddlewareLabel } from "../labels/MiddlewareLabel";
import { RequestLabel } from "../labels/RequestLabel";
import { ConstraintCollection } from "./ConstraintCollection";

export class RequestConstraintCollection extends ConstraintCollection<
	RequestLabel,
	MiddlewareLabel
> {
	protected compatibleLabels: MiddlewareLabel[] = [];

	setCompatible(labels: typeof this.compatibleLabels) {
		this.compatibleLabels = [...labels];
		return this;
	}

	clone() {
		return this.cloneWith<RequestConstraintCollection>((self) => {
			self.incompatibleLabels = [...this.incompatibleLabels];
			self.compatibleLabels = [...this.compatibleLabels];
			self.selfLabels = [...this.selfLabels];
			return self;
		});
	}
}
