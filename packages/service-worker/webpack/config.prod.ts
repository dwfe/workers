import { join } from "path";
import { Configuration } from "webpack";
import { DIST_DIR, MODULE_SW_FILENAME, PUBLIC_DIR } from "./contract";
import { CopyFiles } from "./plugins/copy-files";
import { common } from "./common.config";

export default {
  ...common,
  mode: "production",
  plugins: [
    new CopyFiles(
      new Map([
        [
          join(DIST_DIR, MODULE_SW_FILENAME),
          join(PUBLIC_DIR, MODULE_SW_FILENAME)
        ]
      ])
    )
  ]
} as Configuration;
