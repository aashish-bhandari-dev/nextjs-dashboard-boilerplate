import { Activity, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card className="flex flex-col justify-between md:col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Accelerate common admin tasks and configurations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start text-xs">
          <Plus className="mr-2 h-3.5 w-3.5" />
          Invite Team Member
        </Button>
        <Button variant="outline" className="w-full justify-start text-xs">
          <CreditCard className="mr-2 h-3.5 w-3.5" />
          Configure Billing
        </Button>
        <Button variant="outline" className="w-full justify-start text-xs">
          <Activity className="mr-2 h-3.5 w-3.5" />
          View API Logs
        </Button>
      </CardContent>
      <div className="bg-muted/60 text-muted-foreground m-4 space-y-1 rounded-lg border p-4 text-xs">
        <div className="text-foreground font-semibold">
          Next.js 16 + shadcn UI
        </div>
        <p>
          Tailwind CSS v4 & Turbopack enabled with standard modular component
          architecture.
        </p>
      </div>
    </Card>
  );
}
