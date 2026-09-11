/* eslint-disable react-hooks/set-state-in-effect */
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
  // eslint-disable-next-line no-unused-vars
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
  BookOpen,
  Plus,
  CalendarDays,
  ClipboardCheck,
  Save,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  examsApi,
  marksApi,
  questionsApi,
  useExams,
  useMarkEntries,
  useQuestions,
} from "../../lib/store";
import { useTeacherCtx } from "../../lib/teacher-ctx";
import { getTeacherClasses } from "../../api/teacherclass";
import { getExamCategories } from "../../api/exam"; 

// Fetches the flat class/section/subject rows for the logged-in teacher.
function useTeacherClassSections() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getTeacherClasses();
        if (alive) setRows(res?.data ?? []);
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { rows, loading, error };
}

// 👇 NEW: fetches exam categories for the "Category" dropdown.
function useExamCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getExamCategories({ skip: 0, limit: 100 });
        if (alive) setCategories(res?.items ?? []);
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { categories, loading, error };
}

export default function TeacherExams() {
  const { teacherName, classes, subjects } = useTeacherCtx();
  const exams = useExams();
  const marks = useMarkEntries();
  const questions = useQuestions();

  const {
    rows: classSectionRows,
    loading: loadingClassSections,
  } = useTeacherClassSections();

  // 👇 NEW: category data
  const {
    categories: examCategories,
    loading: loadingCategories,
  } = useExamCategories();

  const myClassRoots = useMemo(
    () => classes.map((c) => c.split("-")[0]),
    [classes],
  );
  const visibleExams = useMemo(
    () =>
      exams.filter(
        (e) => classes.includes(e.class) || myClassRoots.includes(e.class),
      ),
    [exams, classes, myClassRoots],
  );

  const [openTest, setOpenTest] = useState(false);
  const emptyTest = {
    name: "",
    categoryUuid: "", // 👈 CHANGED: was `category: "Unit Test"`
    classUuid: "",
    sectionUuid: "",
    subjectUuid: "",
    from: "",
    to: "",
    maxMarks: 25,
    instructions: "",
  };
  const [testForm, setTestForm] = useState(emptyTest);

  // Unique classes
  const classOptions = useMemo(() => {
    const map = new Map();
    classSectionRows.forEach((r) => {
      if (!map.has(r.class_uuid)) {
        map.set(r.class_uuid, {
          class_uuid: r.class_uuid,
          class_name: r.class_name,
        });
      }
    });
    return Array.from(map.values());
  }, [classSectionRows]);

  // Sections available for the selected class
  const sectionOptions = useMemo(() => {
    const map = new Map();
    classSectionRows
      .filter((r) => r.class_uuid === testForm.classUuid)
      .forEach((r) => {
        if (!map.has(r.section_uuid)) {
          map.set(r.section_uuid, {
            section_uuid: r.section_uuid,
            section_name: r.section_name,
          });
        }
      });
    return Array.from(map.values());
  }, [classSectionRows, testForm.classUuid]);

  // Subjects available for the selected class + section
  const subjectOptions = useMemo(() => {
    const map = new Map();
    classSectionRows
      .filter(
        (r) =>
          r.class_uuid === testForm.classUuid &&
          r.section_uuid === testForm.sectionUuid,
      )
      .forEach((r) => {
        if (!map.has(r.subject_uuid)) {
          map.set(r.subject_uuid, {
            subject_uuid: r.subject_uuid,
            subject_name: r.subject_name,
            subject_code: r.subject_code,
          });
        }
      });
    return Array.from(map.values());
  }, [classSectionRows, testForm.classUuid, testForm.sectionUuid]);

  // 👇 NEW: Default-select the first category once data arrives
  useEffect(() => {
    if (!testForm.categoryUuid && examCategories.length > 0) {
      setTestForm((f) => ({
        ...f,
        categoryUuid: examCategories[0].category_uuid,
      }));
    }
  }, [examCategories, testForm.categoryUuid]);

  // Default-select the first class/section/subject once data arrives
  useEffect(() => {
    if (!testForm.classUuid && classOptions.length > 0) {
      setTestForm((f) => ({ ...f, classUuid: classOptions[0].class_uuid }));
    }
  }, [classOptions, testForm.classUuid]);

  useEffect(() => {
    if (
      testForm.classUuid &&
      (!testForm.sectionUuid ||
        !sectionOptions.some((s) => s.section_uuid === testForm.sectionUuid))
    ) {
      setTestForm((f) => ({
        ...f,
        sectionUuid: sectionOptions[0]?.section_uuid ?? "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionOptions, testForm.classUuid]);

  useEffect(() => {
    if (
      testForm.sectionUuid &&
      (!testForm.subjectUuid ||
        !subjectOptions.some((s) => s.subject_uuid === testForm.subjectUuid))
    ) {
      setTestForm((f) => ({
        ...f,
        subjectUuid: subjectOptions[0]?.subject_uuid ?? "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectOptions, testForm.sectionUuid]);

  const [markExam, setMarkExam] = useState(visibleExams[0]?.id ?? "");
  const [markSubject, setMarkSubject] = useState(subjects[0] ?? "Math");
  const [draft, setDraft] = useState({});

  const myMarks = useMemo(
    () => marks.filter((m) => m.examId === markExam && m.subject === markSubject),
    [marks, markExam, markSubject],
  );

  const createTest = () => {
    if (!testForm.name.trim()) return toast.error("Test name required");
    if (!testForm.classUuid || !testForm.sectionUuid || !testForm.subjectUuid) {
      return toast.error("Select class, section and subject");
    }
    if (!testForm.categoryUuid) {
      return toast.error("Select a category"); // 👈 NEW guard
    }

    const cls = classOptions.find((c) => c.class_uuid === testForm.classUuid);
    const sec = sectionOptions.find(
      (s) => s.section_uuid === testForm.sectionUuid,
    );
    const subj = subjectOptions.find(
      (s) => s.subject_uuid === testForm.subjectUuid,
    );
    // 👇 NEW: resolve category uuid -> name
    const cat = examCategories.find(
      (c) => c.category_uuid === testForm.categoryUuid,
    );
    const classLabel = cls && sec ? `${cls.class_name}-${sec.section_name}` : "";
    const categoryName = cat?.category_name ?? "Exam";

    examsApi.add({
      name: `${categoryName} — ${testForm.name} (${subj?.subject_name ?? ""})`, // 👈 CHANGED: testForm.category -> categoryName
      class: classLabel,
      from: testForm.from || new Date().toISOString().slice(0, 10),
      to: testForm.to || testForm.from || new Date().toISOString().slice(0, 10),
      subjects: 1,
      status: "Scheduled",
    });
    if (testForm.instructions.trim()) {
      questionsApi.add({
        subject: subj?.subject_name ?? "",
        chapter: testForm.name,
        question: testForm.instructions,
        answer: "",
        diff: "Medium",
        marks: testForm.maxMarks,
        className: classLabel,
        examType: categoryName, // 👈 CHANGED: testForm.category -> categoryName
      });
    }
    setOpenTest(false);
    toast.success(`Internal test assigned to ${classLabel}`);
    setTestForm({
      ...emptyTest,
      categoryUuid: testForm.categoryUuid, // 👈 NEW: keep category selected after reset
      classUuid: testForm.classUuid,
      sectionUuid: testForm.sectionUuid,
      subjectUuid: testForm.subjectUuid,
    });
  };

  const grouped = useMemo(() => {
    const map = {};
    visibleExams.forEach((e) => {
      // 👇 CHANGED: match against fetched category names instead of the old static CATEGORIES array
      const cat =
        examCategories.find((c) =>
          e.name.toLowerCase().includes(c.category_name.toLowerCase()),
        )?.category_name ?? "Other";
      (map[cat] ||= []).push(e);
    });
    return map;
  }, [visibleExams, examCategories]); // 👈 CHANGED: added examCategories to deps

  const myQuestions = questions.filter(
    (q) =>
      subjects.includes(q.subject) &&
      (!q.className || classes.includes(q.className) || myClassRoots.includes(q.className)),
  );

  return (
    <PageContainer>
      <PageHeader
        title="My Examinations"
        actions={
          <Dialog open={openTest} onOpenChange={setOpenTest}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary border-0">
                <Plus className="h-4 w-4" />
                New Internal Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create internal test</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Test name</Label>
                  <Input
                    placeholder="Chapter 4 — Quadratics"
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    {/* 👇 CHANGED: entire Select block now driven by examCategories */}
                    <Select
                      value={testForm.categoryUuid}
                      disabled={loadingCategories || examCategories.length === 0}
                      onValueChange={(v) => setTestForm({ ...testForm, categoryUuid: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {examCategories.map((c) => (
                          <SelectItem key={c.category_uuid} value={c.category_uuid}>
                            {c.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Class</Label>
                    <Select
                      value={testForm.classUuid}
                      disabled={loadingClassSections || classOptions.length === 0}
                      onValueChange={(v) =>
                        setTestForm({
                          ...testForm,
                          classUuid: v,
                          sectionUuid: "",
                          subjectUuid: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((c) => (
                          <SelectItem key={c.class_uuid} value={c.class_uuid}>
                            {c.class_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Section</Label>
                    <Select
                      value={testForm.sectionUuid}
                      disabled={!testForm.classUuid || sectionOptions.length === 0}
                      onValueChange={(v) =>
                        setTestForm({
                          ...testForm,
                          sectionUuid: v,
                          subjectUuid: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionOptions.map((s) => (
                          <SelectItem key={s.section_uuid} value={s.section_uuid}>
                            {s.section_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Subject</Label>
                    <Select
                      value={testForm.subjectUuid}
                      disabled={!testForm.sectionUuid || subjectOptions.length === 0}
                      onValueChange={(v) =>
                        setTestForm({ ...testForm, subjectUuid: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((s) => (
                          <SelectItem key={s.subject_uuid} value={s.subject_uuid}>
                            {s.subject_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Max marks</Label>
                    <Input
                      type="number"
                      value={testForm.maxMarks}
                      onChange={(e) =>
                        setTestForm({ ...testForm, maxMarks: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      value={testForm.from}
                      onChange={(e) => setTestForm({ ...testForm, from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input
                      type="date"
                      value={testForm.to}
                      onChange={(e) => setTestForm({ ...testForm, to: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Instructions / question paper notes</Label>
                  <Textarea
                    rows={3}
                    value={testForm.instructions}
                    onChange={(e) =>
                      setTestForm({ ...testForm, instructions: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createTest}>Create & assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard
          label="My Classes"
          value={String(classes.length)}
          icon={<BookOpen className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Scheduled Exams"
          value={String(visibleExams.filter((e) => e.status === "Scheduled").length)}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Completed"
          value={String(visibleExams.filter((e) => e.status === "Completed").length)}
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="My Question Items"
          value={String(myQuestions.length)}
          icon={<BookOpen className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="schedule">Categories & Schedule</TabsTrigger>
          <TabsTrigger value="tests">My Internal Tests</TabsTrigger>
          <TabsTrigger value="marks">Marks Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4 space-y-4">
          {Object.entries(grouped).map(([cat, list]) => (
            <Card key={cat} className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">{cat}</CardTitle>
                <CardDescription>{list.length} exam(s) covering your classes</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Papers</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.class}</TableCell>
                        <TableCell className="text-xs">{e.from}</TableCell>
                        <TableCell className="text-xs">{e.to}</TableCell>
                        <TableCell className="text-xs">{e.subjects}</TableCell>
                        <TableCell>
                          <Badge variant={e.status === "Completed" ? "secondary" : "default"}>
                            {e.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          {visibleExams.length === 0 && (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No exams scheduled for your classes.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Question Papers
              </CardTitle>
              <CardDescription>
                Chapter/unit tests created by {teacherName} for assigned classes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter / Test</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myQuestions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">
                        {q.chapter}
                        <div className="text-[11px] text-muted-foreground max-w-[420px] truncate">
                          {q.question}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{q.subject}</TableCell>
                      <TableCell className="text-xs">{q.className ?? "—"}</TableCell>
                      <TableCell className="text-xs">{q.examType ?? "—"}</TableCell>
                      <TableCell className="text-xs tabular-nums">{q.marks}</TableCell>
                    </TableRow>
                  ))}
                  {myQuestions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                        No internal tests created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-3 flex flex-wrap items-center gap-2">
              <Select value={markExam} onValueChange={setMarkExam}>
                <SelectTrigger className="h-8 w-64">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {visibleExams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} · {e.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={markSubject} onValueChange={setMarkSubject}>
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    marksApi.saveDraft(
                      Object.entries(draft).map(([id, obtained]) => ({ id, obtained })),
                    );
                    setDraft({});
                    toast.success("Marks saved as draft");
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save draft
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    marksApi.submitForModeration(markExam, markSubject);
                    toast.success("Sent to exam cell for moderation");
                  }}
                >
                  <Send className="h-4 w-4" />
                  Submit for moderation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Max</TableHead>
                    <TableHead className="w-32">Marks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myMarks.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.studentName}</TableCell>
                      <TableCell className="text-xs">{m.klass}</TableCell>
                      <TableCell className="text-xs">{m.max}</TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          type="number"
                          defaultValue={m.obtained ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [m.id]: Number(e.target.value) }))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.status === "Published" ? "default" : "secondary"}>
                          {m.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {myMarks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                        No marks sheet for this exam & subject.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}