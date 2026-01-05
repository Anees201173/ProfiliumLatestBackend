const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConversationParticipant = sequelize.define(
    'ConversationParticipant',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'conversation_participants',
    }
  );

  return ConversationParticipant;
};
