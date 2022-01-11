'use strict';
import {Sequelize, Model} from "sequelize";

interface NoteAttributes {
  id: number;
  title: string;
  content: string | null;
  isPrivate: boolean
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class Note extends Model<NoteAttributes>
  implements NoteAttributes{
    id!: number;
    title!: string;
    content!: string | null;
    isPrivate!: boolean;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      Note.belongsTo(models.User);
    }
  };
  Note.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING
    },
    isPrivate: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Note',
  });
  return Note;
};