import { join, resolve } from "path";

export const SW_FILENAME = "sw.js";
export const MODULE_SW_FILENAME = "module.sw.js";

export const PROJ_DIR = resolve(__dirname, "../../../../"); // 'project'
export const PROJ_PUBLIC_DIR = join(PROJ_DIR, "tests-sw-cache-skip-waiting","public"); // 'project/public'
export const ROOT_DIR = join(PROJ_DIR, "service-worker"); // 'project/sw'
export const PUBLIC_DIR = join(ROOT_DIR, "public"); // 'project/sw/public'
export const DIST_DIR = join(ROOT_DIR, "dist"); // 'project/sw/dist'
