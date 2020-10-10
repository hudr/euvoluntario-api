const express = require('express')
const usersRouter = express.Router()
const { celebrate, Segments, Joi } = require('celebrate')
const multer = require('multer')
const authMiddleware = require('../../middlewares/auth')
const UserController = require('../../controllers/User')
const uploadConfig = require('../../config/upload')
const upload = multer(uploadConfig.multer)

usersRouter.get('/', authMiddleware, UserController.index)

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
      cnpj: Joi.string().regex(
        /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/
      ),
    },
  }),
  UserController.store
)

usersRouter.put(
  '/profile',
  authMiddleware,
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      old_password: Joi.string(),
      password: Joi.string(),
      password_confirmation: Joi.string().valid(Joi.ref('password')),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      role: Joi.string().valid('entity', 'volunteer').required(),
      cnpj: Joi.string().regex(
        /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}|[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2})$/
      ),
    },
  }),
  UserController.update
)

usersRouter.patch(
  '/profile/avatar',
  upload.single('avatar'),
  authMiddleware,
  UserController.upload
)

usersRouter.post(
  '/password/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
    },
  }),
  UserController.forgot
)

usersRouter.post('/password/reset', UserController.reset)

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
