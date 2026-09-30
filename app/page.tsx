import {
  Activity,
  ArrowUpRight,
  Bell,
  CreditCard,
  DollarSign,
  Download,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    icon: DollarSign,
  },
  {
    title: "Active Subscriptions",
    value: "+2,350",
    change: "+180.1% from last month",
    icon: Users,
  },
  {
    title: "Sales",
    value: "+12,234",
    change: "+19% from last month",
    icon: CreditCard,
  },
  {
    title: "Active Now",
    value: "+573",
    change: "+201 since last hour",
    icon: Activity,
  },
];

const recentInvoices = [
  {
    id: "INV001",
    customer: "Olivia Martin",
    email: "olivia.martin@email.com",
    initials: "OM",
    status: "Paid",
    amount: "$1,999.00",
  },
  {
    id: "INV002",
    customer: "Jackson Lee",
    email: "jackson.lee@email.com",
    initials: "JL",
    status: "Pending",
    amount: "$39.00",
  },
  {
    id: "INV003",
    customer: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    initials: "IN",
    status: "Paid",
    amount: "$299.00",
  },
  {
    id: "INV004",
    customer: "William Kim",
    email: "will@email.com",
    initials: "WK",
    status: "Paid",
    amount: "$99.00",
  },
  {
    id: "INV005",
    customer: "Sofia Davis",
    email: "sofia.davis@email.com",
    initials: "SD",
    status: "Failed",
    amount: "$39.00",
  },
];

export default function DashboardPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="bg-card flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold">
              AD
            </div>
            <span>AdminHub</span>
          </div>

          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            <span className="text-foreground bg-muted flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2.5 py-1.5 transition-colors">
              Analytics
            </span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2.5 py-1.5 transition-colors">
              Customers
            </span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-2.5 py-1.5 transition-colors">
              Settings
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden w-64 sm:block">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input type="search" placeholder="Search..." className="h-9 pl-8" />
          </div>

          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold">
              SB
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Welcome back! Here is a summary of your platform analytics and
              activities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <span className="inline-flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.change.split(" ")[0]}
                    </span>
                    <span>{stat.change.split(" ").slice(1).join(" ")}</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tables & Activity Section */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Recent Invoices Table */}
          <Card className="md:col-span-4 lg:col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  A list of recent transactions across your payment gateways.
                </CardDescription>
              </div>
              <Button variant="outline" size="xs">
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {inv.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm leading-tight font-medium">
                              {inv.customer}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {inv.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === "Paid"
                              ? "default"
                              : inv.status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {inv.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions / Integration Card */}
          <Card className="flex flex-col justify-between md:col-span-3 lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Accelerate common admin tasks and configurations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Invite Team Member
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
              >
                <CreditCard className="mr-2 h-3.5 w-3.5" />
                Configure Billing
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
              >
                <Activity className="mr-2 h-3.5 w-3.5" />
                View API Logs
              </Button>
            </CardContent>
            <div className="bg-muted/60 text-muted-foreground m-4 space-y-1 rounded-lg border p-4 text-xs">
              <div className="text-foreground font-semibold">
                Next.js 16 + shadcn UI
              </div>
              <p>
                Tailwind CSS v4 & Turbopack enabled with standard root app
                router architecture.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
