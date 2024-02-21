import { autoInjectable, inject, NotFoundError, ValidationError, ValidateFuncArgs, DescribeResource, } from "@structured-growth/microservice-sdk";
import Organization from "../../../database/models/organization";
import { OrganizationCreateBodyInterface } from "../../interfaces/organization-create-body.interface";
import { OrganizationUpdateBodyInterface } from "../../interfaces/organization-update-body.interface";
import { OrganizationRepository } from "./organization.repository";
import slug from 'slug';
import { Buffer } from 'buffer';
import { promises as fs } from 'fs';

@autoInjectable()
export class OrganizationService {
	constructor(
		@inject("OrganizationRepository") private organizationRepository: OrganizationRepository
	) {}

    public async hasValidImageSignature(fileBuffer: Buffer): Promise<boolean> {
        try {
            // Check if the file buffer is large enough to contain image signatures
            if (fileBuffer.length < 12) {
                return false;
            }
    
            // Define file signatures for common image formats
            const jpegSignature = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            const gifSignature = Buffer.from('GIF87a');
            const gif89aSignature = Buffer.from('GIF89a');
    
            // Check if the file buffer's first 12 bytes match any of the known image formats
            if (
                fileBuffer.slice(0, jpegSignature.length).equals(jpegSignature) ||
                fileBuffer.slice(0, pngSignature.length).equals(pngSignature) ||
                fileBuffer.slice(0, gifSignature.length).equals(gifSignature) ||
                fileBuffer.slice(0, gif89aSignature.length).equals(gif89aSignature)
            ) {
                return true;
            }
    
            return false;
        } catch (error) {
            // An error occurred while trying to read the file buffer
            return false;
        }
    }

	public async create(params: OrganizationCreateBodyInterface): Promise<Organization> {

        if (params.image && !(await this.hasValidImageSignature(params.image))) {
            throw new ValidationError({
                title: "Invalid image file",
            });
        }

        const checkParentOrg = await this.organizationRepository.read(params.parentOrgId);

        if (!checkParentOrg) {
			throw new NotFoundError(`Organization ${params.parentOrgId} not found`);
		}

        const name = slug(params.title);
        const count = await Organization.count({
            where: {name},
        });

        if (count > 0) {
            throw new ValidationError({
                title: "Organization with the same name is already exists", 
            })
        }

        const randomImageUuid = Math.random().toString(36).substring(7); 

		return this.organizationRepository.create({
			parentOrgId: params.parentOrgId,
           // OrganisationId = 
			region: params.region,
			title: params.title,
			name: name,
			imageUuid: "",
			status: params.status || "inactive",
            arn: "", // To do
		});
	}

    public async update(params: OrganizationUpdateBodyInterface): Promise<Organization>{

        if (params.image && !(await this.hasValidImageSignature(params.image))) {
            throw new ValidationError({
                title: "Invalid image file",
            });
        }

        const name = slug(params.title);
        const count = await Organization.count({
            where: {name},
        });

        if (count <= 0) {
            throw new NotFoundError(`Organization ${params.title} not found`);
        }

		return this.organizationRepository.update({
			//parentOrgId: params.parentOrgId,
			//region: params.region,
            id: params.organizationId,
			title: params.title,
			name: name,
			imageUuid: "",
			status: params.status,
            arn: "", // To do
		});
    }
}
