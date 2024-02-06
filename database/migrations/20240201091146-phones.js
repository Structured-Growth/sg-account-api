"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("phones", {
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
			phone_number: {
				type: Sequelize.STRING(20),
				allowNull: false,
			},
			is_primary: Sequelize.BOOLEAN,
			status: {
				type: Sequelize.STRING(10),
				allowNull: false,
			},
			verification_code_hash: Sequelize.STRING(50),
			verification_code_salt: Sequelize.STRING(50),
			verification_code_expires: Sequelize.DATE,
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("phones");
	},
};
