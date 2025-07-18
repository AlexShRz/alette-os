// import * as crypto from "node:crypto";
import {} from "effect";
import { v4 as uuid } from "uuid";

export abstract class Event {
	protected isCancelled = false;
	protected id = uuid();
}
