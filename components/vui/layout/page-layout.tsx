"use client"

import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, VariantProps } from "class-variance-authority"
import { Button } from "../button"
import { ArrowLeft } from "lucide-react"

const PageWrapperVariants = cva("space-y-12 w-full mx-auto py-12", {
	variants: {
		variant: {
			full: "",
			focused: "max-w-5xl",
			slim: "max-w-3xl",
		},
	},
	defaultVariants: {
		variant: "focused",
	},
})

export function PageHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return <div className={cn("flex items-start gap-3 ", className)} {...props} />
}
export function PageHeaderContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-4 ", className)} {...props} />
}
export function PageHeaderTitle({
	className,
	...props
}: React.ComponentProps<"h1">) {
	return (
		<h1
			className={cn("text-xl font-semibold leading-9", className)}
			{...props}
		/>
	)
}
export function PageHeaderDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}
export function PageHeaderActions({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex gap-2 items-center ml-auto", className)}
			{...props}
		/>
	)
}
export function PageHeaderBack({}) {
	return (
		<Button
			size={"icon-sm"}
			className="mr-3 cursor-pointer"
			variant={"outline"}
			onClick={() => window.history.back()}
		>
			<ArrowLeft />
		</Button>
	)
}

export function PageWrapper({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"div"> &
	VariantProps<typeof PageWrapperVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : "div"

	return (
		<Comp
			data-slot="page-wrapper"
			className={cn(PageWrapperVariants({ variant, className }))}
			{...props}
		/>
	)
}

export function PageContent({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"main"> &
	VariantProps<typeof PageWrapperVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : "main"

	return (
		<Comp
			data-slot="page-content"
			className={cn(PageWrapperVariants({ variant, className }))}
			{...props}
		/>
	)
}
