# Code Quality & Linting Skill

## Purpose
Keep the SIH codebase clean, readable, typed, and reviewable.

## Rules
- Format Python consistently and use Ruff where configured.
- Use type hints for important backend interfaces.
- Keep FastAPI routes thin.
- Keep SQLAlchemy queries readable and tested.
- Avoid duplicated business logic.
- Use ESLint/Prettier or the project's configured frontend tools.
- Keep React components focused and accessible.
- Avoid unnecessary dependencies.
- Treat lint/type/test failures as blocking before claiming completion.
- Do not silence warnings without a reason.
- Review AI/external-data code for unsafe assumptions.

## Definition of done
Relevant tests pass, lint/type checks pass, build succeeds, and the changed behavior is manually verified when user-facing.
