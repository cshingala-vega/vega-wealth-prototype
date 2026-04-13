# Form Recipes

Complete form examples for common patterns. Each recipe is working TSX.

---

## 1. Settings Form (CRUD)

A profile settings form using Field components with react-hook-form + zod validation, save/cancel actions, and toast feedback.

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/vui/field"
import { Input } from "@/components/vui/input"
import { Textarea } from "@/components/vui/textarea"
import { Button } from "@/components/vui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/vui/card"
import { toast } from "sonner"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function SettingsForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Amara Osei",
      email: "amara@example.com",
      bio: "Product designer based in Accra. Passionate about accessible design systems and component libraries.",
    },
  })

  async function onSubmit(data: ProfileValues) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success("Profile saved", {
      description: "Your changes are now live",
    })
    reset(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                aria-invalid={!!errors.name || undefined}
                {...register("name")}
              />
              {errors.name && (
                <FieldError errors={[errors.name.message!]} />
              )}
            </Field>
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email || undefined}
                {...register("email")}
              />
              <FieldDescription>Used for login and notifications</FieldDescription>
              {errors.email && (
                <FieldError errors={[errors.email.message!]} />
              )}
            </Field>
            <Field data-invalid={!!errors.bio || undefined}>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                aria-invalid={!!errors.bio || undefined}
                {...register("bio")}
              />
              <FieldDescription>Max 500 characters</FieldDescription>
              {errors.bio && (
                <FieldError errors={[errors.bio.message!]} />
              )}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty}
            onClick={() => reset()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

---

## 2. Login Form

An email + password login form using Form components (react-hook-form pattern) with validation error display.

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/vui/form"
import { Input } from "@/components/vui/input"
import { Button } from "@/components/vui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/vui/card"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginValues) {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate incorrect credentials for demo
      if (data.email !== "kai@example.com") {
        form.setError("root", {
          message: "Invalid email or password",
        })
        return
      }

      toast.success("Welcome back", {
        description: `Signed in as ${data.email}`,
      })
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later",
      })
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {form.formState.errors.root && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="kai@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
```

---

## 3. Multi-step Wizard

A 3-step onboarding wizard with useState for step tracking, Field components, and step-specific validation.

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/vui/field"
import { Input } from "@/components/vui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/vui/select"
import { Switch } from "@/components/vui/switch"
import { Button } from "@/components/vui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/vui/card"
import { Progress } from "@/components/vui/progress"
import { toast } from "sonner"

const wizardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.string().min(1, "Please select a role"),
  notifications: z.boolean().default(true),
})

type WizardValues = z.infer<typeof wizardSchema>

const steps = [
  { title: "Account", description: "Your basic information" },
  { title: "Preferences", description: "Customize your experience" },
  { title: "Confirm", description: "Review and finish" },
]

export default function OnboardingWizard() {
  const [step, setStep] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      notifications: true,
    },
  })

  const values = watch()
  const progress = ((step + 1) / steps.length) * 100

  async function handleNext() {
    if (step === 0) {
      const valid = await trigger(["name", "email"])
      if (!valid) return
    }
    if (step === 1) {
      const valid = await trigger(["role"])
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(data: WizardValues) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success("Account created", {
      description: `Welcome aboard, ${data.name}!`,
    })
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="space-y-3">
          <Progress value={progress} />
          <div>
            <CardTitle>
              Step {step + 1}: {steps[step].title}
            </CardTitle>
            <CardDescription>{steps[step].description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {/* Step 1: Account Info */}
          {step === 0 && (
            <FieldGroup>
              <Field data-invalid={!!errors.name || undefined}>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input
                  id="name"
                  placeholder="Priya Sharma"
                  aria-invalid={!!errors.name || undefined}
                  {...register("name")}
                />
                {errors.name && (
                  <FieldError errors={[errors.name.message!]} />
                )}
              </Field>
              <Field data-invalid={!!errors.email || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="priya@example.com"
                  aria-invalid={!!errors.email || undefined}
                  {...register("email")}
                />
                <FieldDescription>We will send a verification email</FieldDescription>
                {errors.email && (
                  <FieldError errors={[errors.email.message!]} />
                )}
              </Field>
            </FieldGroup>
          )}

          {/* Step 2: Preferences */}
          {step === 1 && (
            <FieldGroup>
              <Field data-invalid={!!errors.role || undefined}>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select
                  value={values.role}
                  onValueChange={(val) => setValue("role", val, { shouldValidate: true })}
                >
                  <SelectTrigger id="role" aria-invalid={!!errors.role || undefined}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="product-manager">Product Manager</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <FieldError errors={[errors.role.message!]} />
                )}
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="notifications">Email notifications</FieldLabel>
                <Switch
                  id="notifications"
                  checked={values.notifications}
                  onCheckedChange={(checked) =>
                    setValue("notifications", checked === true)
                  }
                />
              </Field>
            </FieldGroup>
          )}

          {/* Step 3: Confirmation */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please review your details before creating your account.
              </p>
              <div className="rounded-md border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{values.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{values.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{values.role.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notifications</span>
                  <span className="font-medium">{values.notifications ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
```

---

## 4. Filter/Search Form

A live-filtering interface using controlled inputs with useState — no form submission or react-hook-form needed.

```tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/vui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/vui/select"
import { Card, CardContent } from "@/components/vui/card"
import { Item, ItemGroup, ItemSeparator, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/vui/item"
import { Badge } from "@/components/vui/badge"
import { Dot } from "@/components/vui/dot"
import { SearchIcon } from "lucide-react"

const projects = [
  { name: "Brand Refresh", owner: "Amara Osei", status: "active", category: "Design" },
  { name: "API Migration v2", owner: "Kai Tanaka", status: "active", category: "Engineering" },
  { name: "Q4 Campaign", owner: "Sofia Reyes", status: "completed", category: "Marketing" },
  { name: "Mobile App Redesign", owner: "Priya Sharma", status: "active", category: "Design" },
  { name: "Data Pipeline Upgrade", owner: "Lucas Moreno", status: "on-hold", category: "Engineering" },
  { name: "Customer Onboarding Flow", owner: "Nadia Petrov", status: "completed", category: "Product" },
  { name: "Accessibility Audit", owner: "Tomoko Hayashi", status: "active", category: "Design" },
  { name: "Payment Integration", owner: "Raj Patel", status: "on-hold", category: "Engineering" },
]

const statusConfig = {
  active: { label: "Active", variant: "positive" as const },
  completed: { label: "Completed", variant: "neutral" as const },
  "on-hold": { label: "On Hold", variant: "pending" as const },
}

export default function ProjectFilter() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const filtered = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.owner.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === "all" || project.status === status
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or owners..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No projects match your filters
            </div>
          ) : (
            <ItemGroup>
              {filtered.map((project, i) => (
                <div key={project.name}>
                  {i > 0 && <ItemSeparator />}
                  <Item>
                    <ItemContent>
                      <ItemTitle>{project.name}</ItemTitle>
                      <ItemDescription>{project.owner}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Dot variant={statusConfig[project.status as keyof typeof statusConfig].variant} />
                      <Badge variant="secondary">{project.category}</Badge>
                    </ItemActions>
                  </Item>
                </div>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {projects.length} projects
      </p>
    </div>
  )
}
```
