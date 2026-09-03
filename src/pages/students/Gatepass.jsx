import { useEffect, useState } from "react";
import { DoorOpen, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import studentModel from "../../api/studentModel";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const formatDateTime = (value, options) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-IN", options).format(date);
};

const errorMessage = (error) => error?.response?.data?.detail?.message || error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Unable to load gate-pass history.";

export default function StudentGatePass() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentModel.getMyGatePasses()
      .then((response) => setData(response?.data || null))
      .catch((error) => toast.error(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const rows = data?.gate_passes || [];
  const summary = data?.summary || {};
  const classSection = [data?.class_name || rows[0]?.class_name, data?.section_name || rows[0]?.section_name].filter(Boolean).join(" · ");

  return (
    <PageContainer>
      <PageHeader eyebrow="Student Portal" title="Gate Pass History" description="View-only register of gate passes issued by the admin office." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Metric label="Total Passes" value={summary.total_passes ?? rows.length} icon={<DoorOpen className="h-5 w-5" />} />
        <Metric label="Returned" value={summary.returned ?? rows.filter((row) => row.status === "RETURNED").length} icon={<ShieldCheck className="h-5 w-5" />} />
        <Metric label="Currently Out" value={summary.currently_out ?? rows.filter((row) => row.status === "OUT").length} icon={<DoorOpen className="h-5 w-5" />} />
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Issued Gate Passes</CardTitle>
          <CardDescription>{data?.student_name || "Student"}{classSection && ` · ${classSection}`}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Pass No.</TableHead><TableHead>Date</TableHead><TableHead>Purpose</TableHead><TableHead>Out</TableHead><TableHead>In</TableHead><TableHead>Authority</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading gate passes…</TableCell></TableRow>}
              {!loading && rows.map((pass) => <TableRow key={pass.gate_pass_uuid}>
                <TableCell className="font-mono text-xs">{pass.gate_pass_number || "—"}</TableCell>
                <TableCell className="text-xs">{formatDateTime(pass.out_time, { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                <TableCell className="text-sm">{pass.purpose || "—"}</TableCell>
                <TableCell className="text-xs">{formatDateTime(pass.out_time, { hour: "numeric", minute: "2-digit" })}</TableCell>
                <TableCell className="text-xs">{formatDateTime(pass.in_time, { hour: "numeric", minute: "2-digit" })}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{pass.permission_authority || "—"}</TableCell>
                <TableCell><Badge variant="outline" className={pass.status === "RETURNED" ? "bg-success/10 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}>{pass.status === "RETURNED" ? "Returned" : pass.status === "OUT" ? "Out" : pass.status || "—"}</Badge></TableCell>
              </TableRow>)}
              {!loading && rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">No gate passes issued yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Metric({ label, value, icon }) {
  return <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">{icon}</div><div><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl font-semibold">{value}</div></div></CardContent></Card>;
}
