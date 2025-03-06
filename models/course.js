'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.belongsToMany(models.User, {through: "CourseUser"})
      Course.belongsTo(models.Category, {foreignKey: "CategoryId"})
    }

    static async getCoursesAndCat(){
      let result = await Course.findAll({
        order:[["id", "ASC"]],
        include: [{model: sequelize.models.Category}],
      })
      return result
    }

    get getTime() {
      
    const hours = Math.floor(this.duration / 60);
    
    
    const remainingMinutes = this.duration % 60;
    
    let result
    hours > 1 ? result = `${hours} hours` : result = `${hours} hour`
    
    
    if (remainingMinutes > 0) {
      remainingMinutes > 1 ? result += ` and ${remainingMinutes} minutes` : result += ` and ${remainingMinutes} minute`
    }
    
    return result;
  }
  }
  Course.init({
    name: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    material: DataTypes.TEXT,
    CategoryId: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};