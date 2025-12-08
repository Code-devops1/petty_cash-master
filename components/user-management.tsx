"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"

interface User {
  id: string
  full_name: string
  email: string
  phone_number?: string
  role: string
  employee_id?: string
  department?: string
  is_active: boolean
  created_at: string
  transactions: { amount: number; status: string }[]
}

interface UserManagementProps {
  users: User[]
}

const roleColors = {
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  technician: "bg-green-100 text-green-800",
}

export default function UserManagement({ users: initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getUserStats = (user: User) => {
    const totalRequests = user.transactions.length
    const totalAmount = user.transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const approvedAmount = user.transactions
      .filter((t) => ["approved", "disbursed", "completed"].includes(t.status))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return { totalRequests, totalAmount, approvedAmount }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 bg-white border-slate-300">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-slate-500">No users found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const stats = getUserStats(user)

            return (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{user.full_name}</h3>
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>{user.role}</Badge>
                          {!user.is_active && <Badge className="bg-red-100 text-red-800">Inactive</Badge>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                          <div>
                            <p className="font-medium">Email</p>
                            <p>{user.email}</p>
                          </div>
                          <div>
                            <p className="font-medium">Employee ID</p>
                            <p>{user.employee_id || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium">Phone</p>
                            <p>{user.phone_number || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium">Department</p>
                            <p>{user.department || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* User Statistics */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalRequests}</p>
                        <p className="text-xs text-slate-500">Total Requests</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">KSh {stats.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Total Amount</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">KSh {stats.approvedAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Approved</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
