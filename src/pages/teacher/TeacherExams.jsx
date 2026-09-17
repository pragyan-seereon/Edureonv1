// /* eslint-disable react-hooks/set-state-in-effect */
// import { PageContainer, PageHeader } from "../../components/page-shell";
// import { KpiCard } from "../../components/kpi-card";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { Badge } from "../../components/ui/badge";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import { Textarea } from "../../components/ui/textarea";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../../components/ui/tabs";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   // eslint-disable-next-line no-unused-vars
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";
// import {
//   BookOpen,
//   Plus,
//   CalendarDays,
//   ClipboardCheck,
//   Save,
//   Send,
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import {
//   examsApi,
//   marksApi,
//   questionsApi,
//   useExams,
//   useMarkEntries,
//   useQuestions,
// } from "../../lib/store";
// import { useTeacherCtx } from "../../lib/teacher-ctx";
// import { getTeacherClasses } from "../../api/teacherclass";
// import { getExamCategories } from "../../api/exam"; 

// // Fetches the flat class/section/subject rows for the logged-in teacher.
// function useTeacherClassSections() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await getTeacherClasses();
//         if (alive) setRows(res?.data ?? []);
//       } catch (err) {
//         if (alive) setError(err);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   return { rows, loading, error };
// }

// // 👇 NEW: fetches exam categories for the "Category" dropdown.
// function useExamCategories() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await getExamCategories({ skip: 0, limit: 100 });
//         if (alive) setCategories(res?.items ?? []);
//       } catch (err) {
//         if (alive) setError(err);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   return { categories, loading, error };
// }

// export default function TeacherExams() {
//   const { teacherName, classes, subjects } = useTeacherCtx();
//   const exams = useExams();
//   const marks = useMarkEntries();
//   const questions = useQuestions();

//   const {
//     rows: classSectionRows,
//     loading: loadingClassSections,
//   } = useTeacherClassSections();

//   // 👇 NEW: category data
//   const {
//     categories: examCategories,
//     loading: loadingCategories,
//   } = useExamCategories();

//   const myClassRoots = useMemo(
//     () => classes.map((c) => c.split("-")[0]),
//     [classes],
//   );
//   const visibleExams = useMemo(
//     () =>
//       exams.filter(
//         (e) => classes.includes(e.class) || myClassRoots.includes(e.class),
//       ),
//     [exams, classes, myClassRoots],
//   );

//   const [openTest, setOpenTest] = useState(false);
//   const emptyTest = {
//     name: "",
//     categoryUuid: "", // 👈 CHANGED: was `category: "Unit Test"`
//     classUuid: "",
//     sectionUuid: "",
//     subjectUuid: "",
//     from: "",
//     to: "",
//     maxMarks: 25,
//     instructions: "",
//   };
//   const [testForm, setTestForm] = useState(emptyTest);

//   // Unique classes
//   const classOptions = useMemo(() => {
//     const map = new Map();
//     classSectionRows.forEach((r) => {
//       if (!map.has(r.class_uuid)) {
//         map.set(r.class_uuid, {
//           class_uuid: r.class_uuid,
//           class_name: r.class_name,
//         });
//       }
//     });
//     return Array.from(map.values());
//   }, [classSectionRows]);

//   // Sections available for the selected class
//   const sectionOptions = useMemo(() => {
//     const map = new Map();
//     classSectionRows
//       .filter((r) => r.class_uuid === testForm.classUuid)
//       .forEach((r) => {
//         if (!map.has(r.section_uuid)) {
//           map.set(r.section_uuid, {
//             section_uuid: r.section_uuid,
//             section_name: r.section_name,
//           });
//         }
//       });
//     return Array.from(map.values());
//   }, [classSectionRows, testForm.classUuid]);

//   // Subjects available for the selected class + section
//   const subjectOptions = useMemo(() => {
//     const map = new Map();
//     classSectionRows
//       .filter(
//         (r) =>
//           r.class_uuid === testForm.classUuid &&
//           r.section_uuid === testForm.sectionUuid,
//       )
//       .forEach((r) => {
//         if (!map.has(r.subject_uuid)) {
//           map.set(r.subject_uuid, {
//             subject_uuid: r.subject_uuid,
//             subject_name: r.subject_name,
//             subject_code: r.subject_code,
//           });
//         }
//       });
//     return Array.from(map.values());
//   }, [classSectionRows, testForm.classUuid, testForm.sectionUuid]);

//   // 👇 NEW: Default-select the first category once data arrives
//   useEffect(() => {
//     if (!testForm.categoryUuid && examCategories.length > 0) {
//       setTestForm((f) => ({
//         ...f,
//         categoryUuid: examCategories[0].category_uuid,
//       }));
//     }
//   }, [examCategories, testForm.categoryUuid]);

//   // Default-select the first class/section/subject once data arrives
//   useEffect(() => {
//     if (!testForm.classUuid && classOptions.length > 0) {
//       setTestForm((f) => ({ ...f, classUuid: classOptions[0].class_uuid }));
//     }
//   }, [classOptions, testForm.classUuid]);

//   useEffect(() => {
//     if (
//       testForm.classUuid &&
//       (!testForm.sectionUuid ||
//         !sectionOptions.some((s) => s.section_uuid === testForm.sectionUuid))
//     ) {
//       setTestForm((f) => ({
//         ...f,
//         sectionUuid: sectionOptions[0]?.section_uuid ?? "",
//       }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [sectionOptions, testForm.classUuid]);

//   useEffect(() => {
//     if (
//       testForm.sectionUuid &&
//       (!testForm.subjectUuid ||
//         !subjectOptions.some((s) => s.subject_uuid === testForm.subjectUuid))
//     ) {
//       setTestForm((f) => ({
//         ...f,
//         subjectUuid: subjectOptions[0]?.subject_uuid ?? "",
//       }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [subjectOptions, testForm.sectionUuid]);

//   const [markExam, setMarkExam] = useState(visibleExams[0]?.id ?? "");
//   const [markSubject, setMarkSubject] = useState(subjects[0] ?? "Math");
//   const [draft, setDraft] = useState({});

//   const myMarks = useMemo(
//     () => marks.filter((m) => m.examId === markExam && m.subject === markSubject),
//     [marks, markExam, markSubject],
//   );

//   const createTest = () => {
//     if (!testForm.name.trim()) return toast.error("Test name required");
//     if (!testForm.classUuid || !testForm.sectionUuid || !testForm.subjectUuid) {
//       return toast.error("Select class, section and subject");
//     }
//     if (!testForm.categoryUuid) {
//       return toast.error("Select a category"); // 👈 NEW guard
//     }

//     const cls = classOptions.find((c) => c.class_uuid === testForm.classUuid);
//     const sec = sectionOptions.find(
//       (s) => s.section_uuid === testForm.sectionUuid,
//     );
//     const subj = subjectOptions.find(
//       (s) => s.subject_uuid === testForm.subjectUuid,
//     );
//     // 👇 NEW: resolve category uuid -> name
//     const cat = examCategories.find(
//       (c) => c.category_uuid === testForm.categoryUuid,
//     );
//     const classLabel = cls && sec ? `${cls.class_name}-${sec.section_name}` : "";
//     const categoryName = cat?.category_name ?? "Exam";

//     examsApi.add({
//       name: `${categoryName} — ${testForm.name} (${subj?.subject_name ?? ""})`, // 👈 CHANGED: testForm.category -> categoryName
//       class: classLabel,
//       from: testForm.from || new Date().toISOString().slice(0, 10),
//       to: testForm.to || testForm.from || new Date().toISOString().slice(0, 10),
//       subjects: 1,
//       status: "Scheduled",
//     });
//     if (testForm.instructions.trim()) {
//       questionsApi.add({
//         subject: subj?.subject_name ?? "",
//         chapter: testForm.name,
//         question: testForm.instructions,
//         answer: "",
//         diff: "Medium",
//         marks: testForm.maxMarks,
//         className: classLabel,
//         examType: categoryName, // 👈 CHANGED: testForm.category -> categoryName
//       });
//     }
//     setOpenTest(false);
//     toast.success(`Internal test assigned to ${classLabel}`);
//     setTestForm({
//       ...emptyTest,
//       categoryUuid: testForm.categoryUuid, // 👈 NEW: keep category selected after reset
//       classUuid: testForm.classUuid,
//       sectionUuid: testForm.sectionUuid,
//       subjectUuid: testForm.subjectUuid,
//     });
//   };

//   const grouped = useMemo(() => {
//     const map = {};
//     visibleExams.forEach((e) => {
//       // 👇 CHANGED: match against fetched category names instead of the old static CATEGORIES array
//       const cat =
//         examCategories.find((c) =>
//           e.name.toLowerCase().includes(c.category_name.toLowerCase()),
//         )?.category_name ?? "Other";
//       (map[cat] ||= []).push(e);
//     });
//     return map;
//   }, [visibleExams, examCategories]); // 👈 CHANGED: added examCategories to deps

//   const myQuestions = questions.filter(
//     (q) =>
//       subjects.includes(q.subject) &&
//       (!q.className || classes.includes(q.className) || myClassRoots.includes(q.className)),
//   );

//   return (
//     <PageContainer>
//       <PageHeader
//         title="My Examinations"
//         actions={
//           <Dialog open={openTest} onOpenChange={setOpenTest}>
//             <DialogTrigger asChild>
//               <Button size="sm" className="gradient-primary border-0">
//                 <Plus className="h-4 w-4" />
//                 New Internal Test
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Create internal test</DialogTitle>
//               </DialogHeader>
//               <div className="grid gap-3">
//                 <div className="space-y-1">
//                   <Label className="text-xs">Test name</Label>
//                   <Input
//                     placeholder="Chapter 4 — Quadratics"
//                     value={testForm.name}
//                     onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1">
//                     <Label className="text-xs">Category</Label>
//                     {/* 👇 CHANGED: entire Select block now driven by examCategories */}
//                     <Select
//                       value={testForm.categoryUuid}
//                       disabled={loadingCategories || examCategories.length === 0}
//                       onValueChange={(v) => setTestForm({ ...testForm, categoryUuid: v })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {examCategories.map((c) => (
//                           <SelectItem key={c.category_uuid} value={c.category_uuid}>
//                             {c.category_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs">Class</Label>
//                     <Select
//                       value={testForm.classUuid}
//                       disabled={loadingClassSections || classOptions.length === 0}
//                       onValueChange={(v) =>
//                         setTestForm({
//                           ...testForm,
//                           classUuid: v,
//                           sectionUuid: "",
//                           subjectUuid: "",
//                         })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select class" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {classOptions.map((c) => (
//                           <SelectItem key={c.class_uuid} value={c.class_uuid}>
//                             {c.class_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs">Section</Label>
//                     <Select
//                       value={testForm.sectionUuid}
//                       disabled={!testForm.classUuid || sectionOptions.length === 0}
//                       onValueChange={(v) =>
//                         setTestForm({
//                           ...testForm,
//                           sectionUuid: v,
//                           subjectUuid: "",
//                         })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select section" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {sectionOptions.map((s) => (
//                           <SelectItem key={s.section_uuid} value={s.section_uuid}>
//                             {s.section_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs">Subject</Label>
//                     <Select
//                       value={testForm.subjectUuid}
//                       disabled={!testForm.sectionUuid || subjectOptions.length === 0}
//                       onValueChange={(v) =>
//                         setTestForm({ ...testForm, subjectUuid: v })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select subject" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {subjectOptions.map((s) => (
//                           <SelectItem key={s.subject_uuid} value={s.subject_uuid}>
//                             {s.subject_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs">Max marks</Label>
//                     <Input
//                       type="number"
//                       value={testForm.maxMarks}
//                       onChange={(e) =>
//                         setTestForm({ ...testForm, maxMarks: Number(e.target.value) })
//                       }
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <Label className="text-xs">From</Label>
//                     <Input
//                       type="date"
//                       value={testForm.from}
//                       onChange={(e) => setTestForm({ ...testForm, from: e.target.value })}
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <Label className="text-xs">To</Label>
//                     <Input
//                       type="date"
//                       value={testForm.to}
//                       onChange={(e) => setTestForm({ ...testForm, to: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-xs">Instructions / question paper notes</Label>
//                   <Textarea
//                     rows={3}
//                     value={testForm.instructions}
//                     onChange={(e) =>
//                       setTestForm({ ...testForm, instructions: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button onClick={createTest}>Create & assign</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         }
//       />

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
//         <KpiCard
//           label="My Classes"
//           value={String(classes.length)}
//           icon={<BookOpen className="h-5 w-5" />}
//           tone="primary"
//         />
//         <KpiCard
//           label="Scheduled Exams"
//           value={String(visibleExams.filter((e) => e.status === "Scheduled").length)}
//           icon={<CalendarDays className="h-5 w-5" />}
//           tone="info"
//         />
//         <KpiCard
//           label="Completed"
//           value={String(visibleExams.filter((e) => e.status === "Completed").length)}
//           icon={<ClipboardCheck className="h-5 w-5" />}
//           tone="success"
//         />
//         <KpiCard
//           label="My Question Items"
//           value={String(myQuestions.length)}
//           icon={<BookOpen className="h-5 w-5" />}
//           tone="warning"
//         />
//       </div>

//       <Tabs defaultValue="schedule">
//         <TabsList className="flex-wrap h-auto">
//           <TabsTrigger value="schedule">Categories & Schedule</TabsTrigger>
//           <TabsTrigger value="tests">My Internal Tests</TabsTrigger>
//           <TabsTrigger value="marks">Marks Entry</TabsTrigger>
//         </TabsList>

//         <TabsContent value="schedule" className="mt-4 space-y-4">
//           {Object.entries(grouped).map(([cat, list]) => (
//             <Card key={cat} className="border-border/60">
//               <CardHeader className="pb-2">
//                 <CardTitle className="font-display text-base">{cat}</CardTitle>
//                 <CardDescription>{list.length} exam(s) covering your classes</CardDescription>
//               </CardHeader>
//               <CardContent className="p-0 overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Exam</TableHead>
//                       <TableHead>Class</TableHead>
//                       <TableHead>From</TableHead>
//                       <TableHead>To</TableHead>
//                       <TableHead>Papers</TableHead>
//                       <TableHead>Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {list.map((e) => (
//                       <TableRow key={e.id}>
//                         <TableCell className="font-medium">{e.name}</TableCell>
//                         <TableCell>{e.class}</TableCell>
//                         <TableCell className="text-xs">{e.from}</TableCell>
//                         <TableCell className="text-xs">{e.to}</TableCell>
//                         <TableCell className="text-xs">{e.subjects}</TableCell>
//                         <TableCell>
//                           <Badge variant={e.status === "Completed" ? "secondary" : "default"}>
//                             {e.status}
//                           </Badge>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           ))}
//           {visibleExams.length === 0 && (
//             <Card className="border-border/60">
//               <CardContent className="p-8 text-center text-sm text-muted-foreground">
//                 No exams scheduled for your classes.
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         <TabsContent value="tests" className="mt-4">
//           <Card className="border-border/60">
//             <CardHeader className="pb-2">
//               <CardTitle className="font-display text-base">
//                 Question Papers
//               </CardTitle>
//               <CardDescription>
//                 Chapter/unit tests created by {teacherName} for assigned classes.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="p-0 overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Chapter / Test</TableHead>
//                     <TableHead>Subject</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Marks</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {myQuestions.map((q) => (
//                     <TableRow key={q.id}>
//                       <TableCell className="font-medium">
//                         {q.chapter}
//                         <div className="text-[11px] text-muted-foreground max-w-[420px] truncate">
//                           {q.question}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-xs">{q.subject}</TableCell>
//                       <TableCell className="text-xs">{q.className ?? "—"}</TableCell>
//                       <TableCell className="text-xs">{q.examType ?? "—"}</TableCell>
//                       <TableCell className="text-xs tabular-nums">{q.marks}</TableCell>
//                     </TableRow>
//                   ))}
//                   {myQuestions.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
//                         No internal tests created yet.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="marks" className="mt-4 space-y-4">
//           <Card className="border-border/60">
//             <CardContent className="p-3 flex flex-wrap items-center gap-2">
//               <Select value={markExam} onValueChange={setMarkExam}>
//                 <SelectTrigger className="h-8 w-64">
//                   <SelectValue placeholder="Select exam" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {visibleExams.map((e) => (
//                     <SelectItem key={e.id} value={e.id}>
//                       {e.name} · {e.class}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={markSubject} onValueChange={setMarkSubject}>
//                 <SelectTrigger className="h-8 w-40">
//                   <SelectValue placeholder="Subject" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {subjects.map((s) => (
//                     <SelectItem key={s} value={s}>
//                       {s}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <div className="ml-auto flex gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => {
//                     marksApi.saveDraft(
//                       Object.entries(draft).map(([id, obtained]) => ({ id, obtained })),
//                     );
//                     setDraft({});
//                     toast.success("Marks saved as draft");
//                   }}
//                 >
//                   <Save className="h-4 w-4" />
//                   Save draft
//                 </Button>
//                 <Button
//                   size="sm"
//                   onClick={() => {
//                     marksApi.submitForModeration(markExam, markSubject);
//                     toast.success("Sent to exam cell for moderation");
//                   }}
//                 >
//                   <Send className="h-4 w-4" />
//                   Submit for moderation
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-border/60">
//             <CardContent className="p-0 overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Student</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Max</TableHead>
//                     <TableHead className="w-32">Marks</TableHead>
//                     <TableHead>Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {myMarks.map((m) => (
//                     <TableRow key={m.id}>
//                       <TableCell className="font-medium">{m.studentName}</TableCell>
//                       <TableCell className="text-xs">{m.klass}</TableCell>
//                       <TableCell className="text-xs">{m.max}</TableCell>
//                       <TableCell>
//                         <Input
//                           className="h-8"
//                           type="number"
//                           defaultValue={m.obtained ?? ""}
//                           onChange={(e) =>
//                             setDraft((d) => ({ ...d, [m.id]: Number(e.target.value) }))
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={m.status === "Published" ? "default" : "secondary"}>
//                           {m.status}
//                         </Badge>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {myMarks.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
//                         No marks sheet for this exam & subject.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </PageContainer>
//   );
// }



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
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createTeacherInternalTest,
  getTeacherExamCategories,
  getTeacherClassScopes,
  getTeacherExams,
  getTeacherInternalTests,
  getExamMarks,
  importTeacherExamMarks,
  publishExamMarks,
  updateExamMarks,
} from "../../api/exam";
import {
  examsApi,
  marksApi,
  questionsApi,
  useExams,
  useMarkEntries,
  useQuestions,
} from "../../lib/store";
import { useTeacherCtx } from "../../lib/teacher-ctx";

