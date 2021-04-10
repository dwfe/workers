import * as express from 'express'
import {resolve, join} from 'path'
import * as fs from 'fs'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import * as uaParser from 'ua-parser-js'
import { log } from './src/common'

const SRC = resolve(__dirname, 'src')
const STATIC = resolve('../tests-sw-fetch-is-not-limited-by-scope')
// const STATIC = resolve('../tests-sw-cache-skip-waiting/build')
// const STATIC = resolve('.')

const textParser = bodyParser.text()
const port = 2020

const app = express()
app.use(cors())
app.use((req, res, next) => {
  const {browser, os} = uaParser(req.get('user-agent'))
  log(`${os?.name}/${browser?.name}>`, req.url)
  res.set('Cache-Control', 'no-store')
  next()
})
app.set('etag', false)
app.use(express.static(STATIC))

app.get('/', (req, res) => {
  const body = fs.readFileSync(join(STATIC, 'index.html'))
  res.send(body)
})

// app.get('/banana', (req, res) => {
//   const body = fs.readFileSync(path.join(STATIC, 'banana', 'index.html'))
//   res.send(body)
// })
// app.get('/version/app', (req, res) => {
//   res.send('32.0.438')
// })
// app.get('/version/tiles', (req, res) => {
//   res.send('0')
// })

// app.get('/version/:id', (req, res) => {
//   const body = fs.readFileSync(join(STATIC, 'version', req.params.id))
//   res.send(body)
// })

app.listen(port, () => {
  console.log(`> the server is running, try http://localhost:${port}`)
})
