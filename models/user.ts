'use strict';
import {Model} from 'sequelize';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  isActivated: boolean;
  resetLink: string | null;
  activationLink: string | null;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class User extends Model<UserAttributes> 
  implements UserAttributes{
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    id!: number;
    name!: string;
    email!: string;
    password!: string;
    isActivated!: boolean;
    resetLink!: string | null;
    activationLink!: string | null;

    static associate(models: any) {
      // define association here
      User.hasOne(models.Token, { onDelete: "cascade"});
      User.hasMany(models.Note, {
        foreignKey: 'userId'
      });
      User.hasMany(models.Label, {
        foreignKey: 'userId'
      })
    }
  };
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActivated: {
      type: DataTypes.STRING,
      defaultValue: false,
      allowNull: false
    },
    resetLink: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: true,
    },
    activationLink: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },  
    {
    sequelize,
    modelName: 'User',
  });
  return User;
};