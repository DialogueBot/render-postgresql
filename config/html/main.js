export default function html({ title, components }) {
    return (`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta https-equiv="Content-Security-Policy" content="default-src 'self'; script-src '{{SCRIPT_SHAS}}'; style-src '{{STYLE_SHAS}}';/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style> ${components?.map((item) => {
        if (item) {
            return item()?.style || ''
        }
    }).join('')}</style>
    </head>
    <body>
    ${components?.map((item) => {
        if (item) {
            return item().html
        }
    }).join('')}
    <script>
    ${components?.map((item) => {
        if (item) {
            return item().script
        }
    }).join('')}
    </script>
    </body> 
    </html>`)
}