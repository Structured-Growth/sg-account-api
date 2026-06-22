# OrganizationsController.create

Brief overview: Create validates the body, delegates to `OrganizationService.create()`, optionally checks the parent organization, enforces duplicate-name and image rules, validates metadata through `CustomFieldService`, creates the `Organization`, then publishes an event.

## Method

Route: `POST /v1/organizations`  
Controller method: `async create(@Queries() query: {}, @Body() body: OrganizationCreateBodyInterface)`

## Success

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization
    participant CustomFieldService
    participant EventBus

    Client->>OrganizationsController: POST /v1/organizations
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: validated body
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationRepository: read(parentOrgId)
    OrganizationRepository->>Organization: findByPk(parentOrgId)
    Organization-->>OrganizationRepository: parent organization
    OrganizationRepository-->>OrganizationService: parent organization
    OrganizationService->>Organization: count({ where: { name: body.name } })
    Organization-->>OrganizationService: countResult
    OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
    OrganizationService->>OrganizationRepository: create({ parentOrgId, region, title, name, imageUuid, signUpEnabled, status, metadata })
    OrganizationRepository->>CustomFieldService: validate("Organization", metadata, parentOrgId)
    CustomFieldService-->>OrganizationRepository: valid
    OrganizationRepository->>Organization: create(params)
    Organization-->>OrganizationRepository: organization
    OrganizationRepository-->>OrganizationService: organization
    OrganizationService-->>OrganizationsController: organization
    OrganizationsController->>EventBus: publish(new EventMutation(principal.arn, organization.arn, appPrefix:organizations/create, JSON.stringify(body)))
    EventBus-->>OrganizationsController: published
    OrganizationsController-->>Client: 201 Created + PublicOrganizationAttributes
```

## 422 Validation Error

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator

    Client->>OrganizationsController: POST /v1/organizations
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: validation errors
    OrganizationsController-->>Client: 422 Validation Error
```

## 404 Not Found

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant Organization

    Client->>OrganizationsController: POST /v1/organizations
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: validated body
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationRepository: read(parentOrgId)
    OrganizationRepository->>Organization: findByPk(parentOrgId)
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
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant Organization

    Client->>OrganizationsController: POST /v1/organizations
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: validated body
    OrganizationsController->>OrganizationService: create(body)
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
    participant OrganizationCreateParamsValidator
    participant OrganizationService

    Client->>OrganizationsController: POST /v1/organizations
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: validated body
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationService: hasValidImageSignature(Buffer.from(imageBase64, "base64"))
    OrganizationService-->>OrganizationsController: ValidationError({ body.imageBase64 })
    OrganizationsController-->>Client: 422 Validation Error
```

## 422 Custom Field Validation Failure

```mermaid
sequenceDiagram
    participant Client
    participant OrganizationsController
    participant OrganizationCreateParamsValidator
    participant OrganizationService
    participant OrganizationRepository
    participant CustomFieldService

    Client->>OrganizationsController: POST /v1/organizations
    OrganizationsController->>OrganizationCreateParamsValidator: validate({ query, body })
    OrganizationCreateParamsValidator-->>OrganizationsController: validated body
    OrganizationsController->>OrganizationService: create(body)
    OrganizationService->>OrganizationRepository: create({ parentOrgId, region, title, name, imageUuid, signUpEnabled, status, metadata })
    OrganizationRepository->>CustomFieldService: validate("Organization", metadata, parentOrgId)
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
- `src/validators/organization-create-params.validator.ts`
- `database/models/organization.ts`
- `test/api/v1/organizations/create.test.ts`

Assumptions:
- The success diagram shows the branch where `parentOrgId` and `imageBase64` are provided, because those are the only code paths with parent lookup and image-signature validation.
