/**
* IMPORTANT NOTE!
* This file was auto-generated with tsoa.
* Please do not modify it. Re-run tsoa to re-generate this file
*/

import { Router } from "express";
import { container, handleRequest } from "@structured-growth/microservice-sdk";
import * as Controllers from "../controllers/v1";

const handlerOpts = {
    logRequestBody: container.resolve<boolean>('logRequestBody'),
    logResponses: container.resolve<boolean>('logResponses'),
}

export const router = Router();

//PingController
router.get('/v1/ping/alive', handleRequest(Controllers.PingController, "pingGet", handlerOpts));

//OrganizationsController
router.get('/v1/organizations', handleRequest(Controllers.OrganizationsController, "search", handlerOpts));
router.post('/v1/organizations', handleRequest(Controllers.OrganizationsController, "create", handlerOpts));
router.get('/v1/organizations/:organizationId', handleRequest(Controllers.OrganizationsController, "get", handlerOpts));
router.put('/v1/organizations/:organizationId', handleRequest(Controllers.OrganizationsController, "update", handlerOpts));
router.delete('/v1/organizations/:organizationId', handleRequest(Controllers.OrganizationsController, "delete", handlerOpts));

//ResolverController
router.get('/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get('/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get('/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));

// map is required for correct resolving action by route
export const actionToRouteMap = {
	"PingController.pingGet": 'get /v1/ping/alive',
	"OrganizationsController.search": 'get /v1/organizations',
	"OrganizationsController.create": 'post /v1/organizations',
	"OrganizationsController.get": 'get /v1/organizations/:organizationId',
	"OrganizationsController.update": 'put /v1/organizations/:organizationId',
	"OrganizationsController.delete": 'delete /v1/organizations/:organizationId',
	"ResolverController.resolve": 'get /v1/resolver/resolve',
	"ResolverController.actions": 'get /v1/resolver/actions',
	"ResolverController.models": 'get /v1/resolver/models',
};
