# Pydantic Skill

## Purpose
Validate and serialize all API, configuration, and external-data contracts.

## Rules
- Use Pydantic 2.x.
- Define explicit request, response, database-facing DTO, and external-provider schemas.
- Use `Field` constraints for ranges, lengths, and required values.
- Use enums for controlled values such as severity, status, roles, and data source.
- Use `ConfigDict(from_attributes=True)` when response models read ORM objects.
- Validate coordinates, timestamps, units, confidence scores, and geographic payloads.
- Use model validators for cross-field rules.
- Normalize external provider data before business logic.
- Reject malformed or impossible data rather than silently accepting it.
- Never put secrets into response models or logs.
- Keep schemas compatible with the OpenAPI contract.

## Disaster data
Risk scores must have defined ranges; prediction confidence must be validated; source/freshness metadata should be preserved.
