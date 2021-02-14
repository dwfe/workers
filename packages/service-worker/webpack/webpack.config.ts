import {resolve, join} from 'path'
import {Configuration} from 'webpack'

const DIST = resolve(__dirname, '../../')

export default {
    mode: 'production',
    entry: join(DIST, 'esm/index.js'),
    output:{
        path: DIST,
        filename: 'module.sw.js',
    },
} as Configuration
