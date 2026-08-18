import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import { Progress } from "../../../components/ui/progress";
import {
  IndianRupee,
  AlertCircle,
  TrendingUp,
  Download,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";

import api from "../../../api/axios";
import useAuthStore from "../../../store/authStore";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const YEARS = ["2024", "2025", "2026"];

const inr = (value) => {
  const n = Number(value || 0);
  return "₹" +
    (n >= 1e5
      ? (n / 1e5).toFixed(2) + " L"
      : n.toLocaleString("en-IN"));
};

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

const academicYearFromYear = (year) => {
  const start = Number(year);
  return `${start}-${String(start + 1).slice(-2)}`;
};

const monthNumber = (month) => {
  if (month === "all") return null;
  return MONTHS.indexOf(month) + 1;
};

const unwrap = (response) => {
  return response?.data?.data ?? response?.data ?? {};
};

const exportCSV = (rows, filename) => {
  const header = [
    "Year",
    "Month/Period",
    "Class",
    "Students",
    "Expected",
    "Collected",
    "Pending",
    "Late Fine",
    "Collection %",
  ];

  const body = rows.map((r) => [
    r.year,
    r.month,
    r.klass,
    r.students,
    r.expected,
    r.collected,
    r.pending,
    r.lateFine,
    `${Number(r.collectionPct || 0).toFixed(1)}%`,
  ]);

  const csv = [header, ...body]
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return `"${text.replaceAll('"', '""')}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  toast.success(`Exported ${filename}`);
};

export default function FeeCollection() {
  const [year, setYear] = useState("2026");
  const [klass, setKlass] = useState("all");
  const [month, setMonth] = useState("all");
  const [view, setView] = useState("month");
  const [q, setQ] = useState("");

  const [classes, setClasses] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [error, setError] = useState("");

  const academicYear = academicYearFromYear(year);

  // ============================================================
  // LOAD CLASSES
  // ============================================================
  useEffect(() => {
    let mounted = true;

    const loadClasses = async () => {
      setClassesLoading(true);

      try {
        const response = await api.get("/classes", {
          params: { status: "active" },
          headers: getHeaders(),
        });

        const payload = response?.data?.data ?? response?.data ?? [];
        const list = Array.isArray(payload)
          ? payload
          : payload?.items ?? payload?.classes ?? [];

        if (mounted) {
          setClasses(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
        if (mounted) setClasses([]);
      } finally {
        if (mounted) setClassesLoading(false);
      }
    };

    loadClasses();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // LOAD FEE COLLECTION DASHBOARD
  // ============================================================
  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const selectedClass =
          klass !== "all"
            ? classes.find(
                (item) =>
                  item.class_uuid === klass ||
                  item.uuid === klass
              )
            : null;

        const params = {
          academic_year: academicYear,
          class_uuid: selectedClass?.class_uuid || selectedClass?.uuid || undefined,
          month: monthNumber(month) || undefined,
          granularity: "monthly",
          search: q.trim() || undefined,
        };

        const response = await api.get(
          "/fees/collection/dashboard",
          {
            params,
            headers: getHeaders(),
          }
        );

        const payload = unwrap(response);

        if (!mounted) return;

        setDashboard(payload || {});
      } catch (err) {
        console.error("Fee collection dashboard error:", err);

        if (!mounted) return;

        setDashboard(null);
        setError(
          err?.response?.data?.detail ||
            "Failed to load fee collection data."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, [academicYear, klass, month, q, classes]);

  // ============================================================
  // API DATA
  // ============================================================

  const summary = dashboard?.summary || {
    expected: 0,
    collected: 0,
    pending: 0,
    late_payment_fines: 0,
    collection_percentage: 0,
  };

  const apiBreakdown = Array.isArray(dashboard?.breakdown)
    ? dashboard.breakdown
    : [];

  const apiTrend = Array.isArray(dashboard?.monthly_trend)
    ? dashboard.monthly_trend
    : [];

  const apiLateTrend = Array.isArray(dashboard?.late_fines_trend)
    ? dashboard.late_fines_trend
    : [];

  // ============================================================
  // CLASS OPTIONS
  // ============================================================

  const classOptions = useMemo(() => {
    if (classes.length) {
      return classes.map((item) => ({
        uuid: item.class_uuid || item.uuid,
        name:
          item.class_name ||
          item.name ||
          item.title ||
          `Class ${item.class_uuid || item.uuid}`,
      }));
    }

    return apiBreakdown.reduce((acc, row) => {
      if (!acc.some((item) => item.uuid === row.class_uuid)) {
        acc.push({
          uuid: row.class_uuid,
          name: row.class_name || "Unknown Class",
        });
      }
      return acc;
    }, []);
  }, [classes, apiBreakdown]);

  // ============================================================
  // NORMALIZED TABLE ROWS
  // ============================================================

  const rows = useMemo(() => {
    return apiBreakdown
      .map((row) => {
        const expected = Number(row.expected || 0);
        const collected = Number(row.collected || 0);
        const pending = Number(row.pending || 0);
        const lateFine = Number(row.late_fee || 0);
        const pct = Number(
          row.collection_percentage ??
            (expected > 0 ? (collected / expected) * 100 : 0)
        );

        const period = row.period || "";
        const label = row.label || period;

        return {
          ...row,
          klass: row.class_name || "Unknown",
          year: academicYear,
          month: label,
          period,
          students: Number(row.students || 0),
          expected,
          collected,
          pending,
          lateFine,
          collectionPct: pct,
        };
      })
      .filter((row) => {
        if (!q.trim()) return true;

        const search = q.toLowerCase().trim();

        return (
          row.klass.toLowerCase().includes(search) ||
          row.month.toLowerCase().includes(search) ||
          row.period.toLowerCase().includes(search)
        );
      });
  }, [apiBreakdown, q, academicYear]);

  // ============================================================
  // TREND
  // ============================================================

  const trend = useMemo(() => {
    return apiTrend.map((row) => ({
      month: row.label || row.period,
      expected: Number(row.expected || 0),
      collected: Number(row.collected || 0),
      pending: Number(row.pending || 0),
      lateFine: Number(row.late_fee || 0),
    }));
  }, [apiTrend]);

  const lateTrend = useMemo(() => {
    if (apiLateTrend.length) {
      return apiLateTrend.map((row) => ({
        month: row.label || row.period,
        lateFine: Number(row.late_fee || 0),
      }));
    }

    return trend.map((row) => ({
      month: row.month,
      lateFine: row.lateFine,
    }));
  }, [apiLateTrend, trend]);

  // ============================================================
  // LATE REGISTER
  // ============================================================

  const lateRegister = useMemo(() => {
    return rows
      .filter((row) => row.lateFine > 0)
      .map((row) => ({
        ...row,
        defaulters: Number(row.defaulters || 0),
        avgPerDefaulter:
          Number(row.defaulters || 0) > 0
            ? Math.round(
                row.lateFine / Number(row.defaulters)
              )
            : 0,
      }))
      .sort((a, b) => b.lateFine - a.lateFine);
  }, [rows]);

  const selectedClassName = useMemo(() => {
    if (klass === "all") return "All Classes";

    return (
      classOptions.find((item) => item.uuid === klass)?.name ||
      "Selected Class"
    );
  }, [klass, classOptions]);

  // ============================================================
  // EXPORT
  // ============================================================

  const handleExport = () => {
    exportCSV(
      rows,
      `fee-collection-${academicYear}.csv`
    );
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Finance"
        title="Fee Collection"
        description="Month-wise expected vs collected vs pending, with late-payment fines. Filter by class, year, month or search."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || rows.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border-border/60 mb-6">
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Academic Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}-{String(Number(y) + 1).slice(-2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Class
            </Label>
            <Select value={klass} onValueChange={setKlass}>
              <SelectTrigger>
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>

                {classesLoading && (
                  <SelectItem value="__loading" disabled>
                    Loading classes...
                  </SelectItem>
                )}

                {classOptions.map((item) => (
                  <SelectItem
                    key={item.uuid}
                    value={item.uuid}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Month
            </Label>
            <Select
              value={month}
              onValueChange={(value) => setMonth(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Granularity
            </Label>
            <Select value={view} onValueChange={setView}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Search
            </Label>
            <Input
              placeholder="Class or period…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/40 mb-6">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading fee collection...
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Expected"
          value={inr(summary.expected)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="info"
        />

        <KpiCard
          label="Collected"
          value={inr(summary.collected)}
          delta={
            summary.expected
              ? Number(
                  (
                    Number(summary.collection_percentage || 0) - 85
                  ).toFixed(1)
                )
              : 0
          }
          icon={<TrendingUp className="h-5 w-5" />}
          tone="success"
        />

        <KpiCard
          label="Pending"
          value={inr(summary.pending)}
          icon={<AlertCircle className="h-5 w-5" />}
          tone="warning"
        />

        <KpiCard
          label="Late Payment Fines"
          value={inr(summary.late_payment_fines)}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="primary"
        />
      </div>

      {/* Trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Monthly Trend — {academicYear} · {selectedClassName}
            </CardTitle>
            <CardDescription>
              Expected vs collected
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) =>
                    `${(Number(v || 0) / 100000).toFixed(0)}L`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => inr(value)}
                />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                  dataKey="expected"
                  name="Expected"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="collected"
                  name="Collected"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Late Fines Trend
            </CardTitle>
            <CardDescription>
              Penalty collected per period
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lateTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) =>
                    `${(Number(v || 0) / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => inr(value)}
                />
                <Line
                  type="monotone"
                  dataKey="lateFine"
                  name="Late Fine"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">
            Class × Period Breakdown
          </TabsTrigger>
          <TabsTrigger value="late">
            Late Payment Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Detailed Breakdown
              </CardTitle>
              <CardDescription>
                {rows.length} rows · monthly API data
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Class</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Late Fine</TableHead>
                    <TableHead className="w-[160px]">
                      Collection %
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row, index) => {
                    const pct = Math.min(
                      100,
                      Math.max(0, Number(row.collectionPct || 0))
                    );

                    return (
                      <TableRow
                        key={`${row.class_uuid}-${row.period}-${index}`}
                        className="border-border/60 hover:bg-muted/40"
                      >
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="font-mono"
                          >
                            {row.klass}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm">
                          {row.month}
                        </TableCell>

                        <TableCell className="text-right text-sm">
                          {row.students}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {inr(row.expected)}
                        </TableCell>

                        <TableCell className="text-right font-semibold text-success">
                          {inr(row.collected)}
                        </TableCell>

                        <TableCell className="text-right font-medium text-warning">
                          {inr(row.pending)}
                        </TableCell>

                        <TableCell className="text-right text-sm">
                          {inr(row.lateFine)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={pct}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs tabular-nums w-10 text-right">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {!loading && rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No data for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="late" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Late Payment Fines
              </CardTitle>
              <CardDescription>
                Penalty collected for overdue dues. Sorted by total fine.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Class</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Avg / Student</TableHead>
                    <TableHead className="text-right">Total Late Fine</TableHead>
                    <TableHead className="text-right">Pending Principal</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {lateRegister.map((row, index) => (
                    <TableRow
                      key={`${row.class_uuid}-${row.period}-${index}`}
                      className="border-border/60 hover:bg-muted/40"
                    >
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-mono"
                        >
                          {row.klass}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm">
                        {row.month}
                      </TableCell>

                      <TableCell className="text-right text-sm">
                        {row.students}
                      </TableCell>

                      <TableCell className="text-right text-sm">
                        {row.students
                          ? inr(
                              Math.round(
                                row.lateFine / row.students
                              )
                            )
                          : inr(0)}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {inr(row.lateFine)}
                      </TableCell>

                      <TableCell className="text-right text-warning">
                        {inr(row.pending)}
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast.info(
                              `Reminder action for ${row.klass} · ${row.month}`
                            )
                          }
                        >
                          Send Reminders
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && lateRegister.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No late fines for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}