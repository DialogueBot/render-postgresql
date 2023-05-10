export default async function html({ title, components }) {

    const render = async () => {
        let renders = {}
        for (const run of ['html', 'style', 'script']) {
            renders[run] = (await Promise.all(components?.map(async (item) => {
                if ((await item())[run]) {
                    return (await item())[run]
                }
            }))).join('')
        }
        return renders
    }
    const result = await render()

    return (`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta https-equiv="Content-Security-Policy" content="default-src 'self'; script-src '{{SCRIPT_SHAS}}'; style-src '{{STYLE_SHAS}}';/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style> ${result?.style || ''}</style>
    </head>
    <body>
    ${result?.html || ''}
    <script>
    ${result?.script || ''}
    </script>
    </body> 
    </html>`)
}