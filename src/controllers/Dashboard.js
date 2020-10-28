const Charity = require('../models/Charity')
const User = require('../models/User')

module.exports = {
  async index(req, res) {
    try {
      const volunteersCount = await User.countDocuments({
        role: 'volunteer'
      })

      const entitiesCount = await User.countDocuments({
        role: 'entity'
      })

      const charitiesCount = await Charity.countDocuments()

      const charitiesCompleted = await Charity.countDocuments({
        completed: 'true'
      })

      const charitiesInProgress = await Charity.countDocuments({
        completed: 'false'
      })

      const helpedPeople = await Charity.aggregate([
        {
          $match: { completed: true }
        },
        {
          $group:
            {
              _id : null,
              total: { $sum: "$helpedPeople" }
            }
          },
        ]
      )

      return res.send({ volunteersCount, entitiesCount, charitiesCount, charitiesCompleted, charitiesInProgress, helpedPeople: helpedPeople[0] ? helpedPeople[0].total : 0 })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao carregar informações do dashboard!' })
    }
  }
}