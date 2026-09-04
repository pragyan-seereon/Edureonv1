import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Megaphone, PartyPopper, School } from "lucide-react";
import { toast } from "sonner";
import studentModel from "../../api/studentModel";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const collection = (source, names) => names.reduce((found, name) => found.length ? found : (Array.isArray(source?.[name]) ? source[name] : []), []);
const value = (item, names, fallback = "—") => names.map((name) => item?.[name]).find((itemValue) => itemValue !== undefined && itemValue !== null && itemValue !== "") ?? fallback;
const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
};
const errorMessage = (error) => error?.response?.data?.detail?.message || error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Unable to load portal content.";

export default function Notices() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    studentModel.getPortalContent()
      .then((response) => setContent(response?.data || response || {}))
      .catch((error) => toast.error(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const notices = collection(content, ["notices", "notice_list"]);
  const events = collection(content, ["events", "event_list"]);
  const academicCalendar = collection(content, ["academic_calendar", "academic_calendars", "calendar"]);
  const holidays = collection(content, ["holiday_calendar", "holidays", "holiday_calendars"]);
  const calendarRows = useMemo(() => [
    ...events.map((item) => ({ item, type: "Event" })),
    ...academicCalendar.map((item) => ({ item, type: value(item, ["type", "category", "event_type"], "Academic") })),
    ...holidays.map((item) => ({ item, type: "Holiday" })),
  ], [events, academicCalendar, holidays]);
  const visibleRows = filter === "All" ? calendarRows : calendarRows.filter((row) => row.type === filter);
  const studentName = value(content, ["student_name", "name"], "Student");
  const className = value(content, ["class_name", "class"], "");

  return <PageContainer>
    <PageHeader eyebrow="Student Portal" title="Notices, Calendar & Events" description={`${studentName}${className ? ` · ${className}` : ""} · school notices, events and calendars.`}
      actions={<Select value={filter} onValueChange={setFilter}><SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All</SelectItem><SelectItem value="Event">Event</SelectItem><SelectItem value="Academic">Academic</SelectItem><SelectItem value="Holiday">Holiday</SelectItem></SelectContent></Select>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Metric label="Calendar entries" value={calendarRows.length} icon={<CalendarDays className="h-4 w-4" />} tone="primary" />
      <Metric label="Holidays" value={holidays.length} icon={<PartyPopper className="h-4 w-4" />} tone="warning" />
      <Metric label="Notices" value={notices.length} icon={<Megaphone className="h-4 w-4" />} tone="info" />
      <Metric label="Academic calendar" value={academicCalendar.length} icon={<School className="h-4 w-4" />} tone="success" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="border-border/60 lg:col-span-2"><CardHeader className="pb-2"><CardTitle className="font-display text-base">Calendar & Events</CardTitle><div className="text-xs text-muted-foreground">{visibleRows.length} records matching your filter</div></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Title</TableHead><TableHead>Details</TableHead></TableRow></TableHeader><TableBody>
        {loading && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading portal content…</TableCell></TableRow>}
        {!loading && visibleRows.map(({ item, type }, index) => <TableRow key={value(item, ["uuid", "event_uuid", "holiday_uuid", "id"], index)}><TableCell className="text-sm whitespace-nowrap">{formatDate(value(item, ["date", "event_date", "start_date", "holiday_date"], null))}</TableCell><TableCell><Badge variant={type === "Holiday" ? "outline" : type === "Academic" ? "secondary" : "default"} className="text-[10px]">{type}</Badge></TableCell><TableCell className="text-sm font-medium">{value(item, ["title", "name", "event_name", "holiday_name", "description"])}</TableCell><TableCell className="text-sm text-muted-foreground">{value(item, ["notes", "description", "details", "remarks"], "—")}</TableCell></TableRow>)}
        {!loading && visibleRows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground p-6">No records for this filter.</TableCell></TableRow>}
      </TableBody></Table></CardContent></Card>
      <div className="space-y-4"><Card className="border-border/60"><CardHeader className="pb-2"><CardTitle className="font-display text-base">Holidays</CardTitle></CardHeader><CardContent className="space-y-2">{!loading && holidays.map((holiday, index) => <div key={value(holiday, ["holiday_uuid", "uuid", "id"], index)} className="border rounded-md p-3"><div className="text-sm font-medium">{value(holiday, ["title", "name", "holiday_name"])}</div><div className="text-[11px] text-muted-foreground mt-0.5">{formatDate(value(holiday, ["date", "holiday_date", "start_date"], null))}</div></div>)}{!loading && holidays.length === 0 && <div className="text-sm text-muted-foreground text-center p-4">No holidays scheduled.</div>}</CardContent></Card>
        <Card className="border-border/60"><CardHeader className="pb-2"><CardTitle className="font-display text-base">Notices & Circulars</CardTitle></CardHeader><CardContent className="space-y-2">{!loading && notices.map((notice, index) => <div key={value(notice, ["notice_uuid", "uuid", "id"], index)} className="border rounded-md p-3"><div className="text-sm font-medium">{value(notice, ["title", "subject", "notice_title"])}</div><div className="text-[11px] text-muted-foreground mt-0.5">{value(notice, ["published_at", "created_at", "date"], "") && formatDate(value(notice, ["published_at", "created_at", "date"], null))}</div><div className="text-xs mt-1">{value(notice, ["body", "content", "description", "message"], "")}</div></div>)}{!loading && notices.length === 0 && <div className="text-sm text-muted-foreground text-center p-4">No notices.</div>}</CardContent></Card>
      </div>
    </div>
  </PageContainer>;
}

function Metric({ label, value, icon, tone }) {
  const tones = { primary: "bg-primary/10 text-primary", warning: "bg-amber-500/10 text-amber-600", info: "bg-info/10 text-info", success: "bg-emerald-500/10 text-emerald-600" };
  return <Card className="border-border/60"><CardContent className="pt-5 flex items-center gap-3"><div className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 ${tones[tone]}`}>{icon}</div><div><div className="text-[11px] text-muted-foreground">{label}</div><div className="text-lg font-display font-bold">{value}</div></div></CardContent></Card>;
}
