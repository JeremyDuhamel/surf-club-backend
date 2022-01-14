import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { routes } from './routes'

export const app = express()
const port = 3333 //TODO: Move this inside an environment variable

app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

app.use(routes)

app.listen(process.env.PORT ?? port, () => {
  console.log(`Service available on port ${port}`)
})
