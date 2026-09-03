/* eslint-disable react-hooks/set-state-in-effect */
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  CalendarCheck,
  RefreshCcw,
  Save,
  ChevronLeft,
  ChevronRight,
  Check,
  History,
  CalendarClock,
  Lock,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getTeacherClasses,
  getAttendanceStudents,
  submitAttendance,
} from "../../api/teacherattendance";
import {
  PaginationBar,
  RowsPerPageSelect,
} from "../../components/pagination-controls";

const HISTORY_DAYS = 14; // how many past days show up in the sidebar list

const fmt = (d) =>
  d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
const fmtShort = (d) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// Local-date key (NOT toISOString, which converts to UTC first and can
// land on the wrong day for timezones ahead of UTC, e.g. IST).
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isSameDay = (a, b) => dateKey(a) === dateKey(b);
// Keyed by section_uuid (stable/unique) rather than a display label.
const storageKey = (sectionUuid, d) => `attendance:${sectionUuid}:${dateKey(d)}`;
const toInputValue = (d) => dateKey(d);
const fromInputValue = (v) => {
  const [y, m, day] = v.split("-").map(Number);
  return new Date(y, m - 1, day);
};

// --- Storage layer -----------------------------------------------------
// Swap these for real API/store calls whenever the backend is wired up.
function loadRecord(sectionUuid, d) {
  if (!sectionUuid) return null;
  try {
    const raw = localStorage.getItem(storageKey(sectionUuid, d));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveRecord(sectionUuid, d, marks) {
  const record = { marks, submittedAt: new Date().toISOString() };
  try {
    localStorage.setItem(storageKey(sectionUuid, d), JSON.stringify(record));
  } catch {
    // ignore write failures (e.g. storage unavailable)
  }
  return record;
}
// ------------------------------------------------------------------------

export default function TeacherAttendance() {
  const [searchParams] = useSearchParams();
  // Raw (class, section, subject) rows assigned to this teacher
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [selectedClassUuid, setSelectedClassUuid] = useState(
    () => searchParams.get("classUuid"),
  );
  const [selectedSectionUuid, setSelectedSectionUuid] = useState(
    () => searchParams.get("sectionUuid"),
  );

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [date, setDate] = useState(new Date());
  const [marks, setMarks] = useState({});
  const [existingRecord, setExistingRecord] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0); 

  // Roster pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Load the classes/sections assigned to this teacher ---------------
  useEffect(() => {
    let cancelled = false;
    setClassesLoading(true);
    getTeacherClasses()
      .then((res) => {
        if (!cancelled) setTeacherClasses(res?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setTeacherClasses([]);
          toast.error("Couldn't load your classes", {
            description: "Please refresh the page to try again.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setClassesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Group the flat (class, section, subject) rows into class -> sections,
  // deduping sections (a teacher may teach multiple subjects in one section).
  const classesMap = useMemo(() => {
    const map = new Map();
    for (const row of teacherClasses) {
      if (!map.has(row.class_uuid)) {
        map.set(row.class_uuid, {
          class_uuid: row.class_uuid,
          class_name: row.class_name,
          sections: new Map(),
        });
      }
      const entry = map.get(row.class_uuid);
      if (!entry.sections.has(row.section_uuid)) {
        entry.sections.set(row.section_uuid, {
          section_uuid: row.section_uuid,
          section_name: row.section_name,
        });
      }
    }
    return map;
  }, [teacherClasses]);

  const classList = useMemo(() => Array.from(classesMap.values()), [classesMap]);
  const sectionList = useMemo(() => {
    const entry = classesMap.get(selectedClassUuid);
    return entry ? Array.from(entry.sections.values()) : [];
  }, [classesMap, selectedClassUuid]);

  // eslint-disable-next-line no-unused-vars
  const selectedClass = classesMap.get(selectedClassUuid) ?? null;
  const selectedSection =
    sectionList.find((s) => s.section_uuid === selectedSectionUuid) ?? null;

  // Default to the teacher's first class once classes have loaded
  useEffect(() => {
    if (classList.length && !selectedClassUuid) {
      setSelectedClassUuid(classList[0].class_uuid);
    }
  }, [classList, selectedClassUuid]);

  // Default (or reset) to the first section whenever the selected class changes
  useEffect(() => {
    if (!sectionList.length) {
      setSelectedSectionUuid(null);
      return;
    }
    if (!sectionList.some((s) => s.section_uuid === selectedSectionUuid)) {
      setSelectedSectionUuid(sectionList[0].section_uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionList]);

  const handleClassChange = (classUuid) => {
    setSelectedClassUuid(classUuid);
  };

  // --- Load the roster whenever class/section changes --------------------
  useEffect(() => {
    if (!selectedClassUuid || !selectedSectionUuid) {
      setStudents([]);
      return;
    }
    let cancelled = false;
    setStudentsLoading(true);
    getAttendanceStudents(selectedClassUuid, selectedSectionUuid)
      .then((res) => {
        if (!cancelled) setStudents(res?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setStudents([]);
          toast.error("Couldn't load students for this section");
        }
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedClassUuid, selectedSectionUuid]);

  const roster = students;
  const today = new Date();
  const isToday = dateKey(date) === dateKey(today);
  const isFuture = dateKey(date) > dateKey(today);
  const isPast = dateKey(date) < dateKey(today);
  // Only today's attendance can be taken or updated; past dates are view-only.
  const readOnly = isPast || isFuture;

  // Load whatever record exists for this section + date whenever either changes
  useEffect(() => {
    const record = loadRecord(selectedSectionUuid, date);
    if (record) {
      setMarks(record.marks);
      setExistingRecord(record);
    } else {
      setMarks({});
      setExistingRecord(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionUuid, dateKey(date)]);

  // Reset to page 1 whenever the underlying roster changes (section/date switch)
  useEffect(() => {
    setPage(1);
  }, [selectedSectionUuid, dateKey(date)]);

  // Date-wise history for the right-hand panel: today + past N days for this section
  const history = useMemo(() => {
    if (!selectedSectionUuid) return [];
    const rows = [];
    for (let i = 0; i <= HISTORY_DAYS; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      rows.push({ date: d, record: loadRecord(selectedSectionUuid, d) });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionUuid, refreshTick]);

  const present = roster.filter(
    (s) => (marks[s.student_uuid] ?? "P") === "P",
  ).length;
  const absent = roster.filter((s) => marks[s.student_uuid] === "A").length;
  const leave = roster.filter((s) => marks[s.student_uuid] === "L").length;

  const totalPages = Math.max(1, Math.ceil(roster.length / pageSize));
  const pagedRoster = useMemo(
    () => roster.slice((page - 1) * pageSize, page * pageSize),
    [roster, page, pageSize],
  );
  const rangeStart = roster.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, roster.length);

  const setMark = (id, m) => setMarks((p) => ({ ...p, [id]: m }));
  const bulk = (m) =>
    setMarks(Object.fromEntries(roster.map((s) => [s.student_uuid, m])));

  const goTo = (d) => {
    if (dateKey(d) > dateKey(today)) return; // no future dates
    setDate(d);
  };
  const shift = (dx) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dx);
    goTo(d);
  };

   const submit = async () => {
      const students = roster.map((s) => ({
      student_uuid: s.student_uuid,
      status: marks[s.student_uuid] ?? "P",
    }));

    setSubmitting(true);
    try {
      const res = await submitAttendance(
        selectedSectionUuid,
        selectedClassUuid,
        dateKey(date),
        students,
      );

      saveRecord(selectedSectionUuid, date, marks);
      setExistingRecord(loadRecord(selectedSectionUuid, date));
      setRefreshTick((t) => t + 1);
      setConfirm(false);

      toast.success(
        res?.message ??
          (existingRecord
            ? `Attendance updated · ${selectedSection?.section_name} · ${fmt(date)}`
            : `Attendance saved · ${selectedSection?.section_name} · ${fmt(date)}`),
        {
          description: `${present} present · ${absent} absent · ${leave} on leave`,
        },
      );
    } catch (err) {
      toast.error("Couldn't save attendance", {
        description: err?.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <PageContainer>
      <PageHeader title="Take Attendance" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* LEFT: roster + marking */}
        <div>
          <Card className="border-border/60 mb-5">
            <CardContent className="p-4 flex items-center gap-3 flex-wrap">
              <Select
                value={selectedClassUuid ?? undefined}
                onValueChange={handleClassChange}
                disabled={classesLoading || classList.length === 0}
              >
                <SelectTrigger className="h-10 w-28">
                  <SelectValue
                    placeholder={classesLoading ? "Loading…" : "Class"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((c) => (
                    <SelectItem key={c.class_uuid} value={c.class_uuid}>
                      Class {c.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSectionUuid ?? undefined}
                onValueChange={setSelectedSectionUuid}
                disabled={classesLoading || sectionList.length === 0}
              >
                <SelectTrigger className="h-10 w-32">
                  <SelectValue
                    placeholder={classesLoading ? "Loading…" : "Section"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {sectionList.map((s) => (
                    <SelectItem key={s.section_uuid} value={s.section_uuid}>
                      Section {s.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => shift(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-4 h-10 border rounded-md flex items-center font-medium text-sm min-w-[140px] justify-center">
                  {fmt(date)}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={isToday}
                  onClick={() => shift(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {isPast ? (
                <Badge variant="outline" className="text-muted-foreground gap-1">
                  <Lock className="h-3 w-3" />
                  {existingRecord ? "Marked · read only" : "No record"}
                </Badge>
              ) : existingRecord ? (
                <Badge className="bg-success/10 text-success border-0 gap-1">
                  <Check className="h-3 w-3" />
                  Already marked
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground gap-1">
                  Not marked yet
                </Badge>
              )}

              {!readOnly && (
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => bulk("P")}>
                    Mark all Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMarks({})}
                  >
                    Reset
                  </Button>
                                   <Button
                    className="gradient-primary border-0"
                    size="sm"
                    disabled={roster.length === 0 || submitting}
                    onClick={() => setConfirm(true)}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : existingRecord ? (
                      <RefreshCcw className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {existingRecord ? "Update" : "Submit"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isPast && (
            <p className="text-xs text-muted-foreground mb-4 -mt-3 px-1 flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Past attendance is read-only and can't be changed. Only today's
              attendance can be taken or updated.
            </p>
          )}

          {!isPast && existingRecord && (
            <p className="text-xs text-muted-foreground mb-4 -mt-3 px-1">
              Last saved{" "}
              {new Date(existingRecord.submittedAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              . Updating will overwrite this record.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-5">
            <SummaryCard
              label="Present"
              value={present}
              tone="bg-success/10 text-success"
            />
            <SummaryCard
              label="Absent"
              value={absent}
              tone="bg-destructive/10 text-destructive"
            />
            <SummaryCard
              label="On Leave"
              value={leave}
              tone="bg-warning/15 text-warning"
            />
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="font-display text-base">
                  Roster
                  {selectedSection ? ` · Section ${selectedSection.section_name}` : ""}
                </CardTitle>
                <CardDescription>
                  {studentsLoading
                    ? "Loading students…"
                    : isPast && !existingRecord
                      ? "No attendance was recorded for this date"
                      : `${roster.length} students${isPast ? " · read only" : ""}`}
                </CardDescription>
              </div>
              {!studentsLoading &&
                !(isPast && !existingRecord) &&
                roster.length > 0 && (
                  <RowsPerPageSelect
                    pageSize={pageSize}
                    onPageSizeChange={(value) => {
                      setPageSize(value);
                      setPage(1);
                    }}
                  />
                )}
            </CardHeader>
            <CardContent className="space-y-2">
              {studentsLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin opacity-60" />
                  Loading students…
                </div>
              ) : !selectedSectionUuid ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  {classesLoading
                    ? "Loading your classes…"
                    : "You aren't assigned to any class or section yet."}
                </div>
              ) : isPast && !existingRecord ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <Lock className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  No record exists for {fmt(date)}. Past dates can't be marked
                  after the fact — only today's attendance can be taken.
                </div>
              ) : roster.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No students found in this section.
                </div>
              ) : (
                <>
                  {pagedRoster.map((s) => {
                    const m = marks[s.student_uuid] ?? "P";
                    return (
                      <div
                        key={s.student_uuid}
                        className="flex items-center gap-3 p-2.5 border rounded-md hover:bg-muted/30"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {s.student_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.student_name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {s.student_no}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {["P", "A", "L"].map((opt) => (
                            <button
                              key={opt}
                              disabled={readOnly}
                              onClick={() =>
                                !readOnly && setMark(s.student_uuid, opt)
                              }
                              className={`h-11 w-11 rounded-md text-sm font-bold transition border-2 ${
                                readOnly ? "cursor-not-allowed opacity-70" : ""
                              } ${
                                m === opt
                                  ? opt === "P"
                                    ? "bg-success text-success-foreground border-success"
                                    : opt === "A"
                                      ? "bg-destructive text-destructive-foreground border-destructive"
                                      : "bg-warning text-warning-foreground border-warning"
                                  : "border-border text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <PaginationBar
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    totalItems={roster.length}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    showPageSize={false}
                    itemLabel="students"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: date-wise filter / history panel */}
        <Card className="border-border/60 lg:sticky lg:top-4">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Attendance History
            </CardTitle>
            <CardDescription>
              {selectedSection
                ? `Section ${selectedSection.section_name} · pick a date to view or update`
                : "Pick a date to view or update"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={toInputValue(date)}
                max={toInputValue(today)}
                onChange={(e) => {
                  if (!e.target.value) return;
                  goTo(fromInputValue(e.target.value));
                }}
                className="h-9 text-sm"
              />
            </div>

            <div className="max-h-[520px] overflow-y-auto pr-1 space-y-1.5">
              {history.map(({ date: d, record }) => {
                const selected = isSameDay(d, date);
                const today_ = isSameDay(d, today);
                const p = record
                  ? roster.filter(
                      (s) => (record.marks[s.student_uuid] ?? "P") === "P",
                    ).length
                  : null;
                const a = record
                  ? roster.filter((s) => record.marks[s.student_uuid] === "A")
                      .length
                  : null;
                return (
                  <button
                    key={dateKey(d)}
                    onClick={() => goTo(d)}
                    className={`w-full flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {fmtShort(d)}
                        {today_ && (
                          <span className="text-[10px] font-normal text-primary">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {d.toLocaleDateString("en-IN", { weekday: "short" })}
                      </div>
                    </div>
                    {record ? (
                      <div className="flex items-center gap-1 text-[11px] shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-success/10 text-success font-semibold">
                          {p}P
                        </span>
                        {a > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-semibold">
                            {a}A
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        Not marked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {existingRecord ? "Update attendance?" : "Submit attendance?"}
            </DialogTitle>
            <DialogDescription>
              Section{" "}
              <span className="font-semibold text-foreground">
                {selectedSection?.section_name}
              </span>{" "}
              · {fmt(date)}
              <br />
              {present} present · {absent} absent · {leave} on leave
              {existingRecord && (
                <>
                  <br />
                  <span className="text-warning">
                    This replaces the record already saved for this date.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
                       <Button
              className="gradient-primary border-0"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {existingRecord ? "Confirm Update" : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div
            className={`h-8 w-8 rounded-md flex items-center justify-center font-bold ${tone}`}
          >
            {label[0]}
          </div>
          <div className="text-2xl font-display font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
