"use strict";

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface
			.removeConstraint("organizations", "organizations_name_key")
			.catch((err) => console.log("Constraint organizations_name_key doesn't exist or already removed"));
	},

	async down(queryInterface) {
		await queryInterface.changeColumn("organizations", "name", {
			type: Sequelize.STRING(100),
			allowNull: false,
			unique: true,
		});
	},
};
