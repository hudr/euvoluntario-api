const express = require('express')
const authMiddleware = require('../../middlewares/auth')
const usersRouter = express.Router()
const UserController = require('../../controllers/User')
const { celebrate, Segments, Joi } = require('celebrate')

usersRouter.get('/', authMiddleware, (req, res) => {
  res.status(200).send({ success: 'Usuário autenticado' })
})

usersRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      role: Joi.string().valid('entity', 'volunteer').required(),
      cnpj: Joi.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/),
    },
  }),
  UserController.store
)

usersRouter.post(
  '/session',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  UserController.authenticate
)

module.exports = usersRouter
