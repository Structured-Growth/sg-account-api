"use strict";

const Sequelize = require("sequelize");
/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("accounts", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("emails", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("group_members", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("groups", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("organizations", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("phones", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("preferences", "metadata", Sequelize.JSONB);
		await queryInterface.addColumn("users", "metadata", Sequelize.JSONB);
		await queryInterface.createTable("custom_fields", {
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
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("custom_fields");
		await queryInterface.removeColumn("accounts", "metadata");
		await queryInterface.removeColumn("email", "metadata");
		await queryInterface.removeColumn("group_members", "metadata");
		await queryInterface.removeColumn("groups", "metadata");
		await queryInterface.removeColumn("organizations", "metadata");
		await queryInterface.removeColumn("phones", "metadata");
		await queryInterface.removeColumn("preferences", "metadata");
		await queryInterface.removeColumn("users", "metadata");
	},
};
