import dotenv from 'dotenv'
dotenv.config()
import url from 'url'
import path from 'path'
import fs from 'fs/promises'
import { main, nav, todo_page } from './html/index.js'
import db_files from './database/index.js'
import pg from 'pg'
import { createHash } from 'crypto'


const config = async () => {

    const Pool = pg.Pool
    const pool = new Pool({
        host: process.env.PSQL_HOST,
        database: process.env.PSQL_DATABASE,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        port: 5432,
        user: process.env.PSQL_USER,
        password: process.env.PSQL_PASSWORD
    })

    const query = async (text, params) => {
        const start = Date.now()
        const res = await pool.query(text, params)
        const duration = Date.now() - start
        console.log('executed query', { text, duration, rows: res.rowCount })
        return res
    }

    const csp = async (html, res) => {

        const sw = /<script[\s\S]*?>([\s\S]*?)<\/script>/gm
        const stw = /<style[\s\S]*?>([\s\S]*?)<\/style>/gm
        const script_hash = `sha256-${createHash("sha256").update(sw.exec(await html)[1]).digest('base64')}`
        const style_hash = `sha256-${createHash("sha256").update(stw.exec(await html)[1]).digest('base64')}`
        html = (await html).replace('{{SCRIPT_SHAS}}', script_hash)
        html = (await html).replace('{{STYLE_SHAS}}', style_hash)
        res.setHeader("Content-Security-Policy", `default-src 'self'; script-src '${script_hash}'; style-src '${style_hash}'`);
        res.status(200).send(html)
    }
    const db = {

    }

    const routers = [
        {
            route: '/',
            routes: [
                {
                    route: '/',
                    method: 'GET',
                    controller: async (req, res) => {
                        csp(main({ title: 'home', components: [nav] }), res)
                    },
                    middleware: async (req, res, next) => {
                        next()
                    }

                },
                {
                    route: '/home',
                    method: 'GET',
                    controller: async (req, res) => {
                        try {

                            const data = await pool.query(`SELECT * from users where user_name = $1`, ['andrewjudd'])
                            // client.end()
                            csp(main({ title: 'home', components: [nav] }), res)
                        } catch (error) {
                            console.log(error)
                            res.send(error)
                        }
                    },
                    middleware: async (req, res, next) => {
                        next()
                    }

                },
                {
                    route: '/about',
                    method: 'GET',
                    controller: async (req, res) => {
                        csp(await main({ title: 'about', components: [nav] }), res)
                    },
                    middleware: async (req, res, next) => {
                        next()
                    }

                },
                {
                    route: '/projects',
                    method: 'GET',
                    controller: async (req, res) => {
                        csp(main({ title: 'projects', components: [nav] }), res)
                    },
                    middleware: async (req, res, next) => {
                        next()
                    }

                },
                {
                    route: '/todo',
                    method: 'GET',
                    controller: async (req, res) => {
                        csp(main({ title: 'Todo List', components: [nav, async () => await todo_page(db)] }), res)
                    }
                }
            ]
        },
        {
            route: '/api/v1',
            routes: [
                {
                    route: '/first',
                    method: 'GET',
                    controller: async (req, res) => {
                        res.status(200).send('first post')
                    }
                }
            ]
        }
    ]


    const create_db_endpoint = async ({ route, method, controller }) => {
        routers[1].routes.push({
            route: `${route}`,
            method,
            controller
        })
    }

    const create_api_request = async ({ route, method }) => {
        let base_url = 'http://localhost:3001/api/v1'
        db[route.slice(1)] = async () => {
            // add body to requests

            return `
        const render = async (body) => {
        let ${route.slice(1)} = await fetch("${base_url}${route}", {method: "${method}", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)})
         ${route.slice(1)} = await ${route.slice(1)}.json()
         return ${route.slice(1)}
        }`
        }
        if (!db.funcs) {
            db.funcs = {}
        }
        db.funcs[route.slice(1)] = async () => {
            const response = await fetch(base_url + route, { method })
            const data = await response.json()
            return data
        }
    }

    // file imports
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
    const paths = await fs.readdir(__dirname + '/database')

    const database_paths = []
    for (const path of paths) {
        if (path === 'index.js') continue
        database_paths.push({ path, funcs: db_files[path.split('.')[0]] })
    }
    for (const { funcs } of database_paths) {
        for (const key in funcs) {
            await funcs[key](query, create_db_endpoint, create_api_request)
        }
    }

    return { routers, db }
}

export default config
