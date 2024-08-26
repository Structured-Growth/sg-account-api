"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "accounts",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "emails",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "group_members",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "groups",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "organizations",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "phones",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "preferences",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "users",
			},
			"metadata",
			Sequelize.JSONB
		);
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "custom_fields",
			},
			{
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
				status: {
					type: Sequelize.STRING(15),
					allowNull: false,
				},
				entity: {
					type: Sequelize.STRING(50),
					allowNull: false,
				},
				title: {
					type: Sequelize.STRING(50),
					allowNull: false,
				},
				name: {
					type: Sequelize.STRING(50),
					allowNull: false,
				},
				schema: Sequelize.JSON,
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("custom_fields");
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "accounts",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "emails",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "group_members",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "groups",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "organizations",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "phones",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "preferences",
			},
			"metadata"
		);
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "users",
			},
			"metadata"
		);
	},
};
