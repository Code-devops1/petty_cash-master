import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, CheckCircle, XCircle } from "lucide-react"

interface Activity {
  id: string
  amount: number
  description: string
  status: string
  updated_at: string
  users: { full_name: string } | null
}

interface RecentActivityProps {
  activities: Activity[]
}

const statusColors = {
  pending: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  disbursed: "bg-blue-100 text-blue-800",
  completed: "bg-slate-100 text-slate-800",
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  disbursed: CheckCircle,
  completed: CheckCircle,
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const StatusIcon = statusIcons[activity.status as keyof typeof statusIcons]

              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <StatusIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{activity.description}</p>
                      <Badge className={`${statusColors[activity.status as keyof typeof statusColors]} text-xs`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{activity.users?.full_name}</span>
                      </div>
                      <span>KSh {Number(activity.amount).toLocaleString()}</span>
                      <span>{new Date(activity.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { RecentActivity }
export default RecentActivity
