# AntiGravity Prompt — Establish Global Breadcrumb Placement Guidelines

## Context

The breadcrumb placement across the **Organisation, Teams & User Management module** is inconsistent.

Issues observed:

* On some pages, the **breadcrumb is touching the page title**
* On other pages, the **breadcrumb has too much space from the header**
* The spacing and placement are **not consistent across pages**

This creates a **poor visual hierarchy and unprofessional UI**.

We need to establish **clear global guidelines for breadcrumb placement** so that **all pages follow the same spacing and structure**.

This should be implemented **once and reused across all pages**.

---

# Goal

Create a **standard breadcrumb layout rule** that must be followed across all pages in the application.

This includes:

* Organisation pages
* Teams pages
* Users pages
* Roles pages
* Policies pages
* Create/Edit pages
* Any future pages inside **Teams & User Management**

---

# Standard Page Header Structure

Every page must follow this layout order:

```
Page Container
 ├── Breadcrumb
 ├── Page Title
 ├── Page Description
 └── Page Content
```

Example:

```
Settings / Teams & User Management / Users

Users
Manage users in your organization

[ Page Content ]
```

---

# Breadcrumb Placement Rules

### Breadcrumb Container

The breadcrumb must be placed **at the top of the page header section**.

Use a wrapper:

```
<div className="space-y-2">
```

Structure example:

```
<div className="space-y-2">

  <Breadcrumb />

  <div>
    <h1>Page Title</h1>
    <p>Page description</p>
  </div>

</div>
```

---

# Spacing Guidelines

### Space between Breadcrumb and Title

Use:

```
mt-1
```

or use:

```
space-y-2
```

Equivalent spacing:

```
8px
```

This ensures the breadcrumb **does not touch the title**.

---

### Space between Title and Description

Use:

```
mt-1
```

Equivalent spacing:

```
4–6px
```

---

### Space before Page Content

Use:

```
mt-6
```

Equivalent spacing:

```
24px
```

Example:

```
<div className="mt-6">
  {/* cards, tables, forms */}
</div>
```

---

# Breadcrumb Typography

Use the following style for breadcrumb text:

```
text-sm text-slate-500
```

Example:

```
Settings / Teams & User Management / Users
```

Separator should be:

```
/
```

---

# Page Title Styling

Use:

```
text-2xl font-bold text-slate-900
```

Example:

```
Users
```

---

# Page Description Styling

Use:

```
text-sm text-slate-500
```

Example:

```
Manage users in your organization
```

---

# Required Implementation

To avoid inconsistency, implement a **shared PageHeader component**.

Example:

```
<PageHeader
  breadcrumb={...}
  title="Users"
  description="Manage users in your organization"
/>
```

This ensures:

* consistent breadcrumb spacing
* consistent title layout
* consistent description placement

---

# Expected Result

After applying this guideline:

✔ Breadcrumb is always **aligned at the top**
✔ Breadcrumb never **touches the title**
✔ Spacing is **consistent across all pages**
✔ Page hierarchy is clear
✔ UI follows **industry SaaS admin layout patterns**

This rule must be applied **across the entire Teams & User Management module and future pages**.
