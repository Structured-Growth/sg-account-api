"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "organizations",
			},
			"sign_up_enabled",
			{
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "organizations",
			},
			"sign_up_enabled"
		);
	},
};
