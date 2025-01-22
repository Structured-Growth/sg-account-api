"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "organizations",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				parent_org_id: {
					type: Sequelize.INTEGER,
					references: {
						model: "organizations",
						key: "id",
					},
					onDelete: "RESTRICT",
				},
				title: {
					type: Sequelize.STRING(100),
					allowNull: false,
				},
				name: {
					type: Sequelize.STRING(100),
					allowNull: false,
					unique: true,
				},
				image_uuid: Sequelize.STRING(36),
				status: {
					type: Sequelize.STRING(10),
					allowNull: false,
				},
				region: {
					type: Sequelize.STRING(10),
					allowNull: false,
				},
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable({
			schema: process.env.DB_SCHEMA,
			tableName: "organizations",
		});
	},
};
