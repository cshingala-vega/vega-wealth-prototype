import {
  PageWrapper,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
} from "@/components/vui/layout/page-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/vui/card"
import { Button } from "@/components/vui/button"

const stats = [
  { title: "Total Contacts", value: "2,847", change: "+124 this month" },
  { title: "Open Deals", value: "$384,200", change: "18 active" },
  { title: "Tasks Due", value: "12", change: "3 overdue" },
]

export default function DashboardPage() {
  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Dashboard</PageHeaderTitle>
          <PageHeaderDescription>Welcome back, Amara</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Export</Button>
          <Button>Add contact</Button>
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardDescription>{s.title}</CardDescription>
                <CardTitle className="text-3xl">{s.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContent>
    </PageWrapper>
  )
}
