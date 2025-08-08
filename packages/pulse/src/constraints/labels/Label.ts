import { AbstractBuilder } from "../../utils/AbstractBuilder";

export abstract class Label<
	const LabelText extends string = string,
> extends AbstractBuilder<Label<LabelText>> {
	constructor(protected labelTag: LabelText) {
		super();
	}

	is(anotherLabel: Label): anotherLabel is this {
		return this.get() === anotherLabel.get();
	}

	get() {
		return this.labelTag;
	}
}
