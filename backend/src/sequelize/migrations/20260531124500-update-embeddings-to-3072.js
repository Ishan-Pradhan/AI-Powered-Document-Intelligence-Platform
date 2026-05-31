'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop the old 768-dimensional embeddings column
    await queryInterface.removeColumn('Chunks', 'embeddings');

    // 2. Add it back natively sized to 3072 dimensions for gemini-embedding-2
    await queryInterface.addColumn('Chunks', 'embeddings', {
      type: 'VECTOR(3072)',
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chunks', 'embeddings');
    await queryInterface.addColumn('Chunks', 'embeddings', {
      type: 'VECTOR(768)',
      allowNull: true,
    });
  }
};
