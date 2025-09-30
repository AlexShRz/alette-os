import { ISchema, validateSchema } from "@alette/pulse";
import { ArgumentRef } from "./ArgumentRef";
import { ArgumentValidationError } from "./errors";

export class ArgumentAdapter<Arguments = unknown> {
	constructor(
		protected config: {
			schema: ISchema<unknown, Arguments>;
			createRef: (value: Arguments) => ArgumentRef<Arguments>;
		},
	) {}

	getSchema() {
		return this.config.schema;
	}

	from(args: Arguments | unknown) {
		const validated = this.validateArguments(args);
		return this.config.createRef(validated);
	}

	protected validateArguments(args: unknown) {
		try {
			return validateSchema(this.getSchema(), args);
		} catch (e) {
			throw new ArgumentValidationError(args, e);
		}
	}
}
