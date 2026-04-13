import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
} from "@/components/vui/layout/page-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/vui/card"

export default function SettingsPage() {
  return (
    <PageWrapper variant="slim">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Settings</PageHeaderTitle>
          <PageHeaderDescription>Manage your account preferences</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Configure your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Settings content goes here. Use the VUI Field and Input components to build out this form.
            </p>
          </CardContent>
        </Card>
      </PageContent>
    </PageWrapper>
  )
}
