"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"organizations",
			[
				{
					id: 1,
					title: "Structured Growth",
					name: "structured-growth",
					status: "active",
					region: "us",
					created_at: new Date(),
				},
				{
					id: 2,
					title: "Starlion Remote Care",
					name: "starlion-remote-care",
					status: "active",
					region: "us",
					created_at: new Date(),
				},
				{
					id: 3,
					title: "Design Emerging",
					name: "design-emerging",
					status: "active",
					region: "us",
					created_at: new Date(),
				},
				{
					id: 4,
					title: "Zense",
					name: "zense",
					status: "active",
					region: "us",
					created_at: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("organizations", null, {});
	},
};
