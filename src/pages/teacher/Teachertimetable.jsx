/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Download, Loader2, AlertCircle } from "lucide-react";

import { getTeacherTimetable } from "../../api/teachertimetable";
import { getTeacherClasses } from "../../api/teacherclass";

const ALL_CLASSES = "all";
const classKey = (c) => `${c.class_uuid}::${c.section_uuid}`;

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Which schedule "types" to expose as tabs. Add more here (e.g. "winter")
// if/when the API starts returning them — the UI will just work.
const SCHEDULE_TYPES = [
  { value: "regular", label: "Regular" },
  { value: "summer", label: "Summer" },
  { value: "additional", label: "Additional" },
];

const subjectPalette = [
  "bg-info/10 text-info border-info/20",
  "bg-accent/15 text-accent border-accent/20",
  "bg-warning/15 text-warning border-warning/20",
  "bg-success/10 text-success border-success/20",
  "bg-secondary text-secondary-foreground border-border",
  "bg-muted text-foreground border-border",
];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/** "09:30" or "09:30:00" -> "9:30 AM" */
function formatTime(t) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr ?? "00"} ${ampm}`;
}

function statusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "in progress":
      return "bg-warning/15 text-warning border-warning/20";
    case "completed":
      return "bg-success/10 text-success border-success/20";
    case "scheduled":
      return "bg-info/10 text-info border-info/20";
    default:
      return "bg-muted text-foreground border-border";
  }
}

// The "additional" timetable type comes back from the API with a different
// (capitalized) field naming convention than "regular"/"summer". Normalize
// it here so every downstream consumer can keep using the lowercase keys.
function normalizeRow(r) {
  if (r.timetable_type !== "additional") return r;
  return {
    ...r,
    day: r.Day ?? r.day,
    period: r.Period !== undefined ? Number(r.Period) : r.period,
    start_time: r["Start Time"] ?? r.start_time,
    end_time: r["End Time"] ?? r.end_time,
    subject: r.Subject ?? r.subject,
    teacher: r.Teacher ?? r.teacher,
  };
}

export default function TeacherTimetable() {
  const [rows, setRows] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [classFilter, setClassFilter] = useState(ALL_CLASSES);
  const [scheduleType, setScheduleType] = useState("regular"); // "regular" | "summer" | "additional"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [timetableRes, classesRes] = await Promise.allSettled([
          getTeacherTimetable(),
          getTeacherClasses(),
        ]);

        if (ignore) return;

        if (timetableRes.status === "fulfilled") {
          const raw = Array.isArray(timetableRes.value?.data) ? timetableRes.value.data : [];
          setRows(raw.map(normalizeRow));
        } else {
          throw timetableRes.reason;
        }

        if (classesRes.status === "fulfilled") {
          setTeacherClasses(Array.isArray(classesRes.value?.data) ? classesRes.value.data : []);
        } else {
          setTeacherClasses([]);
        }
      } catch (err) {
        if (ignore) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Couldn't load your timetable. Please try again.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const classOptions = useMemo(() => {
    const map = new Map();
    teacherClasses.forEach((c) => {
      map.set(classKey(c), { ...c, label: `${c.class_name}-${c.section_name}` });
    });
    return Array.from(map.values());
  }, [teacherClasses]);

  // Only offer a "type" toggle for the types that actually have rows,
  // so a school with no summer/additional timetable doesn't show a dead tab.
  const availableScheduleTypes = useMemo(() => {
    const present = new Set(rows.map((r) => r.timetable_type).filter((t) => t !== "examination"));
    return SCHEDULE_TYPES.filter((t) => present.has(t.value));
  }, [rows]);

  // Keep scheduleType valid if the currently selected type disappears
  // (e.g. data reloads and summer rows are gone).
  useEffect(() => {
    if (
      availableScheduleTypes.length &&
      !availableScheduleTypes.some((t) => t.value === scheduleType)
    ) {
      setScheduleType(availableScheduleTypes[0].value);
    }
  }, [availableScheduleTypes, scheduleType]);

  const typeRows = useMemo(
    () => rows.filter((r) => r.timetable_type === scheduleType),
    [rows, scheduleType],
  );

  const schedule = useMemo(() => {
    if (classFilter === ALL_CLASSES) return typeRows;
    return typeRows.filter((r) => `${r.class_uuid}::${r.section_uuid}` === classFilter);
  }, [typeRows, classFilter]);

  const exams = useMemo(
    () =>
      rows
        .filter((r) => r.timetable_type === "examination")
        .slice()
        .sort((a, b) =>
          `${a.exam_date}${a.start_time}`.localeCompare(`${b.exam_date}${b.start_time}`),
        ),
    [rows],
  );

  const days = useMemo(() => {
    const present = new Set(schedule.map((r) => r.day));
    return dayOrder.filter((d) => present.has(d));
  }, [schedule]);

  const periods = useMemo(() => {
    const map = new Map();
    schedule.forEach((r) => {
      if (!map.has(r.period)) {
        map.set(r.period, { period: r.period, start_time: r.start_time, end_time: r.end_time });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.period - b.period);
  }, [schedule]);

  const grid = useMemo(() => {
    const map = new Map();
    schedule.forEach((r) => map.set(`${r.day}-${r.period}`, r));
    return map;
  }, [schedule]);

  const subjectColor = useMemo(() => {
    const cache = new Map();
    return (subject) => {
      if (!cache.has(subject)) cache.set(subject, subjectPalette[cache.size % subjectPalette.length]);
      return cache.get(subject);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const academicYear = rows[0]?.academic_year;
  const scheduleLabel =
    SCHEDULE_TYPES.find((t) => t.value === scheduleType)?.label ?? scheduleType;

  const download = () => {
    if (!periods.length) return;

    const bodyRows = days
      .map((day) => {
        const cells = periods
          .map((p) => {
            const cell = grid.get(`${day}-${p.period}`);
            if (!cell) return `<td class="muted-cell">Free</td>`;
            return `<td><b>${esc(cell.subject)}</b><br/><span class="muted">${esc(
              cell.class_name,
            )}-${esc(cell.section_name)} · ${esc(formatTime(cell.start_time))}</span></td>`;
          })
          .join("");
        return `<tr><th>${esc(day)}</th>${cells}</tr>`;
      })
      .join("");

    const headCells = periods
      .map((p) => `<th>P${esc(p.period)}<br/><span class="muted">${esc(formatTime(p.start_time))}</span></th>`)
      .join("");

    const html = `
      <html>
        <head>
          <title>My Timetable</title>
          <style>
            body { font-family: sans-serif; padding: 24px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
            .muted { color: #777; font-size: 10px; }
            .muted-cell { color: #aaa; font-size: 11px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>My ${esc(scheduleLabel)} Timetable</h1>
          <div class="muted">${academicYear ? `Academic year ${esc(academicYear)}` : ""}</div>
          <table>
            <thead><tr><th>Day</th>${headCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Timetable" />
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your timetable…
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Timetable" />
        <div className="flex items-center gap-2 py-8 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Timetable"
        actions={
          <Button size="sm" variant="outline" onClick={download} disabled={!periods.length}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        }
      />

      <Tabs defaultValue="regular">
        <TabsList>
          <TabsTrigger value="regular">My Schedule</TabsTrigger>
          <TabsTrigger value="exams">Exams{exams.length ? ` (${exams.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="flex flex-wrap items-center gap-4 p-3">
              {availableScheduleTypes.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Timetable</span>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableScheduleTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {classOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Class</span>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CLASSES}>All classes</SelectItem>
                      {classOptions.map((c) => (
                        <SelectItem key={classKey(c)} value={classKey(c)}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                {scheduleLabel} Timetable
              </CardTitle>
              <CardDescription>
                {academicYear ? `Academic year ${academicYear} · ` : ""}
                {schedule.length} period(s)
                {classFilter === ALL_CLASSES ? " assigned to you" : " for this class"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 overflow-x-auto">
              {periods.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No periods currently mapped to you in the published {scheduleLabel.toLowerCase()} timetable.
                </div>
              ) : (
                <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
                  <thead>
                    <tr>
                      <th className="text-left font-medium text-muted-foreground">Day</th>
                      {periods.map((p) => (
                        <th key={p.period} className="font-medium text-muted-foreground">
                          <div>P{p.period}</div>
                          <div className="text-[10px] font-normal opacity-70">
                            {formatTime(p.start_time)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day}>
                        <td className="pr-2 font-medium text-muted-foreground">{day}</td>
                        {periods.map((p) => {
                          const cell = grid.get(`${day}-${p.period}`);
                          if (!cell) {
                            return (
                              <td key={p.period}>
                                <div className="rounded-md border border-dashed border-border/60 px-2 py-1.5 text-center text-[10px] text-muted-foreground">
                                  Free
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td key={p.period}>
                              <div className={`rounded-md border px-2 py-1.5 ${subjectColor(cell.subject)}`}>
                                <div className="truncate font-medium">{cell.subject}</div>
                                <div className="truncate text-[10px] opacity-80">
                                  {cell.class_name}-{cell.section_name}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Upcoming Exams</CardTitle>
              <CardDescription>{exams.length} paper(s) scheduled</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((e) => (
                <div key={e.paper_uuid} className="space-y-1 rounded-md border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{e.subject}</span>
                    <Badge variant="secondary" className={statusClass(e.status)}>
                      {e.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.exam_name} · {e.paper_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Class {e.class_name} · {e.room_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.exam_date} · {formatTime(e.start_time)} · {e.duration_minutes} min · {e.max_marks} marks
                  </div>
                </div>
              ))}
              {exams.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No exams scheduled currently.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}