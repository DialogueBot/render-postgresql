export default async function todo_page(database, query) {
    const html = `
<button id="add_todo">Create Todo Table</button>
`
    const style = ``

    const { rows } = await database.todo.get_todo()
    console.log(rows)
    const script = `
    document.getElementById("add_todo").addEventListener("click", async () => {
        console.log("hello")
    })
    `
    return { html, style, script }
}