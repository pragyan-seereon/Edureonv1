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
// eslint-disable-next-line no-unused-vars
import { Download, Eye } from "lucide-react";
import { useMemo, useState } from "react";

/** Signed-in faculty context (would come from auth in a real app). */
const teacherName = "Rahul Kapoor";
const classes = ["X-A", "X-B", "XI-Sci", "XII-Com"];

/** Timetable config — shape mirrors what the Admin publishes. */
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = ["P1", "P2", "P3", "Lunch", "P4", "P5", "P6", "P7"];
const breakPeriods = [3];
const breakLabels = { 3: "Lunch Break" };

const subjects = [
  { name: "Mathematics", color: "bg-info/10 text-info border-info/20" },
  { name: "Physics", color: "bg-accent/15 text-accent border-accent/20" },
  { name: "Chemistry", color: "bg-warning/15 text-warning border-warning/20" },
  { name: "English", color: "bg-success/10 text-success border-success/20" },
  { name: "Computer Science", color: "bg-secondary text-secondary-foreground border-border" },
  { name: "Physical Education", color: "bg-muted text-foreground border-border" },
];

const teachers = [
  "Rahul Kapoor",
  "Vikas Yadav",
  "Sunita Rao",
  "Anjali Mehta",
  "Deepak Nair",
];

const rooms = ["Room 101", "Room 204", "Lab 1", "Lab 2", "Room 309"];

const isBreak = (p) => breakPeriods.includes(p);

/** Deterministic mock cell so the grid looks stable without a backend. */
function defaultCell(kls, d, p) {
  const seedNum = kls.charCodeAt(0) || 65;
  return {
    subject: subjects[(d * 7 + p * 3 + seedNum) % subjects.length]?.name || "—",
    teacher: teachers[(d + p + seedNum) % teachers.length] || "—",
    room: rooms[(d * 2 + p + seedNum) % rooms.length] || "—",
  };
}

const subjectColor = (name) => subjects.find((s) => s.name === name)?.color ?? "bg-muted text-foreground border-border";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export default function TeacherTimetable() {
  const [klass, setKlass] = useState(classes[0]);

  const getCell = (kls, d, p) => defaultCell(kls, d, p);

  const mySchedule = useMemo(() => {
    const out = [];
    classes.forEach((k) => {
      for (let d = 0; d < days.length; d++) {
        for (let p = 0; p < periods.length; p++) {
          if (isBreak(p)) continue;
          const cell = getCell(k, d, p);
          if (cell.teacher === teacherName) out.push({ klass: k, day: d, period: p, cell });
        }
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = () => {
    const rows = days
      .map(
        (day, d) =>
          `<tr><th>${esc(day)}</th>${periods
            .map((_, p) =>
              isBreak(p)
                ? `<td>${esc(breakLabels[p] ?? "Break")}</td>`
                : `<td><b>${esc(getCell(klass, d, p).subject)}</b><br/><span class="muted">${esc(
                    getCell(klass, d, p).teacher,
                  )} · ${esc(getCell(klass, d, p).room)}</span></td>`,
            )
            .join("")}</tr>`,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Timetable ${esc(klass)}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
            .muted { color: #777; font-size: 10px; }
          </style>
        </head>
        <body>
          <h1>Class ${esc(klass)} — Weekly Timetable</h1>
          <div class="muted">Edureon ERP · view generated for ${esc(teacherName)}</div>
          <table>
            <thead><tr><th>Day</th>${periods.map((t) => `<th>${esc(t)}</th>`).join("")}</tr></thead>
            <tbody>${rows}</tbody>
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

  return (
    <PageContainer>
      <PageHeader
        title="Timetable"
        actions={
          <Button size="sm" variant="outline" onClick={download}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        }
      />

      {/* <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" /> View-only mode — timetable changes are managed by the Admin.
      </div> */}

      <Tabs defaultValue="class">
        <TabsList>
          <TabsTrigger value="class">Class View</TabsTrigger>
          <TabsTrigger value="teacher">My Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Class</span>
              <Select value={klass} onValueChange={setKlass}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-3 overflow-x-auto">
              <table className="w-full text-xs border-separate border-spacing-1 min-w-[720px]">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground font-medium">Day</th>
                    {periods.map((t, p) => (
                      <th key={p} className="text-muted-foreground font-medium">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, d) => (
                    <tr key={day}>
                      <td className="text-muted-foreground font-medium pr-2">{day}</td>
                      {periods.map((_, p) => {
                        if (isBreak(p)) {
                          return (
                            <td
                              key={p}
                              className="text-center text-[10px] text-muted-foreground bg-muted/40 rounded"
                            >
                              {breakLabels[p] ?? "Break"}
                            </td>
                          );
                        }
                        const c = getCell(klass, d, p);
                        return (
                          <td key={p}>
                            <div className={`rounded-md border px-2 py-1.5 ${subjectColor(c.subject)}`}>
                              <div className="font-medium truncate">{c.subject}</div>
                              <div className="text-[10px] opacity-80 truncate">{c.teacher}</div>
                              <div className="text-[10px] opacity-70 truncate">{c.room}</div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">{teacherName} — weekly load</CardTitle>
              <CardDescription>
                {mySchedule.length} period(s) across {classes.length} assigned class(es)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mySchedule.map((s, i) => (
                <div key={i} className="rounded-md border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.cell.subject}</span>
                    <Badge variant="secondary">{s.klass}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {days[s.day]} · {periods[s.period]} · {s.cell.room}
                  </div>
                </div>
              ))}
              {mySchedule.length === 0 && (
                <div className="text-sm text-muted-foreground p-4">
                  No periods currently mapped to you in the published timetable.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}