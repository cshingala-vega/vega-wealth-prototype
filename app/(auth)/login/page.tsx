"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/vui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/vui/field"
import { Input } from "@/components/vui/input"
import { Button } from "@/components/vui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="amara@example.com" />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" type="password" />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full">Sign in</Button>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
