'use strict';

const fs = require('fs').promises;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   let data = JSON.parse(await fs.readFile('./data/course.json')).map(e => {
    e.createdAt = new Date()
    e.updatedAt = new Date()
    return e
   })
   await queryInterface.bulkInsert("Courses", data, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
    */
   await queryInterface.bulkDelete('Courses', null, {});
  }
};
