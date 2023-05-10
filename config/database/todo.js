const get_todo = async (query, serve) => {
    return await serve({
        route: '/get_users_by_username',
        method: 'GET',
        controller: async (req, res) => {
            const user = req.query.user
            const { rows } = await query(`SELECT * from users where user_name = $1`, [user])
            res.status(200).json(rows)
        }

    })
}

const create_todo_table = async (query, serve) => {
    try {
        return await serve({
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

        })
    } catch (error) {
        console.log(error)
        return
    }
}

export default { get_todo, create_todo_table }