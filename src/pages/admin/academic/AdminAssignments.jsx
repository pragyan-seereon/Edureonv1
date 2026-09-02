/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Tabs,
  // eslint-disable-next-line no-unused-vars
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line no-unused-vars
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Checkbox } from "../../../components/ui/checkbox";
import { Progress } from "../../../components/ui/progress";
import {
  ClipboardList,
  Plus,
  Paperclip,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  Star,
  Download,
  Send,
  Archive,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { assignmentsApi, useSubmissions } from "../../../lib/store";
import {
  getSubjects,
  getSections,
  getClasses, 
  getStudentsBySection,
  saveDraftAssignment,
  publishAssignment,
  getAssignments,
  getAssignmentDetail,
  updateAssignment,
  deleteAssignment,
} from "../../../api/assignment";
import useSessionStore from "../../../store/sessionStore";
import {
  PaginationBar,
  RowsPerPageSelect,
} from "../../../components/pagination-controls";

const ASSIGNMENT_TYPES = ["Homework", "Project", "Group Assignment", "Classwork"];
const ASSIGN_TO_OPTIONS = ["Entire Class", "Selected Students", "Custom Group"];

const ASSIGN_TO_MAP = {
  "Entire Class": "ENTIRE_CLASS",
  "Selected Students": "SELECTED_STUDENTS",
  "Custom Group": "CUSTOM_GROUP",
};

// Reverse maps, used when loading an existing assignment into the edit form
const TYPE_REVERSE_MAP = ASSIGNMENT_TYPES.reduce((acc, t) => {
  acc[t.toUpperCase().replace(/\s+/g, "_")] = t;
  return acc;
}, {});

const ASSIGN_TO_REVERSE_MAP = Object.fromEntries(
  Object.entries(ASSIGN_TO_MAP).map(([k, v]) => [v, k]),
);

const emptyForm = {
  title: "",
  subject: "",
  classNum: "",
  section: "",
  teacher: "",
  type: "Homework",
  assignTo: "Entire Class",
  groupName: "",
  studentIds: new Set(),
  instructions: "",
  due: "",
  endDate: "",
  duration: "",
  maxMarks: 20,
  pdfFile: null,
  videoFile: null,
  resourceLink: "",
  draftUuid: null,
  existingAttachments: [],
};

// Maps a raw API assignment object to the shape this component's UI expects
const mapAssignment = (a) => ({
  id: a.assignment_no,
  uuid: a.assignment_uuid,
  title: a.title,
  subject: a.subject_name,
  klass: `${a.class_name}-${a.section_name}`,
  teacher: a.teacher_name,
  due: a.due_date,
  maxMarks: a.max_marks,
  status: a.status
    ? a.status.charAt(0) + a.status.slice(1).toLowerCase()
    : "Draft",
  submitted: a.submitted_count ?? 0,
  totalStudents: a.total_students || 1,
});

export default function AdminAssignments() {
  const allSubs = useSubmissions();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [statusF, setStatusF] = useState("All");
  const [subjF, setSubjF] = useState("All");
  const [classF, setClassF] = useState("All");
  const [teacherF, setTeacherF] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState(emptyForm);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Edit / delete state
  const [editingUuid, setEditingUuid] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Real assignment list state (replaces mock useAssignments())
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // eslint-disable-next-line no-unused-vars
  const [total, setTotal] = useState(0);

  // Derived lists from fetched data (replaces old hardcoded constants)
  const SUBJECTS = useMemo(
    () => subjects.map((s) => s.subject_name),
    [subjects],
  );

  const TEACHERS = useMemo(() => {
    const names = new Set();
    subjects.forEach((s) => (s.faculty || []).forEach((f) => names.add(f.name)));
    return [...names];
  }, [subjects]);

  const CLASSES = useMemo(
    () => classes.map((c) => c.class_name),
    [classes],
  );
    const existingPdf = useMemo(
    () => (form.existingAttachments || []).find((att) => att.attachment_type === "PDF"),
    [form.existingAttachments],
  );
  const existingVideo = useMemo(
    () => (form.existingAttachments || []).find((att) => att.attachment_type === "VIDEO"),
    [form.existingAttachments],
  );

  const fetchAssignments = async () => {
    setItemsLoading(true);
    try {
      const res = await getAssignments({ page, pageSize });
      setItems((res.data || []).map(mapAssignment));
      setTotal(res.total || 0);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load assignments");
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, pageSize]);

  const filtered = useMemo(
    () =>
      items.filter(
        (a) =>
          (statusF === "All" || a.status === statusF) &&
          (subjF === "All" || a.subject === subjF) &&
          (classF === "All" || a.klass === classF) &&
          (teacherF === "All" || a.teacher === teacherF),
      ),
    [items, statusF, subjF, classF, teacherF],
  );

  useEffect(() => {
    if (!form.classNum || !form.section) {
      setStudents([]);
      return;
    }
    if (form.assignTo !== "Selected Students" && form.assignTo !== "Custom Group") {
      return;
    }

    const sessionYear = useSessionStore.getState().sessionYear; // key name to confirm

    const load = async () => {
      setStudentsLoading(true);
      try {
        const res = await getStudentsBySection(form.classNum, form.section, sessionYear);
        setStudents(res || []);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load students");
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    load();
  }, [form.classNum, form.section, form.assignTo]);

  const toggleStudent = (uuid) =>
    setForm((f) => {
      const n = new Set(f.studentIds);
      n.has(uuid) ? n.delete(uuid) : n.add(uuid);
      return { ...f, studentIds: n };
    });

 useEffect(() => {
    if (!open) return;
    if (subjects.length && sections.length && classes.length) return;

    const load = async () => {
      try {
        const [subjectRes, sectionRes, classRes] = await Promise.all([
          getSubjects(),
          getSections(),
          getClasses(),
        ]);

        setSubjects(subjectRes);
        setSections(sectionRes);
        setClasses(classRes || []);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load classes");
      }
    };

    load();
  }, [open]);

  useEffect(() => {
    const subject = subjects.find(
      (s) => s.subject_uuid === form.subject
    );

    if (!subject) {
      setTeachers([]);
      return;
    }

    setTeachers(subject.faculty || []);

    // Only auto-pick the first faculty member for a brand-new assignment.
    // When editing, keep whatever teacher came back from getAssignmentDetail.
    if (!editingUuid) {
      setForm((prev) => ({
        ...prev,
        teacher:
          subject.faculty?.length > 0
            ? String(subject.faculty[0].employee_uuid)
            : "",
      }));
    }
  }, [form.subject, subjects]);

  useEffect(() => {
    const sec = sections.filter(
      (s) => s.class_uuid === form.classNum
    );

    setFilteredSections(sec);

    // Only auto-pick the first section for a brand-new assignment.
    // When editing, keep whatever section came back from getAssignmentDetail.
    if (!editingUuid) {
      setForm((prev) => ({
        ...prev,
        section: sec.length ? sec[0].section_uuid : "",
      }));
    }
  }, [form.classNum, sections]);

  const totalSel = selected.size;
  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected(
      filtered.length === selected.size
        ? new Set()
        : new Set(filtered.map((a) => a.id)),
    );

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subject_uuid", form.subject);
    fd.append("class_uuid", form.classNum);
    fd.append("section_uuid", form.section);
    fd.append("teacher_user_id", form.teacher);
    fd.append("assignment_type", form.type.toUpperCase().replace(/\s+/g, "_"));
    fd.append("assign_to", ASSIGN_TO_MAP[form.assignTo] || "ENTIRE_CLASS");

    if (form.assignTo === "Custom Group") fd.append("group_name", form.groupName);
    if (form.assignTo !== "Entire Class") {
      [...form.studentIds].forEach((uuid) => fd.append("selected_student_uuids", uuid));
    }

    fd.append("instructions", form.instructions);
    fd.append("assignment_date", form.due);
    fd.append("due_date", form.endDate);
    fd.append("duration_minutes", form.duration);
    fd.append("max_marks", form.maxMarks);

    if (form.pdfFile) fd.append("pdf_file", form.pdfFile);
    if (form.videoFile) fd.append("video_file", form.videoFile);
    if (form.resourceLink) fd.append("resource_url", form.resourceLink);

    return fd;
  };

 const validateAssignmentForm = () => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.subject) errors.subject = "Select a subject.";
    if (!form.classNum) errors.classNum = "Select a class.";
    if (!form.section) errors.section = "Select a section.";
    if (!form.due) errors.due = "Select the assignment date.";
    if (!form.endDate) errors.endDate = "Select the end date.";
    if (form.due && form.endDate && form.endDate < form.due) {
      errors.endDate = "End date cannot be before the assignment date.";
    }
  if (!form.due) errors.due = "Date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";
  if (form.due && form.endDate && new Date(form.endDate) < new Date(form.due)) {
    errors.endDate = "End date cannot be before the start date.";
  }
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

  // eslint-disable-next-line no-unused-vars
  const handleSaveDraft = async () => {
    if (!validateAssignmentForm()) return toast.error("Complete the required fields.");

    const fd = buildFormData();
    fd.append("status", "DRAFT");
    if (form.draftUuid) fd.append("draft_uuid", form.draftUuid);

    setSavingDraft(true);
    try {
      const res = await saveDraftAssignment(fd);
      if (res?.success) {
        toast.success(res.message || "Draft saved");
        setForm((f) => ({ ...f, draftUuid: res.data?.draft_uuid || f.draftUuid }));
        fetchAssignments();
      } else {
        toast.error(res?.message || "Failed to save draft");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!validateAssignmentForm()) return toast.error("Complete the required fields.");

    const fd = buildFormData();
    fd.append("status", "PUBLISHED");

    // if a draft was already saved, link it so the backend converts/finalizes
    // it instead of creating a duplicate assignment
    if (form.draftUuid) fd.append("draft_uuid", form.draftUuid);

    setPublishing(true);
    try {
      const res = await publishAssignment(fd);
      if (res?.success) {
        toast.success(res.message || "Published & notified");
        setOpen(false);
        setForm(emptyForm);
        fetchAssignments();
      } else {
        toast.error(res?.message || "Failed to publish");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  // Load an existing assignment into the form and open the dialog in "edit" mode
// Load an existing assignment into the form and open the dialog in "edit" mode
const handleEdit = async (a) => {
  try {
    const detail = await getAssignmentDetail(a.uuid);

    // Backend may return the selected students under different keys/shapes.
    // Normalize whatever we get into a flat array of student_uuid strings.
    const rawSelected =
      detail.selected_student_uuids ??
      detail.selected_students ??
      detail.assigned_student_uuids ??
      detail.student_uuids ??
      [];

    const normalizedSelectedIds = rawSelected.map((s) =>
      typeof s === "string" ? s : s.student_uuid ?? s.id ?? s.uuid
    );

    setForm({
      title: detail.title || "",
      subject: detail.subject_uuid || "",
      classNum: detail.class_uuid || "",
      section: detail.section_uuid || "",
      teacher: detail.teacher_user_id ? String(detail.teacher_user_id) : "",
      type: TYPE_REVERSE_MAP[detail.assignment_type] || "Homework",
      assignTo: ASSIGN_TO_REVERSE_MAP[detail.assign_to] || "Entire Class",
      groupName: detail.group_name || "",
      studentIds: new Set(normalizedSelectedIds),
      instructions: detail.instructions || "",
      due: detail.assignment_date || "",
      endDate: detail.due_date || "",
      duration: detail.duration_minutes ? String(detail.duration_minutes) : "",
      maxMarks: detail.max_marks ?? 20,
      pdfFile: null,
      videoFile: null,
      resourceLink: detail.resource_url || "",
      draftUuid: null,
      existingAttachments: detail.attachments || [],
    });
    setEditingUuid(detail.assignment_uuid);
    setOpen(true);
  } catch (err) {
    console.log(err);
    toast.error("Failed to load assignment for editing");
  }
};

 const buildUpdatePayload = () => ({
  title: form.title,
  subject_uuid: form.subject,
  class_uuid: form.classNum,
  section_uuid: form.section,
  teacher_user_id: form.teacher,
  assignment_type: form.type.toUpperCase().replace(/\s+/g, "_"),
  assign_to: ASSIGN_TO_MAP[form.assignTo] || "ENTIRE_CLASS",
  ...(form.assignTo === "Custom Group" ? { group_name: form.groupName } : {}),
  ...(form.assignTo !== "Entire Class"
    ? { selected_student_uuids: [...form.studentIds] }
    : {}),
  instructions: form.instructions,
  assignment_date: form.due,
  due_date: form.endDate,
  duration_minutes: form.duration,
  max_marks: form.maxMarks,
  ...(form.resourceLink ? { resource_url: form.resourceLink } : {}),
});

const handleUpdate = async () => {
  if (!validateAssignmentForm()) return toast.error("Complete the required fields.");

  setPublishing(true);
  try {
    const res = await updateAssignment(editingUuid, buildUpdatePayload());
    if (res?.success) {
      toast.success(res.message || "Assignment updated");
      setOpen(false);
      setForm(emptyForm);
      setEditingUuid(null);
      fetchAssignments();
    } else {
      toast.error(res?.message || "Failed to update assignment");
    }
  } catch (err) {
    console.log(err);
    toast.error(err?.response?.data?.message || "Failed to update assignment");
  } finally {
    setPublishing(false);
  }
};

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete assignment "${a.title}"? This cannot be undone.`)) return;
    setDeletingId(a.id);
    try {
      const res = await deleteAssignment(a.uuid);
      if (res?.success !== false) {
        toast.success(res?.message || "Assignment deleted");
        setSelected((s) => {
          const n = new Set(s);
          n.delete(a.id);
          return n;
        });
        fetchAssignments();
      } else {
        toast.error(res?.message || "Failed to delete assignment");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete assignment");
    } finally {
      setDeletingId(null);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["ID", "Title", "Subject", "Class", "Teacher", "Due", "Max", "Status"],
      ...filtered.map((a) => [
        a.id,
        a.title,
        a.subject,
        a.klass,
        a.teacher,
        a.due,
        String(a.maxMarks),
        a.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assignments.csv";
    a.click();
    toast.success("CSV exported");
  };

  const pendingReview = allSubs.filter((s) =>
    ["Submitted", "Late", "Resubmitted"].includes(s.status),
  ).length;
  const avgSubRate = items.length
    ? Math.round(
        items.reduce(
          (a, x) => a + (x.submitted / x.totalStudents) * 100,
          0,
        ) / items.length,
      )
    : 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Assignments & Homework"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  // closing (via X / outside click) resets edit state too
                  setEditingUuid(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  onClick={() => {
                    setForm(emptyForm);
                    setEditingUuid(null);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUuid ? "Edit Assignment" : "Create Assignment"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Title (e.g. Chapter 5 — Trigonometry)"
                      value={form.title}
                      aria-invalid={Boolean(formErrors.title)}
                      onChange={(e) => {
                        setForm({ ...form, title: e.target.value });
                        setFormErrors((errors) => ({ ...errors, title: "" }));
                      }}
                    />
                    {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                  </div>

                  {/* Subject + Teacher */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={form.subject}
                        onValueChange={(v) => {
                          setForm({ ...form, subject: v });
                          setFormErrors((errors) => ({ ...errors, subject: "" }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((item) => (
                            <SelectItem
                              key={item.subject_uuid}
                              value={item.subject_uuid}
                            >
                              {item.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.subject && <p className="text-xs text-destructive">{formErrors.subject}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Teacher
                      </label>
                      <Select
                        value={form.teacher}
                        onValueChange={(v) => setForm({ ...form, teacher: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Teacher" />
                        </SelectTrigger>
                        <SelectContent>
                         {teachers.map((teacher) => (
  <SelectItem
    key={teacher.employee_uuid}
    value={String(teacher.employee_uuid)}   
  >
    {teacher.name}
  </SelectItem>
))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Class + Section */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Class <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={form.classNum}
                        onValueChange={(v) => {
                          setForm({ ...form, classNum: v });
                          setFormErrors((errors) => ({ ...errors, classNum: "", section: "" }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((item) => (
                            <SelectItem
                              key={item.class_uuid}
                              value={item.class_uuid}
                            >
                              {item.class_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.classNum && <p className="text-xs text-destructive">{formErrors.classNum}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Section <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={form.section}
                        onValueChange={(v) => {
                          setForm({ ...form, section: v });
                          setFormErrors((errors) => ({ ...errors, section: "" }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSections.map((item) => (
                            <SelectItem
                              key={item.section_uuid}
                              value={item.section_uuid}
                            >
                              {item.section_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.section && <p className="text-xs text-destructive">{formErrors.section}</p>}
                    </div>
                  </div>

                  {/* Assignment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Assignment Type
                    </label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNMENT_TYPES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assign To */}
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Assign To
                    </label>
                    <Select
                      value={form.assignTo}
                      onValueChange={(v) =>
                        setForm({ ...form, assignTo: v, studentIds: new Set() })
                      }
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGN_TO_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Group name */}
                  {form.assignTo === "Custom Group" && (
                    <Input
                      placeholder="Group name (e.g. Team Alpha)"
                      value={form.groupName}
                      onChange={(e) =>
                        setForm({ ...form, groupName: e.target.value })
                      }
                    />
                  )}

                  {/* Student picker */}
                  {(form.assignTo === "Selected Students" ||
                    form.assignTo === "Custom Group") && (
                    <div className="rounded-md border border-border/60 p-3">
                      {!form.classNum || !form.section ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Select a class and section first
                        </p>
                      ) : studentsLoading ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Loading students...
                        </p>
                      ) : students.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No students found for this class/section
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {students.map((s) => (
                            <label
                              key={s.student_uuid}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              <Checkbox
                                checked={form.studentIds.has(s.student_uuid)}
                                onCheckedChange={() => toggleStudent(s.student_uuid)}
                              />
                              {s.full_name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Instructions
                    </label>
                    <Textarea
                      placeholder="Instructions"
                      rows={4}
                      value={form.instructions}
                      onChange={(e) =>
                        setForm({ ...form, instructions: e.target.value })
                      }
                    />
                  </div>

                  {/* Date / End date / Duration */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Date <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="date"
                        value={form.due}
                        aria-invalid={Boolean(formErrors.due)}
                        onChange={(e) => {
                          setForm({ ...form, due: e.target.value });
                          setFormErrors((errors) => ({ ...errors, due: "" }));
                        }}
                      />
                      {formErrors.due && <p className="text-xs text-destructive">{formErrors.due}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        End Date <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="date"
                        value={form.endDate}
                        min={form.due || undefined}
                        aria-invalid={Boolean(formErrors.endDate)}
                        onChange={(e) => {
                          setForm({ ...form, endDate: e.target.value });
                          setFormErrors((errors) => ({ ...errors, endDate: "" }));
                        }}
                      />
                      {formErrors.endDate && <p className="text-xs text-destructive">{formErrors.endDate}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </label>
                      <Input
                        placeholder="e.g. 60 mins"
                        value={form.duration}
                        onChange={(e) =>
                          setForm({ ...form, duration: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Max marks */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Max Marks
                    </label>
                    <Input
                      type="number"
                      value={form.maxMarks}
                      onChange={(e) =>
                        setForm({ ...form, maxMarks: Number(e.target.value) })
                      }
                    />
                  </div>

                  {/* Attachments */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Attachments
                    </label>
                    <div className="space-y-2">
                      {/* PDF file upload */}
                      <div className="relative">
                        <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <label
                          htmlFor="pdf-upload"
                          className="flex items-center h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <span className={form.pdfFile ? "truncate" : "text-muted-foreground"}>
                            {form.pdfFile ? form.pdfFile.name : "Attach PDF (file name)"}
                          </span>
                        </label>
                        <input
                          id="pdf-upload"
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            setForm({ ...form, pdfFile: e.target.files?.[0] ?? null })
                          }
                        />
                      </div>
                      {existingPdf && !form.pdfFile && (
                        <a
                          href={existingPdf.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 pl-1 text-xs text-primary hover:underline truncate"
                        >
                          <FileText className="h-3 w-3 shrink-0" />
                          {existingPdf.original_file_name}
                        </a>
                      )}

                      {/* Video file upload */}
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <label
                          htmlFor="video-upload"
                          className="flex items-center h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <span className={form.videoFile ? "truncate" : "text-muted-foreground"}>
                            {form.videoFile ? form.videoFile.name : "Video file name"}
                          </span>
                        </label>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) =>
                            setForm({ ...form, videoFile: e.target.files?.[0] ?? null })
                          }
                        />
                      </div>
                      {existingVideo && !form.videoFile && (
                        <a
                          href={existingVideo.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 pl-1 text-xs text-primary hover:underline truncate"
                        >
                          <Video className="h-3 w-3 shrink-0" />
                          {existingVideo.original_file_name}
                        </a>
                      )}

                      {/* Resource link (unchanged, still text input) */}
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          className="pl-8"
                          placeholder="Resource link (https://...)"
                          value={form.resourceLink}
                          onChange={(e) =>
                            setForm({ ...form, resourceLink: e.target.value })
                          }
                        />
                      </div>
                      {form.resourceLink && (
                        <a
                          href={form.resourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block pl-1 text-xs text-primary hover:underline truncate"
                        >
                          {form.resourceLink}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  {editingUuid ? (
                    <Button onClick={handleUpdate} disabled={publishing}>
                      {publishing ? "Updating..." : "Update Assignment"}
                    </Button>
                  ) : (
                    <>
                      {/* <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={savingDraft || publishing}
                      >
                        {savingDraft ? "Saving..." : "Save Draft"}
                      </Button> */}
                      <Button onClick={handlePublish} disabled={publishing || savingDraft}>
                        {publishing ? "Publishing..." : "create assignment"}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Active"
          value={items
            .filter((a) => a.status === "Published")
            .length.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Submission Rate"
          value={`${avgSubRate}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Pending Review"
          value={pendingReview.toString()}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Total"
          value={items.length.toString()}
          icon={<Star className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <Card className="border-border/60 mb-4">
        <CardContent className="p-3 flex flex-wrap gap-2 items-center">
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Draft", "Published", "Closed", "Archived"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subjF} onValueChange={setSubjF}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...SUBJECTS].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classF} onValueChange={setClassF}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...CLASSES].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teacherF} onValueChange={setTeacherF}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...TEACHERS].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {totalSel > 0 && (
            <>
              <div className="ml-auto text-xs text-muted-foreground">
                {totalSel} selected
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  assignmentsApi.bulkPublish([...selected]);
                  setSelected(new Set());
                  toast.success("Bulk published");
                  fetchAssignments();
                }}
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  assignmentsApi.bulkArchive([...selected]);
                  setSelected(new Set());
                  toast.success("Bulk archived");
                  fetchAssignments();
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="table">
        {/* <TabsList>
          <TabsTrigger value="table">All Assignments</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList> */}

        <TabsContent value="table" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex justify-end border-b px-4 py-3">
                <RowsPerPageSelect
                  pageSize={pageSize}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={
                          filtered.length > 0 &&
                          selected.size === filtered.length
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        Loading assignments...
                      </TableCell>
                    </TableRow>
                  )}
                  {!itemsLoading &&
                    filtered.map((a) => {
                      const subs = a.submitted,
                        tot = a.totalStudents,
                        // eslint-disable-next-line no-unused-vars
                        pct = Math.round((subs / tot) * 100);
                      return (
                        <TableRow
                          key={a.id}
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={(e) => {
                            if (e.target.closest("[data-no-row]")) return;
                            navigate(`/assignments/${a.uuid}`);
                          }}
                        >
                          <TableCell data-no-row>
                            <Checkbox
                              checked={selected.has(a.id)}
                              onCheckedChange={() => toggle(a.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {a.id}
                          </TableCell>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{a.subject}</Badge>
                          </TableCell>
                          <TableCell>{a.klass}</TableCell>
                          <TableCell className="text-xs">{a.teacher}</TableCell>
                          <TableCell className="text-xs">{a.due}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 w-40">
                              <Progress value={pct} className="h-1.5" />
                              <span className="text-xs tabular-nums">
                                {subs}/{tot}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell data-no-row>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEdit(a)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(a)}
                                disabled={deletingId === a.id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {!itemsLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No assignments match filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <PaginationBar
                rangeStart={items.length ? (page - 1) * pageSize + 1 : 0}
                rangeEnd={(page - 1) * pageSize + items.length}
                totalItems={total}
                page={page}
                totalPages={Math.max(1, Math.ceil(total / pageSize))}
                onPageChange={setPage}
                showPageSize={false}
                itemLabel="assignments"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-4 grid md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const subs = a.submitted,
              tot = a.totalStudents,
              pct = Math.round((subs / tot) * 100);
            return (
              <Card
                key={a.id}
                className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/assignments/${a.uuid}`)}
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
                        {a.subject} · Class {a.klass} · Due {a.due}
                      </CardDescription>
                    </div>
                    <div className="flex items-start gap-1">
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
                      <div
                        className="flex items-center gap-1"
                        data-no-row
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(a)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(a)}
                          disabled={deletingId === a.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Submissions</span>
                      <span className="font-semibold">
                        {subs}/{tot}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent
          value="analytics"
          className="mt-4 grid md:grid-cols-3 gap-4"
        >
          {SUBJECTS.map((sub) => {
            const subjItems = items.filter((a) => a.subject === sub);
            const rate = subjItems.length
              ? Math.round(
                  subjItems.reduce(
                    (acc, x) => acc + (x.submitted / x.totalStudents) * 100,
                    0,
                  ) / subjItems.length,
                )
              : 0;
            return (
              <Card key={sub} className="border-border/60">
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {sub}
                  </div>
                  <div className="text-2xl font-display font-semibold mt-1">
                    {rate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    submission rate · {subjItems.length} assigned
                  </div>
                  <Progress value={rate} className="h-1.5 mt-3" /> 
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
