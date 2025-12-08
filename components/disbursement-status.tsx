import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

interface Disbursement {
  id: string
  amount: number
  phone_number: string
  status: string
  initiated_at: string
  completed_at?: string
  error_message?: string
  mpesa_transaction_id?: string
}

interface DisbursementStatusProps {
  disbursements: Disbursement[]
}

const statusConfig = {
  pending: { color: "bg-orange-100 text-orange-800", icon: Clock },
  processing: { color: "bg-blue-100 text-blue-800", icon: Clock },
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  failed: { color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function DisbursementStatus({ disbursements }: DisbursementStatusProps) {
  if (disbursements.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No disbursements found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {disbursements.map((disbursement) => {
        const config = statusConfig[disbursement.status as keyof typeof statusConfig]
        const Icon = config.icon

        return (
          <Card key={disbursement.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">Payment to {disbursement.phone_number}</CardTitle>
                <Badge className={config.color}>
                  <Icon className="h-3 w-3 mr-1" />
                  {disbursement.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p className="font-semibold">KSh {Number(disbursement.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Initiated</p>
                  <p className="font-semibold">{new Date(disbursement.initiated_at).toLocaleString()}</p>
                </div>
                {disbursement.completed_at && (
                  <div>
                    <p className="text-slate-500">Completed</p>
                    <p className="font-semibold">{new Date(disbursement.completed_at).toLocaleString()}</p>
                  </div>
                )}
                {disbursement.mpesa_transaction_id && (
                  <div>
                    <p className="text-slate-500">M-Pesa ID</p>
                    <p className="font-semibold text-xs">{disbursement.mpesa_transaction_id}</p>
                  </div>
                )}
              </div>
              {disbursement.error_message && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{disbursement.error_message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
