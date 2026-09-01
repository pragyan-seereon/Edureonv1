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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStudents } from "../../lib/store";
import {
  PaginationBar,
  RowsPerPageSelect,
} from "../../components/pagination-controls";

const CLASS_SECTIONS = {
  "X": ["X-A", "X-B"],
  "IX": ["IX-A"],
  "VIII": ["VIII-B"],
};
const CLASSES = Object.keys(CLASS_SECTIONS);
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
const storageKey = (section, d) => `attendance:${section}:${dateKey(d)}`;
const toInputValue = (d) => dateKey(d);
const fromInputValue = (v) => {
  const [y, m, day] = v.split("-").map(Number);
  return new Date(y, m - 1, day);
};

// --- Storage layer -----------------------------------------------------
// Swap these for real API/store calls whenever the backend is wired up.
function loadRecord(section, d) {
  try {
    const raw = localStorage.getItem(storageKey(section, d));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveRecord(section, d, marks) {
  const record = { marks, submittedAt: new Date().toISOString() };
  try {
    localStorage.setItem(storageKey(section, d), JSON.stringify(record));
  } catch {
    // ignore write failures (e.g. storage unavailable)
  }
  return record;
}
// ------------------------------------------------------------------------

export default function TeacherAttendance() {
  const all = useStudents();
  const [cls, setCls] = useState(CLASSES[0]);
  const [section, setSection] = useState(CLASS_SECTIONS[CLASSES[0]][0]);
  const [date, setDate] = useState(new Date());
  const [marks, setMarks] = useState({});
  const [existingRecord, setExistingRecord] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0); // bumped after a save so history re-reads storage

  // Roster pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const roster = useMemo(() => all.slice(0, 24), [all]);
  const today = new Date();
  const isToday = dateKey(date) === dateKey(today);
  const isFuture = dateKey(date) > dateKey(today);
  const isPast = dateKey(date) < dateKey(today);
  // Only today's attendance can be taken or updated; past dates are view-only.
  const readOnly = isPast || isFuture;

  const handleClassChange = (newClass) => {
    setCls(newClass);
    setSection(CLASS_SECTIONS[newClass][0]);
  };

  // Load whatever record exists for this section + date whenever either changes
  useEffect(() => {
    const record = loadRecord(section, date);
    if (record) {
      setMarks(record.marks);
      setExistingRecord(record);
    } else {
      setMarks({});
      setExistingRecord(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, dateKey(date)]);

  // Reset to page 1 whenever the underlying roster changes (section/date switch)
  useEffect(() => {
    setPage(1);
  }, [section, dateKey(date)]);

  // Date-wise history for the right-hand panel: today + past N days for this section
  const history = useMemo(() => {
    const rows = [];
    for (let i = 0; i <= HISTORY_DAYS; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      rows.push({ date: d, record: loadRecord(section, d) });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, refreshTick]);

  const present = roster.filter((s) => (marks[s.id] ?? "P") === "P").length;
  const absent = roster.filter((s) => marks[s.id] === "A").length;
  const leave = roster.filter((s) => marks[s.id] === "L").length;

  const totalPages = Math.max(1, Math.ceil(roster.length / pageSize));
  const pagedRoster = useMemo(
    () => roster.slice((page - 1) * pageSize, page * pageSize),
    [roster, page, pageSize],
  );
  const rangeStart = roster.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, roster.length);

  const setMark = (id, m) => setMarks((p) => ({ ...p, [id]: m }));
  const bulk = (m) =>
    setMarks(Object.fromEntries(roster.map((s) => [s.id, m])));

  const goTo = (d) => {
    if (dateKey(d) > dateKey(today)) return; // no future dates
    setDate(d);
  };
  const shift = (dx) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dx);
    goTo(d);
  };

  const submit = () => {
    saveRecord(section, date, marks);
    setRefreshTick((t) => t + 1);
    setConfirm(false);
    toast.success(
      existingRecord
        ? `Attendance updated · ${section} · ${fmt(date)}`
        : `Attendance saved · ${section} · ${fmt(date)}`,
      {
        description: `${present} present · ${absent} absent · ${leave} on leave`,
      },
    );
  };

  return (
    <PageContainer>
      <PageHeader title="Take Attendance" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* LEFT: roster + marking */}
        <div>
          <Card className="border-border/60 mb-5">
            <CardContent className="p-4 flex items-center gap-3 flex-wrap">
              <Select value={cls} onValueChange={handleClassChange}>
                <SelectTrigger className="h-10 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="h-10 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SECTIONS[cls].map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
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
                    onClick={() => setConfirm(true)}
                  >
                    {existingRecord ? (
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
                  Roster · Section {section}
                </CardTitle>
                <CardDescription>
                  {isPast && !existingRecord
                    ? "No attendance was recorded for this date"
                    : `${roster.length} students${isPast ? " · read only" : ""}`}
                </CardDescription>
              </div>
              {!(isPast && !existingRecord) && roster.length > 0 && (
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
              {isPast && !existingRecord ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <Lock className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  No record exists for {fmt(date)}. Past dates can't be marked
                  after the fact — only today's attendance can be taken.
                </div>
              ) : (
                <>
                  {pagedRoster.map((s) => {
                    const m = marks[s.id] ?? "P";
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-2.5 border rounded-md hover:bg-muted/30"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Roll {s.rollNo} · {s.admissionNo}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {["P", "A", "L"].map((opt) => (
                            <button
                              key={opt}
                              disabled={readOnly}
                              onClick={() => !readOnly && setMark(s.id, opt)}
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
              Section {section} · pick a date to view or update
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
                      (s) => (record.marks[s.id] ?? "P") === "P",
                    ).length
                  : null;
                const a = record
                  ? roster.filter((s) => record.marks[s.id] === "A").length
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
              <span className="font-semibold text-foreground">{section}</span>{" "}
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
            <Button className="gradient-primary border-0" onClick={submit}>
              <Check className="h-4 w-4" />
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