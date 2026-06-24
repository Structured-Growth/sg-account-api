# PhonesController.sendCode

Brief overview: Validates the path parameter, delegates to `PhonesService` to read the phone, optionally generates and stores a new verification code, sends the SMS through `SmsService`, and finishes with `204 No Content`.

## Method

- Route: `POST /v1/phones/:phoneId/send-code`
- Signature: `PhonesController.sendCode(phoneId: number)`

## Success

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneSendCodeParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant CustomFieldService
    participant SmsService
    participant Phone

    Client->>PhonesController: sendCode(phoneId)
    PhonesController->>PhoneSendCodeParamsValidator: validate(phoneId)
    PhoneSendCodeParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: sendVerificationCode(phoneId)
    PhonesService->>PhonesRepository: read(phoneId)
    PhonesRepository->>Phone: findByPk(phoneId, { attributes, rejectOnEmpty: false })
    Phone-->>PhonesRepository: phone
    PhonesRepository-->>PhonesService: phone
    opt code is not passed from create flow
        PhonesService->>PhonesService: generateVerificationCode()
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
    end
    PhonesService->>SmsService: send(phoneNumber, message)
    SmsService-->>PhonesService: sent
    PhonesService-->>PhonesController: phone
    PhonesController-->>Client: 204 No Content
```

## 404 Not Found

```mermaid
sequenceDiagram
    actor Client
    participant PhonesController
    participant PhoneSendCodeParamsValidator
    participant PhonesService
    participant PhonesRepository
    participant Phone

    Client->>PhonesController: sendCode(phoneId)
    PhonesController->>PhoneSendCodeParamsValidator: validate(phoneId)
    PhoneSendCodeParamsValidator-->>PhonesController: valid
    PhonesController->>PhonesService: sendVerificationCode(phoneId)
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
    participant PhoneSendCodeParamsValidator

    Client->>PhonesController: sendCode(phoneId)
    PhonesController->>PhoneSendCodeParamsValidator: validate(phoneId)
    PhoneSendCodeParamsValidator-->>PhonesController: throws ValidationError
    PhonesController-->>Client: 422 Validation Error
```
