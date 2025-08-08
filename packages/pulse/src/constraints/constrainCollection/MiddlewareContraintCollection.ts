import { MiddlewareLabel } from "../labels/MiddlewareLabel";
import { RequestLabel } from "../labels/RequestLabel";
import { ConstraintCollection } from "./ConstraintCollection";

export class MiddlewareConstraintCollection extends ConstraintCollection<
	MiddlewareLabel,
	RequestLabel
> {
	clone() {
		return this.cloneWith<MiddlewareConstraintCollection>((self) => {
			self.incompatibleLabels = [...this.incompatibleLabels];
			self.selfLabels = [...this.selfLabels];
			return self;
		});
	}
}
