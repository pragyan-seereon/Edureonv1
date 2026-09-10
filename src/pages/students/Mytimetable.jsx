import { Fragment, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

import studentModel from "../../api/studentModel";
import useSessionStore from "../../store/sessionStore";

// ============================================================
// Constants
// ============================================================

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TYPES = [
  { id: "regular", label: "Regular Timetable" },
  { id: "summer", label: "Summer Timetable" },
  { id: "examination", label: "Examination Timetable" },
  { id: "additional", label: "Additional Timetable" },
];

const EMPTY_TYPE_DATA = {
  record: null,
  records: [],
  schedule: [],
};

const DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const SUBJECT_STYLES = [
  {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
  },
  {
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  {
    bg: "bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-300",
  },
];

// ============================================================
// Helpers
// ============================================================

function subjectStyle(name = "") {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash =
      name.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return SUBJECT_STYLES[
    Math.abs(hash) % SUBJECT_STYLES.length
  ];
}

// ------------------------------------------------------------
// Normalize timetable rows
//
// Supports:
//
// Regular / Summer:
// {
//   day,
//   period,
//   start_time,
//   end_time,
//   subject,
//   teacher
// }
//
// Additional:
// {
//   Day,
//   Period,
//   Start Time,
//   End Time,
//   Subject,
//   Teacher
// }
// ------------------------------------------------------------

function scheduleOf(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => ({
      ...row,

      day:
        row?.day ||
        row?.Day ||
        "",

      period: Number(
        row?.period ||
        row?.Period ||
        0
      ),

      startTime:
        row?.start_time ||
        row?.["Start Time"] ||
        row?.startTime ||
        "",

      endTime:
        row?.end_time ||
        row?.["End Time"] ||
        row?.endTime ||
        "",

      subject:
        row?.subject ||
        row?.Subject ||
        "—",

      teacher:
        row?.teacher ||
        row?.Teacher ||
        "—",

      room:
        row?.room ||
        row?.Room ||
        row?.classroom ||
        row?.room_name ||
        "—",
    }))
    .filter(
      (row) =>
        row.day &&
        Number.isFinite(row.period) &&
        row.period > 0
    )
    .sort((a, b) => {
      if (a.period !== b.period) {
        return a.period - b.period;
      }

      return String(a.day).localeCompare(
        String(b.day)
      );
    });
}

// ============================================================
// Examination helpers
// ============================================================

function examinationRows(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return [...rows].sort((a, b) => {
    const dateA = new Date(
      `${a?.exam_date || ""}T${a?.start_time || "00:00:00"}`
    );

    const dateB = new Date(
      `${b?.exam_date || ""}T${b?.start_time || "00:00:00"}`
    );

    return dateA - dateB;
  });
}

// ============================================================
// Format date
// ============================================================

function formatExamDate(date) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================================
// Main Component
// ============================================================

export default function MyTimetable() {
  const activeSession = useSessionStore(
    (state) => state.sessionYear
  );

  const [activeType, setActiveType] =
    useState("regular");

  const [profile, setProfile] =
    useState(null);

  const [typeData, setTypeData] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // Load timetable
  //
  // ONE API:
  // GET /student-portal/my-timetable
  //
  // session_year comes from active session.
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          await studentModel.getMyTimetable();

        if (cancelled) {
          return;
        }

        // ----------------------------------------------------
        // API response:
        //
        // {
        //   success: true,
        //   message: "...",
        //   data: {
        //     student_uuid,
        //     class_uuid,
        //     class_name,
        //     section_uuid,
        //     section_name,
        //     academic_year,
        //     timetables: {
        //       regular: [],
        //       summer: [],
        //       examination: [],
        //       additional: []
        //     }
        //   }
        // }
        // ----------------------------------------------------

        const data =
          response?.data || {};

        const timetables =
          data?.timetables || {};

        const sessionYear =
          data?.academic_year ||
          activeSession ||
          "";

        // ----------------------------------------------------
        // Student profile
        // ----------------------------------------------------

        const student = {
          student_uuid:
            data?.student_uuid,

          class_uuid:
            data?.class_uuid,

          class_name:
            data?.class_name,

          section_uuid:
            data?.section_uuid,

          section_name:
            data?.section_name,

          session_year:
            sessionYear,
        };

        // ----------------------------------------------------
        // Regular
        // ----------------------------------------------------

        const regularRows =
          Array.isArray(timetables?.regular)
            ? timetables.regular
            : [];

        // ----------------------------------------------------
        // Summer
        // ----------------------------------------------------

        const summerRows =
          Array.isArray(timetables?.summer)
            ? timetables.summer
            : [];

        // ----------------------------------------------------
        // Examination
        // ----------------------------------------------------

        const examination =
          Array.isArray(
            timetables?.examination
          )
            ? timetables.examination
            : [];

        // ----------------------------------------------------
        // Additional
        // ----------------------------------------------------

        const additionalRows =
          Array.isArray(
            timetables?.additional
          )
            ? timetables.additional
            : [];

        // ----------------------------------------------------
        // Build state
        // ----------------------------------------------------

        const selectedByType = {
          regular: {
            record:
              regularRows[0] || null,

            records:
              regularRows,

            schedule:
              scheduleOf(regularRows),
          },

          summer: {
            record:
              summerRows[0] || null,

            records:
              summerRows,

            schedule:
              scheduleOf(summerRows),
          },

          examination: {
            record:
              examination[0] || null,

            records:
              examinationRows(examination),

            // Examination timetable doesn't use
            // regular periods.
            schedule: [],
          },

          additional: {
            record:
              additionalRows[0] || null,

            records:
              additionalRows,

            schedule:
              scheduleOf(additionalRows),
          },
        };

        if (!cancelled) {
          setProfile(student);
          setTypeData(selectedByType);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              err?.message ||
              "Could not load your timetable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [activeSession]);

  // ==========================================================
  // Current timetable
  // ==========================================================

  const current =
    typeData[activeType] ||
    EMPTY_TYPE_DATA;

  const schedule =
    current.schedule || [];

  const meta =
    current.record || null;

  // ==========================================================
  // Weekly grid
  // ==========================================================

  const grid = useMemo(() => {
    const availableDays =
      new Set(
        schedule.map(
          (row) => row.day
        )
      );

    const days =
      DAYS.filter(
        (day) =>
          availableDays.has(day)
      );

    const periodMap =
      new Map();

    const cells =
      new Map();

    schedule.forEach((row) => {
      if (!periodMap.has(row.period)) {
        periodMap.set(
          row.period,
          row
        );
      }

      cells.set(
        `${row.day}:${row.period}`,
        row
      );
    });

    return {
      days,
      periods: [
        ...periodMap.values(),
      ].sort(
        (a, b) =>
          a.period - b.period
      ),
      cells,
    };
  }, [schedule]);

  // ==========================================================
  // Today
  // ==========================================================

  const today =
    DAYS[
      (new Date().getDay() + 6) %
        7
    ];

  // ==========================================================
  // Labels
  // ==========================================================

  const classLabel = profile
    ? `${profile.class_name || "Class"}${
        profile.section_name
          ? `-${profile.section_name}`
          : ""
      }`
    : "Your class";

  const activeTypeLabel =
    TYPES.find(
      (type) =>
        type.id === activeType
    )?.label ||
    "Timetable";

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <PageContainer>
      {/* =====================================================
          Header
      ===================================================== */}

      <PageHeader
        eyebrow="Student Portal"
        title="My Weekly Timetable"
        description={`${classLabel} · ${
          profile?.session_year ||
          activeSession ||
          "Academic Year"
        } · Read-only`}
      />

      {/* =====================================================
          Timetable Type Tabs
      ===================================================== */}

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {TYPES.map((type) => {
          const count =
            typeData[type.id]
              ?.records?.length || 0;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() =>
                setActiveType(
                  type.id
                )
              }
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeType === type.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.label}

              {count > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================
          Loading
      ===================================================== */}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />

            Loading timetable...
          </CardContent>
        </Card>
      ) : error ? (
        /* ===================================================
           Error
           =================================================== */

        <Card>
          <CardContent className="py-16 text-center text-sm text-destructive">
            {String(error)}
          </CardContent>
        </Card>
      ) : activeType ===
        "examination" ? (
        /* ===================================================
           Examination Timetable
           =================================================== */

        current.records.length ? (
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            {/* Header */}

            <div className="flex items-center justify-between gap-4 border-b bg-muted/20 px-5 py-4">
              <div>
                <div className="text-base font-semibold">
                  Examination Timetable ·{" "}
                  {classLabel}
                </div>

                <div className="text-sm text-muted-foreground">
                  {
                    profile?.session_year
                  }{" "}
                  ·{" "}
                  {
                    current.records
                      .length
                  }{" "}
                  examinations
                </div>
              </div>

              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              >
                Scheduled
              </Badge>
            </div>

            {/* Examination Table */}

            <CardContent className="overflow-auto p-0">
              <div className="min-w-[950px]">
                {/* Table Header */}

                <div className="grid grid-cols-7 border-b bg-muted/30 text-xs font-semibold uppercase tracking-wide">
                  <div className="p-4">
                    Date
                  </div>

                  <div className="p-4">
                    Day
                  </div>

                  <div className="p-4">
                    Exam
                  </div>

                  <div className="p-4">
                    Subject
                  </div>

                  <div className="p-4">
                    Paper
                  </div>

                  <div className="p-4">
                    Time
                  </div>

                  <div className="p-4">
                    Room
                  </div>
                </div>

                {/* Rows */}

                {current.records.map(
                  (
                    exam,
                    index
                  ) => (
                    <div
                      key={
                        exam.paper_uuid ||
                        `${exam.exam_uuid}-${index}`
                      }
                      className="grid grid-cols-7 border-b text-sm transition-colors hover:bg-muted/20"
                    >
                      {/* Date */}

                      <div className="p-4 font-medium">
                        {formatExamDate(
                          exam.exam_date
                        )}
                      </div>

                      {/* Day */}

                      <div className="p-4">
                        {exam.day ||
                          "—"}
                      </div>

                      {/* Exam */}

                      <div className="p-4 font-medium">
                        {exam.exam_name ||
                          "—"}
                      </div>

                      {/* Subject */}

                      <div className="p-4 font-semibold">
                        {exam.subject ||
                          "—"}
                      </div>

                      {/* Paper */}

                      <div className="p-4">
                        {exam.paper_name ||
                          "—"}
                      </div>

                      {/* Time */}

                      <div className="p-4">
                        {exam.start_time ||
                          "—"}

                        {exam.duration_minutes && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {
                              exam.duration_minutes
                            }{" "}
                            minutes
                          </div>
                        )}
                      </div>

                      {/* Room */}

                      <div className="p-4">
                        {exam.room_name ||
                          "—"}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* No examination */

          <Card>
            <CardContent className="py-16 text-center">
              <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <div className="font-medium">
                No examination timetable
                found
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                No examinations are
                scheduled for{" "}
                {classLabel} in{" "}
                {profile?.session_year ||
                  activeSession}.
              </div>
            </CardContent>
          </Card>
        )
      ) : !schedule.length &&
        current.records.length ? (
        /* ===================================================
           Records without weekly schedule
           =================================================== */

        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <div className="border-b bg-muted/20 px-5 py-4">
            <div className="font-semibold">
              {activeTypeLabel}
            </div>

            <div className="text-sm text-muted-foreground">
              {classLabel} ·{" "}
              {profile?.session_year}
            </div>
          </div>

          <CardContent className="divide-y p-0">
            {current.records.map(
              (
                record,
                index
              ) => {
                const fileUrl =
                  record.file_url ||
                  record.file ||
                  record.document_url ||
                  record.url;

                return (
                  <div
                    key={
                      record.timetable_uuid ||
                      record.uuid ||
                      index
                    }
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <div className="font-medium">
                        {record.title ||
                          record.name ||
                          record.file_name ||
                          activeTypeLabel}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {record.status ||
                          "Available"}
                      </div>
                    </div>

                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                      >
                        View
                      </a>
                    ) : (
                      <Badge variant="outline">
                        {record.status ||
                          "Available"}
                      </Badge>
                    )}
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      ) : !schedule.length ? (
        /* ===================================================
           No timetable
           =================================================== */

        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <div className="font-medium">
              No{" "}
              {activeTypeLabel.toLowerCase()}{" "}
              found
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              Nothing is available for{" "}
              {classLabel} in{" "}
              {profile?.session_year ||
                activeSession}.
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ===================================================
           Weekly Timetable
           =================================================== */

        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          {/* Header */}

          <div className="flex items-center justify-between gap-4 border-b bg-muted/20 px-5 py-4">
            <div>
              <div className="text-base font-semibold">
                {activeTypeLabel} ·{" "}
                {classLabel}
              </div>

              <div className="text-sm text-muted-foreground">
                {profile?.session_year ||
                  activeSession}{" "}
                ·{" "}
                {grid.days.length}{" "}
                days ·{" "}
                {grid.periods.length}{" "}
                periods
              </div>
            </div>

            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
            >
              Active
            </Badge>
          </div>

          {/* Weekly Grid */}

          <CardContent className="overflow-auto p-0">
            <div
              className="grid min-w-[900px]"
              style={{
                gridTemplateColumns: `110px repeat(${grid.days.length}, 1fr)`,
              }}
            >
              {/* Period Header */}

              <div className="border-b border-r bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900/40">
                Period
              </div>

              {/* Day Headers */}

              {grid.days.map(
                (day) => (
                  <div
                    key={day}
                    className={`border-b bg-slate-50 p-4 text-center text-xs font-semibold uppercase tracking-wider dark:bg-slate-900/40 ${
                      day === today
                        ? "text-primary"
                        : "text-slate-600"
                    }`}
                  >
                    {
                      DAY_SHORT[
                        day
                      ]
                    }

                    {day ===
                      today && (
                      <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium normal-case">
                        Today
                      </span>
                    )}
                  </div>
                )
              )}

              {/* Period Rows */}

              {grid.periods.map(
                (period) => (
                  <Fragment
                    key={
                      period.period
                    }
                  >
                    {/* Period Time */}

                    <div className="flex flex-col justify-center border-b border-r p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <span>
                        {period.startTime ||
                          `Period ${period.period}`}
                      </span>

                      {period.endTime && (
                        <span className="mt-1 text-xs font-normal text-muted-foreground">
                          {
                            period.endTime
                          }
                        </span>
                      )}
                    </div>

                    {/* Day Cells */}

                    {grid.days.map(
                      (day) => {
                        const cell =
                          grid.cells.get(
                            `${day}:${period.period}`
                          );

                        // Empty cell

                        if (!cell) {
                          return (
                            <div
                              key={`${day}-${period.period}`}
                              className="border-b bg-muted/10 p-2"
                            >
                              <div className="flex min-h-[76px] items-center justify-center text-xs text-muted-foreground">
                                —
                              </div>
                            </div>
                          );
                        }

                        const style =
                          subjectStyle(
                            cell.subject
                          );

                        return (
                          <div
                            key={`${day}-${period.period}`}
                            className={`border-b p-2 ${
                              day === today
                                ? "bg-primary/[0.03]"
                                : ""
                            }`}
                          >
                            <div
                              className={`min-h-[76px] rounded-xl border border-border/70 px-3 py-2 ${style.bg}`}
                            >
                              {/* Subject */}

                              <div
                                className={`text-sm font-semibold leading-tight ${style.text}`}
                              >
                                {
                                  cell.subject
                                }
                              </div>

                              {/* Teacher */}

                              {cell.teacher &&
                                cell.teacher !==
                                  "—" && (
                                  <div
                                    className={`mt-1 truncate text-xs opacity-80 ${style.text}`}
                                    title={
                                      cell.teacher
                                    }
                                  >
                                    {
                                      cell.teacher
                                    }
                                  </div>
                                )}

                              {/* Room */}

                              {cell.room &&
                                cell.room !==
                                  "—" && (
                                  <div
                                    className={`mt-0.5 truncate text-xs opacity-70 ${style.text}`}
                                    title={
                                      cell.room
                                    }
                                  >
                                    {
                                      cell.room
                                    }
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </Fragment>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}