import { Sequelize } from 'sequelize'
import path from 'path'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../../data/all_league2.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: false,
    underscored: true,
  },
})

export default sequelize 