import { autoInjectable, inject, NotFoundError, ValidationError,} from "@structured-growth/microservice-sdk";
import Organization from "../../../database/models/organization";
import { OrganizationCreateBodyInterface } from "../../interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "../../interfaces/organization-update-body.interface";
import { OrganizationRepository } from "./organization.repository";
import slug from 'slug';
import { ImageValidator } from '../../validators/image.validator';
import { Buffer } from 'buffer';


@autoInjectable()
export class OrganizationService {
	constructor(
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository
	) {}

	public async create(params: OrganizationCreateBodyInterface): Promise<Organization> {

        if (!(await ImageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, 'base64')))) {
            throw new ValidationError({
                title: "Invalid image file",
            });
        }
        const checkParentOrg = await this.organizationRepository.read(params.parentOrgId);

        if (!checkParentOrg) {
			throw new NotFoundError(`Parent organization ${params.parentOrgId} not found`);
		}

        const name = slug(params.title);
        const count = await Organization.count({
            where: {name},
        });

        if (count > 0) {
            throw new ValidationError({
                title: "Organization with the same name is already exist", 
            })
        }

        const randomImageUuid = Math.random().toString(36).substring(7); 

		return this.organizationRepository.create({
			parentOrgId: params.parentOrgId,
			region: params.region,
			title: params.title,
			name: name,
			imageUuid: randomImageUuid,
			status: params.status || "inactive",
		});
	}

    public async update(organizationId, params: OrganizationUpdateBodyInterface): Promise<Organization>{

        if (!(await ImageValidator.hasValidImageSignature(Buffer.from(params.imageBase64, 'base64')))) {
            throw new ValidationError({
                title: "Invalid image file",
            });
        }
        
        const name = slug(params.title);
/*        const count = await Organization.count({
            where: {name},
        });

        if (count <= 0) {
            throw new NotFoundError(`Organization ${params.title} not found`);
        }
*/
        const randomImageUuid = Math.random().toString(36).substring(7); 

		return this.organizationRepository.update(organizationId, {
			title: params.title,
			name: name,
			imageUuid: randomImageUuid,
			status: params.status,
		});
    }
}
