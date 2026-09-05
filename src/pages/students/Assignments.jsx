// import { useEffect, useMemo, useState } from "react";
// import { CheckCircle2, ClipboardList, Download, Loader2, MessageSquare, Upload } from "lucide-react";
// import { toast } from "sonner";
// import studentModel from "../../api/studentModel";
// import { PageContainer, PageHeader } from "../../components/page-shell";
// import { Badge } from "../../components/ui/badge";
// import { Button } from "../../components/ui/button";
// import { Card, CardContent } from "../../components/ui/card";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
// import { Input } from "../../components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
// import { Textarea } from "../../components/ui/textarea";

// const getError = (error) => error?.response?.data?.detail?.message || error?.response?.data?.detail || error?.message || "Request failed.";

// export default function Assignments() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(null);
//   const [detail, setDetail] = useState(null);
//   const [inquiries, setInquiries] = useState([]);
//   const [file, setFile] = useState(null);
//   const [comment, setComment] = useState("");
//   const [question, setQuestion] = useState("");
//   const [saving, setSaving] = useState(false);

//   const loadAssignments = async () => {
//     setLoading(true);
//     try {
//       setRows((await studentModel.getMyAssignments())?.data || []);
//     } catch (error) {
//       toast.error(getError(error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadAssignments(); }, []);

//   const groups = useMemo(() => ({
//     pending: rows.filter((row) => row.submission_status === "PENDING"),
//     submitted: rows.filter((row) => ["SUBMITTED", "LATE", "RESUBMITTED"].includes(row.submission_status)),
//     graded: rows.filter((row) => row.submission_status === "GRADED"),
//   }), [rows]);

//   const overdue = groups.pending.filter((row) => row.due_date && row.due_date < new Date().toISOString().slice(0, 10));

//   const openAssignment = async (assignment) => {
//     setOpen(assignment);
//     setDetail(null);
//     setFile(null);
//     setComment("");
//     setQuestion("");
//     try {
//       const [assignmentResult, inquiryResult] = await Promise.all([
//         studentModel.getMyAssignmentDetail(assignment.assignment_uuid),
//         studentModel.getAssignmentInquiries(assignment.assignment_uuid),
//       ]);
//       setDetail(assignmentResult?.data || null);
//       setInquiries(inquiryResult?.data || []);
//     } catch (error) {
//       toast.error(getError(error));
//     }
//   };

//   const submitAssignment = async () => {
//     if (!file) return toast.error("Choose an answer PDF.");
//     if (file.type !== "application/pdf") return toast.error("Only PDF files are allowed.");
//     setSaving(true);
//     try {
//       await studentModel.submitAssignment(open.assignment_uuid, { file, comment });
//       toast.success("Assignment submitted successfully.");
//       await loadAssignments();
//       await openAssignment(open);
//     } catch (error) {
//       toast.error(getError(error));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const sendInquiry = async () => {
//     if (!question.trim()) return toast.error("Enter your question.");
//     setSaving(true);
//     try {
//       await studentModel.createAssignmentInquiry(open.assignment_uuid, question);
//       setInquiries((await studentModel.getAssignmentInquiries(open.assignment_uuid))?.data || []);
//       setQuestion("");
//       toast.success("Inquiry sent.");
//     } catch (error) {
//       toast.error(getError(error));
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <PageContainer>
//       <PageHeader eyebrow="Student Portal" title="My Assignments" description={`${rows.length} assignments assigned to you.`} />

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
//         <Card className="border-warning/40 bg-warning/5"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-md bg-warning/20 text-warning flex items-center justify-center"><ClipboardList className="h-5 w-5" /></div><div className="flex-1"><div className="text-xs text-muted-foreground">Pending Assignments</div><div className="text-2xl font-semibold">{groups.pending.length}</div></div><Badge variant="outline">Action Required</Badge></CardContent></Card>
//         <Card className="border-destructive/40 bg-destructive/5"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-md bg-destructive/20 text-destructive flex items-center justify-center"><ClipboardList className="h-5 w-5" /></div><div className="flex-1"><div className="text-xs text-muted-foreground">Overdue / Late</div><div className="text-2xl font-semibold text-destructive">{overdue.length}</div></div><Badge variant="destructive">Submit Now</Badge></CardContent></Card>
//         <Card className="border-success/40 bg-success/5"><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-md bg-success/20 text-success flex items-center justify-center"><CheckCircle2 className="h-5 w-5" /></div><div className="flex-1"><div className="text-xs text-muted-foreground">Submitted</div><div className="text-2xl font-semibold text-success">{groups.submitted.length + groups.graded.length}</div></div><Badge variant="outline">On Track</Badge></CardContent></Card>
//       </div>

