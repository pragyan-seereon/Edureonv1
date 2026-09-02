import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
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
  Download,
  Trophy,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { KpiCard } from "../../components/kpi-card";
import { toast } from "sonner";

const EXAMS = [
  "Mid-Term II — 2025-26",
  "Unit Test 3 — 2025-26",
  "Mid-Term I — 2025-26",
];

const data = {
  "Mid-Term II — 2025-26": [
    { subject: "Mathematics", max: 80, my: 74, avg: 58 },
    { subject: "Physics", max: 80, my: 68, avg: 55 },
    { subject: "Chemistry", max: 80, my: 71, avg: 60 },
    { subject: "English", max: 80, my: 66, avg: 62 },
    { subject: "Hindi", max: 80, my: 70, avg: 64 },
    { subject: "Computer Sci", max: 80, my: 78, avg: 67 },
  ],
  "Unit Test 3 — 2025-26": [
    { subject: "Mathematics", max: 25, my: 22, avg: 17 },
    { subject: "Physics", max: 25, my: 19, avg: 16 },
    { subject: "Chemistry", max: 25, my: 21, avg: 18 },
    { subject: "English", max: 25, my: 20, avg: 19 },
  ],
  "Mid-Term I — 2025-26": [
    { subject: "Mathematics", max: 80, my: 71, avg: 56 },
    { subject: "Physics", max: 80, my: 66, avg: 53 },
    { subject: "Chemistry", max: 80, my: 69, avg: 58 },
    { subject: "English", max: 80, my: 68, avg: 60 },
    { subject: "Hindi", max: 80, my: 72, avg: 63 },
    { subject: "Computer Sci", max: 80, my: 76, avg: 65 },
  ],
};

const examSeries = [
  {
    name: "Pre-Board",
    window: "12 Dec 25 – 16 Dec 25",
    subjectCount: 3,
    scope: "Class XI",
    status: "Scheduled",
    papers: [
      { subject: "Physics", date: "12 Dec", time: "09:00 AM – 12:00 PM", room: "F-11" },
      { subject: "Chemistry", date: "14 Dec", time: "09:00 AM – 12:00 PM", room: "F-11" },
      { subject: "Maths", date: "16 Dec", time: "09:00 AM – 12:00 PM", room: "F-11" },
    ],
  },
  {
    name: "Unit Test 3",
    window: "5 Dec 25 – 9 Dec 25",
    subjectCount: 4,
    scope: "Class XI",
    status: "In Progress",
    papers: [
      { subject: "Mathematics", date: "5 Dec", time: "09:00 AM – 09:25 AM", room: "F-11" },
      { subject: "Physics", date: "6 Dec", time: "09:00 AM – 09:25 AM", room: "F-12" },
      { subject: "Chemistry", date: "7 Dec", time: "09:00 AM – 09:25 AM", room: "F-12" },
      { subject: "English", date: "9 Dec", time: "01:00 PM – 01:25 PM", room: "G-04" },
    ],
  },
];

const examTypes = [
  {
    name: "Unit Test",
    weight: "10%",
    description: "Short tests held every 4–6 weeks to check chapter-level understanding.",
    count: "4 exams",
  },
  {
    name: "Mid-Term",
    weight: "25%",
    description: "Half-syllabus written exams covering taught chapters of the term.",
    count: "2 exams",
  },
  {
    name: "Pre-Board",
    weight: "15%",
    description: "Full-syllabus rehearsal for Class X & XII before board exams.",
    count: "1 exam",
  },
  {
    name: "Annual / Board",
    weight: "50%",
    description: "Final assessment as per CBSE/ICSE board pattern.",
    count: "1 exam",
  },
];

const gradingScale = [
  { grade: "A1", range: "91 – 100", gpa: "10", remark: "Outstanding" },
  { grade: "A2", range: "81 – 90", gpa: "9", remark: "Excellent" },
  { grade: "B1", range: "71 – 80", gpa: "8", remark: "Very Good" },
  { grade: "B2", range: "61 – 70", gpa: "7", remark: "Good" },
  { grade: "C1", range: "51 – 60", gpa: "6", remark: "Above Average" },
  { grade: "C2", range: "41 – 50", gpa: "5", remark: "Average" },
  { grade: "D", range: "33 – 40", gpa: "4", remark: "Pass" },
];

const grade = (pct) =>
  pct >= 91
    ? "A1"
    : pct >= 81
      ? "A2"
      : pct >= 71
        ? "B1"
        : pct >= 61
          ? "B2"
          : pct >= 51
            ? "C1"
            : pct >= 41
              ? "C2"
              : "D";

