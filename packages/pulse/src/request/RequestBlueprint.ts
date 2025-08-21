import { AbstractBuilder } from "../utils/AbstractBuilder";

export class RequestBlueprint extends AbstractBuilder<RequestBlueprint> {
	with() {
		return this;
	}
}
