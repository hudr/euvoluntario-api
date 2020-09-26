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
      console.log(err)
      res.status(400).send({ error: 'Oops! O registro falhou!' })
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
