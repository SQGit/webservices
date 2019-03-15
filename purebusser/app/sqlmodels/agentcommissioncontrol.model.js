const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const AgentCommission = sequelize.define('agentcommissioncontrol',{
    agentcommissioncontrolid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    agentcommission: {
        type: Sequelize.INTEGER
    }
})


module.exports = AgentCommission;