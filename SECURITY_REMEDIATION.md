# Security remediation status

Tracked frontend/backend environment files, a swap file, and `temp/key.txt`
were removed from the worktree. New examples separate public browser
configuration from server-only secrets. Real values must be rotated and Git
history must be reviewed/cleaned by an authorized owner; removing the current
files does not revoke exposed credentials.

The API now refuses short/missing JWT secrets, limits CORS to configured
origins, stops logging request bodies/password diagnostics, validates provider
configuration, and restricts SAM attachment downloads to configured HTTPS
hosts with size/time limits.

Remaining external decisions include authoritative SAM/provider accounts,
Qdrant/Mongo production topology, contract-data retention and licensing,
SSO/RBAC scope, and approval/evaluation rules for AI-generated analysis. Do not
use this prototype for proposal submission or compliance decisions until those
are owned and tested.
