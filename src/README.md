# Form Builder — source layout

Production-oriented structure for the React app.

```
src/
├── app/                 # App shell, providers, routing entry
│   ├── App.jsx
│   └── providers.jsx
├── main.jsx             # Vite entry (bootstrap + router)
├── styles/
│   └── index.css
├── features/            # Domain features (pages + feature UI)
│   ├── builder/
│   │   ├── components/
│   │   └── pages/
│   ├── forms/
│   │   └── pages/
│   ├── preview/
│   │   ├── components/
│   │   └── pages/
│   ├── projects/
│   │   ├── components/
│   │   └── pages/
│   └── settings/
│       └── pages/
└── shared/              # Cross-feature code
    ├── components/
    │   ├── common/
    │   └── fields/      # Form field renderers (builder + preview)
    ├── constants/
    ├── contexts/
    ├── hooks/
    ├── layouts/
    ├── models/
    ├── schemas/
    ├── services/
    └── utils/
```

Import alias: `@/` → `src/` (see `vite.config.js`).

Examples:

- `@/shared/hooks/useFormBuilder`
- `@/features/builder/pages/BuilderPage`
- `@/shared/components/fields/FieldFactory`
