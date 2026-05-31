'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists in the table
    const tableDefinition = await queryInterface.describeTable('Chats');
    
    if (!tableDefinition.documentId) {
      await queryInterface.addColumn('Chats', 'documentId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Documents',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Chats');
    if (tableDefinition.documentId) {
      await queryInterface.removeColumn('Chats', 'documentId');
    }
  }
};
