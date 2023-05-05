export default function nav() {
    const html = `<nav>
    <a href="home">Home</a>
    <a href="about">about</a>
    <a href="projects">projects</a>
    <a href="todo">todo</a>
    </nav>`
    const style = `
    a {
        color: red;
    }
    `
    return { html, style }
}