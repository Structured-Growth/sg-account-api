import { waitAppIsReady } from "./wait-app-is-ready";
import { agent } from "supertest";
import { container, webServer } from "@structured-growth/microservice-sdk";
import { routes } from "../../src/routes";

export function initTest() {
	container.register("authenticationEnabled", { useValue: false });
	container.register("authorizationEnabled", { useValue: false });

	const server = agent(webServer(routes));
	const context: any = {};

	waitAppIsReady();

	return { server, context };
}
