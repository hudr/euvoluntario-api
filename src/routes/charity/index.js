const express = require('express')
const authMiddleware = require('../../middlewares/auth')
const charitiesRouter = express.Router()
const CharityController = require('../../controllers/Charity')
const { celebrate, Segments, Joi } = require('celebrate')

charitiesRouter.get('/', authMiddleware, CharityController.index)

charitiesRouter.get(
  '/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.show
)

charitiesRouter.post(
  '/',
  authMiddleware,
  celebrate({
    [Segments.BODY]: {
      title: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      date: Joi.date().required(),
    },
  }),
  CharityController.store
)

charitiesRouter.patch(
  '/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.update
)

charitiesRouter.patch(
  '/subscribe/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.subscribe
)

charitiesRouter.patch(
  '/unsubscribe/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.unsubscribe
)

charitiesRouter.patch(
  '/approve/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
    [Segments.BODY]: {
      subscribeId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.approve
)

charitiesRouter.patch(
  '/deny/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
    [Segments.BODY]: {
      subscribeId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.deny
)

charitiesRouter.delete(
  '/:charityId',
  authMiddleware,
  celebrate({
    [Segments.PARAMS]: {
      charityId: Joi.string().guid({ version: 'uuidv4' }).required(),
    },
  }),
  CharityController.delete
)

module.exports = charitiesRouter
