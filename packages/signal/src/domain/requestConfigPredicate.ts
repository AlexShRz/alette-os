import { IHeaders, THttpBody } from "@alette/pulse";
import * as P from "effect/Predicate";

/**
 * Basic
 * */
export const hasBody = (object: unknown): object is { body: THttpBody } =>
	P.hasProperty(object, "body");

export const hasHeaders = (object: unknown): object is { headers: IHeaders } =>
	P.hasProperty(object, "headers") && P.isRecord(object.headers);

/**
 * Credential related
 * */
export const hasCredentials = (
	object: unknown,
): object is { credentials: RequestCredentials } =>
	P.hasProperty(object, "credentials") &&
	P.isString(object.credentials) &&
	(["include", "omit", "same-origin"] as RequestCredentials[]).includes(
		object.credentials as RequestCredentials,
	);
