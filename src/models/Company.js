const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define(
    'Company',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Please enter a valid email address",
          },
        },
      },
      websiteUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            args: true,
            msg: "Please enter a valid website URL (for example: https://yourcompany.com)",
          },
        }
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true
      },
      employees: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: [["active", "suspended"]]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      logoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      timestamps: true,
      tableName: 'companies'
    }
  );

  return Company;
};