const CATEGORIES = [
  "Unit Test",
  "Chapter Test",
  "Term 1",
  "Half Yearly",
  "Term 2",
  "Pre-board",
  "Annual",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const emptyQuestionRow = () => ({
  // client-only id used as a React key; stripped before hitting the API
  _key: Math.random().toString(36).slice(2),
  chapter_topic: "",
  difficulty: "Medium",
  marks: 1,
  question: "",
  answer_key: "",
});

export default function TeacherExams() {
  const { teacherName, classes, subjects } = useTeacherCtx();
  const exams = useExams();
  const marks = useMarkEntries();
  const questions = useQuestions();

  const myClassRoots = useMemo(
    () => classes.map((c) => c.split("-")[0]),
    [classes],
  );
  const [teacherExams, setTeacherExams] = useState([]);
  const [teacherExamsLoaded, setTeacherExamsLoaded] = useState(false);
  const [internalTests, setInternalTests] = useState([]);
  const [examCategories, setExamCategories] = useState(CATEGORIES);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [teacherScopes, setTeacherScopes] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getTeacherExamCategories();
        const categoryNames = (response.items ?? []).map(
          (category) => category.category_name,
        );
        if (categoryNames.length) {
          setExamCategories(categoryNames);
          setCategoryRecords(response.items);
        }
      } catch {
        // The standard categories remain available if the request fails.
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    getTeacherClassScopes()
      .then((response) => setTeacherScopes(response.data ?? []))
      .catch(() => toast.error("Unable to load assigned classes and subjects"));
  }, []);

  useEffect(() => {
    let active = true;

    const loadTeacherExams = async () => {
      try {
        const response = await getTeacherExams();
        if (!active) return;

        setTeacherExams((response.items ?? []).map((exam) => ({
          // An exam can have multiple papers, so use the paper UUID as the
          // UI row key while retaining the parent exam UUID for API actions.
          id: exam.paper_uuid,
          examUuid: exam.exam_uuid,
          classUuid: exam.class_uuid,
          sectionUuid: exam.section_uuid,
          subjectUuid: exam.subject_uuid,
          name: exam.test_name,
          category: exam.category_name,
          class: exam.class_name,
          from: exam.from_date,
          to: exam.to_date,
          subjects: 1,
          status: exam.status,
          subject: exam.subject_name,
        })));
        setTeacherExamsLoaded(true);
      } catch (error) {
        if (active) {
          toast.error(error?.response?.data?.detail ?? "Unable to load your exams");
        }
      }
    };

    loadTeacherExams();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    getTeacherInternalTests()
      .then((response) => {
        if (active) setInternalTests(response.items ?? []);
      })
      .catch((error) => {
        if (active) {
          toast.error(error?.response?.data?.detail ?? "Unable to load internal tests");
        }
      });

    return () => { active = false; };
  }, []);

  const visibleExams = useMemo(
    () => {
      // The backend endpoint already applies the logged-in teacher's
      // class/section/subject scope.  Do not compare its real class names to
      // the local mock context labels (for example "Class 10" vs "X-B").
      if (teacherExamsLoaded) return teacherExams;

      return exams.filter(
        (e) => classes.includes(e.class) || myClassRoots.includes(e.class),
      );
    },
    [teacherExamsLoaded, teacherExams, exams, classes, myClassRoots],
  );

  const [openTest, setOpenTest] = useState(false);
  const emptyTest = {
    category: "Unit Test",
    klass: classes[0] ?? "X-B",
    subject: subjects[0] ?? "Math",
    from: "",
    to: "",
    maxMarks: 25,
    instructions: "",
    paperTime: "",
    durationMinutes: 60,
    questions: [],
  };
  const [testForm, setTestForm] = useState(emptyTest);

  const scopedClasses = useMemo(
    () => [...new Set(teacherScopes.map(
      (scope) => `${scope.class_name} - ${scope.section_name}`,
    ))],
    [teacherScopes],
  );
  const scopedSubjects = useMemo(
    () => teacherScopes
      .filter((scope) =>
        `${scope.class_name} - ${scope.section_name}` === testForm.klass,
      )
      .map((scope) => scope.subject_name)
      .filter(Boolean),
    [teacherScopes, testForm.klass],
  );

  useEffect(() => {
    if (!scopedClasses.length) return;
    const className = scopedClasses[0];
    const subjectName = teacherScopes.find(
      (scope) => `${scope.class_name} - ${scope.section_name}` === className,
    )?.subject_name ?? "";
    setTestForm((form) => ({
      ...form,
      klass: className,
      subject: subjectName,
    }));
  }, [scopedClasses, teacherScopes]);

  const [markExam, setMarkExam] = useState(visibleExams[0]?.id ?? "");
  const [draft, setDraft] = useState({});
  const [markRows, setMarkRows] = useState([]);

  // ---------------- Excel marks import ----------------
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const selectedMarkPaper = useMemo(
    () => visibleExams.find((exam) => exam.id === markExam),
    [visibleExams, markExam],
  );

  useEffect(() => {
    if (!markExam && visibleExams.length) setMarkExam(visibleExams[0].id);
  }, [markExam, visibleExams]);

  const refreshMarkRows = async () => {
    if (!selectedMarkPaper) return;
    try {
      const results = await getExamMarks({
        examUuid: selectedMarkPaper.examUuid,
        classUuid: selectedMarkPaper.classUuid,
        sectionUuid: selectedMarkPaper.sectionUuid,
      });
      setMarkRows(results);
    } catch (error) {
      setMarkRows([]);
      toast.error(error?.response?.data?.detail ?? "Unable to load exam marks");
    }
  };

  useEffect(() => {
    if (!selectedMarkPaper) {
      setMarkRows([]);
      return;
    }

    getExamMarks({
      examUuid: selectedMarkPaper.examUuid,
      classUuid: selectedMarkPaper.classUuid,
      sectionUuid: selectedMarkPaper.sectionUuid,
    })
      .then((results) => setMarkRows(results))
      .catch((error) => {
        setMarkRows([]);
        toast.error(error?.response?.data?.detail ?? "Unable to load exam marks");
      });
  }, [selectedMarkPaper]);

  const myMarks = useMemo(() => markRows.map((result) => {
    const subjectMark = result.subject_marks?.find(
      (item) => item.subject_uuid === selectedMarkPaper?.subjectUuid,
    );
    return {
      id: result.result_uuid,
      studentUuid: result.student_uuid,
      subjectUuid: selectedMarkPaper?.subjectUuid,
      studentName: result.student_name,
      klass: result.class_name,
      max: subjectMark?.max_marks ?? result.total_max_marks,
      obtained: subjectMark?.marks,
      isAbsent: subjectMark?.is_absent ?? false,
      status: result.is_published ? "Published" : "Draft",
    };
  }), [markRows, selectedMarkPaper]);

  const saveMarksDraft = async () => {
    if (!selectedMarkPaper || !Object.keys(draft).length) {
      return toast.error("Enter at least one mark before saving");
    }
    try {
      await Promise.all(Object.entries(draft).map(([resultUuid, obtained]) =>
        updateExamMarks(resultUuid, {
          subject_marks: [{
            subject_uuid: selectedMarkPaper.subjectUuid,
            marks: obtained,
            is_absent: false,
          }],
        }),
      ));
      setMarkRows((rows) => rows.map((row) => {
        const obtained = draft[row.result_uuid];
        if (obtained === undefined) return row;
        return {
          ...row,
          subject_marks: row.subject_marks.map((mark) =>
            mark.subject_uuid === selectedMarkPaper.subjectUuid
              ? { ...mark, marks: obtained, is_absent: false }
              : mark,
          ),
        };
      }));
      setDraft({});
      toast.success("Marks saved as draft");
    } catch (error) {
      toast.error(error?.response?.data?.detail ?? "Unable to save marks");
    }
  };

  const publishMarks = async () => {
    if (!selectedMarkPaper || !markRows.length) return;
    try {
      await publishExamMarks({
        examUuid: selectedMarkPaper.examUuid,
        classUuid: selectedMarkPaper.classUuid,
        sectionUuid: selectedMarkPaper.sectionUuid,
        studentUuids: markRows.map((row) => row.student_uuid),
      });
      setMarkRows((rows) => rows.map((row) => ({ ...row, is_published: true })));
      toast.success("Marks published to students");
    } catch (error) {
      toast.error(error?.response?.data?.detail ?? "Unable to publish marks");
    }
  };

  const triggerImport = () => {
    if (!selectedMarkPaper) {
      return toast.error("Select an exam before importing marks");
    }
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file again later.
    e.target.value = "";
    if (!file || !selectedMarkPaper) return;

    setImporting(true);
    try {
      await importTeacherExamMarks(file, {
        examUuid: selectedMarkPaper.examUuid,
        classUuid: selectedMarkPaper.classUuid,
        sectionUuid: selectedMarkPaper.sectionUuid,
      });
      await refreshMarkRows();
      setDraft({});
      toast.success("Marks imported successfully");
    } catch (error) {
      toast.error(error?.response?.data?.detail ?? "Unable to import marks");
    } finally {
      setImporting(false);
    }
  };

  // ---------------- Question row helpers (create-test dialog) ----------------

  const addQuestionRow = () => {
    setTestForm((form) => ({
      ...form,
      questions: [...form.questions, emptyQuestionRow()],
    }));
  };

  const updateQuestionRow = (key, patch) => {
    setTestForm((form) => ({
      ...form,
      questions: form.questions.map((q) =>
        q._key === key ? { ...q, ...patch } : q,
      ),
    }));
  };

  const removeQuestionRow = (key) => {
    setTestForm((form) => ({
      ...form,
      questions: form.questions.filter((q) => q._key !== key),
    }));
  };

  const createTest = () => {
    if (!testForm.name.trim()) return toast.error("Test name required");
    examsApi.add({
      name: `${testForm.category} — ${testForm.name} (${testForm.subject})`,
      class: testForm.klass,
      from: testForm.from || new Date().toISOString().slice(0, 10),
      to: testForm.to || testForm.from || new Date().toISOString().slice(0, 10),
      subjects: 1,
      status: "Scheduled",
    });
    if (testForm.instructions.trim()) {
      questionsApi.add({
        subject: testForm.subject,
        chapter: testForm.name,
        question: testForm.instructions,
        answer: "",
        diff: "Medium",
        marks: testForm.maxMarks,
        className: testForm.klass,
        examType: testForm.category,
      });
    }
    setOpenTest(false);
    toast.success(`Internal test assigned to ${testForm.klass}`);
    setTestForm({ ...emptyTest, klass: testForm.klass, subject: testForm.subject });
  };

  const createTestFromBackend = async () => {
    const category = categoryRecords.find(
      (item) => item.category_name === testForm.category,
    );
    const scope = teacherScopes.find(
      (item) =>
        `${item.class_name} - ${item.section_name}` === testForm.klass &&
        item.subject_name === testForm.subject,
    );
    if (!category || !scope?.subject_uuid) {
      return toast.error("Select an assigned class, subject, and category");
    }

    const incompleteQuestion = testForm.questions.find((q) => !q.question.trim());
    if (incompleteQuestion) {
      return toast.error("Fill in every question row or remove the empty one");
    }

    try {
      const fromDate = testForm.from || new Date().toISOString().slice(0, 10);
      const created = await createTeacherInternalTest({
        category_uuid: category.category_uuid,
        class_uuid: scope.class_uuid,
        section_uuid: scope.section_uuid,
        subject_uuid: scope.subject_uuid,
        from_date: fromDate,
        to_date: testForm.to || fromDate,
        max_marks: testForm.maxMarks,
        instructions: testForm.instructions.trim() || null,
        paper_time: testForm.paperTime || null,
        duration_minutes: testForm.durationMinutes,
        questions: testForm.questions.map(({ _key, ...q }) => ({
          class_uuid: scope.class_uuid,
          subject_uuid: scope.subject_uuid,
          category_uuid: category.category_uuid,
          chapter_topic: q.chapter_topic.trim(),
          difficulty: q.difficulty,
          marks: q.marks,
          question: q.question.trim(),
          answer_key: q.answer_key.trim(),
          is_active: true,
        })),
      });
      setTeacherExams((items) => [{
        id: created.paper_uuid,
        examUuid: created.exam_uuid,
        name: created.test_name,
        category: created.category_name,
        class: scope.class_name,
        from: created.from_date,
        to: created.to_date,
        subjects: 1,
        status: "Scheduled",
        subject: testForm.subject,
      }, ...items]);
      setInternalTests((items) => [{
        ...created,
        class_name: scope.class_name,
        section_name: scope.section_name,
        subject_name: testForm.subject,
      }, ...items]);
      setTeacherExamsLoaded(true);
      setOpenTest(false);
      toast.success("Internal test created and assigned");
      setTestForm({ ...emptyTest, klass: testForm.klass, subject: testForm.subject });
    } catch (error) {
      toast.error(error?.response?.data?.detail ?? "Unable to create internal test");
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    visibleExams.forEach((e) => {
      const cat =
        e.category ?? CATEGORIES.find((c) => e.name.toLowerCase().includes(c.toLowerCase())) ??
        "Other";
      (map[cat] ||= []).push(e);
    });
    return map;
  }, [visibleExams]);

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
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create internal test</DialogTitle>
                {/* <DialogDescription>
                  Assigned to students of your class only.
                </DialogDescription> */}
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={testForm.category}
                      onValueChange={(v) => setTestForm({ ...testForm, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {examCategories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Subject</Label>
                    <Select
                      value={testForm.subject}
                      onValueChange={(v) => setTestForm({ ...testForm, subject: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scopedSubjects.map((s) => (
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
                      value={testForm.klass}
                      onValueChange={(v) => {
                        const subjectName = teacherScopes.find(
                          (scope) => `${scope.class_name} - ${scope.section_name}` === v,
                        )?.subject_name ?? "";
                        setTestForm({ ...testForm, klass: v, subject: subjectName });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scopedClasses.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                  <div className="space-y-1">
                    <Label className="text-xs">Paper time</Label>
                    <Input
                      type="time"
                      value={testForm.paperTime}
                      onChange={(e) => setTestForm({ ...testForm, paperTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={testForm.durationMinutes}
                      onChange={(e) =>
                        setTestForm({ ...testForm, durationMinutes: Number(e.target.value) })
                      }
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Questions (optional)</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addQuestionRow}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add question
                    </Button>
                  </div>

                  {testForm.questions.map((q, idx) => (
                    <div
                      key={q._key}
                      className="rounded-md border border-border/60 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Question {idx + 1}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => removeQuestionRow(q._key)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Chapter / topic</Label>
                          <Input
                            value={q.chapter_topic}
                            onChange={(e) =>
                              updateQuestionRow(q._key, { chapter_topic: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Difficulty</Label>
                          <Select
                            value={q.difficulty}
                            onValueChange={(v) => updateQuestionRow(q._key, { difficulty: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTIES.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Marks</Label>
                          <Input
                            type="number"
                            min={0}
                            value={q.marks}
                            onChange={(e) =>
                              updateQuestionRow(q._key, { marks: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Question</Label>
                        <Textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) =>
                            updateQuestionRow(q._key, { question: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Answer key</Label>
                        <Textarea
                          rows={2}
                          value={q.answer_key}
                          onChange={(e) =>
                            updateQuestionRow(q._key, { answer_key: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createTestFromBackend}>Create & assign</Button>
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
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="schedule">Categories & Schedule</TabsTrigger>
          <TabsTrigger value="tests">My Internal Tests</TabsTrigger>
          <TabsTrigger value="marks">Marks Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Exam Categories</CardTitle>
              <CardDescription>
                Categories are created by the administrator and available when
                creating an internal test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {examCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="px-3 py-1">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                My Internal Tests
              </CardTitle>
              <CardDescription>
                Internal tests created by {teacherName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalTests.map((test) => {
                    const q = {
                      className: test.section_name
                        ? `${test.class_name} - ${test.section_name}`
                        : test.class_name,
                      examType: test.category_name,
                      marks: test.max_marks,
                    };
                    return (
                    <TableRow key={test.paper_uuid}>
                      <TableCell className="font-medium">
                        {test.test_name}
                        <div className="text-[11px] text-muted-foreground max-w-[420px] truncate">
                          {test.instructions ?? "No instructions"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{test.subject_name}</TableCell>
                      <TableCell className="text-xs">{q.className ?? "—"}</TableCell>
                      <TableCell className="text-xs">{q.examType ?? "—"}</TableCell>
                      <TableCell className="text-xs tabular-nums">{q.marks}</TableCell>
                    </TableRow>
                    );
                  })}
                  {internalTests.length === 0 && (
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
              <Select value={selectedMarkPaper?.subject ?? ""} disabled>
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMarkPaper?.subject && (
                    <SelectItem value={selectedMarkPaper.subject}>
                      {selectedMarkPaper.subject}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Hidden file input driving the Excel import button below */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={triggerImport}
                disabled={!selectedMarkPaper || importing}
              >
                <Upload className="h-4 w-4" />
                {importing ? "Importing…" : "Import marks"}
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveMarksDraft}
                >
                  <Save className="h-4 w-4" />
                  Save draft
                </Button>
                <Button
                  size="sm"
                  onClick={publishMarks}
                >
                  <Send className="h-4 w-4" />
                  Publish marks
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
                          value={draft[m.id] ?? m.obtained ?? ""}
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