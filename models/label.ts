'use strict';
import {Sequelize, Model} from "sequelize";

interface LabelAttributes{
  id: number,
  title: string,
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Label extends Model<LabelAttributes>
  implements LabelAttributes{
    id!: number;
    title!: string
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
      Label.belongsTo(models.User);
      Label.belongsToMany(models.Note, {through: 'NoteLabel'});
    }
  };
  Label.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Label',
  });
  return Label;
};