# OrganizationsController.update

Brief overview: Update validates the request, loads the target organization, conditionally checks duplicate name and image payload, validates metadata in the repository using `customFieldsOrgId` when provided, saves the `Organization`, then publishes an event.

## Method

Route: `PUT /v1/organizations/:organizationId`  
Controller method: `async update(@Path() organizationId: number, @Queries() query: {}, @Body() body: OrganizationUpdateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization
    participant CustomFieldService
    participant EventBus

    Client->>OrganizationsController: PUT /v1/organizations/:organizationId
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: validated request
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService->>Organization: count({ where: { name: body.name } })
    Organization-->>OrganizationService: countResult
    OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
    OrganizationService->>OrganizationRepository: update(organizationId, params, customFieldsOrgId)
    OrganizationRepository->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>CustomFieldService: validate("Organization", organization.toJSON().metadata, customFieldsOrgId || organization.parentOrgId)
    CustomFieldService-->>OrganizationRepository: valid
    OrganizationRepository->>Organization: save()
    Organization-->>OrganizationRepository: updated organization
    OrganizationRepository-->>OrganizationService: updated organization
    OrganizationService-->>OrganizationsController: updated organization
    OrganizationsController->>EventBus: publish(new EventMutation(principal.arn, organization.arn, appPrefix:organizations/update, JSON.stringify(body)))
    EventBus-->>OrganizationsController: published
    OrganizationsController-->>Client: 200 OK + PublicOrganizationAttributes
```

## 422 Validation Error

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator

    Client->>OrganizationsController: PUT /v1/organizations/:organizationId
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: PUT /v1/organizations/:organizationId
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: validated request
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository->>Organization: findByPk(organizationId)
    Organization-->>OrganizationRepository: null
    OrganizationRepository-->>OrganizationService: null
    OrganizationService-->>OrganizationsController: NotFoundError
    OrganizationsController-->>Client: 404 Not Found
```

## 422 Duplicate Name Validation Failure

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: PUT /v1/organizations/:organizationId
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: validated request
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService->>Organization: count({ where: { name: body.name } })
    Organization-->>OrganizationService: countResult > 0
    OrganizationService-->>OrganizationsController: ValidationError({ body.name })
    OrganizationsController-->>Client: 422 Validation Error
```

## 422 Invalid Image Validation Failure

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository

    Client->>OrganizationsController: PUT /v1/organizations/:organizationId
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: validated request
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: read(organizationId)
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
    OrganizationService-->>OrganizationsController: ValidationError({ body.imageBase64 })
    OrganizationsController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Failure

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationUpdateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant CustomFieldService

    Client->>OrganizationsController: PUT /v1/organizations/:organizationId
    OrganizationsController->>OrganizationUpdateParamsValidator: validate({ organizationId, query, body })
    OrganizationUpdateParamsValidator-->>OrganizationsController: validated request
    OrganizationsController->>OrganizationService: update(organizationId, body, body.customFieldsOrgId)
    OrganizationService->>OrganizationRepository: update(organizationId, params, customFieldsOrgId)
    OrganizationRepository->>CustomFieldService: validate("Organization", organization.toJSON().metadata, customFieldsOrgId || organization.parentOrgId)
    CustomFieldService-->>OrganizationRepository: ValidationError({ body.metadata })
    OrganizationRepository-->>OrganizationService: ValidationError({ body.metadata })
    OrganizationService-->>OrganizationsController: ValidationError({ body.metadata })
    OrganizationsController-->>Client: 422 Validation Error
```

Sources:
- `src/controllers/v1/organizations.controller.ts`
- `src/modules/organizations/organization.service.ts`
- `src/modules/organizations/organization.repository.ts`
- `src/modules/custom-fields/custom-field.service.ts`
- `src/validators/organization-update-params.validator.ts`
- `database/models/organization.ts`
- `test/api/v1/organizations/update.test.ts`

Assumptions:
- The success diagram shows the branch where `body.name` changes and `imageBase64` is supplied, because those are the only code paths that trigger duplicate-name and image-signature checks.
