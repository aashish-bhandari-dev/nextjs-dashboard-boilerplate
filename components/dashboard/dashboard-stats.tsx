import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}

const defaultStats: DashboardStat[] = [
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

interface DashboardStatsProps {
  stats?: DashboardStat[];
}

export function DashboardStats({ stats = defaultStats }: DashboardStatsProps) {
  return (
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
  );
}
