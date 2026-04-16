import Link from "next/link"
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
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/vui/card"
import { Button } from "@/components/vui/button"
import { Badge } from "@/components/vui/badge"
import { ArrowRight, FileUp, GitCompare } from "lucide-react"

export default function WealthPage() {
  return (
    <PageWrapper>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Wealth Operations</PageHeaderTitle>
          <PageHeaderDescription>
            AI-powered tools for trade processing and reconciliation.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Distributor Ingestion */}
          <Card>
            <CardHeader>
              <CardDescription>Operations module</CardDescription>
              <CardTitle>Distributor Ingestion</CardTitle>
              <CardAction>
                <FileUp className="h-5 w-5 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Normalise trade files from any distributor into your internal order book.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/wealth/ingestion">
                  Open module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Trade Reconciliation */}
          <Card>
            <CardHeader>
              <CardDescription>Operations module</CardDescription>
              <CardTitle>Trade Reconciliation</CardTitle>
              <CardAction>
                <GitCompare className="h-5 w-5 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compare your internal ledger against Transfer Agent exports to surface exceptions.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/wealth/reconciliation">
                  Open module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageContent>
    </PageWrapper>
  )
}
