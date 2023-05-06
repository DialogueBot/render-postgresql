import dotenv from 'dotenv'
dotenv.config()
import url from 'url'
import path from 'path'
import fs from 'fs/promises'
import { main, nav, todo_page } from './html/index.js'
import { todo } from './database/index.js'
import pg from 'pg'
import { createHash } from 'crypto'


const config = () => {
    const client = new pg.Client({
        host: process.env.PSQL_HOST,
        database: process.env.PSQL_DATABASE,
        // port: 5432,
        // user: 'andrewjudd',
        // password: 'Bybhlfef15&'
    })
    client
        .connect()
        .then(() => console.log('connected'))
        .catch((err) => console.error('connection error', err.stack))
    const database = {}
    for (const key in todo) {
        database['todo'] = {}
        database['todo'][key] = async () => {
            const data = await todo[key](client)
            return data
        }
    }

    const csp = (html) => {

    }

    const routers = [
        {
            route: '/',
            routes: [
                {
                    route: '/',
                    method: 'GET',
                    controller: async (req, res) => {
                        database.todo.get_todo()
                        res.status(200).send(main({ title: 'home', components: [nav] }))
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

                            const data = await client.query(`SELECT * from users where user_name = $1`, ['andrewjudd'])
                            // client.end()
                            console.log(data.rows)
                            res.status(200).send(main({ title: 'home', components: [nav] }))
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
                        res.status(200).send(main({ title: 'about', components: [nav] }))
                    },
                    middleware: async (req, res, next) => {
                        next()
                    }

                },
                {
                    route: '/projects',
                    method: 'GET',
                    controller: async (req, res) => {
                        res.status(200).send(main({ title: 'projects', components: [nav] }))
                    },
                    middleware: async (req, res, next) => {
                        next()
                    }

                },
                {
                    route: '/todo',
                    method: 'GET',
                    controller: async (req, res) => {
                        let html = main({ title: 'Todo List', components: [() => todo_page(database)] })
                        const sw = /<script[\s\S]*?>([\s\S]*?)<\/script>/gm
                        const stw = /<style[\s\S]*?>([\s\S]*?)<\/style>/gm
                        const script_hash = `sha256-${createHash("sha256").update(sw.exec(html)[1]).digest('base64')}`
                        const style_hash = `sha256-${createHash("sha256").update(stw.exec(html)[1]).digest('base64')}`
                        html = html.replace('{{SCRIPT_SHAS}}', script_hash)
                        html = html.replace('{{STYLE_SHAS}}', style_hash)
                        res.setHeader("Content-Security-Policy", `default-src 'self'; script-src '${script_hash}'; style-src '${style_hash}'`);
                        res.status(200).send(html)
                    }
                }
            ]
        },
        {
            route: '/posts',
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

    return { routers, database }
}

export default config