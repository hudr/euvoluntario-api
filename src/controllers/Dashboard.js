const Charity = require('../models/Charity')
const User = require('../models/User')

module.exports = {
  async index(req, res) {
    try {
      const usersCount = await User.countDocuments()
      const charitiesCount = await Charity.countDocuments()
      const charitiesCompleted = await Charity.countDocuments({
        completed: 'true'
      })

      const charitiesInProgress = await Charity.countDocuments({
        completed: 'false'
      })

      return res.send({ usersCount, charitiesCount, charitiesCompleted, charitiesInProgress })
    } catch (err) {
      return res
        .status(400)
        .send({ error: 'Oops! Erro ao carregar informações do dashboard!' })
    }
  }
}