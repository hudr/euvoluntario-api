const nodemailer = require('nodemailer')
const aws = require('aws-sdk')
const mailConfig = require('../../config/mail')
const mailTemplateProvider = require('../MailTemplate')

const client = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01',
    region: 'us-east-1',
  }),
})

module.exports = {
  async sendMail({ to, from, subject, templateData }) {
    await client.sendMail({
      from: {
        name: 'Eu Voluntário | Ajudando quem mais precisa',
        address: 'contato@hudsonramos.com.br',
      },
      to: {
        name: to.name,
        address: to.email,
      },
      subject,
      html: await mailTemplateProvider.parse(templateData),
    })
  },
}
