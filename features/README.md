# Feature specification contract

Each generated feature definition is the source of truth for schema, validation,
permissions, workflow metadata, integrations, admin UI, and generated Playwright
coverage.

```json
{
  "name": "Order",
  "fields": [
    { "name": "total", "type": "float", "required": true },
    { "name": "receipt", "type": "file", "required": false }
  ],
  "businessRules": [
    { "id": "positive-total", "description": "total must be greater than zero" }
  ],
  "workflow": {
    "states": ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
    "transitions": [
      { "from": "DRAFT", "to": "SUBMITTED", "action": "submit", "permission": "order:submit" }
    ]
  },
  "permissions": {
    "roles": { "ADMIN": ["order:view", "order:edit"], "REVIEWER": ["order:approve"] }
  },
  "integrations": [
    { "name": "payments", "env": ["PAYMENTS_API_KEY", "PAYMENTS_WEBHOOK_SECRET"] }
  ]
}
```

The generator validates the workflow shape, emits the reviewed feature contract,
adds integration keys to `.env.example`, generates CRUD/admin/dashboard code,
and creates a Playwright test draft. Project-specific business rules and
workflow handlers must be reviewed and completed from this contract before
production deployment.