//       {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin" /></div> : (
//         <Tabs defaultValue="pending">
//           <TabsList><TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger><TabsTrigger value="submitted">Submitted ({groups.submitted.length})</TabsTrigger><TabsTrigger value="graded">Graded ({groups.graded.length})</TabsTrigger></TabsList>
//           {Object.entries(groups).map(([key, assignments]) => <TabsContent key={key} value={key}><Card><CardContent className="p-0 divide-y">{assignments.map((assignment) => <div key={assignment.assignment_uuid} className="p-3 flex items-start gap-3"><div className="h-9 w-9 rounded-md flex items-center justify-center bg-primary/10 text-primary"><ClipboardList className="h-4 w-4" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium">{assignment.title}</span><Badge variant="outline" className="text-[10px]">{assignment.subject_name}</Badge><Badge variant="secondary" className="text-[10px]">Due {assignment.due_date}</Badge>{assignment.submission_status === "GRADED" && <Badge className="text-[10px]">{assignment.obtained_marks}/{assignment.max_marks}</Badge>}</div><div className="text-[11px] text-muted-foreground mt-1">Teacher: {assignment.teacher_name || "-"} · Max marks: {assignment.max_marks}</div>{assignment.feedback && <div className="text-[11px] mt-2 p-2 bg-muted/40 rounded flex gap-1"><MessageSquare className="h-3 w-3 mt-0.5" />{assignment.feedback}</div>}<Button size="sm" className="mt-2" variant={assignment.submission_status === "PENDING" ? "default" : "outline"} onClick={() => openAssignment(assignment)}>{assignment.submission_status === "PENDING" && <Upload className="h-3.5 w-3.5" />}Open</Button></div></div>)}{!assignments.length && <div className="text-sm text-muted-foreground text-center p-6">Nothing here.</div>}</CardContent></Card></TabsContent>)}
//         </Tabs>
//       )}

//       <Dialog open={!!open} onOpenChange={(value) => !value && setOpen(null)}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{open?.title}</DialogTitle><DialogDescription>{open?.subject_name} · Max {open?.max_marks} marks · Due {open?.due_date}</DialogDescription></DialogHeader>{!detail ? <Loader2 className="animate-spin mx-auto my-8" /> : <div className="space-y-5"><section><div className="text-sm font-medium">Instructions</div><p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.instructions || "No instructions."}</p></section>
//         {!!detail.attachments?.length && <section><div className="text-sm font-medium mb-2">Attachments</div><div className="flex gap-2 flex-wrap">{detail.attachments.map((item) => <Button key={item.attachment_uuid} size="sm" variant="outline" asChild><a href={item.file_url || item.resource_url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />{item.original_file_name || item.attachment_type}</a></Button>)}</div></section>}
//         {detail.my_submission?.status === "PENDING" && <section className="space-y-2"><div className="text-sm font-medium">Upload answer PDF</div><Input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /><Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Notes (optional)" /><Button onClick={submitAssignment} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Upload className="h-4 w-4" />}Submit</Button></section>}
//         {detail.my_submission?.status === "GRADED" && <section className="border rounded-md p-4"><div className="font-semibold">Marks: {detail.my_submission.obtained_marks}/{detail.max_marks}</div><p className="text-sm text-muted-foreground mt-1">{detail.my_submission.feedback || "No feedback."}</p></section>}
//         <section className="space-y-2"><div className="text-sm font-medium flex gap-2"><MessageSquare className="h-4 w-4" />Inquiry</div><Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask your teacher" /><Button variant="outline" onClick={sendInquiry} disabled={saving}>Send inquiry</Button>{inquiries.map((item) => <div key={item.inquiry_uuid} className="bg-muted/40 rounded p-3 text-sm"><div><b>You:</b> {item.question}</div><div className="mt-1"><b>Teacher:</b> {item.reply || "Waiting for reply"}</div></div>)}</section></div>}<DialogFooter><Button variant="outline" onClick={() => setOpen(null)}>Close</Button></DialogFooter></DialogContent></Dialog>
//     </PageContainer>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import studentModel from "../../api/studentModel";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

