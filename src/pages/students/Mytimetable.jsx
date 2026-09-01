import { Fragment, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import studentModel from "../../api/studentModel";
import {
  getAdditionalTimetables,
  getExaminationTimetables,
  getRegularTimetables,
  getSectionTimetable,
  getSummerTimetables,
} from "../../api/timetable";
import useSessionStore from "../../store/sessionStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = [
  { id: "regular", label: "Regular Timetable" },
  { id: "summer", label: "Summer Timetable" },
  { id: "examination", label: "Examination Timetable" },
  { id: "additional", label: "Additional Timetable" },
];
const EMPTY_TYPE_DATA = { record: null, records: [], schedule: [] };
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
const SUBJECT_STYLES = [
  { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-fuchsia-500/10", text: "text-fuchsia-700 dark:text-fuchsia-300" },
  { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-300" },
  { bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-300" },
  { bg: "bg-violet-500/10", text: "text-violet-700 dark:text-violet-300" },
];

function subjectStyle(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_STYLES[Math.abs(hash) % SUBJECT_STYLES.length];
}

function bodyOf(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

function listOf(response) {
  const body = bodyOf(response);
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(body.results)) return body.results;
  return [];
}

function scheduleOf(response) {
  const body = bodyOf(response);
  const rows = Array.isArray(body) ? body : body?.timetable ?? body?.schedule ?? [];
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    day: row.day || row.Day,
    period: Number(row.period || row.Period),
    startTime: row.start_time || row["Start Time"] || "",
    endTime: row.end_time || row["End Time"] || "",
    subject: row.subject || row.Subject || "—",
    teacher: row.teacher || row.Teacher || "—",
    room: row.room || row.Room || row.classroom || "—",
  })).filter((row) => row.day && Number.isFinite(row.period));
}

const same = (left, right) => left != null && right != null && String(left) === String(right);
const yearOf = (item) => item?.academic_year || item?.academic_year_uuid || item?.academicYear || item?.academic_session || item?.session_year || item?.sessionYear || item?.year || "";

