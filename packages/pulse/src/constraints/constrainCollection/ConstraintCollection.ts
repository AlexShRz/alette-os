import { AbstractBuilder } from "../../utils/AbstractBuilder";
import { Label } from "../labels/Label";

export abstract class ConstraintCollection<
	SelfLabelType extends Label = Label,
	IncompatibleLabelType extends Label = Label,
> extends AbstractBuilder<
	ConstraintCollection<SelfLabelType, IncompatibleLabelType>
> {
	protected selfLabels: SelfLabelType[] = [];
	protected incompatibleLabels: IncompatibleLabelType[] = [];

	setLabelsForSelf(labels: SelfLabelType[]) {
		this.selfLabels = [...labels];
		return this;
	}

	setIncompatible(labels: IncompatibleLabelType[]) {
		this.incompatibleLabels = [...labels];
		return this;
	}
}
