"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("preferences", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			org_id: {
				type: Sequelize.INTEGER,
				references: {
					model: "organizations",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			region: {
				type: Sequelize.STRING(10),
				allowNull: false,
			},
			account_id: {
				type: Sequelize.INTEGER,
				references: {
					model: "accounts",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			preferences: {
				type: Sequelize.JSON,
				allowNull: false,
			},
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("preferences");
	},
};
