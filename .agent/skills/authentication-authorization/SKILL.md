# Authentication & Authorization Skill

## Purpose
Secure users, administrators, emergency operators, APIs, and real-time channels.

## Rules
- Hash passwords with a strong password-hashing algorithm; never store plaintext passwords.
- Use short-lived access tokens and a secure refresh strategy when needed.
- Enforce authorization server-side.
- Suggested roles: USER, ADMIN, EMERGENCY_OPERATOR.
- Protect administrative/official-alert operations.
- Check resource ownership where users can access personal data.
- Authenticate WebSocket connections.
- Rate-limit sensitive endpoints.
- Configure CORS narrowly.
- Never log passwords, tokens, or sensitive personal data.
- Record security-relevant audit events.
- Return safe authentication errors without leaking account information.

## SIH
A user must not be able to create/approve an official emergency alert merely by changing a client-side role value.
