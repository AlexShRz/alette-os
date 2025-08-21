import { Label } from "./Label";

export class RequestLabel<
	const Label extends string = string,
> extends Label<Label> {
	static from<const Label extends string>(label: Label) {
		return new RequestLabel(label);
	}

	clone() {
		return this.cloneWith<RequestLabel<Label>>((self) => {
			self.labelTag = this.labelTag;
			return self;
		});
	}
}
