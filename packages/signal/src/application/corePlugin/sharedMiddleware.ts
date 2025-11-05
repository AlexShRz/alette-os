import { RequestFailedError } from "@alette/pulse";
import { throws } from "../../domain";

export const withRecognizedErrors = throws(RequestFailedError);
