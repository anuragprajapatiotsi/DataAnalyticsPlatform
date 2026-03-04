# Frontend UI Guidelines (Typography, Spacing & Layout)

All UI must follow the design scale.
No arbitrary font sizes, margins, paddings, or component sizes are allowed.
If a new size is required, it must be added to the design scale first.

These guidelines must be followed across all pages such as **Users, Teams, Roles, Policies, Settings, and Admin pages** to maintain consistent UI in the application.

---

# 1. Typography Guidelines

Use a limited typography scale to maintain visual hierarchy.

Page Title
Font Size: **20px – 24px**
Example:
text-xl or text-2xl
Font Weight: semibold

Section Title
Font Size: **16px – 18px**
Example:
text-lg
Font Weight: semibold

Table Headers
Font Size: **13px – 14px**
Example:
text-sm font-semibold

Body Text
Font Size: **14px**
Example:
text-sm

Secondary Text (descriptions / helper text)
Font Size: **12px – 13px**
Example:
text-xs

Rules:

* Do not use more than 5 font sizes in the application.
* Maintain consistent hierarchy between title, section title, and body text.
* Avoid random font sizes.

---

# 2. Spacing System

Always follow the **4px spacing scale**.

Allowed spacing values:

4px
8px
12px
16px
24px
32px

Corresponding Tailwind classes:

gap-1 → 4px
gap-2 → 8px
gap-3 → 12px
gap-4 → 16px
gap-6 → 24px
gap-8 → 32px

Rules:

* Do not use arbitrary spacing like gap-5 or gap-7.
* Use consistent spacing across components.

---

# 3. Page Layout Spacing

All pages should follow the same layout padding.

Page container padding:

px-6 py-6

Section spacing:

space-y-6

Example page layout:

<div class="px-6 py-6 space-y-6">

---

# 4. Form Layout Guidelines

Forms should maintain consistent vertical spacing.

Form spacing:

space-y-4

Field spacing:

16px between fields

Input field height:

36px – 40px

Textarea padding:

p-3 or p-4

Rules:

* Form fields should never touch each other.
* Maintain proper margins between sections.

---

# 5. Table Layout Guidelines

Table rows must not look cramped.

Row height:

44px – 48px

Cell padding:

px-4 py-3

Header padding:

px-4 py-2

Example:

<td class="px-4 py-3 text-sm">

---

# 6. Button Guidelines

All buttons should use consistent sizes.

Primary button height:

h-9

Secondary button height:

h-9

Small icon buttons:

h-8 w-8

Button padding:

px-4 or px-6

Rules:

* Avoid different button heights on the same page.

---

# 7. Input Field Guidelines

Standard input height:

h-9

Large form input:

h-10

Example:

<Input className="h-9" />

Rules:

* Input sizes must remain consistent across forms.

---

# 8. Card Layout Guidelines

Cards should use the following structure:

bg-white
border
rounded-lg
p-6
space-y-6

Example:

<div class="bg-white border rounded-lg p-6 space-y-6">

---

# 9. Icon Guidelines

Standard icon sizes:

Navigation icons → 18px
Buttons → 16px
Table actions → 16px

Example:

<Trash2 size={16} />

---

# 10. Text Color Usage

Use only the following text colors.

Primary text:

text-slate-900

Body text:

text-slate-700

Secondary text:

text-slate-500

Disabled text:

text-slate-400

---

# 11. Container Width

Avoid stretching forms across full screen.

Recommended widths:

Forms → max-w-3xl
Settings pages → max-w-5xl
Tables → full width

---

# 12. General UI Principles

* Maintain consistent spacing across the application.
* Avoid overcrowding UI components.
* Follow a predictable layout pattern for all settings pages.
* Use consistent typography and colors.


# Card & Container Standards

To ensure a **unified, production-grade UI**, all card-like containers, panels, and table wrappers in the application must follow these standards.

These rules apply to pages such as **Users, Teams, Roles, Policies, Settings, Dashboards, and Admin panels**.

---

# 1. Core Styling

All card containers must use the following base styles.

| Property      | Value                 | Tailwind Class                 |
| ------------- | --------------------- | ------------------------------ |
| Corner Radius | 8px (Large)           | `rounded-lg`                   |
| Border Color  | Slate 200             | `border-slate-200`             |
| Background    | White / Light Surface | `bg-white` or `bg-slate-50/95` |
| Shadow        | Subtle elevation      | `shadow-sm` or `shadow-none`   |

Example:

```
<div className="rounded-lg border border-slate-200 bg-white shadow-sm">
```

Rules:

* Avoid large shadows.
* Prefer subtle elevation to maintain a clean SaaS UI.
* Do not mix multiple border colors.

---

# 2. Spacing (Padding)

Proper internal spacing improves readability and visual balance.

### Standard Cards

Use:

```
p-6
```

Equivalent spacing:

```
24px
```

Used for:

* Settings pages
* Forms
* Data sections
* Table wrappers

---

### Small / Grid Cards

Use:

```
p-4
```

or

```
p-5
```

Equivalent spacing:

```
16px – 20px
```

Used for:

* Dashboard cards
* Grid items
* Compact UI blocks

---

### Layout Spacing Between Cards

Use:

```
gap-6
```

Equivalent spacing:

```
24px
```

Example layout:

```
<div className="grid gap-6">
```

Rules:

* Never place cards directly next to each other without spacing.
* Maintain consistent separation across all pages.

---

# 3. Table Containers

All tables must be wrapped inside a **card container** to maintain consistent UI boundaries.

Example:

```
<div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
  {/* Table goes here */}
</div>
```

Important notes:

* `overflow-hidden` ensures rounded corners are preserved.
* Tables must **never directly touch the page background**.
* Always wrap tables inside a card.

---

# 4. Interactive States (Hover)

For **clickable cards or dashboard items**, use subtle hover transitions.

Required transition:

```
transition-all duration-300
```

Optional hover effects:

```
hover:shadow-md
hover:-translate-y-1
```

Example:

```
<div className="rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
```

Rules:

* Use hover animations sparingly.
* Avoid aggressive motion.

---

# 5. Header Consistency

Card headers must follow consistent typography rules.

### Card Titles

Font Size:

```
18px
```

Tailwind:

```
text-lg font-bold text-slate-900
```

Example:

```
<h3 className="text-lg font-bold text-slate-900">
```

---

### Card Subtitle / Description

Font Size:

```
14px
```

Tailwind:

```
text-sm font-medium text-slate-500
```

Example:

```
<p className="text-sm text-slate-500">
```

---

# 6. Card Layout Pattern

All cards should follow this internal structure:

```
Card
 ├── Header (title + description)
 ├── Divider (optional)
 └── Content (form / table / controls)
```

Example structure:

```
<div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 space-y-4">

  <div>
    <h3 className="text-lg font-bold text-slate-900">Users</h3>
    <p className="text-sm text-slate-500">
      Manage users in your organization
    </p>
  </div>

  <div>
    {/* content */}
  </div>

</div>
```

---

# 7. Design Principle

All UI containers must follow these principles:

* Consistent radius
* Consistent spacing
* Minimal shadows
* Clean visual hierarchy
* Predictable layouts

Never introduce **new card styles** unless they follow these rules.

This ensures the UI remains **scalable, maintainable, and production-ready**.


These rules ensure a **clean, scalable, production-quality UI**.
