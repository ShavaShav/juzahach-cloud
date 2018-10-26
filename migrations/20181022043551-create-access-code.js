'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AccessCodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      accessCode: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => 
      // index the access code
      queryInterface.addIndex('AccessCodes', ['accessCode'])
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AccessCodes');
  }
};
