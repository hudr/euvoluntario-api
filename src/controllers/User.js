require('dotenv/config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

function generateToken(params = {}) {
  return jwt.sign(params, process.env.APP_SECRET, {
    expiresIn: 86400,
  })
}

module.exports = {
  async store(req, res) {
    try {
      const { email, cnpj, role } = req.body

      if (cnpj && (await User.findOne({ cnpj }))) {
        return res.status(400).send({ error: 'Entidade já cadastrada!' })
      }

      if (role === 'entity' && !cnpj) {
        return res
          .status(400)
          .send({ error: 'Oops! Você não preencheu seu CNPJ!' })
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

      const data = await User.findByIdAndUpdate(req.userId, user, {
        new: true,
      })

      res.send(data)
    } catch (err) {
      res.status(400).send({ error: 'Oops! A atualização de perfil falhou!' })
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
}
