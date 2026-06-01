'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chats', 'documentId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Chats', 'documentId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Documents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },
};