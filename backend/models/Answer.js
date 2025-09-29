// models/Answer.js
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db/index.js";

export class Answer extends Model {}
Answer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.STRING, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: "answers",
    timestamps: false,
    underscored: true,
  }
);
