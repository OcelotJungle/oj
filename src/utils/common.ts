import { sleep as _sleep } from "./promises";
import { capitalize } from "./string";
import { bound } from "./math";

global.sleep = _sleep;
Math.bound = bound;
String.prototype.capitalize = capitalize;