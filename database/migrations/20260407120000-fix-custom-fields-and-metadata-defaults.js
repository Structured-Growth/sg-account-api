"use strict";

const Sequelize = require("sequelize");

const metadataTables = [
	"accounts",
	"emails",
	"group_members",
	"groups",
	"organizations",
	"phones",
	"preferences",
	"users",
];

function getTableRef(tableName) {
	return {
		schema: process.env.DB_SCHEMA,
		tableName,
	};
}

async function hasIndex(queryInterface, tableName, indexName) {
	const indexes = await queryInterface.showIndex(getTableRef(tableName));
	return indexes.some((index) => index.name === indexName);
}

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		for (const tableName of metadataTables) {
			const quotedTable = queryInterface.queryGenerator.quoteTable(getTableRef(tableName));

			await queryInterface.sequelize.query(`
				UPDATE ${quotedTable}
				SET metadata = '{}'::jsonb
				WHERE metadata IS NULL
					OR metadata = 'null'::jsonb
					OR metadata = '""'::jsonb;
			`);

			await queryInterface.changeColumn(getTableRef(tableName), "metadata", {
				type: Sequelize.JSONB,
				allowNull: false,
				defaultValue: {},
			});
		}

		const quotedCustomFieldsTable = queryInterface.queryGenerator.quoteTable(getTableRef("custom_fields"));

		await queryInterface.sequelize.query(`
			UPDATE ${quotedCustomFieldsTable}
			SET schema = '{}'::json
			WHERE schema IS NULL;
		`);

		await queryInterface.sequelize.query(`
			ALTER TABLE ${quotedCustomFieldsTable}
			ALTER COLUMN schema TYPE JSONB
			USING schema::jsonb;
		`);

		await queryInterface.changeColumn(getTableRef("custom_fields"), "schema", {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: {},
		});

		const [duplicates] = await queryInterface.sequelize.query(`
			SELECT org_id, entity, name, COUNT(*)::int AS duplicates
			FROM ${quotedCustomFieldsTable}
			WHERE deleted_at IS NULL
			GROUP BY org_id, entity, name
			HAVING COUNT(*) > 1
			LIMIT 1;
		`);

		if (duplicates.length > 0) {
			const duplicate = duplicates[0];
			throw new Error(
				`Cannot add unique index to custom_fields: duplicate active rows found for org_id=${duplicate.org_id}, entity=${duplicate.entity}, name=${duplicate.name}`
			);
		}

		if (!(await hasIndex(queryInterface, "custom_fields", "custom_fields_org_entity_name_unique"))) {
			await queryInterface.addIndex(getTableRef("custom_fields"), {
				name: "custom_fields_org_entity_name_unique",
				fields: ["org_id", "entity", "name"],
				unique: true,
				where: {
					deleted_at: null,
				},
			});
		}
	},

	async down(queryInterface) {
		if (await hasIndex(queryInterface, "custom_fields", "custom_fields_org_entity_name_unique")) {
			await queryInterface.removeIndex(getTableRef("custom_fields"), "custom_fields_org_entity_name_unique");
		}

		await queryInterface.sequelize.query(`
			ALTER TABLE ${queryInterface.queryGenerator.quoteTable(getTableRef("custom_fields"))}
			ALTER COLUMN schema DROP DEFAULT,
			ALTER COLUMN schema DROP NOT NULL,
			ALTER COLUMN schema TYPE JSON
			USING schema::json;
		`);

		for (const tableName of metadataTables) {
			await queryInterface.changeColumn(getTableRef(tableName), "metadata", {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: null,
			});
		}
	},
};