const gradeTone = (g) =>
  g === "A1" || g === "A2"
    ? "text-emerald-600"
    : g === "B1" || g === "B2"
      ? "text-blue-600"
      : g === "C1" || g === "C2"
        ? "text-amber-600"
        : "text-red-600";

export default function Results() {
  const [exam, setExam] = useState(EXAMS[0]);
  const rows = data[exam];
  const total = rows.reduce((s, r) => s + r.my, 0);
  const max = rows.reduce((s, r) => s + r.max, 0);
  const pct = Math.round((total / max) * 100);
  const overallGrade = grade(pct);

  const radarData = rows.map((r) => ({
    subject: r.subject.length > 8 ? r.subject.slice(0, 4) + "." : r.subject,
    score: Math.round((r.my / r.max) * 100),
  }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Exams & Results"
        description="Schedule, exam types and detailed performance reports."
        actions={
          <>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
              Admit Card
            </Button>
            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => toast.success("Report card downloaded (PDF)")}
            >
              <Download className="h-4 w-4" />
              Report Card
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Upcoming Exams"
          value={String(examSeries.length)}
          icon={<Calendar className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Completed"
          value="0"
          icon={<BookOpen className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Latest %"
          value={pct + "%"}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Overall Grade"
          value={overallGrade}
          icon={<Trophy className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">
            <Calendar className="h-3.5 w-3.5" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="types">
            <BookOpen className="h-3.5 w-3.5" />
            Exam Types
          </TabsTrigger>
          <TabsTrigger value="results">
            <Trophy className="h-3.5 w-3.5" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Upcoming Exam Schedule
              </CardTitle>
              <CardDescription>
                {examSeries.length} exam series scheduled for your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {examSeries.map((series) => (
                <div key={series.name} className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium">{series.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {series.window} · {series.subjectCount} subjects · {series.scope}
                      </div>
                    </div>
                    <Badge
                      variant={series.status === "In Progress" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {series.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {series.papers.map((p) => (
                      <div key={p.subject} className="border rounded-md p-3">
                        <div className="text-sm font-medium mb-1">{p.subject}</div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {p.date} · {p.time}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          Room {p.room}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Types */}
        <TabsContent value="types" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {examTypes.map((t) => (
              <Card key={t.name} className="border-border/60">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {t.weight}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Per academic year</span>
                    <span className="font-medium text-foreground">{t.count}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Grading Scale (CBSE)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Marks Range</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradingScale.map((g) => (
                    <TableRow key={g.grade}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {g.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{g.range}</TableCell>
                      <TableCell className="text-sm font-semibold">{g.gpa}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {g.remark}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results" className="space-y-4 mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="font-display text-base">
                  Detailed Exam Report
                </CardTitle>
                <CardDescription>
                  Subject-wise performance, grade and rank analysis
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={exam} onValueChange={setExam}>
                  <SelectTrigger className="h-9 w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Report card downloaded (PDF)")}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="border rounded-md p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Total</div>
                  <div className="text-lg font-display font-bold">{total} / {max}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Percentage</div>
                  <div className="text-lg font-display font-bold">{pct}%</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Grade</div>
                  <div className={`text-lg font-display font-bold ${gradeTone(overallGrade)}`}>
                    {overallGrade}
                  </div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">Class Rank</div>
                  <div className="text-lg font-display font-bold">#7 of 38</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Subject Scores</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="subject"
                        fontSize={11}
                        stroke="var(--muted-foreground)"
                      />
                      <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="my"
                        name="My Score"
                        fill="var(--chart-1)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="max"
                        name="Max"
                        fill="var(--chart-3)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Strength Radar</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        fontSize={11}
                        stroke="var(--muted-foreground)"
                      />
                      <Radar
                        dataKey="score"
                        stroke="var(--chart-1)"
                        fill="var(--chart-1)"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Subject Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead className="text-right">Obtained</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const p = Math.round((r.my / r.max) * 100);
                    const g = grade(p);
                    return (
                      <TableRow key={r.subject}>
                        <TableCell className="text-sm">{r.subject}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {r.max}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {r.my}
                        </TableCell>
                        <TableCell className="w-40">
                          <Progress value={p} className="h-2" />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {g}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-xs ${gradeTone(g)}`}>
                          {g === "A1" || g === "A2"
                            ? "Excellent"
                            : g === "B1" || g === "B2"
                              ? "Good"
                              : g === "C1" || g === "C2"
                                ? "Needs work"
                                : "At risk"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}