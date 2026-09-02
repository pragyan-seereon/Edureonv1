import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
import {
  CalendarDays,
  PartyPopper,
  Megaphone,
  School,
  Download,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNotices, noticesApi } from "../../lib/store";

const WHO = "STU1000";
const CLASS = "XI-C";

const EVENTS = [
  {
    date: "2025-11-10",
    type: "Event",
    title: "Children's Day Celebration",
    audience: "All Classes",
    notes: "House-wise cultural programme",
  },
  {
    date: "2025-11-25 to 2025-12-05",
    type: "Exam",
    title: "Unit Test 3",
    audience: "VI-XII",
    notes: "Manual timetable and invigilation to be published",
  },
  {
    date: "2025-12-25",
    type: "Holiday",
    title: "Christmas Holiday",
    audience: "All",
    notes: "Campus closed",
  },
];

const typeVariant = (t) =>
  t === "Holiday" ? "outline" : t === "Exam" ? "secondary" : "default";

export default function Notices() {
  const notices = useNotices();
  const [filter, setFilter] = useState("All");

  const visible = notices.filter(
    (n) =>
      n.status === "Published" &&
      (n.audience === "Students" ||
        n.audience === "Parents" ||
        n.audience === "All"),
  );

  const holidays = EVENTS.filter((e) => e.type === "Holiday");

  const filteredEvents = useMemo(
    () => (filter === "All" ? EVENTS : EVENTS.filter((e) => e.type === filter)),
    [filter],
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Notices, Calendar & Events"
        description={`Class ${CLASS} · events, holidays, annual calendar and school notices from the admin portal.`}
        actions={
          <>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Exam">Exam</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => toast.success("Calendar exported")}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/60">
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Upcoming</div>
              <div className="text-lg font-display font-bold">{EVENTS.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-amber-500/10 text-amber-600 shrink-0">
              <PartyPopper className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Holidays</div>
              <div className="text-lg font-display font-bold">{holidays.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-info/10 text-info shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Notices</div>
              <div className="text-lg font-display font-bold">{visible.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
              <School className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Class</div>
              <div className="text-lg font-display font-bold">{CLASS}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Annual Calendar
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {filteredEvents.length} records matching your filters
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((e) => (
                  <TableRow key={e.title}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {e.date}
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeVariant(e.type)} className="text-[10px]">
                        {e.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {e.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.audience}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.notes}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground p-6">
                      No records for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Holidays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {holidays.map((h) => (
                <div key={h.title} className="border rounded-md p-3">
                  <div className="text-sm font-medium">{h.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {h.date} · {h.notes}
                  </div>
                </div>
              ))}
              {holidays.length === 0 && (
                <div className="text-sm text-muted-foreground text-center p-4">
                  No holidays scheduled.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Notices &amp; Circulars
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visible.map((n) => (
                <div key={n.id} className="border rounded-md p-3">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {n.by} · {n.category}
                  </div>
                  <div className="text-xs mt-1">{n.body}</div>
                  {n.acks.includes(WHO) ? (
                    <Badge className="text-[10px] mt-2">Acknowledged</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        noticesApi.acknowledge(n.id, WHO);
                        toast.success("Acknowledged");
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
              {visible.length === 0 && (
                <div className="text-sm text-muted-foreground text-center p-4">
                  No notices.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}