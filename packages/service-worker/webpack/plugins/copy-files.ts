import { closeSync, copyFileSync, openSync, PathLike } from "fs";
import { Compiler, Plugin } from "webpack";

export class CopyFiles implements Plugin {
  constructor(
    private fromToMap: Map<PathLike, PathLike>,
    private compilerHookName = "done" // https://v4.webpack.js.org/api/compiler-hooks
  ) {}

  apply(compiler: Compiler) {
    compiler.hooks[this.compilerHookName].tap("Copy files", () => {
      {
        console.log(
          `==========================\r\n Copying files \r\n==========================`
        );
        Array.from(this.fromToMap).forEach(([from, to]) => {
          try {
            console.log(` > copy '${from}' -> '${to}'`);
            copyFileSync(from, to);

            console.log(` > done!`);
          } catch (e) {
            closeSync(openSync(to, "w"));
            console.error(e);
          }
        });
        console.log(`==========================\r\n`);
      }
    });
  }
}
