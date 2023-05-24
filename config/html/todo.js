export default async function todo_page(db, query) {
    const lists = await db.funcs.get_todo_lists()
    let html = '', style = '', script = ''
    let count = 0
    html += `<h3>Lists</h3>`
    html += '<div id="lists">'
    for (const list of lists) {
        count++
        html += `<p>${count}. ${list?.name || ''}</p>`
    }
    html += '</div>'
    html += `
    <input id="name" type="text"></input>
<button id="add_todo_list">Create Todo List</button>
`
    style = ``


    script = `
    let count = ${count}
    let name = document.getElementById("name")
    const add_todo = async () => {
        let name = document.getElementById("name").value
        ${await db.create_todo_list()}
        const data = await render({name: name})
        count++
        document.getElementById("lists").innerHTML += \`<p>\${count}. \${data?.name}</p>\`
        name = ''

}
    document.getElementById("add_todo_list").addEventListener("click", add_todo)
    name.addEventListener("keypress", async (e) => {
        if (e.key === 'Enter') {
            await add_todo()
        }
    })
`
    return { html, style, script }
}