"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable("emails", {
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
			user_id: {
				type: Sequelize.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			email: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			is_primary: Sequelize.BOOLEAN,
			status: {
				type: Sequelize.STRING(15),
				allowNull: false,
			},
			verification_code_hash: Sequelize.STRING,
			verification_code_salt: Sequelize.STRING,
			verification_code_expires: Sequelize.DATE,
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("emails");
	},
};
