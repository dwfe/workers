import {Configuration} from 'webpack';
import {join} from 'path';
import {common, MODULE_SW_FILENAME, ROOT_DIST_DIR, ROOT_PUBLIC_DIR, SW_FILENAME, TESTS_PUBLIC_DIR} from './common.config';
import {CopyFiles} from './plugins/copy-files';

export default {
  ...common,
  mode: 'development',
  plugins: [
    new CopyFiles([
      [join(ROOT_DIST_DIR, MODULE_SW_FILENAME), join(TESTS_PUBLIC_DIR, MODULE_SW_FILENAME)],
      [join(ROOT_PUBLIC_DIR, SW_FILENAME), join(TESTS_PUBLIC_DIR, SW_FILENAME)]
    ])
  ],
  devtool: 'inline-source-map'
} as Configuration;
