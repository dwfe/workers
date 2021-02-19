import {closeSync, copyFileSync, openSync, PathLike} from 'fs';
import {Compiler, Plugin} from 'webpack';

export class CopyFiles implements Plugin {
  constructor(
    private fromToArr: Array<[PathLike, PathLike]>,
    private compilerHookName = 'done' // https://v4.webpack.js.org/api/compiler-hooks
  ) {
  }

  apply(compiler: Compiler) {
    compiler.hooks[this.compilerHookName].tap('Copy files', () => {
      {
        console.log(
          `==========================\r\n Copying files \r\n==========================`
        );
        this.fromToArr.forEach(([from, to]) => {
          try {
            console.log(` > copy '${from}' -> '${to}'`);
            copyFileSync(from, to);

            console.log(` > done!`);
          } catch (e) {
            closeSync(openSync(to, 'w'));
            console.error(e);
          }
        });
        console.log(`==========================\r\n`);
      }
    });
  }
}
