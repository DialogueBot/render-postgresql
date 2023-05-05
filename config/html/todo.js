export default function todo_page(database) {
    const html = `
<button id="add_todo">Add todo List</button>
`
    const style = ``

    const script = `
    document.getElementById("add_todo").addEventListener("click", () => {
        console.log('hello')
    })
    `
    return { html, style, script }
}