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

//ExampleController
router.get('/v1/examples', handleRequest(Controllers.ExampleController, "search", handlerOpts));
router.post('/v1/examples', handleRequest(Controllers.ExampleController, "create", handlerOpts));
router.get('/v1/examples/:exampleId', handleRequest(Controllers.ExampleController, "get", handlerOpts));
router.put('/v1/examples/:exampleId', handleRequest(Controllers.ExampleController, "update", handlerOpts));
router.delete('/v1/examples/:exampleId', handleRequest(Controllers.ExampleController, "delete", handlerOpts));

//ResolverController
router.get('/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get('/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get('/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));

