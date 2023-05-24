export default async function html({ title, components }) {

    const render = async () => {
        let final = { html: '', style: '', script: '' }
        let renders = []
        renders = (await Promise.all(components?.map(async (item) => {
            return await item()
        })))
        for (const run of renders) {
            final.html += run?.html || ''
            final.style += run?.style || ''
            final.script += run?.script || ''
        }
        return final
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