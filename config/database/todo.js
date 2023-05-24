const main = async (query, serve, api) => {
    const funcs = {}

    const config = [
        {
            route: '/create_todo_table',
            method: 'GET',
            controller: async (req, res) => {
                const sql = `
                CREATE TABLE IF NOT EXISTS todo_list (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name TEXT
                );`
                const result = await query(sql)
                res.status(200).json(result)
            }
        },
        {
            route: '/get_todo_lists',
            method: 'GET',
            controller: async (req, res) => {
                const { rows } = await query(`SELECT * from todo_list`)
                res.status(200).json(rows)
            }
        },
        {
            route: '/get_todo_list',
            method: 'GET',
            controller: async (req, res) => {
                try {
                    const id = req?.query?.id || ''
                    const name = req?.query?.name || ''
                    const { rows } = await query(`SELECT * from todo_list where ${id ? 'id' : 'name'} = $1`, [id ? id : name])
                    res.status(200).json(rows)
                } catch (error) {
                    res.status(400).json({ error: 'bad request' })
                }
            }
        },
        {
            route: '/create_todo_list',
            method: 'POST',
            controller: async (req, res) => {
                const todo_name = req.body.name
                const sql = `
               insert into todo_list (name) values ($1) returning name, id`
                const { rows } = await query(sql, [todo_name])
                await query(`commit`)
                res.status(200).json(rows?.[0] || {})
            }
        },
    ]

    for (const { route, method, controller } of config) {
        await serve({
            route, method, controller
        })
        await api({
            route, method
        })
    }
}

export default { main }