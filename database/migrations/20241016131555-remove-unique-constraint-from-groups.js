"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface
			.removeConstraint(
				{
					schema: process.env.DB_SCHEMA,
					tableName: "groups",
				},
				"groups_name_key"
			)
			.catch((err) => console.log("Constraint 'groups_name_key' doesn't exist or already removed"));

		await queryInterface.changeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "groups",
			},
			"name",
			{
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: false,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.changeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "groups",
			},
			"name",
			{
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: true,
			}
		);
	},
};
