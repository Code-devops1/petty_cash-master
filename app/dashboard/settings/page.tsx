"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  CreditCard, 
  Shield, 
  Settings as SettingsIcon,
  Check,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface UserProfile {
  id: string;
  full_name?: string;
  phone_number?: string;
  department?: string;
  employee_id?: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    employee_id: ""
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    pending_approval: true,
    status_updates: true,
    system_announcements: false
  });
  const [security, setSecurity] = useState({
    two_factor_auth: false,
    password_change_required: false,
    session_timeout: "30min"
  });
  const [display, setDisplay] = useState({
    theme: "system",
    font_size: "normal",
    high_contrast: false,
    language: "en"
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const result = await (supabase
            .from('user_profiles') as any)
            .select('*')
            .eq('id', user.id)
            .single();

          if (result.error) throw result.error;

          setUser(user);
          setProfile({
            full_name: result.data?.full_name || "",
            email: user.email || "",
            phone: result.data?.phone_number || "",
            department: result.data?.department || "",
            employee_id: result.data?.employee_id || ""
          });
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const profileUpdates = {
        full_name: profile.full_name,
        phone_number: profile.phone,
        department: profile.department,
      };

      const { error } = await (supabase
        .from('user_profiles') as any)
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save notification preferences to the database
      console.log("Saving notification preferences:", notifications);
      
      toast.success("Notification preferences saved!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Failed to save notification preferences", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save security settings to the database
      console.log("Saving security settings:", security);
      
      toast.success("Security settings saved!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error saving security settings:", error);
      toast.error("Failed to save security settings", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDisplay = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save display preferences to the database
      console.log("Saving display preferences:", display);
      
      toast.success("Display preferences saved!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error saving display preferences:", error);
      toast.error("Failed to save display preferences", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              <span>Settings</span>
            </h1>
            <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
          </div>
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Mobile accordion view */}
          <div className="md:hidden mb-4">
            <div className="space-y-2">
              {[
                { value: "account", label: "Account", icon: User },
                { value: "notifications", label: "Notifications", icon: Bell },
                { value: "security", label: "Security", icon: Lock },
                { value: "display", label: "Display", icon: Palette },
                { value: "billing", label: "Billing", icon: CreditCard },
                { value: "advanced", label: "Advanced", icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <div key={tab.value} className="border rounded-lg">
                    <button
                      className={`flex items-center justify-between w-full p-4 text-left ${
                        activeTab === tab.value 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveTab(tab.value)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </div>
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          activeTab === tab.value ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop tab view */}
          <TabsList className="hidden md:grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 pb-2">
            <TabsTrigger value="account" className="flex items-center gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-3">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2 py-3">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 py-3">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                        placeholder="Your email address"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profile.department}
                        onChange={(e) => setProfile({...profile, department: e.target.value})}
                        placeholder="Enter your department"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={profile.employee_id}
                      disabled
                      className="bg-muted"
                      placeholder="Your employee ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user?.user_metadata?.role || profile.department ? profile.department.charAt(0).toUpperCase() + profile.department.slice(1) : "User"}
                      disabled
                      className="bg-muted"
                      placeholder="Your role"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Channels</h3>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                          className="self-end"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive urgent notifications via SMS</p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                          className="self-end"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications on this device</p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                          className="self-end"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Types</h3>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <h4 className="font-medium">Pending Approvals</h4>
                          <p className="text-sm text-muted-foreground">When expenses require your approval</p>
                        </div>
                        <Switch
                          checked={notifications.pending_approval}
                          onCheckedChange={(checked) => setNotifications({...notifications, pending_approval: checked})}
                          className="self-end"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <h4 className="font-medium">Status Updates</h4>
                          <p className="text-sm text-muted-foreground">When your expenses change status</p>
                        </div>
                        <Switch
                          checked={notifications.status_updates}
                          onCheckedChange={(checked) => setNotifications({...notifications, status_updates: checked})}
                          className="self-end"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
                        <div className="space-y-1">
                          <h4 className="font-medium">System Announcements</h4>
                          <p className="text-sm text-muted-foreground">Important system updates and announcements</p>
                        </div>
                        <Switch
                          checked={notifications.system_announcements}
                          onCheckedChange={(checked) => setNotifications({...notifications, system_announcements: checked})}
                          className="self-end"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Pending Approvals</h4>
                        <p className="text-sm text-muted-foreground">When expenses require your approval</p>
                      </div>
                      <Switch
                        checked={notifications.pending_approval}
                        onCheckedChange={(checked) => setNotifications({...notifications, pending_approval: checked})}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Status Updates</h4>
                        <p className="text-sm text-muted-foreground">When your expenses change status</p>
                      </div>
                      <Switch
                        checked={notifications.status_updates}
                        onCheckedChange={(checked) => setNotifications({...notifications, status_updates: checked})}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Announcements</h4>
                        <p className="text-sm text-muted-foreground">Important system updates and announcements</p>
                      </div>
                      <Switch
                        checked={notifications.system_announcements}
                        onCheckedChange={(checked) => setNotifications({...notifications, system_announcements: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveNotifications} 
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? "Saving..." : "Save Notification Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Authentication</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={security.two_factor_auth}
                          onCheckedChange={(checked) => setSecurity({ ...security, two_factor_auth: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Password Change Required</h4>
                          <p className="text-sm text-muted-foreground">Force password change on next login</p>
                        </div>
                        <Switch
                          checked={security.password_change_required}
                          onCheckedChange={(checked) => setSecurity({ ...security, password_change_required: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Session Settings</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout</Label>
                        <Select value={security.session_timeout} onValueChange={(value) => setSecurity({ ...security, session_timeout: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15min">15 minutes</SelectItem>
                            <SelectItem value="30min">30 minutes</SelectItem>
                            <SelectItem value="1hour">1 hour</SelectItem>
                            <SelectItem value="2hours">2 hours</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Active Sessions</h3>
                    <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">Just now</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded">Active</span>
                      </div>

                      <div className="flex justify-between items-center rounded-lg border p-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-muted p-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Home Computer</p>
                            <p className="text-sm text-muted-foreground">Yesterday</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                          Sign Out
                        </Button>
                      </div>

                      <div className="flex justify-between items-center rounded-lg border p-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-muted p-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Work Laptop</p>
                            <p className="text-sm text-muted-foreground">2 days ago</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                          Sign Out
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full md:w-auto">
                      Sign Out of All Other Sessions
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveSecurity} 
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? "Saving..." : "Save Security Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize your interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Theme</h4>
                        <p className="text-sm text-muted-foreground">Change the look of the app</p>
                      </div>
                      <ThemeToggle />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">High Contrast Mode</h4>
                        <p className="text-sm text-muted-foreground">Improve readability for visually impaired users</p>
                      </div>
                      <Switch
                        checked={display.high_contrast}
                        onCheckedChange={(checked) => setDisplay({...display, high_contrast: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Display Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="font-size">Font Size</Label>
                      <Select value={display.font_size} onValueChange={(value) => setDisplay({...display, font_size: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="extra-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={display.language} onValueChange={(value) => setDisplay({...display, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Dashboard Preferences</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Compact View</h4>
                      <p className="text-sm text-muted-foreground">Use compact spacing in lists</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveDisplay} 
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? "Saving..." : "Save Display Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your billing details and plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Current Plan</h3>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-lg">Professional Plan</h4>
                        <p className="text-sm text-muted-foreground">Unlimited transactions, advanced analytics</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$29<span className="text-sm text-muted-foreground">/month</span></p>
                        <p className="text-xs text-muted-foreground">Renews on June 1, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center">
                        <div className="w-10 h-6 bg-muted rounded mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Billing History</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-3 border-b">
                      <span>June 2024</span>
                      <span className="font-medium">$29.00</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span>May 2024</span>
                      <span className="font-medium">$29.00</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>April 2024</span>
                      <span className="font-medium">$29.00</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full md:w-auto">
                  Update Billing Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Advanced configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Data Export</h3>
                    <p className="text-sm text-muted-foreground">Export your data in various formats</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Export as CSV</Button>
                      <Button variant="outline">Export as Excel</Button>
                      <Button variant="outline">Export as PDF</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">API Access</h3>
                    <p className="text-sm text-muted-foreground">Manage your API keys for integrations</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-2 rounded mr-3">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Default API Key</p>
                            <p className="text-xs text-muted-foreground">Created: Jan 2024</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Copy</Button>
                          <Button variant="outline" size="sm">Revoke</Button>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full md:w-auto">
                        Generate New API Key
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Danger Zone</h3>
                    <div className="border border-destructive/30 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-destructive">Delete Account</h4>
                              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="w-full md:w-auto"
                          onClick={() => toast.error("Account deletion requires additional verification")}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}