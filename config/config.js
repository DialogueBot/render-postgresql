import dotenv from 'dotenv'
dotenv.config()
import url from 'url'
import path from 'path'
import fs from 'fs/promises'
import { main, nav, todo_page } from './html/index.js'
import { todo } from './database/index.js'
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
        // port: 5432,
        // user: 'andrewjudd',
        // password: 'Bybhlfef15&'
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
                            console.log(data.rows)
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
                        csp(main({ title: 'Todo List', components: [nav, async () => await todo_page(database)] }), res)
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

    // file imports
    const database_paths = [{ path: 'todo', funcs: todo }]

    let database = {}
    for (const { path, funcs } of database_paths) {
        console.log(path)
        database[path] = {}
        for (const key in funcs) {
            await funcs[key](query, create_db_endpoint)
        }
    }

    return { routers, database }
}

export default config