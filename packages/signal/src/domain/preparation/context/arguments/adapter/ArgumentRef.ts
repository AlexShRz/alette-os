import { ISchema, validateSchema } from "@alette/pulse";
import { v4 as uuid } from "uuid";
import { IArgumentCloner, IArgumentComparator } from "./ArgumentAdapterBuilder";
import { ArgumentValidationError } from "./errors";

export class ArgumentRef<Arguments = unknown> {
	protected id = uuid();

	constructor(
		protected args: Arguments,
		protected config: {
			schema: ISchema<unknown, Arguments>;
			cloner: IArgumentCloner<Arguments>;
			comparator: IArgumentComparator<Arguments>;
		},
	) {}

	isEqual(that: Arguments | null) {
		return this.config.comparator(that, this.args);
	}

	getId() {
		return this.id;
	}

	get() {
		return this.args;
	}

	set(newArgs: Arguments | unknown) {
		try {
			this.args = validateSchema(this.config.schema, newArgs);
			return this;
		} catch {
			throw new ArgumentValidationError(newArgs);
		}
	}

	clone() {
		return new ArgumentRef(this.config.cloner(this.args), {
			...this.config,
		});
	}
}
