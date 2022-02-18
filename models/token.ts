'use strict';
import { Model } from 'sequelize';

interface TokenAttributes {
  // user: number;
  refreshToken: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Token extends Model<TokenAttributes> implements TokenAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // user!: number;
    refreshToken!: string;

    static associate(models: any) {
      // define association here
    }
  }
  Token.init(
    {
      // user: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Token',
    }
  );
  return Token;
};
