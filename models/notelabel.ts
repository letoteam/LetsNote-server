'use strict';
import {Sequelize, Model} from "sequelize";

export interface NoteLabelAttributes {
  NoteId: number;
  LabelId: number;
}

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  class NoteLabel extends Model<NoteLabelAttributes>
  implements NoteLabelAttributes{
    NoteId!: number;
    LabelId!: number;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: any) {
      // define association here
    }
  };
  NoteLabel.init({
    NoteId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Notes',
        key: 'id'
      }
    },
    LabelId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Labels',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'NoteLabel',
  });
  return NoteLabel;
};