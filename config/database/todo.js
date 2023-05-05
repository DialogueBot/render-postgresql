const get_todo = async (client) => {
    const data = await client.query(`SELECT * from users where user_name = $1`, ['andrewjudd'])
    return data
}

export default { get_todo }