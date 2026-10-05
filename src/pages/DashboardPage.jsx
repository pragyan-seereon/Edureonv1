import { PageContainer, PageHeader } from "../components/page-shell";
import { KpiCard } from "../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  BookOpen,
  Bus,
  CalendarCheck,
  AlertCircle,
  Receipt,
  Plus,
  Download,
  ArrowLeftRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  feeCollectionTrend,
  attendanceTrend,
  classDistribution,
  examPerformance,
} from "../lib/mock";
import { useAuth } from "../lib/auth";
import { portalHomeForRole } from "../lib/portal-nav";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const inr = (n) =>
  "₹" +
  (n >= 1e7
    ? (n / 1e7).toFixed(2) + " Cr"
    : n >= 1e5
      ? (n / 1e5).toFixed(2) + " L"
      : n.toLocaleString("en-IN"));
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const SUPER_ADMIN_SESSION_KEY = "superAdminSession";

export default function DashboardPage() {
  const { user } = useAuth();
  const auth = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const instituteName = user?.institute || "your institute";
  const roleCode = String(user?.role || user?.role_code || "ADMIN")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const customRoleLabel = String(
    user?.role_name ||
      user?.role_display_name ||
      user?.role ||
      user?.role_code ||
      "Team member",
  ).replace(/[_-]+/g, " ");
  const roleDashboard = {
    ACCOUNTANT: {
      label: "Accountant",
      summary: "your institute's accounts and finance.",
    },
    ACCOUNTHEAD: {
      label: "Accounts Head",
      summary: "your institute's accounts and finance.",
    },
    ACCOUNTSHEAD: {
      label: "Accounts Head",
      summary: "your institute's accounts and finance.",
    },
    COORDINATOR: {
      label: "Co-Ordinator",
      summary: "your institute's operations.",
    },
  }[roleCode] || {
    label: ["ADMIN", "INSTITUTEADMIN", "PRINCIPAL"].includes(roleCode)
      ? "Admin"
      : customRoleLabel,
    summary: ["ADMIN", "INSTITUTEADMIN", "PRINCIPAL"].includes(roleCode)
      ? `a real-time snapshot of ${instituteName}.`
      : `your role overview at ${instituteName}.`,
  };

  // When switching TO institute admin, the Institutes page sets switchedFrom: "super_admin"
  // on the user object. We also persist the super admin session in sessionStorage so we
  // can fully restore it when switching back.
  const isSwitched = user?.switchedFrom === "super_admin";

  const switchBackToSuperAdmin = async () => {
    const raw = sessionStorage.getItem(SUPER_ADMIN_SESSION_KEY);
    if (!raw) {
      toast.error("Could not restore super admin session.");
      return;
    }
    const superAdminUser = JSON.parse(raw);
    sessionStorage.removeItem(SUPER_ADMIN_SESSION_KEY);
    await auth.completeLogin(superAdminUser);
    toast.success("Switched back to Super Admin");
    navigate("/super/institutes");
  };

  useEffect(() => {
    if (!user) return;
    const target = portalHomeForRole(user.role);
    if (target !== "/") navigate(target);
  }, [user, navigate]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={roleDashboard.label}
        title={`Welcome back, ${firstName}`}
        description={`Here's ${roleDashboard.summary}`}
        actions={
          <>
            {/* ── Back to Super Admin button — only shown when switched ── */}
            {isSwitched && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchBackToSuperAdmin}
                className="border-primary/40 text-primary hover:bg-primary/10"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Back to Super Admin
              </Button>
            )}

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gradient-primary border-0">
              <Plus className="h-4 w-4" />
              Quick Action
            </Button>
          </>
        }
      />

      {roleCode === "ACCOUNTANT" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Collected this month"
              value={inr(5450000)}
              delta={8.4}
              icon={<IndianRupee className="h-5 w-5" />}
              tone="success"
            />
            <KpiCard
              label="Pending fee dues"
              value={inr(530000)}
              delta={-4.7}
              icon={<AlertCircle className="h-5 w-5" />}
              tone="warning"
            />
            <KpiCard
              label="Recorded payments"
              value="1,284"
              delta={6.2}
              icon={<Receipt className="h-5 w-5" />}
              tone="info"
            />
            <KpiCard
              label="Monthly collection goal"
              value="82%"
              delta={5.1}
              icon={<TrendingUp className="h-5 w-5" />}
              tone="primary"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Fee collection
                </CardTitle>
                <CardDescription>
                  Collected and pending fees over the last 8 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={feeCollectionTrend}>
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
                      tickFormatter={(v) => `${v / 100000}L`}
                    />
                    <Tooltip
                      formatter={(v) => inr(v)}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.18}
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke="var(--chart-5)"
                      fill="var(--chart-5)"
                      fillOpacity={0.12}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Finance checklist
                </CardTitle>
                <CardDescription>Items to review today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Verify online payments", "18 transactions"],
                  ["Follow up on fee dues", "42 students"],
                  ["Reconcile bank statement", "June statement"],
                ].map(([title, detail]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{title}</div>
                      <div className="text-xs text-muted-foreground">
                        {detail}
                      </div>
                    </div>
                    <Badge variant="secondary">Review</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : ["ACCOUNTHEAD", "ACCOUNTSHEAD"].includes(roleCode) ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Total fee collection"
              value={inr(5450000)}
              delta={8.4}
              icon={<IndianRupee className="h-5 w-5" />}
              tone="success"
            />
            <KpiCard
              label="Outstanding dues"
              value={inr(530000)}
              delta={-4.7}
              icon={<AlertCircle className="h-5 w-5" />}
              tone="warning"
            />
            <KpiCard
              label="Budget utilization"
              value="68%"
              delta={2.3}
              icon={<TrendingUp className="h-5 w-5" />}
              tone="info"
            />
            <KpiCard
              label="Accounts requiring review"
              value="12"
              delta={-2.0}
              icon={<Receipt className="h-5 w-5" />}
              tone="primary"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Collection performance
                </CardTitle>
                <CardDescription>
                  Monthly collections compared with pending fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={feeCollectionTrend}>
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
                      tickFormatter={(v) => `${v / 100000}L`}
                    />
                    <Tooltip
                      formatter={(v) => inr(v)}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="collected"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pending"
                      fill="var(--chart-5)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Accounts oversight
                </CardTitle>
                <CardDescription>Current finance operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: "Fee collection target", value: 82 },
                  { label: "Expense approvals", value: 64 },
                  { label: "Payment reconciliation", value: 91 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} />
                  </div>
                ))}
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="font-medium">Next review:</span>
                  <span className="ml-2 text-muted-foreground">
                    Monthly expense summary
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : roleCode === "COORDINATOR" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Student attendance"
              value="92.4%"
              delta={1.8}
              icon={<CalendarCheck className="h-5 w-5" />}
              tone="success"
            />
            <KpiCard
              label="Classes running today"
              value="38"
              delta={0}
              icon={<BookOpen className="h-5 w-5" />}
              tone="primary"
            />
            <KpiCard
              label="Pending follow-ups"
              value="14"
              delta={-3.0}
              icon={<AlertCircle className="h-5 w-5" />}
              tone="warning"
            />
            <KpiCard
              label="Upcoming activities"
              value="6"
              delta={2.0}
              icon={<CalendarCheck className="h-5 w-5" />}
              tone="info"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Attendance this week
                </CardTitle>
                <CardDescription>
                  Daily student and staff attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
                    <YAxis
                      domain={[80, 100]}
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="staff"
                      stroke="var(--chart-3)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Coordinator tasks
                </CardTitle>
                <CardDescription>Operational follow-ups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Confirm class coverage", "3 periods need review"],
                  ["Review attendance", "8 classes pending"],
                  ["Check transport updates", "2 route notices"],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">{title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {detail}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Academic progress
              </CardTitle>
              <CardDescription>
                Average and top scores by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="subject"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="avg"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="top"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : !["ADMIN", "INSTITUTEADMIN", "PRINCIPAL"].includes(roleCode) ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Active students"
              value="2,840"
              delta={3.2}
              icon={<GraduationCap className="h-5 w-5" />}
              tone="primary"
            />
            <KpiCard
              label="Today's attendance"
              value="92.4%"
              delta={1.8}
              icon={<CalendarCheck className="h-5 w-5" />}
              tone="success"
            />
            <KpiCard
              label="Open assignments"
              value="24"
              delta={-2.0}
              icon={<BookOpen className="h-5 w-5" />}
              tone="info"
            />
            <KpiCard
              label="New notices"
              value="5"
              delta={1.0}
              icon={<AlertCircle className="h-5 w-5" />}
              tone="warning"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Institute activity
                </CardTitle>
                <CardDescription>
                  Attendance overview for this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
                    <YAxis
                      domain={[80, 100]}
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="staff"
                      stroke="var(--chart-3)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Your workspace
                </CardTitle>
                <CardDescription>
                  Quick overview for {customRoleLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Tasks to review", "8 items need attention"],
                  ["Upcoming events", "3 scheduled this week"],
                  ["Recent updates", "5 new notices"],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">{title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {detail}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {/* <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Student distribution
              </CardTitle>
              <CardDescription>Enrollment by class</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={classDistribution}
                    dataKey="students"
                    nameKey="class"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {classDistribution.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
        </>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Active Students"
              value="2,840"
              delta={3.2}
              icon={<GraduationCap className="h-5 w-5" />}
              tone="primary"
            />
            <KpiCard
              label="Staff Strength"
              value="186"
              delta={1.1}
              icon={<Users className="h-5 w-5" />}
              tone="info"
            />
            <KpiCard
              label="Fee Collected (MTD)"
              value={inr(5450000)}
              delta={8.4}
              icon={<IndianRupee className="h-5 w-5" />}
              tone="success"
            />
            <KpiCard
              label="Pending Dues"
              value={inr(530000)}
              delta={-4.7}
              icon={<AlertCircle className="h-5 w-5" />}
              tone="warning"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="font-display text-base">
                    Fee Collection Trend
                  </CardTitle>
                  <CardDescription>
                    Collected vs pending — last 8 months
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  FY 2025-26
                </Badge>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={feeCollectionTrend}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--chart-2)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--chart-2)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--chart-5)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--chart-5)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
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
                      tickFormatter={(v) => `${v / 100000}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v) => inr(v)}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      fill="url(#g1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke="var(--chart-5)"
                      strokeWidth={2}
                      fill="url(#g2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  Students by Class
                </CardTitle>
                <CardDescription>Grade-wise enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      dataKey="students"
                      nameKey="class"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {classDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  Attendance (this week)
                </CardTitle>
                <CardDescription>Students vs staff %</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      domain={[80, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="staff"
                      stroke="var(--chart-3)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  Exam Performance — Class X
                </CardTitle>
                <CardDescription>
                  Average vs top score by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={examPerformance}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="subject"
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                    />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="avg"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="top"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom: activity + quick stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: IndianRupee,
                    tone: "bg-success/10 text-success",
                    title: "Fee payment received — ₹48,000",
                    desc: "Aarav Sharma · Class X-B · UPI",
                    time: "2m ago",
                  },
                  {
                    icon: GraduationCap,
                    tone: "bg-primary/10 text-primary",
                    title: "New admission approved",
                    desc: "Diya Verma · Class VIII · ADM-2025-0152",
                    time: "18m ago",
                  },
                  {
                    icon: BookOpen,
                    tone: "bg-info/10 text-info",
                    title: "Term 2 exam schedule published",
                    desc: "Classes IX–XII · Starting 12 Dec",
                    time: "1h ago",
                  },
                  {
                    icon: Bus,
                    tone: "bg-warning/15 text-warning",
                    title: "Route #7 delayed by 12 minutes",
                    desc: "Driver: Sunil · 38 students notified",
                    time: "2h ago",
                  },
                  {
                    icon: CalendarCheck,
                    tone: "bg-success/10 text-success",
                    title: "Attendance closed for today",
                    desc: "Present: 2,612 · Absent: 228",
                    time: "3h ago",
                  },
                ].map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`h-9 w-9 rounded-md flex items-center justify-center ${a.tone}`}
                    >
                      <a.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {a.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {a.desc}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {a.time}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">
                  Capacity & Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "Classroom utilization",
                    value: 78,
                    tone: "bg-primary",
                  },
                  { label: "Hostel occupancy", value: 64, tone: "bg-info" },
                  {
                    label: "Transport fleet usage",
                    value: 89,
                    tone: "bg-warning",
                  },
                  {
                    label: "Library check-out rate",
                    value: 42,
                    tone: "bg-accent",
                  },
                  { label: "Storage used", value: 31, tone: "bg-success" },
                ].map((m) => (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-semibold">{m.value}%</span>
                    </div>
                    <Progress value={m.value} className="h-1.5" />
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  All systems operational
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}