import "reflect-metadata";
import "./load-environment";
import { App } from "./app";
import { container, Lifecycle, logWriters, Logger } from "@structured-growth/microservice-sdk";
import { loadEnvironment } from "./load-environment";
import { AccountRepository } from "../modules/accounts/accounts.repository";
import { AccountsService } from "../modules/accounts/accounts.service";
import { EmailsRepository } from "../modules/emails/emails.repository";
import { EmailsService } from "../modules/emails/emails.service";
import { GroupsRepository } from "../modules/groups/groups.repository";
import { GroupService } from "../modules/groups/groups.service";
import { GroupMemberRepository } from "../modules/groupmember/group-member.repository";
import { GroupMemberService } from "../modules/groupmember/group-member.service";
import { OrganizationRepository } from "../modules/organizations/organization.repository";
import { OrganizationService } from "../modules/organizations/organization.service";
import { PhonesRepository } from "../modules/phones/phones.repository";
import { PhonesService } from "../modules/phones/phones.service";
import { UsersService } from "../modules/users/users.service";
import { UsersRepository } from "../modules/users/users.repository";
import { ImageValidator } from "../validators/image.validator";

// load and validate env variables
loadEnvironment();

// const
container.register("appPrefix", { useValue: process.env.APP_PREFIX });
container.register("stage", { useValue: process.env.STAGE });
container.register("region", { useValue: process.env.REGION });
container.register("isDev", { useValue: process.env.STAGE === "dev" });
container.register("isTest", { useValue: process.env.STAGE === "test" });
container.register("logDbRequests", { useValue: process.env.LOG_DB_REQUESTS === "true" });
container.register("logRequestBody", { useValue: process.env.LOG_HTTP_REQUEST_BODY === "true" });
container.register("logResponses", { useValue: process.env.LOG_HTTP_RESPONSES === "true" });
container.register("s3UserDataBucket", { useValue: process.env.S3_USER_DATA_BUCKET });
container.register("s3UserDataBucketWebSiteUrl", { useValue: process.env.S3_USER_DATA_BUCKET_WEBSITE_URL });

// services
container.register("LogWriter", logWriters[process.env.LOG_WRITER || "ConsoleLogWriter"], {
	lifecycle: Lifecycle.Singleton,
});
container.register("Logger", Logger);
container.register("App", App, { lifecycle: Lifecycle.Singleton });
container.register("AccountsService", AccountsService);
container.register("EmailsService", EmailsService);
container.register("GroupService", GroupService);
container.register("GroupMemberService", GroupMemberService);
container.register("OrganizationService", OrganizationService);
container.register("PhonesService", PhonesService);
container.register("UsersService", UsersService);



// repositories
container.register("AccountRepository", AccountRepository);
container.register("EmailsRepository", EmailsRepository);
container.register("GroupsRepository", GroupsRepository);
container.register("GroupMemberRepository", GroupMemberRepository);
container.register("OrganizationRepository", OrganizationRepository);
container.register("UsersRepository", UsersRepository);
container.register("PhonesRepository", PhonesRepository);


//validators
container.register("ImageValidator", ImageValidator);