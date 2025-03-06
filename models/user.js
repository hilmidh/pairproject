'use strict';
const {
  Model
} = require('sequelize');
const {hashPassword} = require('../helpers/helper.js');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profile, {foreignKey: "UserId"})
      User.belongsToMany(models.Course, {through: "CourseUser"})
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: "email is required"
        },
        notNull: {
          msg: "email is required"
        },
        isEmail: {
          msg: "Please input a valid email!"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty: {
          msg: "password is required"
        },
        notNull: {
          msg: "password is required"
        },
        minLength(val){
          if(val.length < 8){
            throw new Error("Minimum password length is 8 char")
          }
        }
      }
    },
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate((input) => {
    input.password = hashPassword(input.password)
  })
  return User;
};