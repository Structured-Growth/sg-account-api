# ResolverController.validateCustomFields

Brief overview: the method first hands the input to `ResolveCustomFieldValidateValidator`, then calls `CustomFieldService.validate(entity, data, orgId, false)`, which optionally loads parent organizations, fetches `CustomField` schemas, builds a Joi validator, and returns the validation result in a `200 OK` response.

## Method

`POST /v1/resolver/validate -> validateCustomFields(body)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant ResolveCustomFieldValidateValidator
    participant CustomFieldService
    participant OrganizationService
    participant CustomField
    participant joi
    participant validate

    Client->>ResolverController: validateCustomFields(body)
    ResolverController->>ResolveCustomFieldValidateValidator: validate(body, query)
    ResolveCustomFieldValidateValidator-->>ResolverController: valid
    ResolverController->>CustomFieldService: validate(entity, data, orgId, false)
    opt orgId is missing
        CustomFieldService-->>ResolverController: { valid: true }
    end
    opt orgId is present
        CustomFieldService->>OrganizationService: getParentOrganizations(orgId)
        OrganizationService-->>CustomFieldService: organizations
        CustomFieldService->>CustomField: findAll({ where: { entity, orgId: { [Op.or]: [orgId, ...organizationIds] } } })
        CustomField-->>CustomFieldService: customFields
        CustomFieldService->>joi: object({ ...joi.build(schema) })
        joi-->>CustomFieldService: validator
        CustomFieldService->>validate: validate(validator, data)
        validate-->>CustomFieldService: { valid, message, errors }
        CustomFieldService-->>ResolverController: { valid, message, errors }
    end
    ResolverController-->>Client: 200 OK
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant ResolverController
    participant ResolveCustomFieldValidateValidator

    Client->>ResolverController: validateCustomFields(body)
    ResolverController->>ResolveCustomFieldValidateValidator: validate(body, query)
    ResolveCustomFieldValidateValidator-->>ResolverController: validation error
    ResolverController-->>Client: 422 Validation Error
```
