"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Shield,
  Users,
  Database,
  Smartphone,
  AlertTriangle,
  Server,
  Activity,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SuperAdminDashboardProps {
  user: any
  profile: any
}

interface SystemConfig {
  id: string
  key: string
  value: string
  description: string
  is_sensitive: boolean
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export default function SuperAdminDashboard({ user, profile }: SuperAdminDashboardProps) {
  const [config, setConfig] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: configData, error: configError } = await supabase
        .from("configuration")
        .select("*")
        .order("key")

      if (configError) throw configError

      setConfig(configData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (key: string, value: string) => {
    try {
      const { error } = await (supabase
        .from("system_config") as any)
        .update({ value })
        .eq("key", key)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error updating config:", error)
    }
  }


  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const systemStats = {
    configItems: config.length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground mt-1">Manage system configuration and user accounts</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-border">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Configuration Items</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{systemStats.configItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">User data unavailable</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">User data unavailable</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Pending Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">User data unavailable</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-background border border-border rounded-lg p-1">
          <TabsTrigger 
            value="config" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="mr-2 h-4 w-4" />
            System Configuration
          </TabsTrigger>
        </TabsList>


        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : config.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No configuration items found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{item.key}</h3>
                            {item.is_sensitive && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Sensitive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          {item.is_sensitive ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type={showSensitive[item.key] ? "text" : "password"}
                                value={item.value}
                                onChange={(e) => updateConfig(item.key, e.target.value)}
                                className="bg-background border-border text-foreground"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleSensitiveVisibility(item.key)}
                              >
                                {showSensitive[item.key] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Input
                              value={item.value}
                              onChange={(e) => updateConfig(item.key, e.target.value)}
                              className="bg-background border-border text-foreground"
                            />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateConfig(item.key, item.value)}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Last Login</h3>
                      <p className="text-sm text-muted-foreground">Today, 09:30 AM</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Success
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Last Config Change</h3>
                      <p className="text-sm text-muted-foreground">Yesterday, 04:15 PM</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Update
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Failed Login Attempts</h3>
                      <p className="text-sm text-muted-foreground">3 in last 24 hours</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Warning
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}