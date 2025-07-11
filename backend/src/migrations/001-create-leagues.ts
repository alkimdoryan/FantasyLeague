import { QueryInterface, DataTypes } from 'sequelize'

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('leagues', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    })
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('leagues')
  },
} 