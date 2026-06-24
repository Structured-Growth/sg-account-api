# PhonesController.verify

Brief overview: Validates the verification request, delegates to `PhonesService.verifyPhone`, reads the phone, checks the verification code and expiration in the service, updates the record through `PhonesRepository`, publishes an event, and returns `200 OK`.

## Method

- Route: `POST /v1/phones/:phoneId/verify`
- Signature: `PhonesController.verify(phoneId: number, query: {}, body: PhoneVerifyBodyInterface)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneVerifyParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant CustomFieldService
    participant Phone
    participant EventBus

    Client->>PhonesController: verify(phoneId, body)
    PhonesController->>PhoneVerifyParamsValidator: validate(phoneId, body)
    PhoneVerifyParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: verifyPhone(phoneId, verificationCode)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    PhonesService->>PhonesService: verify code and expiration
    PhonesService->>PhonesRepository: update(phoneId, params)
    PhonesRepository->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository->>Phone: setAttributes(params)
    PhonesRepository->>CustomFieldService: validate("Phone", metadata, orgId)
    CustomFieldService-->>PhonesRepository: valid
    PhonesRepository->>Phone: save()
    Phone-->>PhonesRepository: updated phone
    PhonesRepository-->>PhonesService: updated phone
    PhonesService-->>PhonesController: updated phone
    PhonesController->>EventBus: publish(new EventMutation(...))
    EventBus-->>PhonesController: published
    PhonesController-->>Client: 200 OK
```

## 404 Invalid Or Expired Verification Code

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneVerifyParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: verify(phoneId, body)
    PhonesController->>PhoneVerifyParamsValidator: validate(phoneId, body)
    PhoneVerifyParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: verifyPhone(phoneId, verificationCode)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    PhonesService->>PhonesService: verify code and expiration
    PhonesService-->>PhonesController: throws NotFoundError
    PhonesController-->>Client: 404 Not Found
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneVerifyParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: verify(phoneId, body)
    PhonesController->>PhoneVerifyParamsValidator: validate(phoneId, body)
    PhoneVerifyParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: verifyPhone(phoneId, verificationCode)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: null
    PhonesRepository-->>PhonesService: null
    PhonesService-->>PhonesController: throws NotFoundError
    PhonesController-->>Client: 404 Not Found
```

## 422 Validation Error

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneVerifyParamsValidator

    Client->>PhonesController: verify(phoneId, body)
    PhonesController->>PhoneVerifyParamsValidator: validate(phoneId, body)
    PhoneVerifyParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
