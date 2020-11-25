require('dotenv/config')
const Charity = require('../models/Charity')
const User = require('../models/User')
const UserNotification = require('../models/UserNotification')

module.exports = {
  async index(req, res) {
    try {
      const charities = await Charity.find()
        .populate(['assignedTo', 'volunteers.user'])
        .sort({ createdAt: -1 })

      return res.send({ charities })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao carregar eventos beneficentes!' })
    }
  },

  async show(req, res) {
    try {
      const charity = await Charity.findById(req.params.charityId).populate([
        'assignedTo',
        'volunteers.user',
      ])

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      return res.send({ charity })
    } catch (err) {
      return res.status(400).send({ error: 'Oops! Erro ao carregar evento!' })
    }
  },

  async store(req, res) {
    try {
      const { title, helpedPeople, description, address, date } = req.body

      const isEntity = await User.findById(req.userId)

      if (isEntity.role !== 'entity')
        return res
          .status(401)
          .send({ error: 'Oops! Apenas entidades podem criar caridades' })

      const charity = await Charity.create({
        title,
        helpedPeople: parseInt(helpedPeople),
        description,
        address,
        date,
        assignedTo: req.userId,
      })

      return res.send({ charity })
    } catch (err) {
      res.status(400).send({ error: 'Oops! Erro ao criar evento beneficente!' })
    }
  },

  async update(req, res) {
    try {
      const charity = await Charity.findByIdAndUpdate(
        req.params.charityId,
        req.body,
        {
          new: true,
        }
      )

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      const isOwner = req.userId === charity.assignedTo

      if (!isOwner)
        return res
          .status(404)
          .send({ error: 'Oops! Você não é o dono deste evento!' })

      return res.send({ charity })
    } catch (err) {
      return res.status(400).send({ error: 'Oops! Erro ao atualizar evento!' })
    }
  },

  async subscribe(req, res) {
    try {
      const charity = await Charity.findByIdAndUpdate(
        req.params.charityId,
        { $push: { volunteers: { user: req.userId } } },
        {
          new: true,
        }
      ).populate(['assignedTo', 'volunteers.user'])

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      return res.send({ charity })
    } catch (err) {
      return res.status(400).send({ error: 'Oops! Erro ao voluntariar-se!' })
    }
  },

  async unsubscribe(req, res) {
    try {
      const charity = await Charity.findByIdAndUpdate(
        req.params.charityId,
        { $pull: { volunteers: { user: { $in: [req.userId] } } } },
        {
          new: true,
        }
      ).populate(['assignedTo', 'volunteers.user'])

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      return res.send({ charity })
    } catch (err) {
      return res.status(400).send({ error: 'Oops! Erro ao desvoluntariar-se!' })
    }
  },

  async approve(req, res) {
    try {
      const charity = await Charity.findOneAndUpdate(
        { _id: req.params.charityId },
        { $set: { 'volunteers.$[request].approved': 'true' } },
        {
          arrayFilters: [{ 'request._id': req.body.subscribeId }],
          new: true,
        }
      ).populate(['assignedTo', 'volunteers.user'])

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      const isOwner = req.userId === charity.assignedTo._id

      if (!isOwner)
        return res
          .status(404)
          .send({ error: 'Oops! Você não é o dono deste evento!' })

      return res.send({ charity })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao recusar voluntário(a)!' })
    }
  },

  async deny(req, res) {
    try {
      const charity = await Charity.findOneAndUpdate(
        { _id: req.params.charityId },
        { $set: { 'volunteers.$[request].approved': 'denied' } },
        {
          arrayFilters: [{ 'request._id': req.body.subscribeId }],
          new: true,
        }
      ).populate(['assignedTo', 'volunteers.user'])

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      const isOwner = req.userId === charity.assignedTo._id

      if (!isOwner)
        return res
          .status(404)
          .send({ error: 'Oops! Você não é o dono deste evento!' })

      return res.send({ charity })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao recusar voluntário(a)!' })
    }
  },

  async delete(req, res) {
    try {
      const charity = await Charity.findById(req.params.charityId)

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      const isOwner = req.userId === charity.assignedTo

      if (!isOwner)
        return res
          .status(404)
          .send({ error: 'Oops! Você não é o dono deste evento!' })

      await Charity.findByIdAndRemove(req.params.charityId)

      return res.send()
    } catch (err) {
      return res.status(400).send({ error: 'Oops! Erro ao deletar evento!' })
    }
  },

  async complete(req, res) {
    try {
      
      const volunteers = await Charity.findById({ _id: req.params.charityId }).populate('volunteers.user')

      const approvedVolunteers = volunteers.volunteers.filter(volunteer => volunteer.approved === 'true')

      const charity = await Charity.findOneAndUpdate(
        { _id: req.params.charityId },
        { $set: { 'completed': 'true', 'picturesLink': req.body.message } },
        {
          new: true,
        }
      ).populate(['assignedTo', 'volunteers.user'])

      approvedVolunteers.map(volunteer => 
        UserNotification.create({
          sender: charity.assignedTo.name,
          charityName: charity.title,
          message: 'A iniciativa foi finalizada!',
          status: 'Informativo',
          user_id: volunteer.user._id
        })
      )

      if (!charity)
        return res.status(404).send({ error: 'Oops! Evento não encontrado!' })

      const isOwner = req.userId === charity.assignedTo._id

      if (!isOwner)
        return res
          .status(404)
          .send({ error: 'Oops! Você não é o dono deste evento!' })

      return res.send({ charity })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao finalizar iniciativa' })
    }
  },
}
