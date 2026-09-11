import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  PageContainer,
  PageHeader,
} from "../../components/page-shell";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { KpiCard } from "../../components/kpi-card";

import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileBox,
  IndianRupee,
  Library,
  Megaphone,
  Trophy,
} from "lucide-react";

import studentModel from "../../api/studentModel";


// ============================================================
// HELPERS
// ============================================================

const formatDate = (value) =>
  value
    ? new Date(`${value}`.slice(0, 10)).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "—";


const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));


const Empty = ({ text }) => (
  <div className="text-xs text-muted-foreground text-center p-4">
    {text}
  </div>
);

const getNoteCategory = (note) =>
  note?.category?.name || note?.category || "Notice";


// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = () => {

    setError("");

    studentModel
      .getMyDashboard()
      .then((data) => {

        console.log(
          "Student Dashboard API:",
          data
        );

        setDashboard(data);

      })
      .catch((requestError) => {

        console.error(
          "Student Dashboard Error:",
          requestError
        );

        setError(
          requestError?.response?.data?.detail ||
          "Unable to load your dashboard."
        );

      });

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadDashboard();

  }, []);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (!dashboard && !error) {

    return (
      <PageContainer>

        <div className="py-12 text-sm text-muted-foreground">
          Loading your dashboard…
        </div>

      </PageContainer>
    );

  }


  // ==========================================================
  // DATA
  // ==========================================================

  const student =
    dashboard?.student || {};

  const summary =
    dashboard?.summary || {};

  const fees =
    dashboard?.fees || {};

  const upcomingAssignments =
    dashboard?.upcoming_assignments || [];

  const latestResults =
    dashboard?.latest_results || [];

  const studyMaterials =
    dashboard?.study_materials || [];

  // `communication_notes` is the current dashboard response field. Retain
  // `notes` as a fallback while older backend deployments are upgraded.
  const portalNotes = Array.isArray(dashboard?.communication_notes)
    ? dashboard.communication_notes
    : Array.isArray(dashboard?.notes)
      ? dashboard.notes
      : [];

  // Empty legacy arrays are returned alongside `notes`, so prefer them only
  // when they actually contain records.
  const calendar = Array.isArray(dashboard?.calendar) && dashboard.calendar.length
    ? dashboard.calendar
    : portalNotes.filter((note) =>
        ["event", "events", "calendar", "holiday", "holidays", "academic"].includes(
          getNoteCategory(note).toLowerCase()
        )
      );

  const notices = Array.isArray(dashboard?.notices) && dashboard.notices.length
    ? dashboard.notices
    : portalNotes.filter(
        (note) =>
          !["event", "events", "calendar", "holiday", "holidays", "academic"].includes(
            getNoteCategory(note).toLowerCase()
          )
      );


  // ==========================================================
  // CLASS
  // ==========================================================

  const classLabel = [
    student?.class_name,
    student?.section_name,
  ]
    .filter(Boolean)
    .join(" - ");


  // ==========================================================
  // FEE VALUES
  // ==========================================================

  const totalFee =
    Number(fees?.total_amount || 0);

  const paidFee =
    Number(fees?.paid_amount || 0);

  const balanceFee =
    Number(fees?.balance_amount || 0);

  const lateFee =
    Number(fees?.late_fee || 0);


  // ==========================================================
  // FEE PROGRESS
  // ==========================================================

  const paidPercent =
    totalFee > 0
      ? Math.min(
          Math.max(
            (paidFee / totalFee) * 100,
            0
          ),
          100
        )
      : 0;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <PageContainer>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        eyebrow="Student Portal"
        title={`Hi ${
          student?.full_name?.split(" ")[0] ||
          "Student"
        } 👋`}
        description={
          student
            ? `Class ${
                classLabel || "Not assigned"
              } · ${student.session_year}`
            : "Your academic overview"
        }
      />


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-6 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">

          <span>
            {error}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
          >
            Retry
          </Button>

        </div>

      )}


      {dashboard && (

        <>

          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <KpiCard
              label="Attendance"
              value={`${
                summary.attendance_percentage ?? 0
              }%`}
              icon={
                <CalendarDays className="h-5 w-5" />
              }
              tone="success"
            />


            <KpiCard
              label="Pending Assignments"
              value={
                summary.pending_assignments ?? 0
              }
              icon={
                <ClipboardList className="h-5 w-5" />
              }
              tone="warning"
            />


            <KpiCard
              label="Upcoming Exams"
              value={
                summary.upcoming_exams ?? 0
              }
              icon={
                <BookOpen className="h-5 w-5" />
              }
              tone="info"
            />


            <KpiCard
              label="Study Materials"
              value={
                summary.study_materials ?? 0
              }
              icon={
                <FileBox className="h-5 w-5" />
              }
              tone="primary"
            />

          </div>


          {/* ==================================================
              ASSIGNMENTS + FEES
          ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">


            {/* ================================================
                UPCOMING ASSIGNMENTS
            ================================================= */}

            <Card className="lg:col-span-2 border-border/60">

              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">

                <div>

                  <CardTitle className="font-display text-base">
                    Upcoming Assignments
                  </CardTitle>

                  <CardDescription>
                    {summary.pending_assignments ?? 0} active
                  </CardDescription>

                </div>


                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >

                  <Link to="/student/assignments">

                    All

                    <ArrowRight className="h-3.5 w-3.5" />

                  </Link>

                </Button>

              </CardHeader>


              <CardContent className="space-y-2">

                {upcomingAssignments.map(
                  (item) => (

                    <Link
                      key={item.assignment_uuid}
                      to="/student/assignments"
                      className="flex items-center gap-3 p-2.5 border rounded-md hover:bg-muted/40"
                    >

                      <div className="flex-1 min-w-0">

                        <div className="text-sm font-medium truncate">
                          {item.title}
                        </div>

                        <div className="text-[11px] text-muted-foreground">

                          {item.subject_name || "Subject"}

                          {" · due "}

                          {formatDate(
                            item.due_date
                          )}

                        </div>

                      </div>


                      <Badge
                        variant="outline"
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>

                    </Link>

                  )
                )}


                {!upcomingAssignments.length && (

                  <Empty
                    text="No pending assignments."
                  />

                )}

              </CardContent>

            </Card>


            {/* ================================================
                FEES
            ================================================= */}

            <Card className="border-border/60">

              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">

                <div>

                  <CardTitle className="font-display text-base flex items-center gap-2">

                    <IndianRupee className="h-4 w-4" />

                    Fees

                  </CardTitle>

                  <CardDescription>
                    Your fee details for{" "}
                    {student?.session_year || "current session"}
                  </CardDescription>

                </div>


                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >

                  <Link to="/student/fees">
                    View
                  </Link>

                </Button>

              </CardHeader>


              <CardContent className="space-y-3">


                {/* ==========================================
                    TOTAL FEE
                ========================================== */}

                <div className="rounded-xl border bg-background p-3">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Total Fee
                      </p>

                      <p className="mt-1 text-2xl font-semibold">
                        {currency(totalFee)}
                      </p>

                    </div>


                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">

                      <IndianRupee className="h-4 w-4" />

                    </div>

                  </div>

                </div>


                {/* ==========================================
                    FEES PAID
                ========================================== */}

                <div className="rounded-xl border bg-background p-3">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Fees Paid
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-green-600">
                        {currency(paidFee)}
                      </p>

                    </div>


                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">

                      <IndianRupee className="h-4 w-4" />

                    </div>

                  </div>

                </div>


                {/* ==========================================
                    FEES DUE
                ========================================== */}

                <div className="rounded-xl border bg-background p-3">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Fees Due
                      </p>

                      <p
                        className={`mt-1 text-2xl font-semibold ${
                          balanceFee > 0
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {currency(balanceFee)}
                      </p>

                    </div>


                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">

                      <IndianRupee className="h-4 w-4" />

                    </div>

                  </div>

                </div>


                {/* ==========================================
                    LATE FEE
                ========================================== */}

                <div className="rounded-xl border bg-background p-3">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Late Fee
                      </p>

                      <p className="mt-1 text-2xl font-semibold">
                        {currency(lateFee)}
                      </p>

                    </div>


                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">

                      <IndianRupee className="h-4 w-4" />

                    </div>

                  </div>

                </div>


                {/* ==========================================
                    PROGRESS
                ========================================== */}

                <div className="rounded-xl border bg-muted/20 p-3">

                  <div className="flex items-center justify-between mb-2">

                    <div>

                      <p className="text-sm font-medium">
                        Fee Progress
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        {Math.round(paidPercent)}% paid
                      </p>

                    </div>


                    <span className="text-xs font-semibold">

                      {currency(paidFee)}
                      {" / "}
                      {currency(totalFee)}

                    </span>

                  </div>


                  <Progress
                    value={paidPercent}
                    className="h-2"
                  />


                  {/* BALANCE */}

                  <div className="mt-3">

                    {balanceFee > 0 ? (

                      <div className="text-xs text-muted-foreground">

                        Balance{" "}

                        <span className="font-semibold text-foreground">
                          {currency(balanceFee)}
                        </span>

                        {fees.next_due_date && (
                          <>
                            {" · Due "}
                            {formatDate(
                              fees.next_due_date
                            )}
                          </>
                        )}

                      </div>

                    ) : (

                      <div className="text-xs font-medium text-green-600">
                        All fees paid
                      </div>

                    )}

                  </div>


                  {/* LATE FEE */}

                  {lateFee > 0 && (

                    <div className="mt-2 text-xs text-muted-foreground">

                      Late Fee{" "}

                      <span className="font-semibold text-foreground">
                        {currency(lateFee)}
                      </span>

                    </div>

                  )}


                  {/* PAY NOW */}

                  {balanceFee > 0 && (

                    <Button
                      className="mt-4 w-full gradient-primary border-0"
                      asChild
                    >

                      <Link to="/student/fees">
                        Pay Now
                      </Link>

                    </Button>

                  )}


                  {/* FULLY PAID */}

                  {balanceFee <= 0 && (

                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      asChild
                    >

                      <Link to="/student/fees">
                        View Fee Details
                      </Link>

                    </Button>

                  )}

                </div>

              </CardContent>

            </Card>

          </div>


          {/* ==================================================
              RESULTS / MATERIALS / CALENDAR
          ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">


            {/* ================================================
                LATEST RESULTS
            ================================================= */}

            <Card className="border-border/60">

              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">

                <CardTitle className="font-display text-base flex items-center gap-2">

                  <Trophy className="h-4 w-4" />

                  Latest Results

                </CardTitle>


                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >

                  <Link to="/student/results">

                    All

                    <ArrowRight className="h-3.5 w-3.5" />

                  </Link>

                </Button>

              </CardHeader>


              <CardContent className="space-y-2">

                {latestResults.map(
                  (item) => (

                    <div
                      key={item.result_uuid}
                      className="flex justify-between text-sm border-b py-1.5"
                    >

                      <span>
                        {item.grade || "Result"}
                      </span>

                      <span className="font-semibold">
                        {item.percentage}%
                      </span>

                    </div>

                  )
                )}


                {!latestResults.length && (

                  <Empty
                    text="No published results."
                  />

                )}

              </CardContent>

            </Card>


            {/* ================================================
                STUDY MATERIALS
            ================================================= */}

            <Card className="border-border/60">

              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">

                <CardTitle className="font-display text-base flex items-center gap-2">

                  <FileBox className="h-4 w-4" />

                  Study Materials

                </CardTitle>


                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >

                  <Link to="/student/materials">

                    All

                    <ArrowRight className="h-3.5 w-3.5" />

                  </Link>

                </Button>

              </CardHeader>


              <CardContent className="space-y-2">

                {studyMaterials.map(
                  (item) => (

                    <div
                      key={item.material_uuid}
                      className="p-2 border rounded-md text-sm"
                    >

                      <div className="font-medium truncate">
                        {item.title}
                      </div>

                      <div className="text-[10px] text-muted-foreground">

                        {item.source_type}

                        {" · "}

                        {item.mime_type ||
                          "Document"}

                      </div>

                    </div>

                  )
                )}


                {!studyMaterials.length && (

                  <Empty
                    text="No study materials."
                  />

                )}

              </CardContent>

            </Card>


            {/* ================================================
                CALENDAR
            ================================================= */}

            <Card className="border-border/60">

              <CardHeader className="pb-2">

                <CardTitle className="font-display text-base flex items-center gap-2">

                  <CalendarDays className="h-4 w-4" />

                  Calendar

                </CardTitle>

              </CardHeader>


              <CardContent className="space-y-2">

                {calendar.map(
                  (item) => (

                    <div
                      key={
                        item.calendar_uuid ||
                        item.holiday_uuid ||
                        item.notes_uuid
                      }
                      className="p-2 border rounded-md text-sm"
                    >

                      <div className="font-medium">
                        {item.title}
                      </div>

                      <div className="text-[10px] text-muted-foreground">

                        {formatDate(
                          item.start_date
                        )}

                        {" · "}

                        {getNoteCategory(item)}

                      </div>

                    </div>

                  )
                )}


                {!calendar.length && (

                  <Empty
                    text="No upcoming events."
                  />

                )}

              </CardContent>

            </Card>

          </div>


          {/* ==================================================
              NOTICES
          ================================================== */}

          <Card className="border-border/60">

            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">

              <CardTitle className="font-display text-base flex items-center gap-2">

                <Megaphone className="h-4 w-4" />

                Notices

              </CardTitle>


              <Button
                variant="ghost"
                size="sm"
                asChild
              >

                <Link to="/student/notices">

                  All

                  <ArrowRight className="h-3.5 w-3.5" />

                </Link>

              </Button>

            </CardHeader>


            <CardContent className="space-y-2">

              {notices.map(
                (item) => (

                  <div
                    key={item.notice_uuid || item.notes_uuid}
                    className="flex items-center gap-3 p-2.5 border rounded-md"
                  >

                    <Badge
                      variant="outline"
                      className="text-[10px]"
                    >
                      {getNoteCategory(item)}
                    </Badge>


                    <div className="flex-1 text-sm">
                      {item.title}
                    </div>


                    <div className="text-[10px] text-muted-foreground">

                      {formatDate(
                        item.start_date
                      )}

                    </div>

                  </div>

                )
              )}


              {!notices.length && (

                <Empty
                  text="No active notices."
                />

              )}

            </CardContent>

          </Card>

        </>

      )}


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="mt-4 text-[10px] text-muted-foreground flex items-center gap-2">

        <Bell className="h-3 w-3" />

        Library, attendance and timetable available in the side menu.

        <Library className="h-3 w-3" />

      </div>

    </PageContainer>

  );

}
