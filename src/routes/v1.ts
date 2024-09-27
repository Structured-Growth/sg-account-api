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
const pathPrefix = process.env.URI_PATH_PREFIX || '';

//UsersController
router.get(pathPrefix + '/v1/users', handleRequest(Controllers.UsersController, "search", handlerOpts));
router.post(pathPrefix + '/v1/users/search', handleRequest(Controllers.UsersController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/users', handleRequest(Controllers.UsersController, "create", handlerOpts));
router.get(pathPrefix + '/v1/users/:userId', handleRequest(Controllers.UsersController, "get", handlerOpts));
router.put(pathPrefix + '/v1/users/:userId', handleRequest(Controllers.UsersController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/users/:userId', handleRequest(Controllers.UsersController, "delete", handlerOpts));

//SystemController
router.post(pathPrefix + '/v1/system/migrate', handleRequest(Controllers.SystemController, "migrate", handlerOpts));

//PingController
router.get(pathPrefix + '/v1/ping/alive', handleRequest(Controllers.PingController, "pingGet", handlerOpts));

//OrganizationsController
router.get(pathPrefix + '/v1/organizations', handleRequest(Controllers.OrganizationsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/organizations/search', handleRequest(Controllers.OrganizationsController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/organizations', handleRequest(Controllers.OrganizationsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/organizations/:organizationId', handleRequest(Controllers.OrganizationsController, "get", handlerOpts));
router.get(pathPrefix + '/v1/organizations/:organizationId/parents', handleRequest(Controllers.OrganizationsController, "getParents", handlerOpts));
router.put(pathPrefix + '/v1/organizations/:organizationId', handleRequest(Controllers.OrganizationsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/organizations/:organizationId', handleRequest(Controllers.OrganizationsController, "delete", handlerOpts));

//AccountsController
router.get(pathPrefix + '/v1/accounts', handleRequest(Controllers.AccountsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/accounts/search', handleRequest(Controllers.AccountsController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/accounts', handleRequest(Controllers.AccountsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/accounts/:accountId', handleRequest(Controllers.AccountsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/accounts/:accountId', handleRequest(Controllers.AccountsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/accounts/:accountId', handleRequest(Controllers.AccountsController, "delete", handlerOpts));

//EmailsController
router.get(pathPrefix + '/v1/emails', handleRequest(Controllers.EmailsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/emails/search', handleRequest(Controllers.EmailsController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/emails', handleRequest(Controllers.EmailsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/emails/:emailId', handleRequest(Controllers.EmailsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/emails/:emailId', handleRequest(Controllers.EmailsController, "update", handlerOpts));
router.post(pathPrefix + '/v1/emails/:emailId/send-code', handleRequest(Controllers.EmailsController, "sendCode", handlerOpts));
router.post(pathPrefix + '/v1/emails/:emailId/verify', handleRequest(Controllers.EmailsController, "verify", handlerOpts));
router.delete(pathPrefix + '/v1/emails/:emailId', handleRequest(Controllers.EmailsController, "delete", handlerOpts));

//PreferencesController
router.get(pathPrefix + '/v1/preferences/:accountId', handleRequest(Controllers.PreferencesController, "read", handlerOpts));
router.post(pathPrefix + '/v1/preferences/:accountId', handleRequest(Controllers.PreferencesController, "update", handlerOpts));

//GroupsController
router.get(pathPrefix + '/v1/groups', handleRequest(Controllers.GroupsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/groups/search', handleRequest(Controllers.GroupsController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/groups', handleRequest(Controllers.GroupsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/groups/:groupId', handleRequest(Controllers.GroupsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/groups/:groupId', handleRequest(Controllers.GroupsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/groups/:groupId', handleRequest(Controllers.GroupsController, "delete", handlerOpts));

//GroupMembersController
router.get(pathPrefix + '/v1/groups/:groupId/members', handleRequest(Controllers.GroupMembersController, "search", handlerOpts));
router.post(pathPrefix + '/v1/groups/:groupId/members/search', handleRequest(Controllers.GroupMembersController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/groups/:groupId/members', handleRequest(Controllers.GroupMembersController, "create", handlerOpts));
router.get(pathPrefix + '/v1/groups/:groupId/members/:groupMemberId', handleRequest(Controllers.GroupMembersController, "get", handlerOpts));
router.put(pathPrefix + '/v1/groups/:groupId/members/:groupMemberId', handleRequest(Controllers.GroupMembersController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/groups/:groupId/members/:groupMemberId', handleRequest(Controllers.GroupMembersController, "delete", handlerOpts));

//PhonesController
router.get(pathPrefix + '/v1/phones', handleRequest(Controllers.PhonesController, "search", handlerOpts));
router.post(pathPrefix + '/v1/phones/search', handleRequest(Controllers.PhonesController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/phones', handleRequest(Controllers.PhonesController, "create", handlerOpts));
router.get(pathPrefix + '/v1/phones/:phoneId', handleRequest(Controllers.PhonesController, "get", handlerOpts));
router.put(pathPrefix + '/v1/phones/:phoneId', handleRequest(Controllers.PhonesController, "update", handlerOpts));
router.post(pathPrefix + '/v1/phones/:phoneId/send-code', handleRequest(Controllers.PhonesController, "sendCode", handlerOpts));
router.post(pathPrefix + '/v1/phones/:phoneId/verify', handleRequest(Controllers.PhonesController, "verify", handlerOpts));
router.delete(pathPrefix + '/v1/phones/:phoneId', handleRequest(Controllers.PhonesController, "delete", handlerOpts));

//CustomFieldsController
router.get(pathPrefix + '/v1/custom-fields', handleRequest(Controllers.CustomFieldsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/custom-fields', handleRequest(Controllers.CustomFieldsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/custom-fields/:customFieldId', handleRequest(Controllers.CustomFieldsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/custom-fields/:customFieldId', handleRequest(Controllers.CustomFieldsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/custom-fields/:customFieldId', handleRequest(Controllers.CustomFieldsController, "delete", handlerOpts));

//ResolverController
router.get(pathPrefix + '/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get(pathPrefix + '/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get(pathPrefix + '/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));

// map is required for correct resolving action by route
export const actionToRouteMap = {
	"UsersController.search": 'get /v1/users',
	"UsersController.searchPost": 'post /v1/users/search',
	"UsersController.create": 'post /v1/users',
	"UsersController.get": 'get /v1/users/:userId',
	"UsersController.update": 'put /v1/users/:userId',
	"UsersController.delete": 'delete /v1/users/:userId',
	"SystemController.migrate": 'post /v1/system/migrate',
	"PingController.pingGet": 'get /v1/ping/alive',
	"OrganizationsController.search": 'get /v1/organizations',
	"OrganizationsController.searchPost": 'post /v1/organizations/search',
	"OrganizationsController.create": 'post /v1/organizations',
	"OrganizationsController.get": 'get /v1/organizations/:organizationId',
	"OrganizationsController.getParents": 'get /v1/organizations/:organizationId/parents',
	"OrganizationsController.update": 'put /v1/organizations/:organizationId',
	"OrganizationsController.delete": 'delete /v1/organizations/:organizationId',
	"AccountsController.search": 'get /v1/accounts',
	"AccountsController.searchPost": 'post /v1/accounts/search',
	"AccountsController.create": 'post /v1/accounts',
	"AccountsController.get": 'get /v1/accounts/:accountId',
	"AccountsController.update": 'put /v1/accounts/:accountId',
	"AccountsController.delete": 'delete /v1/accounts/:accountId',
	"EmailsController.search": 'get /v1/emails',
	"EmailsController.searchPost": 'post /v1/emails/search',
	"EmailsController.create": 'post /v1/emails',
	"EmailsController.get": 'get /v1/emails/:emailId',
	"EmailsController.update": 'put /v1/emails/:emailId',
	"EmailsController.sendCode": 'post /v1/emails/:emailId/send-code',
	"EmailsController.verify": 'post /v1/emails/:emailId/verify',
	"EmailsController.delete": 'delete /v1/emails/:emailId',
	"PreferencesController.read": 'get /v1/preferences/:accountId',
	"PreferencesController.update": 'post /v1/preferences/:accountId',
	"GroupsController.search": 'get /v1/groups',
	"GroupsController.searchPost": 'post /v1/groups/search',
	"GroupsController.create": 'post /v1/groups',
	"GroupsController.get": 'get /v1/groups/:groupId',
	"GroupsController.update": 'put /v1/groups/:groupId',
	"GroupsController.delete": 'delete /v1/groups/:groupId',
	"GroupMembersController.search": 'get /v1/groups/:groupId/members',
	"GroupMembersController.searchPost": 'post /v1/groups/:groupId/members/search',
	"GroupMembersController.create": 'post /v1/groups/:groupId/members',
	"GroupMembersController.get": 'get /v1/groups/:groupId/members/:groupMemberId',
	"GroupMembersController.update": 'put /v1/groups/:groupId/members/:groupMemberId',
	"GroupMembersController.delete": 'delete /v1/groups/:groupId/members/:groupMemberId',
	"PhonesController.search": 'get /v1/phones',
	"PhonesController.searchPost": 'post /v1/phones/search',
	"PhonesController.create": 'post /v1/phones',
	"PhonesController.get": 'get /v1/phones/:phoneId',
	"PhonesController.update": 'put /v1/phones/:phoneId',
	"PhonesController.sendCode": 'post /v1/phones/:phoneId/send-code',
	"PhonesController.verify": 'post /v1/phones/:phoneId/verify',
	"PhonesController.delete": 'delete /v1/phones/:phoneId',
	"CustomFieldsController.search": 'get /v1/custom-fields',
	"CustomFieldsController.create": 'post /v1/custom-fields',
	"CustomFieldsController.get": 'get /v1/custom-fields/:customFieldId',
	"CustomFieldsController.update": 'put /v1/custom-fields/:customFieldId',
	"CustomFieldsController.delete": 'delete /v1/custom-fields/:customFieldId',
	"ResolverController.resolve": 'get /v1/resolver/resolve',
	"ResolverController.actions": 'get /v1/resolver/actions',
	"ResolverController.models": 'get /v1/resolver/models',
};
