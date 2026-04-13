---
name: wiring-vui-forms
description: Builds interactive forms with validation using VUI CN components. Applies when creating forms, handling validation, form submit, react-hook-form, zod schemas, input handling, field errors, form state, interactive forms, user input, sign up flows, login forms, checkout forms, settings forms, multi-step wizards, filter forms, or any pattern involving controlled inputs and submission logic.
user-invocable: true
---

# Wiring VUI Forms

Build interactive forms with validation using VUI CN's form components. Two approaches: **Field** (simple layout, no JS state) vs **Form** (react-hook-form + zod for validation/state).

> The `prototyping-with-vui` skill covers page layouts. This skill covers form wiring, validation, and submission.

## Installing Components

```bash
npx shadcn@latest add https://cn.vui.run/r/field    # Field, FieldGroup, FieldLabel, etc.
npx shadcn@latest add https://cn.vui.run/r/form     # Form, FormField, FormItem, etc.
npx shadcn@latest add https://cn.vui.run/r/input
npx shadcn@latest add https://cn.vui.run/r/select
npx shadcn@latest add https://cn.vui.run/r/sonner   # Toast notifications
npm install react-hook-form zod @hookform/resolvers  # For validated forms
```

## Choosing an Approach

| Need | Approach | Components |
|------|----------|------------|
| Simple layout, no JS validation | **Field** | FieldGroup, Field, FieldLabel, FieldDescription, FieldError |
| Validation, error messages, controlled state | **Form** | Form, FormField, FormItem, FormLabel, FormControl, FormMessage |
| Live filtering, no submission | **useState** | Controlled inputs with onChange handlers |

## Field Components (Simple Layout)

Use `FieldGroup` + `Field` for forms without client-side validation — settings with `defaultValue`, static forms, server-action forms.

```tsx
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/vui/field"
import { Input } from "@/components/vui/input"

<FieldGroup>
  <Field>
    <FieldLabel htmlFor="name">Full name</FieldLabel>
    <Input id="name" defaultValue="Amara Osei" />
  </Field>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" defaultValue="amara@example.com" />
    <FieldDescription>Used for login and notifications</FieldDescription>
  </Field>
</FieldGroup>
```

**FieldError** accepts an `errors` array and auto-deduplicates messages. Pair with `data-invalid` on Field and `aria-invalid` on the control:

```tsx
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldError errors={["Please enter a valid email"]} />
</Field>
```

## Form Components (react-hook-form + zod)

The VUI form stack: `react-hook-form` manages state, `zod` defines the schema, `zodResolver` bridges them, `Form` components render with automatic error wiring.

### Zod Schema Patterns

```tsx
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  role: z.string().default("viewer"),
  notifications: z.boolean().default(true),
  status: z.enum(["active", "inactive", "pending"]),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
})

type FormValues = z.infer<typeof schema>
```

### Form Component Composition

The nesting is always:

```
<Form {...form}>              ← Provider, spreads useForm return
  <form onSubmit={...}>       ← Native form element
    <FormField>               ← Connects to a field by name
      <FormItem>              ← Wrapper for one field
        <FormLabel>           ← Label, auto-linked
        <FormControl>         ← Wraps the actual input
          <Input {...field} /> ← The control, spread field props
        </FormControl>
        <FormDescription>    ← Optional helper text
        <FormMessage />       ← Shows validation error automatically
      </FormItem>
    </FormField>
  </form>
</Form>
```

### Wiring a Form

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/vui/form"
import { Input } from "@/components/vui/input"
import { Button } from "@/components/vui/button"
import { toast } from "sonner"

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
})
type FormValues = z.infer<typeof schema>

export default function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: FormValues) {
    await signIn(data)
    toast.success("Welcome back")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="kai@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}
```

## Form Submission and Toasts

```tsx
import { toast } from "sonner"

async function onSubmit(data: FormValues) {
  try {
    await saveProfile(data)
    toast.success("Profile saved", { description: "Your changes are now live" })
  } catch {
    toast.error("Something went wrong")
  }
}
```

Mount `<Toaster />` once in the app layout:
```tsx
import { Toaster } from "@/components/vui/sonner"
// In layout.tsx body:
<Toaster />
```

## State Management Patterns

**Dialog with form** — close dialog and reset on success:
```tsx
const [open, setOpen] = useState(false)
async function onSubmit(data: FormValues) {
  await createItem(data)
  toast.success("Item created")
  setOpen(false)
  form.reset()
}
```

**Filter state (no submission)** — use useState with controlled inputs:
```tsx
const [search, setSearch] = useState("")
const [status, setStatus] = useState("all")
const filtered = items.filter((item) => {
  const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
  const matchesStatus = status === "all" || item.status === status
  return matchesSearch && matchesStatus
})
<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
```

## Critical Rules

1. **Import from `@/components/vui/`** — components are installed there by the shadcn CLI from the VUI registry.
2. **Add `"use client"`** at the top of any file using useState, useForm, event handlers, or hooks.
3. **Always provide `defaultValues`** in useForm — react-hook-form requires them for controlled inputs.
4. **Spread `{...field}` on controls** inside FormControl — this connects value, onChange, onBlur, and ref.
5. **Use `<FormMessage />`** not manual error display — it auto-wires to the field's zod error.
6. **Toast requires Toaster** — ensure `<Toaster />` from sonner is in the layout.
7. **Field vs Form** — use Field for simple layout, Form for validation. Don't mix them in the same form.

## References

- [references/form-recipes.md](references/form-recipes.md) — Complete form examples: settings CRUD, login, multi-step wizard, live filter

For page layouts: use the `prototyping-with-vui` skill.
For theming: use the `theming-vui-components` skill.
