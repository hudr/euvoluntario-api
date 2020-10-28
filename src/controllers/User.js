require('dotenv/config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const S3Provider = require('../providers/S3')
const path = require('path')
const dateFns = require('date-fns')
const User = require('../models/User')
const Charity = require('../models/Charity')
const UserToken = require('../models/UserToken')
const UserNotification = require('../models/UserNotification')
const mailProvider = require('../providers/SES')

function generateToken(params = {}) {
  return jwt.sign(params, process.env.APP_SECRET, {
    expiresIn: '1d',
  })
}

module.exports = {
  async index(req, res) {
    try {
      const volunteers = await User.find().sort({ createdAt: -1 })

      return res.send({ volunteers })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao carregar voluntários!' })
    }
  },

  async store(req, res) {
    try {
      const { email, cnpj, role, qualities } = req.body

      if (cnpj && (await User.findOne({ cnpj }))) {
        return res.status(400).send({ error: 'Entidade já cadastrada!' })
      }

      if (role === 'entity' && !cnpj) {
        return res
          .status(400)
          .send({ error: 'Oops! Você não preencheu seu CNPJ!' })
      }

      if (role === 'volunteer' && !qualities.length) {
        return res
          .status(400)
          .send({ error: 'Oops! Você não preencheu suas qualidades!' })
      }

      if (await User.findOne({ email })) {
        return res
          .status(400)
          .send({ error: 'Este e-mail já está sendo utilizado!' })
      }

      const user = await User.create(req.body)

      user.password = undefined

      return res.send({ user, token: generateToken({ id: user.id }) })
    } catch (err) {
      res.status(400).send({ error: 'Oops! O registro falhou!' })
    }
  },

  async update(req, res) {
    try {
      const {
        name,
        email,
        phone,
        address,
        cnpj,
        role,
        qualities,
        password,
        old_password,
      } = req.body

      const user = await User.findById(req.userId).select('+password')

      if (!user) {
        return res.status(400).send({ error: 'Usuário não encontrado' })
      }

      const userWithUpdatedEmail = await User.findOne({ email })

      if (userWithUpdatedEmail && userWithUpdatedEmail._id !== req.userId) {
        return res.status(400).send({ error: 'Email já em uso' })
      }

      if (password && !old_password) {
        return res.status(400).send({
          error: 'Você precisa informar a senha antiga para usar uma nova',
        })
      }

      if (password && old_password) {
        const checkOldPassword = await bcrypt.compare(
          old_password,
          user.password
        )

        if (!checkOldPassword) {
          return res.status(400).send({
            error: 'A senha antiga não está correta',
          })
        }

        user.password = await bcrypt.hash(password, 8)
      }

      user.name = name
      user.email = email
      user.phone = phone
      user.address = address
      user.cnpj = cnpj
      user.role = role
      user.qualities = qualities

      const data = await User.findByIdAndUpdate(req.userId, user, {
        new: true,
      })

      res.send(data)
    } catch (err) {
      res.status(400).send({ error: 'Oops! A atualização de perfil falhou!' })
    }
  },

  async upload(req, res) {
    try {
      const user = await User.findById(req.userId)

      if (!user)
        return res.status(401).send({
          error: 'Apenas usuários autenticados podem alterar o avatar',
        })

      const destinyFolder = 'users'

      const avatarFilename = req.file.filename

      if (user.avatarUrl) {
        await S3Provider.deleteFile(user.avatarUrl, destinyFolder)
      }

      const fileName = await S3Provider.saveFile(avatarFilename, destinyFolder)

      user.avatarUrl = fileName

      const data = await User.findByIdAndUpdate(req.userId, user, {
        new: true,
      })

      res.send(data)
    } catch (err) {
      res.status(400).send({ error: 'Oops! Erro ao fazer upload de imagem' })
    }
  },

  async forgot(req, res) {
    try {
      const { email } = req.body

      const user = await User.findOne({ email })

      if (!user) {
        res.status(400).send({ error: 'Este usuário não existe' })
      }

      const { token } = await UserToken.create({ user_id: user._id })

      const forgotPasswordTemplate = path.resolve(
        __dirname,
        '..',
        'views',
        'forgot_password.hbs'
      )

      await mailProvider.sendMail({
        to: {
          name: user.name,
          email: user.email,
        },
        subject: '[Eu Voluntário] Recuperação de senha',
        templateData: {
          file: forgotPasswordTemplate,
          variables: {
            name: user.name,
            link: `${process.env.APP_WEB_URL}/resetar-senha?token=${token}`,
          },
        },
      })

      res.status(204).send()
    } catch (err) {
      res.status(400).send({ error: 'Erro ao enviar e-mail' })
    }
  },

  async reset(req, res) {
    try {
      const { token, password } = req.body

      const userToken = await UserToken.findOne({ token })

      if (!userToken) {
        res.status(400).send({ error: 'O token não existe' })
      }

      const user = await User.findOne({ _id: userToken.user_id })

      if (!user) {
        res.status(400).send({ error: 'O token não existe para este usuário' })
      }

      const tokenCreatedAt = userToken.createdAt
      const compareDate = dateFns.addHours(tokenCreatedAt, 2)

      if (dateFns.isAfter(Date.now(), compareDate)) {
        res.status(400).send({ error: 'Token expirado' })
      }

      user.password = await bcrypt.hash(password, 8)

      await User.findOneAndUpdate({ _id: userToken.user_id }, user)

      res.status(204).send()
    } catch (err) {
      res.status(400).send({ error: 'Erro ao resetar senha' })
    }
  },

  async authenticate(req, res) {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(400).send({ error: 'Usuário não encontrado!' })
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Senha inválida!' })
    }

    user.password = undefined

    res.send({ user, token: generateToken({ id: user.id }) })
  },

  async notifications(req, res) {
    try {
      const notifications = await UserNotification.find({ user_id: req.userId }).sort({ createdAt: -1 })

      return res.send({ notifications })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao carregar notificações!' })
    }
  },

  async notify(req, res) {
    try {

      const { user_id, charity_id, message, status } = req.body

      const volunteer = await User.findOne({ _id: user_id })

      if (!volunteer) {
        return res.status(400).send({ error: 'Voluntário não encontrado!' })
      }

      const entity = await User.findOne({ _id: req.userId })

      if (!entity) {
        return res.status(400).send({ error: 'Entidade não encontrada!' })
      }

      const charity = await Charity.findOne({ _id: charity_id })

      if (!charity) {
        return res.status(400).send({ error: 'Caridade não encontrada!' })
      }

      await UserNotification.create({
        sender: entity.name,
        charityName: charity.title,
        message,
        status,
        user_id: volunteer._id
      })

      res.status(204).send()
    } catch (err) {
      res.status(400).send({ error: 'Erro ao criar notificação' })
    }
  },
}
