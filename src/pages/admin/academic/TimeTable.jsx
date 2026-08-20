/* eslint-disable react-hooks/set-state-in-effect */
import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  CalendarDays,
  Download,
  // eslint-disable-next-line no-unused-vars
  Printer,
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Users2,
  Lock,
  Eye,
  Trash2,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getClasses } from "../../../api/class";
import { getSections } from "../../../api/section";
import {
  downloadSampleTimetable,
  deleteTimetable,
  getSectionTimetable,
  uploadTimetable,
  downloadSummerTimetableSample,
  uploadSummerTimetable,
  downloadExaminationTimetableSample,
  downloadAdditionalTimetableSample,
  uploadExaminationTimetable,
  uploadAdditionalTimetable,
} from "../../../api/timetable";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

// Each subject gets a stable border/bg/text combo, hashed off its name,
// so the same subject always reads the same color across the grid.
const SUBJECT_STYLES = [
  { border: "border-blue-400/60", bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-300" },
  { border: "border-emerald-400/60", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300" },
  { border: "border-amber-400/60", bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300" },
  { border: "border-fuchsia-400/60", bg: "bg-fuchsia-500/10", text: "text-fuchsia-700 dark:text-fuchsia-300" },
  { border: "border-rose-400/60", bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-300" },
  { border: "border-cyan-400/60", bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-300" },
  { border: "border-lime-400/60", bg: "bg-lime-500/10", text: "text-lime-700 dark:text-lime-300" },
  { border: "border-violet-400/60", bg: "bg-violet-500/10", text: "text-violet-700 dark:text-violet-300" },
];

function subjectStyle(name) {
  if (!name) return { border: "border-border", bg: "bg-muted/10", text: "text-muted-foreground" };
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_STYLES[Math.abs(hash) % SUBJECT_STYLES.length];
}

// Kept for the existing, visually hidden summary block below.
function StatTile({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="rounded-full bg-muted p-1.5 text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

const VIEWS = [
  { id: "class", label: "Class View" },
  { id: "teacher", label: "Teacher View" },
  // { id: "room", label: "Room View", disabled: true },
  // { id: "conflicts", label: "Conflicts", disabled: true },
  // { id: "balance", label: "Free-Period Balance", disabled: true },
];

const TIMETABLE_TYPES = [
  { id: "regular", label: "Regular Timetable" },
  { id: "summer", label: "Summer Timetable" },
  { id: "examination", label: "Examination Timetable" },
  { id: "additional", label: "Additional Timetable" },
];

export default function TimeTable() {
  const [classes, setClasses] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Sections for whichever class is currently selected on the page.
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const [selectedClassUUID, setSelectedClassUUID] = useState("");
  const [selectedSectionUUID, setSelectedSectionUUID] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");

  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const fileInputRef = useRef(null);

  const [timetableMeta, setTimetableMeta] = useState(null); // full API response minus schedule
  const [schedule, setSchedule] = useState([]); // array of period rows

  const [activeView, setActiveView] = useState("class");
  const [timetableType, setTimetableType] = useState("regular");
  const [viewingTimetable, setViewingTimetable] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timetableRows] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const tableTotal = 0;
  const tablePageSize = 10;

  // ---- Import dialog state (separate from page state until confirmed) ----
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importClassUUID, setImportClassUUID] = useState("");
  const [importSectionUUID, setImportSectionUUID] = useState("");
  const [importSections, setImportSections] = useState([]);
  const [loadingImportSections, setLoadingImportSections] = useState(false);
  const [importYear, setImportYear] = useState("2026-27");
  const [importStep, setImportStep] = useState("select"); // "select" -> "file"
  const [importTimetableType, setImportTimetableType] = useState("regular");

  // ---- Load class dropdown, then default to the first class/section ----
  useEffect(() => {
    (async () => {
      setLoadingOptions(true);
      try {
        const classRes = await getClasses();
        const list = classRes?.data ?? classRes ?? [];
        setClasses(list);
        if (list.length && !selectedClassUUID) {
          const first = list[0];
          setSelectedClassUUID(first.class_uuid || first.uuid || first.id);
        }
      } catch {
        toast.error("Failed to load classes");
      } finally {
        setLoadingOptions(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSectionsForClass = async (classUUID, setList, setLoading) => {
    if (!classUUID) {
      setList([]);
      return [];
    }

    setLoading(true);
    try {
      const response = await getSections(classUUID);
      const list = response?.data ?? response ?? [];

      // The /sections API returns sections across all classes mixed
      // together, so we filter to the selected class here.
      const filtered = Array.isArray(list)
        ? list.filter((s) => String(s.class_uuid) === String(classUUID))
        : [];

      setList(filtered);
      return filtered;
    } catch {
      setList([]);
      toast.error("Failed to load sections for this class");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Page-level class selector — reload sections, then default to the
  // first section so the grid always has something to show.
  useEffect(() => {
    if (!selectedClassUUID) {
      setSections([]);
      setSelectedSectionUUID("");
      return;
    }
    (async () => {
      const list = await loadSectionsForClass(
        selectedClassUUID,
        setSections,
        setLoadingSections,
      );
      const stillValid = list.some(
        (s) => (s.section_uuid || s.uuid || s.id) === selectedSectionUUID,
      );
      if (!stillValid) {
        const first = list[0];
        setSelectedSectionUUID(first ? first.section_uuid || first.uuid || first.id : "");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassUUID]);

  // Whenever section or academic year changes, pull the existing
  // timetable straight from the API (GET /regular-timetable/section/{uuid}).
  useEffect(() => {
    setViewingTimetable(false);
    if (timetableType !== "regular") return;
    if (!selectedSectionUUID || !academicYear.trim()) {
      setSchedule([]);
      setTimetableMeta(null);
      return;
    }
    (async () => {
      setLoadingTimetable(true);
      try {
        const res = await getSectionTimetable(
          selectedSectionUUID,
          academicYear.trim(),
        );
        const { timetable, ...meta } = res || {};
        setSchedule(timetable || []);
        setTimetableMeta(meta?.timetable_uuid ? meta : null);
      } catch {
        // No timetable imported yet for this class/section/year is the
        // common case here — treat it as an empty state, not an error toast.
        setSchedule([]);
        setTimetableMeta(null);
      } finally {
        setLoadingTimetable(false);
      }
    })();
  }, [selectedSectionUUID, academicYear, timetableType]);

  const labelFor = (list, uuid, keys) => {
    const item = list.find((x) =>
      [x.class_uuid, x.section_uuid, x.uuid, x.id].includes(uuid),
    );
    if (!item) return "";
    for (const k of keys) if (item[k]) return item[k];
    return "";
  };

  const selectedClassLabel = labelFor(classes, selectedClassUUID, [
    "name",
    "class_name",
  ]);
  const selectedSectionLabel = labelFor(sections, selectedSectionUUID, [
    "name",
    "section_name",
  ]);

  // ---- Sample download ----
  const handleDownloadSample = async () => {
    setDownloading(true);
    try {
      const sampleDownloads = {
        summer: downloadSummerTimetableSample,
        examination: downloadExaminationTimetableSample,
        additional: downloadAdditionalTimetableSample,
      };
      const blob = await (sampleDownloads[timetableType] || downloadSampleTimetable)();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${timetableType}_timetable_sample.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Sample timetable downloaded");
    } catch {
      toast.error("Could not download sample file");
    } finally {
      setDownloading(false);
    }
  };

  // ---- Import flow: step 1, open dialog pre-filled from what's on screen ----
  const handleImportClick = () => {
    setImportClassUUID(selectedClassUUID);
    setImportSectionUUID(selectedSectionUUID);
    setImportYear(academicYear || "2026-27");
    setImportTimetableType(timetableType);
    if (selectedClassUUID) {
      loadSectionsForClass(
        selectedClassUUID,
        setImportSections,
        setLoadingImportSections,
      );
    } else {
      setImportSections([]);
    }
    setImportStep("select");
    setImportDialogOpen(true);
  };

  const handleImportClassChange = (classUUID) => {
    setImportClassUUID(classUUID);
    setImportSectionUUID("");
    loadSectionsForClass(classUUID, setImportSections, setLoadingImportSections);
  };

  // ---- Import flow: step 1 -> step 2 (confirm class/section/year, then choose file) ----
  const handleConfirmSelection = () => {
    if (!importClassUUID || !importSectionUUID) {
      toast.error("Select a class and section to continue");
      return;
    }
    if (!importYear.trim()) {
      toast.error("Enter an academic year, e.g. 2026-27");
      return;
    }
    setImportStep("file");
    // give the dialog a tick to render before opening the native file picker
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  // ---- Import flow: step 2, file chosen -> upload ----
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    try {
      const payload = {
        classUUID: importClassUUID,
        sectionUUID: importSectionUUID,
        academicYear: importYear.trim(),
        file,
      };
      const uploaders = {
        summer: uploadSummerTimetable,
        examination: uploadExaminationTimetable,
        additional: uploadAdditionalTimetable,
      };
      const response = await (uploaders[importTimetableType] || uploadTimetable)(payload);
      const res = Array.isArray(response) ? response[0] : response;
      const { timetable, ...meta } = res || {};

      // sync page-level state to what was just imported — this also
      // triggers the GET effect above to refresh from the server.
      setSelectedClassUUID(importClassUUID);
      setSelectedSectionUUID(importSectionUUID);
      setAcademicYear(importYear.trim());
      setSchedule(
        (timetable || []).map((row) => ({
          ...row,
          day: row.day || row.Day,
          period: Number(row.period || row.Period),
          start_time: row.start_time || row["Start Time"],
          end_time: row.end_time || row["End Time"],
          subject: row.subject || row.Subject,
          teacher: row.teacher || row.Teacher,
        })),
      );
      setTimetableMeta(meta);

      toast.success(`Imported ${meta.file_name || file.name}`);
      setImportDialogOpen(false);
    } catch {
      toast.error("Import failed — check the file and try again");
    } finally {
      setUploading(false);
    }
  };

  // ---- Build grid from the loaded schedule ----
  const { days, periodRows, cellMap } = useMemo(() => {
    const dayset = new Set(schedule.map((r) => r.day));
    const orderedDays = DAY_ORDER.filter((d) => dayset.has(d));

    const periodMap = new Map();
    schedule.forEach((r) => {
      if (!periodMap.has(r.period)) {
        periodMap.set(r.period, {
          period: r.period,
          start_time: r.start_time,
          end_time: r.end_time,
        });
      }
    });
    const orderedPeriods = Array.from(periodMap.values()).sort(
      (a, b) => a.period - b.period,
    );

    const map = new Map();
    schedule.forEach((r) => map.set(`${r.day}:${r.period}`, r));

    return { days: orderedDays, periodRows: orderedPeriods, cellMap: map };
  }, [schedule]);

  // ---- Teacher View: same schedule, grouped by who's teaching ----
  const { teacherRows, teacherCellMap } = useMemo(() => {
    const teacherSet = new Set(schedule.map((r) => r.teacher).filter(Boolean));
    const rows = Array.from(teacherSet).sort();
    const map = new Map();
    schedule.forEach((r) => {
      const key = `${r.teacher}:${r.day}`;
      const list = map.get(key) || [];
      list.push(r);
      map.set(key, list);
    });
    return { teacherRows: rows, teacherCellMap: map };
  }, [schedule]);

  const exportCsv = () => {
    if (!schedule.length) {
      toast.error("Nothing to export yet — import a timetable first");
      return;
    }
    const rows = [["Day", "Period", "Start", "End", "Subject", "Teacher"]];
    schedule.forEach((r) =>
      rows.push([r.day, r.period, r.start_time, r.end_time, r.subject, r.teacher]),
    );
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable-${selectedClassLabel || "class"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timetable exported");
  };

  const hasSchedule = schedule.length > 0;
  const maxTablePage = 1;

  const handleViewTimetable = (item) => {
    setSelectedClassUUID(item.class_uuid || item.classUUID || "");
    setSelectedSectionUUID(item.section_uuid || item.sectionUUID || "");
    setAcademicYear(item.academic_year || item.academicYear || "2026-27");
    setViewingTimetable(true);
  };

  const handleDeleteTimetable = async (item) => {
    const timetableUUID = item?.timetable_uuid || item?.uuid || timetableMeta?.timetable_uuid || timetableMeta?.uuid;
    if (!timetableUUID) return;
    if (!window.confirm("Delete this timetable? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteTimetable(timetableUUID);
      setSchedule([]);
      setTimetableMeta(null);
      setViewingTimetable(false);
      toast.success("Timetable deleted");
    } catch {
      toast.error("Could not delete the timetable");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Timetable Engine"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              {timetableType === "regular" ? "Sample" : `${TIMETABLE_TYPES.find((type) => type.id === timetableType)?.label.replace(" Timetable", "")} Sample`}
            </Button>

            {/* hidden file input used only after class/section/year are confirmed */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileSelected}
            />

            <Button variant="outline" size="sm" onClick={handleImportClick}>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {timetableType === "regular" ? "Import" : `Upload ${TIMETABLE_TYPES.find((type) => type.id === timetableType)?.label.replace(" Timetable", "")}`}
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <Card className="mb-6 overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold">Timetable Type</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the timetable category you want to manage.
          </p>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto bg-muted/40 px-4 pt-2">
          {TIMETABLE_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setTimetableType(type.id)}
              className={`whitespace-nowrap rounded-t-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                timetableType === type.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        {timetableType !== "regular" && (
          <div className="border-t bg-sky-500/10 px-5 py-3 text-sm text-sky-800 dark:text-sky-200">
            {timetableType === "summer"
              ? "Summer timetable schedules will appear here."
              : timetableType === "examination"
                ? "Examination timetable schedules will appear here."
                : "Additional timetable schedules will appear here."}
          </div>
        )}
      </Card>

      {(timetableType === "regular" || timetableType === "summer" || timetableType === "examination" || timetableType === "additional") && (
        <>
      <div className="mb-5 flex flex-wrap items-end justify-end gap-3">
        <div className="space-y-1.5 w-48">
          <Label className="text-xs font-medium text-muted-foreground">Class</Label>
          <Select
            value={selectedClassUUID}
            onValueChange={setSelectedClassUUID}
            disabled={loadingOptions}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => {
                const value = c.class_uuid || c.uuid || c.id;
                const label = c.name || c.class_name || value;
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-48">
          <Label className="text-xs font-medium text-muted-foreground">Section</Label>
          <Select
            value={selectedSectionUUID}
            onValueChange={setSelectedSectionUUID}
            disabled={!selectedClassUUID || loadingSections}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingSections ? "Loading…" : "Select section"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => {
                const value = s.section_uuid || s.uuid || s.id;
                const label = s.name || s.section_name || value;
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-36">
          <Label className="text-xs font-medium text-muted-foreground">
            Academic Year
          </Label>
          <Input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2026-27"
          />
        </div>
      </div>

      <div className="hidden grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <StatTile
          label="Periods Scheduled"
          value={schedule.length.toString()}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="primary"
        />
        <StatTile
          label="Days Covered"
          value={days.length.toString()}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="info"
        />
        <StatTile
          label="Version"
          value={timetableMeta?.version ? `v${timetableMeta.version}` : "—"}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone={timetableMeta ? "success" : "warning"}
        />
        <StatTile
          label="Status"
          value={timetableMeta ? timetableMeta.status || "Imported" : "Not imported"}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={timetableMeta ? "success" : "warning"}
        />
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="hidden flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">
              {selectedClassLabel && selectedSectionLabel
                ? `${selectedClassLabel} - ${selectedSectionLabel}`
                : "Class Timetable"}
            </CardTitle>
            <CardDescription>
              {timetableMeta?.file_name
                ? `Imported from ${timetableMeta.file_name}`
                : "Download the sample file, fill it in, and import it to see the schedule here"}
            </CardDescription>
          </div>
        </CardHeader>

        {/* View tabs */}
        <div className={viewingTimetable ? "border-b border-border/60 bg-muted/20 px-4 pt-2" : "hidden"}>
          <div className="flex gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewingTimetable(false)}
              className="whitespace-nowrap rounded-t-md px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            >
              Timetable List
            </button>
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.disabled}
                onClick={() => setActiveView(v.id)}
                title={v.disabled ? "Coming soon" : undefined}
                className={`whitespace-nowrap rounded-t-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeView === v.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                } ${v.disabled ? "opacity-40 cursor-not-allowed hover:text-muted-foreground" : ""}`}
              >
                {v.label}
                {v.disabled && <Lock className="inline h-3 w-3 ml-1 -mt-0.5" />}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0 overflow-auto">
          {!viewingTimetable ? (
            <div className="min-w-[720px]">
              <div className="border-b bg-slate-50 px-5 py-4 dark:bg-slate-900/40">
                <h2 className="text-base font-semibold">Timetables</h2>
              </div>
              <table className="hidden w-full text-sm">
                <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-5 py-3 font-semibold">Class</th><th className="px-5 py-3 font-semibold">Section</th><th className="px-5 py-3 font-semibold">Academic Year</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr>
                </thead>
                <tbody>
                  {loadingTimetable ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading timetables...</td></tr>
                  ) : timetableRows.length ? timetableRows.map((item) => (
                    <tr key={item.timetable_uuid || item.uuid} className="border-b last:border-0">
                      <td className="px-5 py-4 font-medium">{item.class_name || item.class?.name || labelFor(classes, item.class_uuid, ["name", "class_name"]) || "-"}</td>
                      <td className="px-5 py-4">{item.section_name || item.section?.name || labelFor(sections, item.section_uuid, ["name", "section_name"]) || "-"}</td>
                      <td className="px-5 py-4">{item.academic_year || item.academicYear || "-"}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">{item.status || "Active"}</span></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => handleViewTimetable(item)}><Eye className="h-4 w-4" />View</Button><Button size="sm" variant="destructive" onClick={() => handleDeleteTimetable(item)} disabled={deleting}><Trash2 className="h-4 w-4" />{deleting ? "Deleting..." : "Delete"}</Button></div></td>
                    </tr>
                  )) : <tr><td colSpan="5" className="px-5 py-10 text-center text-muted-foreground">No timetables found.</td></tr>}
                </tbody>
              </table>
              <div className="hidden flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm text-muted-foreground">
                <span>Showing {timetableRows.length ? (tablePage - 1) * tablePageSize + 1 : 0}-{(tablePage - 1) * tablePageSize + timetableRows.length} of {tableTotal}</span>
                <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={tablePage === 1} onClick={() => setTablePage((page) => Math.max(1, page - 1))}>Previous</Button><span className="text-xs">Page {tablePage} of {maxTablePage}</span><Button variant="outline" size="sm" disabled={tablePage === maxTablePage} onClick={() => setTablePage((page) => Math.min(maxTablePage, page + 1))}>Next</Button></div>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Class</th>
                    <th className="px-5 py-3 font-semibold">Section</th>
                    <th className="px-5 py-3 font-semibold">Academic Year</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTimetable ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading timetable...</td></tr>
                  ) : timetableMeta || hasSchedule ? (
                    <tr className="border-b last:border-0">
                      <td className="px-5 py-4 font-medium">{selectedClassLabel || "—"}</td>
                      <td className="px-5 py-4">{selectedSectionLabel || "—"}</td>
                      <td className="px-5 py-4">{academicYear}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">{timetableMeta?.status || "Imported"}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setViewingTimetable(true)}><Eye className="h-4 w-4" />View</Button>
                          <Button size="sm" variant="destructive" onClick={handleDeleteTimetable} disabled={deleting || !timetableMeta}><Trash2 className="h-4 w-4" />{deleting ? "Deleting..." : "Delete"}</Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-muted-foreground">No timetable found for this class, section, and academic year.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : loadingTimetable ? (
            <div className="p-10 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading timetable…
            </div>
          ) : !hasSchedule ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No timetable imported yet for this class, section, and year.
              Click "Import", choose a class and section, then upload a
              filled-in Excel file.
            </div>
          ) : activeView === "teacher" ? (
            <div
              className="min-w-[900px] grid"
              style={{ gridTemplateColumns: `140px repeat(${days.length}, 1fr)` }}
            >
              <div className="border-b border-r bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900/40">
                Teacher
              </div>
              {days.map((d) => (
                <div
                  key={d}
                  className="border-b bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center dark:bg-slate-900/40"
                >
                  {DAY_SHORT[d] || d}
                </div>
              ))}
              {teacherRows.map((teacher) => (
                <Fragment key={teacher}>
                  <div className="p-3 text-xs font-medium border-b border-r flex items-center gap-1.5">
                    <Users2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {teacher}
                  </div>
                  {days.map((d) => {
                    const entries = teacherCellMap.get(`${teacher}:${d}`) || [];
                    return (
                      <div key={`${teacher}-${d}`} className="p-2 border-b space-y-1">
                        {entries.length === 0 ? (
                          <div className="text-[10px] text-muted-foreground text-center py-1.5">
                            —
                          </div>
                        ) : (
                          entries
                            .sort((a, b) => a.period - b.period)
                            .map((entry, i) => {
                              const s = subjectStyle(entry.subject);
                              return (
                                <div
                                  key={i}
                                  className={`rounded-md border px-2 py-1 ${s.border} ${s.bg}`}
                                >
                                  <div className={`text-[11px] font-semibold leading-tight ${s.text}`}>
                                    {entry.subject}
                                  </div>
                                  <div className="text-[10px] opacity-70">
                                    P{entry.period} · {entry.start_time}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          ) : (
            <div
              className="min-w-[900px] grid"
              style={{ gridTemplateColumns: `110px repeat(${days.length}, 1fr)` }}
            >
              <div className="border-b border-r bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-900/40">
                Period
              </div>
              {days.map((d) => (
                <div
                  key={d}
                  className="border-b bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center dark:bg-slate-900/40"
                >
                  {DAY_SHORT[d] || d}
                </div>
              ))}
              {periodRows.map((p, pi) => (
                <Fragment key={`row-${pi}`}>
                  <div className="flex items-center border-b border-r p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {p.start_time}
                  </div>
                  {days.map((d) => {
                    const cell = cellMap.get(`${d}:${p.period}`);
                    if (!cell)
                      return (
                        <div
                          key={`${d}-${p.period}`}
                          className="border-b bg-muted/10 p-2 text-[10px] text-muted-foreground text-center"
                        >
                          —
                        </div>
                      );
                    const s = subjectStyle(cell.subject);
                    return (
                      <div key={`${d}-${p.period}`} className="border-b p-2">
                        <div className={`min-h-[76px] rounded-xl border-2 border-red-500 px-3 py-2 ${s.bg}`}>
                          <div className={`text-sm font-semibold leading-tight ${s.text}`}>
                            {cell.subject}
                          </div>
                          <div className={`mt-1 text-xs ${s.text} opacity-80 truncate`}>
                            {cell.teacher}
                          </div>
                          {cell.room && (
                            <div className={`mt-0.5 text-xs ${s.text} opacity-70 truncate`}>
                              {cell.room}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}

      {/* ---- Import dialog: step 1 select class/section/year, step 2 choose file ---- */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Timetable</DialogTitle>
            <DialogDescription>
              {importStep === "select"
                ? "Select the class, section, and academic year for this timetable."
                : "Confirmed. Choose the filled-in Excel file to upload."}
            </DialogDescription>
          </DialogHeader>

          {importStep === "select" ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Class</Label>
                <Select
                  value={importClassUUID}
                  onValueChange={handleImportClassChange}
                  disabled={loadingOptions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => {
                      const value = c.class_uuid || c.uuid || c.id;
                      const label = c.name || c.class_name || value;
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Section
                </Label>
                <Select
                  value={importSectionUUID}
                  onValueChange={setImportSectionUUID}
                  disabled={!importClassUUID || loadingImportSections}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !importClassUUID
                          ? "Select a class first"
                          : loadingImportSections
                            ? "Loading sections..."
                            : importSections.length === 0
                              ? "No sections available"
                              : "Select section"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {importSections.map((s) => {
                      const value = s.section_uuid || s.uuid || s.id;
                      const label = s.name || s.section_name || value;
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Academic Year
                </Label>
                <Input
                  value={importYear}
                  onChange={(e) => setImportYear(e.target.value)}
                  placeholder="2026-27"
                />
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading and parsing your file…
                </div>
              ) : (
                "Waiting for file selection — pick an Excel file from the dialog that opened."
              )}
            </div>
          )}

          <DialogFooter>
            {importStep === "select" ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setImportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmSelection}>Continue</Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setImportStep("select")}
                  disabled={uploading}
                >
                  Back
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Choose File
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
