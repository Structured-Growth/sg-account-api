"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable("users", {
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
			first_name: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			last_name: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			birthday: Sequelize.DATE,
			gender: Sequelize.STRING(6),
			image_uuid: Sequelize.STRING(36),
			is_primary: Sequelize.BOOLEAN,
			status: {
				type: Sequelize.STRING(10),
				allowNull: false,
			},
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("users");
	},
};