export default function MyTimetable() {
  const activeSession = useSessionStore((state) => state.sessionYear);
  const [activeType, setActiveType] = useState("regular");
  const [profile, setProfile] = useState(null);
  const [typeData, setTypeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const profileBody = bodyOf(await studentModel.getMyProfile());
        const student = profileBody?.student ?? profileBody;
        const classUUID = student?.class_uuid;
        const sectionUUID = student?.section_uuid;
        const sessionYear = student?.session_year || activeSession;
        if (!classUUID || !sectionUUID) throw new Error("No class or section is assigned to your profile.");

        const results = await Promise.allSettled([
          getRegularTimetables(sessionYear),
          getSummerTimetables(sessionYear),
          getExaminationTimetables(sessionYear),
          getAdditionalTimetables(sessionYear),
        ]);
        const matchesStudent = (item) => {
          const year = yearOf(item);
          const sections = item?.section_uuids || item?.sections || [];
          const sectionMatches = same(item.section_uuid || item.sectionUUID, sectionUUID) ||
            (Array.isArray(sections) && sections.some((value) => same(value?.section_uuid || value, sectionUUID)));
          return same(item.class_uuid || item.classUUID, classUUID) && sectionMatches && (!year || same(year, sessionYear));
        };
        const selectedByType = {};
        TYPES.forEach((type, index) => {
          const rows = results[index].status === "fulfilled" ? listOf(results[index].value) : [];
          const records = rows.filter(matchesStudent);
          selectedByType[type.id] = { record: records[0] || null, records, schedule: scheduleOf(records[0]) };
        });

        const regular = selectedByType.regular;
        if (regular.record && !regular.schedule.length) {
          const detail = await getSectionTimetable(sectionUUID, sessionYear);
          regular.schedule = scheduleOf(detail);
          regular.record = { ...regular.record, ...bodyOf(detail) };
        }
        if (cancelled) return;
        setProfile({ ...student, session_year: sessionYear });
        setTypeData(selectedByType);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.detail || err?.message || "Could not load your timetable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeSession]);

  const current = typeData[activeType] || EMPTY_TYPE_DATA;
  const schedule = current.schedule;
  const meta = current.record;

  const grid = useMemo(() => {
    const availableDays = new Set(schedule.map((row) => row.day));
    const days = DAYS.filter((day) => availableDays.has(day));
    const periodMap = new Map();
    const cells = new Map();
    schedule.forEach((row) => {
      if (!periodMap.has(row.period)) periodMap.set(row.period, row);
      cells.set(`${row.day}:${row.period}`, row);
    });
    return { days, periods: [...periodMap.values()].sort((a, b) => a.period - b.period), cells };
  }, [schedule]);

  const today = DAYS[(new Date().getDay() + 6) % 7];
  const classLabel = profile ? `${profile.class_name || "Class"}-${profile.section_name || ""}` : "Your class";
  const activeTypeLabel = TYPES.find((type) => type.id === activeType)?.label || "Timetable";

  return (
    <PageContainer>
      <PageHeader eyebrow="Student Portal" title="My Weekly Timetable" description={`${classLabel} · ${profile?.session_year || activeSession} · Read-only`} />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setActiveType(type.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeType === type.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {type.label}
            {!!typeData[type.id]?.records?.length && <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{typeData[type.id].records.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading timetable...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="py-16 text-center text-sm text-destructive">{String(error)}</CardContent></Card>
      ) : !schedule.length && current.records.length ? (
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <div className="border-b bg-muted/20 px-5 py-4"><div className="font-semibold">{activeTypeLabel}</div><div className="text-sm text-muted-foreground">{classLabel} · {profile?.session_year}</div></div>
          <CardContent className="divide-y p-0">
            {current.records.map((record, index) => {
              const fileUrl = record.file_url || record.file || record.document_url || record.url;
              return <div key={record.timetable_uuid || record.uuid || index} className="flex items-center justify-between gap-4 px-5 py-4"><div><div className="font-medium">{record.title || record.name || record.file_name || activeTypeLabel}</div><div className="mt-1 text-xs text-muted-foreground">{yearOf(record) || profile?.session_year} · {record.status || "Available"}</div></div>{fileUrl ? <a href={fileUrl} target="_blank" rel="noreferrer" className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">View</a> : <Badge variant="outline">{record.status || "Available"}</Badge>}</div>;
            })}
          </CardContent>
        </Card>
      ) : !schedule.length ? (
        <Card><CardContent className="py-16 text-center"><CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><div className="font-medium">No {activeTypeLabel.toLowerCase()} found</div><div className="mt-1 text-sm text-muted-foreground">Nothing is available for {classLabel} in {profile?.session_year || activeSession}.</div></CardContent></Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b bg-muted/20 px-5 py-4">
            <div><div className="text-base font-semibold">{activeTypeLabel} · {classLabel}</div><div className="text-sm text-muted-foreground">{profile.session_year} · {grid.days.length} days · {grid.periods.length} periods</div></div>
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">{meta?.status || "Active"}</Badge>
          </div>
          <CardContent className="overflow-auto p-0">
            <div className="grid min-w-[900px]" style={{ gridTemplateColumns: `110px repeat(${grid.days.length}, 1fr)` }}>
              <div className="border-b border-r bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900/40">Period</div>
              {grid.days.map((day) => <div key={day} className={`border-b bg-slate-50 p-4 text-center text-xs font-semibold uppercase tracking-wider dark:bg-slate-900/40 ${day === today ? "text-primary" : "text-slate-600"}`}>{DAY_SHORT[day]}{day === today && <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium normal-case">Today</span>}</div>)}
              {grid.periods.map((period) => (
                <Fragment key={period.period}>
                  <div className="flex items-center border-b border-r p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{period.startTime || `Period ${period.period}`}</div>
                  {grid.days.map((day) => {
                    const cell = grid.cells.get(`${day}:${period.period}`);
                    if (!cell) return <div key={`${day}-${period.period}`} className="border-b bg-muted/10 p-2"><div className="flex min-h-[76px] items-center justify-center text-xs text-muted-foreground">—</div></div>;
                    const style = subjectStyle(cell.subject);
                    return <div key={`${day}-${period.period}`} className={`border-b p-2 ${day === today ? "bg-primary/[0.03]" : ""}`}><div className={`min-h-[76px] rounded-xl border border-border/70 px-3 py-2 ${style.bg}`}><div className={`text-sm font-semibold leading-tight ${style.text}`}>{cell.subject}</div><div className={`mt-1 truncate text-xs opacity-80 ${style.text}`}>{cell.teacher}</div>{cell.room && <div className={`mt-0.5 truncate text-xs opacity-70 ${style.text}`}>{cell.room}</div>}</div></div>;
                  })}
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
