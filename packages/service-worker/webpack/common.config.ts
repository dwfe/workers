import { join } from "path";
import { Configuration } from "webpack";
import { DIST_DIR, MODULE_SW_FILENAME } from "./contract";

export const common: Configuration = {
  entry: join(DIST_DIR, "esm/index.js"),
  output: {
    path: DIST_DIR,
    filename: MODULE_SW_FILENAME
  }
};
