const handlebars = require('handlebars')
const fs = require('fs')

module.exports = {
  async parse({ file, variables }) {
    const templateFileContent = await fs.promises.readFile(file, {
      encoding: 'utf-8',
    })

    const parseTemplate = handlebars.compile(templateFileContent)

    return parseTemplate(variables)
  },
}
