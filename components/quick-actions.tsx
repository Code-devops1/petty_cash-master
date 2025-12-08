import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/dashboard/transactions/new" className="block cursor-pointer">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
        <Link href="/dashboard/transactions" className="block cursor-pointer">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <FileText className="h-4 w-4 mr-2" />
            View History
          </Button>
        </Link>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Reports
        </Button>
      </CardContent>
    </Card>
  )
}