const getError = (error) =>
  error?.response?.data?.detail?.message ||
  error?.response?.data?.detail ||
  error?.message ||
  "Request failed.";

const STATUS_META = {
  PENDING: { accent: "bg-warning", ring: "ring-warning/20", label: "Pending" },
  SUBMITTED: { accent: "bg-primary", ring: "ring-primary/20", label: "Submitted" },
  LATE: { accent: "bg-destructive", ring: "ring-destructive/20", label: "Late" },
  RESUBMITTED: { accent: "bg-primary", ring: "ring-primary/20", label: "Resubmitted" },
  GRADED: { accent: "bg-success", ring: "ring-success/20", label: "Graded" },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function DueChip({ dateStr, isOverdue }) {
  if (!dateStr) return null;
  const diff = daysUntil(dateStr);
  let text = `Due ${dateStr}`;
  let tone = "text-muted-foreground bg-muted";
  if (isOverdue) {
    text = diff === 0 ? "Due today" : `${Math.abs(diff)}d overdue`;
    tone = "text-destructive bg-destructive/10";
  } else if (diff === 0) {
    text = "Due today";
    tone = "text-warning bg-warning/10";
  } else if (diff === 1) {
    text = "Due tomorrow";
    tone = "text-warning bg-warning/10";
  } else if (diff > 1 && diff <= 3) {
    text = `Due in ${diff}d`;
    tone = "text-warning bg-warning/10";
  }
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tone}`}>{text}</span>;
}

function Initials({ name }) {
  const value = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
      {value || "?"}
    </div>
  );
}

export default function Assignments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const [question, setQuestion] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      setRows((await studentModel.getMyAssignments())?.data || []);
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const groups = useMemo(
    () => ({
      pending: rows.filter((row) => row.submission_status === "PENDING"),
      submitted: rows.filter((row) => ["SUBMITTED", "LATE", "RESUBMITTED"].includes(row.submission_status)),
      graded: rows.filter((row) => row.submission_status === "GRADED"),
    }),
    [rows],
  );

  const overdue = groups.pending.filter(
    (row) => row.due_date && row.due_date < new Date().toISOString().slice(0, 10),
  );

  const completed = groups.submitted.length + groups.graded.length;
  const completionPct = rows.length ? Math.round((completed / rows.length) * 100) : 0;

  const openAssignment = async (assignment) => {
    setOpen(assignment);
    setDetail(null);
    setFile(null);
    setComment("");
    setQuestion("");
    try {
      const [assignmentResult, inquiryResult] = await Promise.all([
        studentModel.getMyAssignmentDetail(assignment.assignment_uuid),
        studentModel.getAssignmentInquiries(assignment.assignment_uuid),
      ]);
      setDetail(assignmentResult?.data || null);
      setInquiries(inquiryResult?.data || []);
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const submitAssignment = async () => {
    if (!file) return toast.error("Choose an answer PDF.");
    if (file.type !== "application/pdf") return toast.error("Only PDF files are allowed.");
    setSaving(true);
    try {
      await studentModel.submitAssignment(open.assignment_uuid, { file, comment });
      toast.success("Assignment submitted successfully.");
      await loadAssignments();
      await openAssignment(open);
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setSaving(false);
    }
  };

  const sendInquiry = async () => {
    if (!question.trim()) return toast.error("Enter your question.");
    setSaving(true);
    try {
      await studentModel.createAssignmentInquiry(open.assignment_uuid, question);
      setInquiries((await studentModel.getAssignmentInquiries(open.assignment_uuid))?.data || []);
      setQuestion("");
      toast.success("Inquiry sent.");
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="My Assignments"
        description={`${rows.length} assignments assigned to you.`}
      />

      {/* Overview strip */}
      <Card className="mb-5 border-border/60">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <div className="flex items-center gap-8 flex-1">
              <div>
                <div className="text-2xl font-semibold tabular-nums">{groups.pending.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Pending</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-2xl font-semibold tabular-nums text-destructive">{overdue.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Overdue</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-2xl font-semibold tabular-nums text-success">{completed}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Completed</div>
              </div>
            </div>
            <div className="flex-1 sm:max-w-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Overall progress</span>
                <span className="font-medium text-foreground">{completionPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-[width] duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({groups.submitted.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({groups.graded.length})</TabsTrigger>
          </TabsList>

          {Object.entries(groups).map(([key, assignments]) => (
            <TabsContent key={key} value={key} className="mt-4">
              {!assignments.length ? (
                <div className="text-center py-16 border border-dashed rounded-xl">
                  <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {key === "pending"
                      ? "Nothing pending. You're caught up."
                      : key === "submitted"
                      ? "Nothing waiting on a grade right now."
                      : "No graded assignments yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {assignments.map((assignment) => {
                    const isOverdue =
                      assignment.submission_status === "PENDING" &&
                      assignment.due_date &&
                      assignment.due_date < new Date().toISOString().slice(0, 10);
                    const meta = STATUS_META[isOverdue ? "LATE" : assignment.submission_status] || STATUS_META.PENDING;

                    return (
                      <Card
                        key={assignment.assignment_uuid}
                        className="relative overflow-hidden border-border/60 hover:border-border transition-colors"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.accent}`} />
                        <CardContent className="p-4 pl-5">
                          <div className="flex items-start gap-3">
                            <Initials name={assignment.teacher_name} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium text-sm leading-snug truncate">{assignment.title}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {assignment.teacher_name || "Unassigned teacher"}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={assignment.submission_status === "PENDING" ? "default" : "outline"}
                                  onClick={() => openAssignment(assignment)}
                                  className="shrink-0"
                                >
                                  {assignment.submission_status === "PENDING" && <Upload className="h-3.5 w-3.5" />}
                                  Open
                                </Button>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                <Badge variant="outline" className="text-[11px] font-normal">
                                  {assignment.subject_name}
                                </Badge>
                                <DueChip dateStr={assignment.due_date} isOverdue={isOverdue} />
                                {assignment.submission_status === "GRADED" && (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                                    {assignment.obtained_marks}/{assignment.max_marks} marks
                                  </span>
                                )}
                              </div>

                              {assignment.feedback && (
                                <div className="text-[12px] mt-3 p-2.5 bg-muted/40 rounded-lg flex gap-1.5 text-muted-foreground">
                                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                  <span>{assignment.feedback}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={!!open} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
            <DialogDescription>
              {open?.subject_name} · Max {open?.max_marks} marks · Due {open?.due_date}
            </DialogDescription>
          </DialogHeader>

          {!detail ? (
            <Loader2 className="animate-spin mx-auto my-8" />
          ) : (
            <div className="space-y-6">
              {detail.my_submission?.status !== "GRADED" && (
                <>
                  <section>
                    <div className="text-sm font-medium mb-1.5">Instructions</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {detail.instructions || "No instructions provided."}
                    </p>
                  </section>

                  {!!detail.attachments?.length && (
                    <section>
                      <div className="text-sm font-medium mb-2">Attachments</div>
                      <div className="grid gap-2">
                        {detail.attachments.map((item) => (
                          <a
                            key={item.attachment_uuid}
                            href={item.file_url || item.resource_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{item.original_file_name || item.attachment_type}</span>
                            <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {detail.my_submission?.status === "PENDING" && (
                    <section className="space-y-3 rounded-xl border border-dashed p-4">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm font-medium">Upload your answer</div>
                      </div>
                      <Input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                      />
                      <Textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Add a note for your teacher (optional)"
                      />
                      <Button onClick={submitAssignment} disabled={saving} className="w-full sm:w-auto">
                        {saving ? <Loader2 className="animate-spin" /> : <Upload className="h-4 w-4" />}
                        Submit assignment
                      </Button>
                    </section>
                  )}
                </>
              )}

              {detail.my_submission?.status === "GRADED" && (
                <section className="space-y-3">
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    Ask a question
                  </div>
                  <Textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask your teacher about this assignment"
                  />
                  <Button variant="outline" onClick={sendInquiry} disabled={saving}>
                    Send
                  </Button>
                  {inquiries.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {inquiries.map((item) => (
                        <div key={item.inquiry_uuid} className="rounded-lg bg-muted/40 p-3 text-sm space-y-1.5">
                          <div>
                            <span className="font-medium">You </span>
                            <span className="text-muted-foreground">{item.question}</span>
                          </div>
                          <div>
                            <span className="font-medium">Teacher </span>
                            <span className="text-muted-foreground">
                              {item.reply || "Waiting for a reply"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}