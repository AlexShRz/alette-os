import { Label } from "./Label";

export class MiddlewareLabel<
	const Label extends string = string,
> extends Label<Label> {
	static toFactory<const Label extends string>(label: Label) {
		return new MiddlewareLabel(label);
	}

	clone() {
		return this.cloneWith<MiddlewareLabel<Label>>((self) => {
			self.labelTag = this.labelTag;
			return self;
		});
	}
}
