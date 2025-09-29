// models/Trivia.js
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

export class Trivia extends Model {}
Trivia.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    owner_user_id: { type: DataTypes.INTEGER, allowNull: false },
    is_public: { type: DataTypes.BOOLEAN, defaultValue: true },
    image: { type: DataTypes.TEXT, allowNull: true }, 
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "trivias",
    timestamps: false,
    underscored: true,
  }
);
