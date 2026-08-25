import { PageContainer, PageHeader } from "../../components/page-shell";
import { KpiCard } from "../../components/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ClipboardList,
  Plus,
  Download,
  FileBox,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Paperclip,
  NotebookPen,
  Link2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  assignmentsApi,
  submissionsApi,
  materialsApi,
  lessonPlansApi,
  useAssignments,
  useSubmissions,
  useMaterials,
  useLessonPlans,
} from "../../lib/store";
import { useTeacherCtx } from "../../lib/teacher-ctx";
import { openPrintable, esc } from "../../lib/print";

export default function TeacherAssignmentsPage() {
  const { teacherName, classes, subjects } = useTeacherCtx();
  const allAssignments = useAssignments();
  const allSubs = useSubmissions();
  const allMaterials = useMaterials();

  const [openA, setOpenA] = useState(false);
  const [openM, setOpenM] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [classF, setClassF] = useState("All");

  const mine = useMemo(
    () =>
      allAssignments.filter(
        (a) => a.teacher === teacherName || classes.includes(a.klass),
      ),
    [allAssignments, teacherName, classes],
  );
  const filtered = useMemo(
    () => mine.filter((a) => classF === "All" || a.klass === classF),
    [mine, classF],
  );
  const myMaterials = useMemo(
    () =>
      allMaterials.filter(
        (m) =>
          !m.archived &&
          (m.teacher === teacherName ||
            m.klasses.some((k) => classes.includes(k))),
      ),
    [allMaterials, teacherName, classes],
  );

  const subsFor = (id) => allSubs.filter((s) => s.assignmentId === id);
  const active = activeId ? mine.find((a) => a.id === activeId) : undefined;

  const emptyA = {
    title: "",
    subject: subjects[0] ?? "Math",
    klass: classes[0] ?? "X-B",
    due: "",
    maxMarks: 20,
    instructions: "",
    attachment: "",
  };
  const [formA, setFormA] = useState(emptyA);
  const emptyM = {
    title: "",
    type: "PDF",
    url: "",
    subject: subjects[0] ?? "Math",
    klass: classes[0] ?? "X-B",
    description: "",
  };
  const [formM, setFormM] = useState(emptyM);

  const createAssignment = (status) => {
    if (!formA.title.trim()) return toast.error("Title required");
    const id = assignmentsApi.add({
      title: formA.title,
      subject: formA.subject,
      klass: formA.klass,
      section: formA.klass.split("-")[1],
      teacher: teacherName,
      due: formA.due,
      endDate: formA.due,
      maxMarks: formA.maxMarks,
      instructions: formA.instructions,
      attachments: formA.attachment ? [formA.attachment] : [],
      resources: formA.attachment
        ? [{ kind: "pdf", label: formA.attachment }]
        : [],
      status,
    });
    setOpenA(false);
    setFormA(emptyA);
    if (status === "Published") {
      const n = assignmentsApi.distribute(id);
      toast.success(`Published to ${n} student(s) of ${formA.klass}`);
    } else toast.success("Draft saved");
  };

  const uploadMaterial = () => {
    if (!formM.title.trim()) return toast.error("Title required");
    materialsApi.add({
      title: formM.title,
      type: formM.type,
      url:
        formM.url ||
        `/files/${formM.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      subject: formM.subject,
      klasses: [formM.klass],
      teacher: teacherName,
      description: formM.description,
    });
    setOpenM(false);
    setFormM(emptyM);
    toast.success("Study material shared with students");
  };

  const downloadFile = (name, body) => {
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${name}`);
  };

  const printSubmission = (s, a) =>
    openPrintable(
      `${s.studentName} — Submission`,
      `
      <h1>${esc(a?.title ?? "Assignment")}</h1>
      <div class="muted">${esc(a?.subject)} · Class ${esc(a?.klass)} · Max ${esc(a?.maxMarks)} marks</div>
      <h2>Student</h2>
      <div class="box">${esc(s.studentName)} (${esc(s.studentId)}) · Status: ${esc(s.status)}${s.late ? " · LATE" : ""}<br/>
      Submitted: ${esc(s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—")}</div>
      <h2>Answer / Notes</h2><div class="box">${esc(s.text || "No written answer submitted.")}</div>
      <h2>Files</h2><ul>${(s.files ?? []).map((f) => `<li>${esc(f)}</li>`).join("") || "<li>No files</li>"}</ul>`,
    );

  const pending = allSubs.filter(
    (s) =>
      mine.some((a) => a.id === s.assignmentId) &&
      ["Submitted", "Late", "Resubmitted"].includes(s.status),
  ).length;
  const graded = allSubs.filter(
    (s) =>
      mine.some((a) => a.id === s.assignmentId) && s.status === "Graded",
  ).length;

  // ---- Detail view: students of one assignment ----
  if (active) {
    const rows = subsFor(active.id);
    return (
      <PageContainer>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3"
          onClick={() => {
            setActiveId(null);
            setActiveSub(null);
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to assignments
        </Button>
        <PageHeader
          eyebrow={`${active.subject} · Class ${active.klass}`}
          title={active.title}
          description={`Due ${active.due || "—"} · Max ${active.maxMarks} marks · ${rows.length} student(s) assigned`}
        />
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Assigned students
            </CardTitle>
            <CardDescription>
              Click a student to open their submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setActiveSub(s)}
                  >
                    <TableCell className="font-medium">
                      {s.studentName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.studentId}
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.submittedAt
                        ? new Date(s.submittedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.files?.length ? s.files.join(", ") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "Graded"
                            ? "default"
                            : s.status === "Pending"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {s.marks ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!s.submittedAt}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSub(s);
                        }}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-sm text-muted-foreground"
                    >
                      No students attached yet — publish the assignment to
                      distribute it.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!activeSub} onOpenChange={(v) => !v && setActiveSub(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{activeSub?.studentName}</DialogTitle>
              <DialogDescription>
                {active.title} · {activeSub?.status}
                {activeSub?.late ? " · Late" : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-border/60 p-3">
                <div className="text-[10px] uppercase text-muted-foreground mb-1">
                  Submitted answer
                </div>
                {activeSub?.text || (
                  <span className="text-muted-foreground">
                    No written answer.
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase text-muted-foreground">
                  Attached files
                </div>
                {(activeSub?.files ?? []).length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No files uploaded.
                  </div>
                )}
                {(activeSub?.files ?? []).map((f) => (
                  <div
                    key={f}
                    className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      {f}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadFile(
                          f,
                          `Submission by ${activeSub?.studentName}\n\n${activeSub?.text ?? ""}`,
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">
                    Marks (max {active.maxMarks})
                  </Label>
                  <Input
                    type="number"
                    defaultValue={activeSub?.marks ?? ""}
                    id="tsub-marks"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Feedback</Label>
                  <Input defaultValue={activeSub?.feedback ?? ""} id="tsub-fb" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => activeSub && printSubmission(activeSub, active)}
              >
                <Download className="h-4 w-4" />
                Download as PDF
              </Button>
              <Button
                onClick={() => {
                  if (!activeSub) return;
                  const m = Number(
                    document.getElementById("tsub-marks")?.value || 0,
                  );
                  const fb =
                    document.getElementById("tsub-fb")?.value || "";
                  submissionsApi.publishGrade(activeSub.id, m, fb);
                  toast.success("Grade published to student");
                  setActiveSub(null);
                }}
              >
                Publish grade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Teacher Portal · Academics"
        title="Assignments & Materials"
        description="Create assignments for your assigned classes, review student submissions, and share downloadable study materials."
        actions={
          <div className="flex flex-wrap gap-2">
            <Dialog open={openM} onOpenChange={setOpenM}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FileBox className="h-4 w-4" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share study material</DialogTitle>
                  <DialogDescription>
                    Visible and downloadable for students of the selected
                    class.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={formM.title}
                      onChange={(e) =>
                        setFormM({ ...formM, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Subject</Label>
                      <Select
                        value={formM.subject}
                        onValueChange={(v) =>
                          setFormM({ ...formM, subject: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Class</Label>
                      <Select
                        value={formM.klass}
                        onValueChange={(v) =>
                          setFormM({ ...formM, klass: v })
                        }
                      >
                        <SelectTrigger>
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
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">File name / URL</Label>
                    <Input
                      placeholder="chapter-5-notes.pdf"
                      value={formM.url}
                      onChange={(e) =>
                        setFormM({ ...formM, url: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      rows={3}
                      value={formM.description}
                      onChange={(e) =>
                        setFormM({ ...formM, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={uploadMaterial}>Share</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={openA} onOpenChange={setOpenA}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary border-0">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create assignment</DialogTitle>
                  <DialogDescription>
                    Publishing attaches it to every student of the selected
                    class.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={formA.title}
                      onChange={(e) =>
                        setFormA({ ...formA, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Subject</Label>
                      <Select
                        value={formA.subject}
                        onValueChange={(v) =>
                          setFormA({ ...formA, subject: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Class</Label>
                      <Select
                        value={formA.klass}
                        onValueChange={(v) =>
                          setFormA({ ...formA, klass: v })
                        }
                      >
                        <SelectTrigger>
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
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Due date</Label>
                      <Input
                        type="date"
                        value={formA.due}
                        onChange={(e) =>
                          setFormA({ ...formA, due: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max marks</Label>
                      <Input
                        type="number"
                        value={formA.maxMarks}
                        onChange={(e) =>
                          setFormA({
                            ...formA,
                            maxMarks: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Instructions</Label>
                    <Textarea
                      rows={4}
                      value={formA.instructions}
                      onChange={(e) =>
                        setFormA({ ...formA, instructions: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Attachment (file name)</Label>
                    <Input
                      value={formA.attachment}
                      onChange={(e) =>
                        setFormA({ ...formA, attachment: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => createAssignment("Draft")}
                  >
                    Save draft
                  </Button>
                  <Button onClick={() => createAssignment("Published")}>
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard
          label="My Assignments"
          value={String(mine.length)}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Pending Review"
          value={String(pending)}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Graded"
          value={String(graded)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Materials Shared"
          value={String(myMaterials.length)}
          icon={<FileBox className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
          <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Class</span>
              <Select value={classF} onValueChange={setClassF}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["All", ...classes].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((a) => {
              const rows = subsFor(a.id);
              const done = rows.filter((s) => s.status !== "Pending").length;
              const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
              return (
                <Card
                  key={a.id}
                  className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => setActiveId(a.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {a.id}
                        </div>
                        <CardTitle className="text-sm font-display">
                          {a.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {a.subject} · Class {a.klass} · Due {a.due || "—"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          a.status === "Published"
                            ? "default"
                            : a.status === "Draft"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {a.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Submissions
                      </span>
                      <span className="font-semibold">
                        {done}/{rows.length}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <Card className="border-border/60 md:col-span-2">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No assignments yet for your classes.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myMaterials.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {m.title}
                        <div className="text-[11px] text-muted-foreground">
                          {m.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{m.subject}</TableCell>
                      <TableCell className="text-xs">
                        {m.klasses.join(", ")}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">
                        {m.downloads}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            materialsApi.download(m.id);
                            downloadFile(
                              m.title.replace(/\s+/g, "-") + ".txt",
                              `${m.title}\n${m.description ?? ""}\nSource: ${m.url}`,
                            );
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {myMaterials.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No study materials shared yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <LessonPlansTab
            teacherName={teacherName}
            classes={classes}
            subjects={subjects}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

/** Lesson planning lives inside the assignments workspace for teachers. */
function LessonPlansTab({ teacherName, classes, subjects }) {
  const plans = useLessonPlans();
  const [open, setOpen] = useState(false);
  const empty = {
    title: "",
    subject: subjects[0] ?? "Math",
    klass: classes[0] ?? "X-B",
    chapter: "",
    topic: "",
    method: "Discussion + worked examples",
    weekOf: "",
    periods: 3,
    objectives: "",
    pdf: "",
    link: "",
  };
  const [form, setForm] = useState(empty);

  const mine = plans.filter(
    (p) =>
      !p.archived &&
      (p.teacher === teacherName || classes.includes(p.klass)),
  );

  const save = (status) => {
    if (!form.title.trim()) return toast.error("Title required");
    const resources = [];
    if (form.pdf.trim()) resources.push({ kind: "pdf", label: form.pdf.trim() });
    if (form.link.trim())
      resources.push({ kind: "link", label: form.link.trim(), url: form.link.trim() });
    lessonPlansApi.add({
      title: form.title,
      subject: form.subject,
      klass: form.klass,
      teacher: teacherName,
      chapter: form.chapter,
      topic: form.topic,
      method: form.method,
      weekOf: form.weekOf || new Date().toISOString().slice(0, 10),
      periods: form.periods,
      materials: [],
      resources,
      objectives: form.objectives,
      status,
      completion: "Not Started",
    });
    setOpen(false);
    setForm(empty);
    toast.success(
      status === "Submitted"
        ? "Lesson plan submitted to HOD"
        : "Lesson plan saved",
    );
  };

  const downloadPlan = (p) =>
    openPrintable(
      `${p.title} — Lesson Plan`,
      `
      <h1>${esc(p.title)}</h1>
      <div class="muted">${esc(p.subject)} · Class ${esc(p.klass)} · Week of ${esc(p.weekOf)} · ${esc(p.periods)} period(s)</div>
      <h2>Chapter & topic</h2><div class="box">${esc(p.chapter)}<br/>${esc(p.topic)}</div>
      <h2>Learning objectives</h2><div class="box">${esc(p.objectives || "—")}</div>
      <h2>Teaching method</h2><div class="box">${esc(p.method)}</div>
      <h2>Resources</h2><ul>${(p.resources ?? []).map((r) => `<li>${esc(r.kind.toUpperCase())}: ${esc(r.label)}</li>`).join("") || "<li>None attached</li>"}</ul>
      <h2>Progress log</h2><ul>${p.completionLogs.map((l) => `<li>${esc(l.date)} — ${esc(l.note)}</li>`).join("") || "<li>No entries</li>"}</ul>
      <div class="muted" style="margin-top:24px">Prepared by ${esc(p.teacher)} · Edureon ERP</div>`,
    );

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="p-3 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <NotebookPen className="h-3.5 w-3.5" />
            {mine.length} lesson plan(s)
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0">
                <Plus className="h-4 w-4" />
                New Lesson Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create lesson plan</DialogTitle>
                <DialogDescription>
                  Attach reference PDFs and URLs; the plan can be downloaded
                  as a PDF.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 max-h-[65vh] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Subject</Label>
                    <Select
                      value={form.subject}
                      onValueChange={(v) => setForm({ ...form, subject: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Class</Label>
                    <Select
                      value={form.klass}
                      onValueChange={(v) => setForm({ ...form, klass: v })}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Chapter</Label>
                    <Input
                      value={form.chapter}
                      onChange={(e) =>
                        setForm({ ...form, chapter: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Topic</Label>
                    <Input
                      value={form.topic}
                      onChange={(e) =>
                        setForm({ ...form, topic: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Week of</Label>
                    <Input
                      type="date"
                      value={form.weekOf}
                      onChange={(e) =>
                        setForm({ ...form, weekOf: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Periods</Label>
                    <Input
                      type="number"
                      value={form.periods}
                      onChange={(e) =>
                        setForm({ ...form, periods: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Learning objectives</Label>
                  <Textarea
                    rows={3}
                    value={form.objectives}
                    onChange={(e) =>
                      setForm({ ...form, objectives: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Teaching method</Label>
                  <Input
                    value={form.method}
                    onChange={(e) =>
                      setForm({ ...form, method: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 rounded-md border border-border/60 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Resources
                  </div>
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="file"
                      className="text-xs"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          pdf: e.target.files?.[0]?.name ?? f.pdf,
                        }))
                      }
                    />
                  </div>
                  <Input
                    placeholder="Attached PDF name"
                    value={form.pdf}
                    onChange={(e) => setForm({ ...form, pdf: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Reference URL (https://…)"
                      value={form.link}
                      onChange={(e) =>
                        setForm({ ...form, link: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => save("Draft")}>
                  Save draft
                </Button>
                <Button onClick={() => save("Submitted")}>
                  Submit to HOD
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {mine.map((p) => (
          <Card key={p.id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {p.id}
                  </div>
                  <CardTitle className="text-sm font-display">
                    {p.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {p.subject} · Class {p.klass} · Week of {p.weekOf} ·{" "}
                    {p.periods} period(s)
                  </CardDescription>
                </div>
                <Badge variant={p.status === "Approved" ? "default" : "outline"}>
                  {p.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {p.chapter} — {p.topic}
              </div>
              <div className="flex flex-wrap gap-1">
                {(p.resources ?? []).map((r, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {r.kind.toUpperCase()} · {r.label}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => downloadPlan(p)}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                {p.status === "Draft" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      lessonPlansApi.submit(p.id);
                      toast.success("Submitted to HOD");
                    }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {mine.length === 0 && (
          <Card className="border-border/60 md:col-span-2">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No lesson plans yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}