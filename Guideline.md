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

These rules ensure a **clean, scalable, production-quality UI**.
