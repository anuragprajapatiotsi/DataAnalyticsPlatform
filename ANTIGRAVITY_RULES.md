# ANTIGRAVITY_RULES.md

These rules MUST be followed when generating or modifying any code in this project.

This project should be treated as a **production-grade SaaS dashboard**, not a small demo project.

---

# 1. General Principles

The codebase must follow:

* Scalability
* Maintainability
* Reusability
* Readability
* Separation of Concerns
* Predictable folder structure

Another developer should understand the project without asking questions.

DO NOT write quick-hack code or single-file implementations.

---

# 2. Project Architecture (Feature Based)

Use a **feature-based architecture**, not type-based (not all components in one folder).

Rules:

* No deeply nested messy structure

---

# 3. Routing Rules

Use **React Router nested routes**.

Requirements:

* URLs must represent navigation hierarchy
* Pages must support direct URL access (deep linking)
* Refresh must not break navigation

Example:

```
/settings
/settings/organization-team-user-management
/settings/organization-team-user-management/organizations
```

Parent layout (sidebar/header) must NOT reload when navigating children.

---

# 4. Component Rules

Components must follow:

### Smart vs Dumb Components

**Pages (Smart Components)**

* Handle routing
* Call hooks
* Fetch data

**UI Components (Dumb Components)**

* Only display data
* No API calls
* No business logic

NEVER call API directly inside UI components.

---

# 5. API & Data Fetching Rules

We use:

* Axios instance
* TanStack Query

### Mandatory Rules

1. No `fetch()` inside components
2. No axios calls inside JSX files
3. All API calls go in:

```
features/<feature>/services/
```

Example:

```
features/organizations/services/org.service.ts
```

4. Data fetching must use custom hooks:

```
features/organizations/hooks/useOrganizations.ts
```

Components must call hooks — not services.

---

# 6. Axios Rules

Create a single axios instance:

```
shared/api/axios.ts
```

It must:

* Attach Authorization Bearer token automatically
* Handle 401 globally
* Redirect to login on unauthorized

DO NOT create multiple axios instances.

---

# 7. State Management

Rules:

* Server state → TanStack Query
* UI state → React state
* Global auth → Context Provider

Do NOT store API data in useState if it comes from backend.

---

# 8. Forms

All forms must:

* Have validation
* Disable submit while loading
* Show error messages
* Show success notification

Use controlled inputs.

No uncontrolled forms.

---

# 9. Reusability

Before creating a component, check:

If reusable → put in `shared/components`

Examples:

* Modal
* Table
* Input
* Button
* Badge
* Confirm Dialog

Do NOT duplicate components.

---

# 10. Styling

Follow consistent UI:

* Same spacing
* Same button styles
* Same card styles
* Same typography

No inline CSS unless necessary.

Prefer reusable UI components.

---

# 11. Error Handling

Every API call must handle:

* Loading state
* Error state
* Empty state

Never leave blank screen.

401 → logout
Network error → message to user

---

# 12. Code Quality Rules

Strictly enforce:

* Small components
* No 500-line files
* No duplicated logic
* Meaningful variable names
* No console.log in final code

Bad:

```
data, d, x, val
```

Good:

```
organizationList
selectedOrganization
isLoadingOrganizations
```

---

# 13. Performance Rules

* Use React Query caching
* Avoid unnecessary re-renders
* Use memoization when needed
* Do not refetch data repeatedly

---

# 14. What NOT To Do

DO NOT:

* Hardcode API data
* Mix UI and API logic
* Create giant components
* Create pages without routes
* Use window.location navigation
* Reload the page manually

Use React Router navigation only.

---

# Final Goal

This codebase must resemble a **real enterprise SaaS admin dashboard** architecture (similar to Jira, OpenMetadata, GitHub, or Stripe admin panels).

All generated code must respect these rules.
