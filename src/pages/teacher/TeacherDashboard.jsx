/* eslint-disable react-hooks/set-state-in-effect */
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/kpi-card";
import {
  ClipboardList,
  BookOpen,
  Users,
  Bell,
  NotebookPen,
  ArrowRight,
  Megaphone,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getTeacherDashboard } from "../../api/teacherclass"; // adjust path to your service file

const ACADEMIC_YEAR = "2026-27";

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeacherDashboard(ACADEMIC_YEAR);
      if (res?.success) {
        setDashboard(res.data);
      } else {
        setError(res?.message || "Failed to load dashboard.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const name = dashboard?.teacher?.full_name?.split(" ")[0] ?? "Teacher";

  const summary = dashboard?.summary ?? {
    active_assignments: 0,
    pending_grading: 0,
    open_lesson_plans: 0,
    upcoming_exams: 0,
  };

  const todayPeriods = dashboard?.today_schedule ?? [];
  const draftPlans = dashboard?.pending_lesson_plans ?? [];
  const weakAlert = dashboard?.weak_student_alerts ?? [];

  const recentNotices = useMemo(
    () =>
      (dashboard?.notices ?? [])
        .filter(
          (n) =>
            n.status === "PUBLISHED" &&
            (n.audience === "TEACHERS" ||
              n.audience === "ALL" ||
              n.audience === "STAFF"),
        )
        .slice(0, 4),
    [dashboard],
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard…
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div className="text-sm text-muted-foreground">{error}</div>
          <Button size="sm" variant="outline" onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Good morning, ${name}`}
        description={`${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${todayPeriods.length} periods today.`}
        actions={<></>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="My Active Assignments"
          value={summary.active_assignments}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Pending Grading"
          value={summary.pending_grading}
          icon={<Users className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Lesson Plans (Open)"
          value={summary.open_lesson_plans}
          icon={<NotebookPen className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Upcoming Exams"
          value={summary.upcoming_exams}
          icon={<BookOpen className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-base">
                Today's Schedule
              </CardTitle>
              <CardDescription>{todayPeriods.length} sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/timetable">
                Full timetable
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayPeriods.length === 0 && (
              <div className="text-xs text-muted-foreground p-4 text-center">
                No periods scheduled today.
              </div>
            )}
            {todayPeriods.map((p, i) => (
              <div
                key={p.id ?? i}
                className="flex items-center gap-3 p-2.5 rounded-md border hover:bg-muted/40"
              >
                <div className="text-xs font-mono text-muted-foreground w-28 shrink-0">
                  {p.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.subject}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Section {p.section} · Room {p.room}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7" asChild>
                  <Link to="/teacher/attendance">
                    Mark
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Pending Lesson Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {draftPlans.length === 0 && (
              <div className="text-xs text-muted-foreground p-4 text-center">
                All caught up.
              </div>
            )}
            {draftPlans.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to={`/teacher/lesson-plans/${p.id}`}
                className="block p-2.5 rounded-md border hover:bg-muted/40"
              >
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {p.klass} · {p.chapter} ·{" "}
                  <span className="font-mono">{p.status}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Weak-Student Alerts
            </CardTitle>
            <Badge variant="outline">{weakAlert.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakAlert.length === 0 && (
              <div className="text-xs text-muted-foreground p-4 text-center">
                No alerts in recent gradings.
              </div>
            )}
            {weakAlert.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-2 rounded-md border"
              >
                <div className="flex-1 text-sm">{s.studentName}</div>
                <Badge variant="destructive" className="text-[10px]">
                  {s.marks}/{s.maxMarks}
                </Badge>
                <div className="text-[10px] text-muted-foreground">
                  {s.subject}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Notices
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/notices">
                All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotices.length === 0 && (
              <div className="text-xs text-muted-foreground p-4 text-center">
                No notices right now.
              </div>
            )}
            {recentNotices.map((n) => (
              <div
                key={n.notes_uuid}
                className="flex items-start gap-3 p-2.5 rounded-md hover:bg-muted/40 border"
              >
                <div className="h-8 w-8 rounded-md flex items-center justify-center bg-info/10 text-info shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(n.start_date).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {n.category?.name}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}