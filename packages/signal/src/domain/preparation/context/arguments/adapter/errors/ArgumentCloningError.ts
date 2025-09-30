import { FatalApiError } from "@alette/pulse";

export class ArgumentCloningError extends FatalApiError {
	constructor(args: unknown) {
		super(
			"\nArgumentCloningError\n" +
				"Cannot clone request arguments.\n" +
				"Make sure that argument contain only serializable values," +
				"or create a custom argumentAdapter.\n" +
				`Passed arguments - "${args}"`,
		);
	}
}
