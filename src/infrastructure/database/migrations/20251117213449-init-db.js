'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Locations', {
      id: { type: Sequelize.DataTypes.STRING, primaryKey: true, allowNull: false },
      name: { type: Sequelize.DataTypes.STRING(128), allowNull: false, unique: true },
      type: { type: Sequelize.DataTypes.STRING(64), allowNull: true },
      dimension: { type: Sequelize.DataTypes.STRING(64), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DataTypes.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DataTypes.DATE },
    });

    await queryInterface.createTable('Characters', {
      id: { type: Sequelize.DataTypes.STRING, primaryKey: true, allowNull: false },
      name: { type: Sequelize.DataTypes.STRING(100), allowNull: false },
      status: { type: Sequelize.DataTypes.STRING(50), allowNull: false },
      species: { type: Sequelize.DataTypes.STRING(100), allowNull: false },
      type: { type: Sequelize.DataTypes.STRING(100) },
      gender: { type: Sequelize.DataTypes.STRING(50), allowNull: false },
      image: { type: Sequelize.DataTypes.STRING },
      created: { type: Sequelize.DataTypes.DATE, allowNull: false },
      originLocationId: {
        type: Sequelize.DataTypes.STRING,
        references: { model: 'Locations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      currentLocationId: {
        type: Sequelize.DataTypes.STRING,
        references: { model: 'Locations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: { allowNull: false, type: Sequelize.DataTypes.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DataTypes.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Characters');
    await queryInterface.dropTable('Locations');
  },
};
