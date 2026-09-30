import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface Invoice {
  id: string;
  customer: string;
  email: string;
  initials: string;
  status: "Paid" | "Pending" | "Failed";
  amount: string;
}

const defaultInvoices: Invoice[] = [
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

interface RecentInvoicesProps {
  invoices?: Invoice[];
}

export function RecentInvoices({
  invoices = defaultInvoices,
}: RecentInvoicesProps) {
  return (
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
            {invoices.map((inv) => (
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
  );
}
