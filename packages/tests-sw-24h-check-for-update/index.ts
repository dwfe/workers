import * as express from 'express'
import * as path from 'path'
import * as fs from 'fs'
import * as cors from 'cors'
import * as uaParser from 'ua-parser-js'
import {log} from './src/common'

const SRC = path.resolve(__dirname, 'src')
const STATIC = path.resolve('./public')

const port = 2020

const app = express()
app.use(cors())
app.use((req, res, next) => {
  const {browser, os} = uaParser(req.get('user-agent'))
  log(req.url, `- ${os?.name}/${browser?.name}`)
  next()
})
app.use(express.static(STATIC))


app.get('/', (req, res) => {
  const body = fs.readFileSync(path.join(STATIC, 'index.html'))
  res.send(body)
})

app.get('/sw.js', (req, res) => {
  const body = fs.readFileSync(path.join(STATIC, 'sw.js'))
  res.send(body)
})

app.listen(port, () => {
  console.log(`> the server is running, try http://localhost:${port}`)
})


