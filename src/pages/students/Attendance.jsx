import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarCheck, Loader2 } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import studentModel from "../../api/studentModel";
import { KpiCard } from "../../components/kpi-card";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const colors = { P: "bg-success/20 text-success border-success/30", A: "bg-destructive/20 text-destructive border-destructive/30", L: "bg-warning/20 text-warning border-warning/30", H: "bg-muted/40 text-muted-foreground", F: "border-dashed text-muted-foreground/40" };
const message = (error) => error?.response?.data?.detail?.message || error?.response?.data?.detail || error?.message || "Unable to load attendance.";

export default function Attendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date(), year = now.getFullYear(), month = now.getMonth();
  useEffect(() => { studentModel.getMyAttendance().then((response) => setData(response?.data)).catch((error) => toast.error(message(error))).finally(() => setLoading(false)); }, []);
  const days = useMemo(() => {
    const values = new Map((data?.attendance || []).map((item) => [item.attendance_date, item.status]));
    return Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => { const day = index + 1; const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; return { day, status: values.get(date) || (new Date(year, month, day).getDay() === 0 ? "H" : day > now.getDate() ? "F" : null) }; });
  }, [data, month, year]);
  if (loading) return <PageContainer><Loader2 className="animate-spin mx-auto my-20" /></PageContainer>;
  const percent = Number(data?.attendance_percentage || 0), eligible = data?.eligibility?.eligible ?? percent >= 75;
  const trend = (data?.monthly_trend || []).map((item) => ({ month: item.month_label, percent: item.attendance_percentage }));
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  return <PageContainer><PageHeader eyebrow="Student Portal" title="My Attendance" description="Daily attendance and monthly trend from your student record." />
    {!eligible && <div className="mb-5 flex gap-3 p-4 rounded-md bg-warning/10 border border-warning/30"><AlertTriangle className="text-warning" /><div><b className="text-sm">Attendance below 75%</b><p className="text-xs text-muted-foreground">Maintain at least {data?.eligibility?.minimum_percentage || 75}% attendance.</p></div></div>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><KpiCard label="Present" value={data?.present || 0} icon={<CalendarCheck />} tone="success" /><KpiCard label="Absent" value={data?.absent || 0} icon={<CalendarCheck />} tone="warning" /><KpiCard label="On Leave" value={data?.on_leave || 0} icon={<CalendarCheck />} tone="info" /><KpiCard label="Attendance %" value={`${percent}%`} icon={<CalendarCheck />} tone="primary" /></div>
    <div className="grid lg:grid-cols-3 gap-4"><Card className="lg:col-span-2"><CardHeader><CardTitle>{now.toLocaleString("en-IN", { month: "long", year: "numeric" })}</CardTitle><CardDescription>P · A · L · H (Holiday) · Future</CardDescription></CardHeader><CardContent><div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground mb-2">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => <div key={name}>{name}</div>)}</div><div className="grid grid-cols-7 gap-1.5">{Array.from({ length: offset }, (_, index) => <div key={index} />)}{days.map(({ day, status }) => <div title={data?.status_legend?.[status] || "Not marked"} key={day} className={`aspect-square rounded-md border flex flex-col items-center justify-center text-xs ${colors[status] || "border-dashed text-muted-foreground"}`}><span>{day}</span>{status && status !== "F" && <small>{status}</small>}</div>)}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Last 4 Months</CardTitle><CardDescription>Attendance % trend</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="percent" stroke="var(--chart-1)" strokeWidth={2.5} /></LineChart></ResponsiveContainer><Badge variant="outline" className={eligible ? "text-success" : "text-warning"}>{eligible ? "Eligible" : "Below threshold"}</Badge></CardContent></Card></div>
  </PageContainer>;
}
