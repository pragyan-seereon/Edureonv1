import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Download, FileText, Paperclip, Users } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Progress } from "../../../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { getAssignmentDetail, getAssignmentSubmissions, downloadAssignmentSubmission } from "../../../api/assignment";

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const getName = (file) => file?.file_name || file?.filename || file?.name || file?.original_name || "Submitted file";
const getUrl = (file) => typeof file === "string" ? file : file?.file_url || file?.url || file?.download_url || file?.path;

function normaliseSubmission(submission) {
  const student = submission.student || submission.student_details || {};
  const files = asArray(submission.attachments || submission.files || submission.submission_files || submission.documents)
    .map((file) => typeof file === "string" ? { name: file, url: file } : { ...file, name: getName(file), url: getUrl(file) });
  return {
    id: submission.submission_uuid || submission.uuid || submission.id,
    studentName: submission.student_name || student.full_name || student.name || "Student",
    admissionNo: submission.admission_no || student.admission_no || student.student_no || "—",
    submittedAt: submission.submitted_at || submission.submission_date || submission.created_at,
    status: submission.status || "Submitted",
    files,
  };
}

export default function AssignmentsDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [detail, result] = await Promise.all([getAssignmentDetail(id), getAssignmentSubmissions(id)]);
        if (!active) return;
        setAssignment(detail);
        setSubmissions(asArray(result?.data || result?.submissions || result).map(normaliseSubmission));
      } catch (error) {
        if (active) toast.error(error?.response?.data?.detail || "Failed to load assignment submissions");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? submissions.filter((item) => `${item.studentName} ${item.admissionNo}`.toLowerCase().includes(query)) : submissions;
  }, [search, submissions]);
  const totalStudents = assignment?.total_students || assignment?.assigned_students_count || submissions.length;
  const completion = totalStudents ? Math.round((submissions.length / totalStudents) * 100) : 0;

  async function handleDownload(submission, file, fileIndex) {
    if (file?.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
    if (!submission.id) return toast.error("This file is not available for download.");
    const key = `${submission.id}-${fileIndex}`;
    setDownloading(key);
    try {
      const blob = await downloadAssignmentSubmission(id, submission.id, file?.uuid || file?.file_uuid || fileIndex);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file?.name || "assignment-submission";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to download this submission");
    } finally { setDownloading(""); }
  }

  return <PageContainer>
    <PageHeader
      eyebrow={<Link to="/assignments" className="inline-flex items-center hover:text-primary"><ChevronLeft className="h-3.5 w-3.5" /> Assignments</Link>}
      title={assignment?.title || "Assignment submissions"}
      description={`${assignment?.subject_name || assignment?.subject || "Assignment"} · Class ${assignment?.class_name || "—"}${assignment?.section_name ? `-${assignment.section_name}` : ""} · Due ${assignment?.due_date || assignment?.assignment_date || "—"}`}
    />
    <div className="grid gap-4 md:grid-cols-3 mb-5">
      <Card className="border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Submitted</div><div className="mt-1 text-2xl font-semibold">{submissions.length}</div></CardContent></Card>
      <Card className="border-border/60"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Assigned students</div><div className="mt-1 text-2xl font-semibold">{totalStudents || "—"}</div></CardContent></Card>
      <Card className="border-border/60"><CardContent className="p-4"><div className="flex justify-between text-xs text-muted-foreground"><span>Submission rate</span><span>{completion}%</span></div><Progress value={completion} className="mt-3 h-2" /></CardContent></Card>
    </div>
    <Card className="border-border/60">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Students who submitted</CardTitle><CardDescription>Only students with an uploaded assignment are listed here.</CardDescription></div><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student" className="sm:w-56" /></CardHeader>
      <CardContent className="p-0 overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Admission no.</TableHead><TableHead>Submitted on</TableHead><TableHead>File</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Download</TableHead></TableRow></TableHeader><TableBody>
        {loading && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading submissions…</TableCell></TableRow>}
        {!loading && rows.flatMap((submission) => (submission.files.length ? submission.files : [null]).map((file, fileIndex) => <TableRow key={`${submission.id || submission.studentName}-${fileIndex}`}><TableCell className="font-medium">{fileIndex === 0 ? submission.studentName : ""}</TableCell><TableCell className="font-mono text-xs">{fileIndex === 0 ? submission.admissionNo : ""}</TableCell><TableCell className="text-xs">{fileIndex === 0 && submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "—"}</TableCell><TableCell><span className="flex max-w-64 items-center gap-1.5 truncate text-xs"><Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />{file?.name || "No file attached"}</span></TableCell><TableCell>{fileIndex === 0 && <Badge variant="secondary">{submission.status}</Badge>}</TableCell><TableCell className="text-right"><Button size="sm" variant="outline" disabled={!file || downloading === `${submission.id}-${fileIndex}`} onClick={() => handleDownload(submission, file, fileIndex)}><Download className="h-3.5 w-3.5" />{downloading === `${submission.id}-${fileIndex}` ? "Downloading…" : "Download"}</Button></TableCell></TableRow>))}
        {!loading && rows.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground"><FileText className="mx-auto mb-2 h-5 w-5 opacity-50" />No submitted assignments yet.</TableCell></TableRow>}
      </TableBody></Table></CardContent>
    </Card>
  </PageContainer>;
}
