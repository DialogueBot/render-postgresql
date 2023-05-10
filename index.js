import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import bodyParser from 'body-parser'
import config from './config/config.js'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import xss from 'xss-clean'
const app = express()

app.use(morgan('tiny'))
app.use(helmet())
app.use(xss())

app.use(cors())
app.options('*', cors())


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

for (const router of (await config()).routers) {
    const express_router = express.Router()
    for (const route of router.routes) {
        express_router.route(route.route)[route.method.toLowerCase()]((route.middleware || ((_, __, next) => next())), (route?.controller || ((req, res) => res.send(req.path))))
    }
    app.use(router.route, express_router)

}

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`listening on port ${port}...`))