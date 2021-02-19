import {Configuration} from 'webpack';
import {join, resolve} from 'path';

export const SW_FILENAME = 'sw.js';
export const MODULE_SW_FILENAME = 'module.sw.js';

export const PACKAGES_DIR = resolve(__dirname, '../../../../');                              // 'packages'
export const TESTS_PUBLIC_DIR = join(PACKAGES_DIR, 'tests-sw-cache-skip-waiting', 'public'); // 'packages/tests-sw-cache-skip-waiting/public'
export const ROOT_DIR = join(PACKAGES_DIR, 'service-worker-skip-waiting');                   // 'packages/service-worker-skip-waiting'
export const ROOT_PUBLIC_DIR = join(ROOT_DIR, 'public');                                     // 'packages/service-worker-skip-waiting/public'
export const ROOT_DIST_DIR = join(ROOT_DIR, 'dist');                                         // 'project/sw/dist'

export const common: Configuration = {
  entry: join(ROOT_DIST_DIR, 'esm/index.js'),
  output: {
    path: ROOT_DIST_DIR,
    filename: MODULE_SW_FILENAME
  }
};
