'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Enable the vector extension (Docker pgvector has this pre-compiled)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // 2. Add the embeddings column natively sized to 768 dimensions
    await queryInterface.addColumn('Chunks', 'embeddings', {
      type: 'VECTOR(768)',
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chunks', 'embeddings');
  }
};
