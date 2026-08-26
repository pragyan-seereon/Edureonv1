import { PageContainer, PageHeader } from "../../components/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Plane, FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const balances = [
  {
    type: "Casual Leave (CL)",
    balance: 7,
    used: 5,
    total: 12,
    tone: "bg-info/10 text-info",
  },
  {
    type: "Sick Leave (SL)",
    balance: 9,
    used: 3,
    total: 12,
    tone: "bg-warning/15 text-warning",
  },
  {
    type: "Earned Leave (EL)",
    balance: 18,
    used: 6,
    total: 24,
    tone: "bg-success/10 text-success",
  },
  {
    type: "Comp-off",
    balance: 2,
    used: 1,
    total: 3,
    tone: "bg-accent/15 text-accent",
  },
];

const seed = [
  {
    id: "LV-0142",
    type: "Casual Leave",
    from: "22 Nov 2025",
    to: "22 Nov 2025",
    days: 1,
    reason: "Family wedding",
    status: "Approved",
    approver: "Rahul Kapoor",
  },
  {
    id: "LV-0141",
    type: "Sick Leave",
    from: "08 Nov 2025",
    to: "09 Nov 2025",
    days: 2,
    reason: "Flu",
    status: "Approved",
    approver: "Vikas Yadav",
  },
  {
    id: "LV-0140",
    type: "Earned Leave",
    from: "12 Dec 2025",
    to: "16 Dec 2025",
    days: 5,
    reason: "Pre-planned vacation",
    status: "Pending",
  },
  {
    id: "LV-0139",
    type: "Casual Leave",
    from: "30 Oct 2025",
    to: "30 Oct 2025",
    days: 1,
    reason: "Personal",
    status: "Rejected",
    approver: "Rahul Kapoor",
  },
];

const statusColor = {
  Pending: "bg-warning/15 text-warning border-warning/20",
  Approved: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function TeacherLeave() {
  const [items, setItems] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "Casual Leave",
    from: "",
    to: "",
    reason: "",
  });

  const submit = () => {
    const days = Math.max(
      1,
      Math.round(
        (new Date(form.to).getTime() - new Date(form.from).getTime()) /
          86400000,
      ) + 1,
    );
    setItems((p) => [
      {
        id: "LV-" + (143 + p.length),
        type: form.type,
        from: form.from || "—",
        to: form.to || "—",
        days: isFinite(days) ? days : 1,
        reason: form.reason,
        status: "Pending",
      },
      ...p,
    ]);
    toast.success("Leave request submitted to Principal");
    setOpen(false);
    setForm({ type: "Casual Leave", from: "", to: "", reason: "" });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Teacher Portal · HR"
        title="Attendance & Leave"
        description="My own attendance record, leave balance and approval status from the Principal / HOD."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0">
                <Plus className="h-4 w-4" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New leave application</DialogTitle>
                <DialogDescription>
                  Goes to Principal for approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Leave Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Casual Leave",
                        "Sick Leave",
                        "Earned Leave",
                        "Comp-off",
                      ].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1"></div>
                <div className="space-y-1.5">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={form.from}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, from: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={form.to}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, to: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Reason</Label>
                  <Textarea
                    rows={3}
                    value={form.reason}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reason: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileUp className="h-4 w-4" />
                    Attach supporting document (optional)
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className="gradient-primary border-0" onClick={submit}>
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">My Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <MyAttendance />
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {balances.map((b) => (
              <Card key={b.type} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {b.type}
                      </div>
                      <div className="text-3xl font-display font-semibold mt-1">
                        {b.balance}
                        <span className="text-sm text-muted-foreground ml-1">
                          / {b.total}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {b.used} days used
                      </div>
                    </div>
                    <div
                      className={`h-9 w-9 rounded-md flex items-center justify-center ${b.tone}`}
                    >
                      <Plane className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Leave History
              </CardTitle>
              <CardDescription>All applications submitted by me</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px]">
                          {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{r.from}</TableCell>
                      <TableCell className="text-xs">{r.to}</TableCell>
                      <TableCell className="text-xs">{r.days}</TableCell>
                      <TableCell className="text-sm max-w-[260px] truncate">
                        {r.reason}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.approver ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColor[r.status]}
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

/** Personal duty attendance for the signed-in faculty member. */
function MyAttendance() {
  const days = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const wk = d.getDay();
    const status =
      wk === 0 ? "Holiday" : i % 11 === 0 ? "Leave" : i % 7 === 0 ? "Late" : "Present";
    return {
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        weekday: "short",
      }),
      status,
      inTime:
        status === "Present"
          ? "08:0" + (i % 9) + " AM"
          : status === "Late"
            ? "09:2" + (i % 9) + " AM"
            : "—",
      outTime: status === "Present" || status === "Late" ? "03:45 PM" : "—",
      periods: status === "Present" || status === "Late" ? 5 : 0,
    };
  });
  const present = days.filter((d) => d.status === "Present" || d.status === "Late").length;
  const working = days.filter((d) => d.status !== "Holiday").length;
  const pct = Math.round((present / Math.max(1, working)) * 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Attendance %
            </div>
            <div className="text-3xl font-display font-semibold mt-1">{pct}%</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Days Present
            </div>
            <div className="text-3xl font-display font-semibold mt-1">{present}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Late Marks
            </div>
            <div className="text-3xl font-display font-semibold mt-1">
              {days.filter((d) => d.status === "Late").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Leaves Taken
            </div>
            <div className="text-3xl font-display font-semibold mt-1">
              {days.filter((d) => d.status === "Leave").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Daily punch record</CardTitle>
          <CardDescription>Last 24 days · read-only, maintained by HR</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>In</TableHead>
                <TableHead>Out</TableHead>
                <TableHead className="text-right">Periods</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {days.map((d) => (
                <TableRow key={d.date}>
                  <TableCell className="text-xs">{d.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{d.inTime}</TableCell>
                  <TableCell className="text-xs">{d.outTime}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">
                    {d.periods}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}