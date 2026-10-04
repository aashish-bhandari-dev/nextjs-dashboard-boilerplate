"use client";

import * as React from "react";
import {
  Check,
  Layers,
  Loader2,
  Search,
  Table as TableIcon,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GroupedPermissions } from "@/types/permission.types";
import { Role } from "@/types/role.types";
import { permissionRepo } from "@/repo/permission.repo";
import { roleRepo } from "@/repo/role.repo";

interface PermissionsCatalogViewProps {
  roles?: Role[];
}

export function PermissionsCatalogView({ roles }: PermissionsCatalogViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"catalog" | "matrix">("catalog");
  const [groupedPermissions, setGroupedPermissions] = React.useState<GroupedPermissions>({});
  const [matrixRoles, setMatrixRoles] = React.useState<Role[]>(roles || []);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState("all");

  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        permissionRepo.listGroupedPermissions({
          onSuccess: (data) => {
            if (isMounted) setGroupedPermissions(data);
          },
          onError: () => {},
        }),
        roleRepo.listRoles({
          query: { limit: 100 },
          onSuccess: (data) => {
            if (isMounted) setMatrixRoles(data);
          },
          onError: () => {},
        }),
      ]);
      if (isMounted) setIsLoading(false);
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const allModules = Object.keys(groupedPermissions);
  const allPermissionsList = Object.values(groupedPermissions).flat();

  // Filtered catalog
  const filteredCatalog = React.useMemo(() => {
    const result: GroupedPermissions = {};
    const q = search.toLowerCase().trim();

    for (const [mod, perms] of Object.entries(groupedPermissions)) {
      if (selectedModule !== "all" && mod !== selectedModule) continue;

      const filtered = perms.filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.action.toLowerCase().includes(q)
      );

      if (filtered.length > 0) {
        result[mod] = filtered;
      }
    }
    return result;
  }, [groupedPermissions, search, selectedModule]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/60 p-3 rounded-xl shadow-xs">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveSubTab("catalog")}
            className={`h-8 text-xs font-semibold px-3 ${
              activeSubTab === "catalog"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5 mr-1.5" />
            Module Catalog
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveSubTab("matrix")}
            className={`h-8 text-xs font-semibold px-3 ${
              activeSubTab === "matrix"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="size-3.5 mr-1.5" />
            Role Permission Matrix
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16 border border-border/60 rounded-xl bg-card">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading permissions registry...</span>
        </div>
      ) : activeSubTab === "catalog" ? (
        /* Catalog View */
        <div className="space-y-4">
          {/* Module Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedModule("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedModule === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-card border border-border/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Modules ({allPermissionsList.length})
            </button>
            {allModules.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors uppercase shrink-0 ${
                  selectedModule === mod
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-card border border-border/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {mod} ({groupedPermissions[mod]?.length || 0})
              </button>
            ))}
          </div>

          {/* Catalog Grouped Cards */}
          {Object.keys(filteredCatalog).length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/80 rounded-xl text-sm text-muted-foreground">
              No permissions found matching &quot;{search}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(filteredCatalog).map(([mod, perms]) => (
                <Card key={mod} className="shadow-xs border-border/60">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">
                          {mod}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {perms.length} actions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-border/40">
                    {perms.map((perm) => (
                      <div
                        key={perm.name}
                        className="p-3.5 hover:bg-muted/30 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {perm.displayName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono py-0 px-1.5 uppercase font-medium"
                            >
                              {perm.action}
                            </Badge>
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {perm.name}
                          </p>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground/90 mt-1">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Matrix View */
        <Card className="shadow-xs border-border/60 overflow-hidden">
          <CardHeader className="p-5 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-base font-bold">Permissions Authorization Matrix</CardTitle>
            <CardDescription className="text-xs">
              Overview of active privileges granted across system and custom roles
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px] text-xs font-bold uppercase">
                    Permission Definition
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase">Module</TableHead>
                  {matrixRoles.map((r) => (
                    <TableHead
                      key={r.id}
                      className="text-center text-xs font-bold uppercase whitespace-nowrap"
                    >
                      <div>{r.displayName}</div>
                      <span className="text-[10px] font-normal text-muted-foreground font-mono">
                        {r.name}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPermissionsList.map((perm) => (
                  <TableRow key={perm.name}>
                    <TableCell className="font-medium">
                      <div className="text-xs font-semibold text-foreground">
                        {perm.displayName}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {perm.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {perm.module}
                      </Badge>
                    </TableCell>
                    {matrixRoles.map((r) => {
                      const hasWildcard = (r.permissions || []).includes("*");
                      const hasDirect = (r.permissions || []).includes(perm.name);
                      const isGranted = hasWildcard || hasDirect;

                      return (
                        <TableCell key={r.id} className="text-center">
                          {isGranted ? (
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <Check className="size-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center size-6 rounded-full text-muted-foreground/30">
                              <X className="size-3" />
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
