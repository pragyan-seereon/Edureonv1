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
import { Progress } from "../../components/ui/progress";
import { Checkbox } from "../../components/ui/checkbox";
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
  Video,
  FileText,
  NotebookPen,
  Link2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getLessonPlans,
  createLessonPlan,
  downloadLessonPlan,
  getLessonPlanDetail,
  updateLessonPlan,
} from "../../api/lessonplan";
import {
  getStudyMaterials,
  createStudyMaterial,
  downloadStudyMaterial,
  updateStudyMaterial,
} from "../../api/studymaterial";
import {
  getAssignments,
  publishAssignment,
  getAssignmentDetail,
  updateAssignment,
  deleteAssignment,
} from "../../api/assignment";
import {
  getAssignmentStudents,
  getAssignmentSubmissions,
  gradeSubmission,
  getAssignmentInquiries,
  replyAssignmentInquiry,
} from "../../api/teacherassignment";
import { getTeacherClasses } from "../../api/teacherclass";
import {
  PaginationBar,
  RowsPerPageSelect,
} from "../../components/pagination-controls";

import useSessionStore from "../../store/sessionStore";
import { useTeacherCtx } from "../../lib/teacher-ctx";

// Maps a raw submission row from GET /assignments/:uuid/submissions
const mapSubmission = (s) => ({
  id: s.submission_uuid,
  studentUuid: s.student_uuid,
  studentName: s.student_name,
  studentId: s.student_no,
  status: s.status
    ? s.status.charAt(0) + s.status.slice(1).toLowerCase()
    : "Pending",
  late: s.is_late,
  submittedAt: s.submitted_at,
  marks: s.obtained_marks,
  feedback: s.feedback,
  gradingIsDraft: s.grading_is_draft,
  resubmissionCount: s.resubmission_count,
  attachments: s.attachments ?? [],
});

// Maps a raw inquiry row from GET /assignments/:uuid/inquiries
const mapInquiry = (i) => ({
  id: i.inquiry_uuid,
  assignmentUuid: i.assignment_uuid,
  studentUuid: i.student_uuid,
  question: i.question,
  reply: i.reply,
  status: i.status, // "OPEN" | "REPLIED"
  createdAt: i.created_at,
  repliedAt: i.replied_at,
});

const ASSIGNMENT_TYPES = [
  "Homework",
  "Project",
  "Group Assignment",
  "Classwork",
];
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

const mapAssignment = (a) => ({
  id: a.assignment_uuid,
  assignmentNo: a.assignment_no,
  title: a.title,
  subject: a.subject_name,
  subjectUuid: a.subject_uuid,
  classUuid: a.class_uuid,
  sectionUuid: a.section_uuid,
  klass: a.section_name ? `${a.class_name}-${a.section_name}` : a.class_name,
  type: a.assignment_type,
  assignTo: a.assign_to,
  teacher: a.teacher_name,
  due: a.due_date,
  assignmentDate: a.assignment_date,
  duration: a.duration_minutes,
  maxMarks: a.max_marks,
  status:
    a.status === "PUBLISHED"
      ? "Published"
      : a.status === "DRAFT"
        ? "Draft"
        : a.status,
  totalStudents: a.total_students ?? 0,
  pendingCount: a.pending_count ?? 0,
  submittedCount: a.submitted_count ?? 0,
  reviewedCount: a.reviewed_count ?? 0,
  publishedAt: a.published_at,
  createdBy: a.created_by,
  createdByRole: a.created_by_role,
});

const formatRole = (role) =>
  role
    ? role
        .split("_")
        .map((w) => w[0] + w.slice(1).toLowerCase())
        .join(" ")
    : "—";

const canModify = (a) => !a.createdByRole || a.createdByRole === "TEACHER";

const mapMaterial = (m) => ({
  id: m.material_uuid,
  title: m.title,
  description: m.description,
  type: m.type,
  subjectUuid: m.subject_uuid,
  subject: m.subject_name,
  classUuid: m.class_uuid,
  sectionUuid: m.section_uuid,
  klass: m.section_name ? `${m.class_name}-${m.section_name}` : m.class_name,
  fileName: m.file_name,
  url: m.url,
  downloads: m.downloads ?? 0,
  createdAt: m.created_at,
});

const mapLessonPlan = (p) => ({
  id: p.lesson_plan_uuid,
  title: p.title,
  subjectUuid: p.subject_uuid,
  subject: p.subject_name,
  classUuid: p.class_uuid,
  sectionUuid: p.section_uuid,
  klass: p.section_name ? `${p.class_name}-${p.section_name}` : p.class_name,
  chapter: p.chapter,
  topic: p.topic,
  weekOf: p.week_of,
  periods: p.periods,
  objectives: p.learning_objectives,
  method: p.teaching_method,
  pdfFileName: p.pdf_file_name,
  pdfUrl: p.pdf_url,
  referenceUrl: p.reference_url,
  createdAt: p.created_at,
});

export default function TeacherAssignmentsPage() {
  const { teacherName } = useTeacherCtx();

  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const loadMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const res = await getStudyMaterials();
      setMaterials((res?.data ?? []).map(mapMaterial));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load study materials");
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Real submissions for whichever assignment is open in the detail view
  // (populated from GET /assignments/:uuid/submissions).
  const [subRows, setSubRows] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(20);
  const [subTotal, setSubTotal] = useState(0);
  const [grading, setGrading] = useState(false);

  // Student inquiries for whichever assignment is open in the detail view
  // (populated from GET /assignments/:uuid/inquiries).
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({}); // { [inquiry_uuid]: string }
  const [replyingId, setReplyingId] = useState(null);

  const loadSubmissions = async (
    assignmentUuid,
    page = 1,
    pageSize = subPageSize,
  ) => {
    if (!assignmentUuid) return;
    setSubLoading(true);
    try {
      const res = await getAssignmentSubmissions(
        assignmentUuid,
        page,
        pageSize,
      );
      setSubRows((res?.data ?? []).map(mapSubmission));
      setSubTotal(res?.pagination?.total ?? 0);
      setSubPage(res?.pagination?.page ?? page);
      setSubPageSize(res?.pagination?.page_size ?? pageSize);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load submissions");
      setSubRows([]);
      setSubTotal(0);
    } finally {
      setSubLoading(false);
    }
  };

  const loadInquiries = async (assignmentUuid) => {
    if (!assignmentUuid) return;
    setInquiriesLoading(true);
    try {
      const res = await getAssignmentInquiries(assignmentUuid);
      setInquiries((res?.data ?? []).map(mapInquiry));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load inquiries");
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleReplyInquiry = async (inquiryId) => {
    const reply = (replyDrafts[inquiryId] || "").trim();
    if (!reply) return toast.error("Write a reply first");
    if (!activeId) return;
    setReplyingId(inquiryId);
    try {
      const res = await replyAssignmentInquiry(activeId, inquiryId, reply);
      if (res?.success) {
        toast.success("Reply sent");
        setInquiries((rows) =>
          rows.map((r) => (r.id === inquiryId ? mapInquiry(res.data) : r)),
        );
        setReplyDrafts((d) => ({ ...d, [inquiryId]: "" }));
      } else {
        toast.error(res?.message || "Failed to send reply");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setReplyingId(null);
    }
  };

  const [allAssignments, setAllAssignments] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  const loadAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const res = await getAssignments();
      setAllAssignments((res?.data ?? []).map(mapAssignment));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadMaterials();
  }, []);

  const [openA, setOpenA] = useState(false);
  const [openM, setOpenM] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [classF, setClassF] = useState("All");
  const [mainTab, setMainTab] = useState("assignments");
  const mine = allAssignments;

  const classOptions = useMemo(() => {
    const set = new Set(mine.map((a) => a.klass).filter(Boolean));
    return [...set].sort();
  }, [mine]);

  const filtered = useMemo(
    () => mine.filter((a) => classF === "All" || a.klass === classF),
    [mine, classF],
  );

  const [assignPage, setAssignPage] = useState(1);
  const [assignPageSize, setAssignPageSize] = useState(10);

  useEffect(() => {
    setAssignPage(1);
  }, [classF, mine.length]);

  const assignTotalPages = Math.max(
    1,
    Math.ceil(filtered.length / assignPageSize),
  );
  const pagedAssignments = useMemo(
    () =>
      filtered.slice(
        (assignPage - 1) * assignPageSize,
        assignPage * assignPageSize,
      ),
    [filtered, assignPage, assignPageSize],
  );
  const assignRangeStart = filtered.length
    ? (assignPage - 1) * assignPageSize + 1
    : 0;
  const assignRangeEnd = Math.min(assignPage * assignPageSize, filtered.length);

  const active = activeId ? mine.find((a) => a.id === activeId) : undefined;

  useEffect(() => {
    if (!activeId) {
      setSubRows([]);
      setSubTotal(0);
      setSubPage(1);
      setInquiries([]);
      return;
    }
    loadSubmissions(activeId, 1, subPageSize);
    loadInquiries(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // ---------------------------------------------------------------------
  // Create-assignment form — ported from the admin "Create Assignment"
  // dialog, minus the Teacher picker (the teacher is always "me" here).
  // ---------------------------------------------------------------------
  const emptyA = {
    title: "",
    subject: "", // subject_uuid
    classNum: "", // class_uuid
    section: "", // section_uuid
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
  const [formA, setFormA] = useState(emptyA);
  const [formErrors, setFormErrors] = useState({});
  const [subjectsList, setSubjectsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [classesLoading, setClassesLoading] = useState(false);
  const [filteredSections, setFilteredSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [savingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Edit / delete state
  const [editingUuid, setEditingUuid] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Loads the teacher's classes/sections/subjects the first time either
  // dialog is opened, then caches them for the rest of the session.
  useEffect(() => {
    if (!openA && !openM) return;
    if (classesList.length || sectionsList.length || subjectsList.length)
      return;

    let cancelled = false;

    const load = async () => {
      setClassesLoading(true);
      try {
        const res = await getTeacherClasses();
        const rows = res?.data ?? [];
        if (cancelled) return;

        const classesMap = new Map();
        const sectionsMap = new Map();
        const subjectsMap = new Map();

        rows.forEach((row) => {
          if (row.class_uuid && !classesMap.has(row.class_uuid)) {
            classesMap.set(row.class_uuid, {
              class_uuid: row.class_uuid,
              class_name: row.class_name,
            });
          }
          if (row.section_uuid && !sectionsMap.has(row.section_uuid)) {
            sectionsMap.set(row.section_uuid, {
              section_uuid: row.section_uuid,
              section_name: row.section_name,
              class_uuid: row.class_uuid,
            });
          }
          if (row.subject_uuid && !subjectsMap.has(row.subject_uuid)) {
            subjectsMap.set(row.subject_uuid, {
              subject_uuid: row.subject_uuid,
              subject_name: row.subject_name,
            });
          }
        });

        setClassesList([...classesMap.values()]);
        setSectionsList([...sectionsMap.values()]);
        setSubjectsList([...subjectsMap.values()]);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load classes");
      } finally {
        if (!cancelled) setClassesLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    openA,
    openM,
    classesList.length,
    sectionsList.length,
    subjectsList.length,
  ]);
  // Filter sections whenever the chosen class changes, auto-pick the
  // first section for a fresh form. When editing an existing assignment,
  // keep whatever section came back from getAssignmentDetail.
  useEffect(() => {
    const sec = sectionsList.filter((s) => s.class_uuid === formA.classNum);
    setFilteredSections(sec);
    if (editingUuid) return;
    setFormA((prev) => ({
      ...prev,
      section: sec.length ? sec[0].section_uuid : "",
    }));
  }, [formA.classNum, sectionsList, editingUuid]);

  // Load students of the chosen class/section when needed for the
  // "Selected Students" / "Custom Group" picker.
  useEffect(() => {
    if (!formA.classNum || !formA.section) {
      setStudents([]);
      return;
    }
    if (
      formA.assignTo !== "Selected Students" &&
      formA.assignTo !== "Custom Group"
    ) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setStudentsLoading(true);
      try {
        const res = await getAssignmentStudents(formA.classNum, formA.section);
        if (cancelled) return;
        setStudents(res?.data ?? []);
      } catch (err) {
        console.log(err);
        if (!cancelled) {
          toast.error("Failed to load students");
          setStudents([]);
        }
      } finally {
        if (!cancelled) setStudentsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [formA.classNum, formA.section, formA.assignTo]);

  const toggleStudent = (uuid) =>
    setFormA((f) => {
      const n = new Set(f.studentIds);
      n.has(uuid) ? n.delete(uuid) : n.add(uuid);
      return { ...f, studentIds: n };
    });

  const validateAssignmentForm = () => {
    const errors = {};
    if (!formA.title.trim()) errors.title = "Title is required.";
    if (!formA.subject) errors.subject = "Select a subject.";
    if (!formA.classNum) errors.classNum = "Select a class.";
    if (!formA.section) errors.section = "Select a section.";
    if (!formA.due) errors.due = "Select the assignment date.";
    if (!formA.endDate) errors.endDate = "Select the end date.";
    if (formA.due && formA.endDate && formA.endDate < formA.due) {
      errors.endDate = "End date cannot be before the assignment date.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildFormData = () => {
    // TODO: confirm the correct field/store for the current teacher's id.
    const teacherUserId = useSessionStore.getState().userId;

    const fd = new FormData();
    fd.append("title", formA.title);
    fd.append("subject_uuid", formA.subject);
    fd.append("class_uuid", formA.classNum);
    fd.append("section_uuid", formA.section);
    fd.append("teacher_user_id", teacherUserId);
    fd.append("assignment_type", formA.type.toUpperCase().replace(/\s+/g, "_"));
    fd.append("assign_to", ASSIGN_TO_MAP[formA.assignTo] || "ENTIRE_CLASS");

    if (formA.assignTo === "Custom Group")
      fd.append("group_name", formA.groupName);
    if (formA.assignTo !== "Entire Class") {
      [...formA.studentIds].forEach((uuid) =>
        fd.append("selected_student_uuids", uuid),
      );
    }

    fd.append("instructions", formA.instructions);
    fd.append("assignment_date", formA.due);
    fd.append("due_date", formA.endDate);
    fd.append("duration_minutes", formA.duration);
    fd.append("max_marks", formA.maxMarks);

    if (formA.pdfFile) fd.append("pdf_file", formA.pdfFile);
    if (formA.videoFile) fd.append("video_file", formA.videoFile);
    if (formA.resourceLink) fd.append("resource_url", formA.resourceLink);

    return fd;
  };

  // JSON payload used for updating an existing (already published/draft)
  // assignment — mirrors the admin page's update flow.
  const buildUpdatePayload = () => ({
    title: formA.title,
    subject_uuid: formA.subject,
    class_uuid: formA.classNum,
    section_uuid: formA.section,
    assignment_type: formA.type.toUpperCase().replace(/\s+/g, "_"),
    assign_to: ASSIGN_TO_MAP[formA.assignTo] || "ENTIRE_CLASS",
    ...(formA.assignTo === "Custom Group"
      ? { group_name: formA.groupName }
      : {}),
    ...(formA.assignTo !== "Entire Class"
      ? { selected_student_uuids: [...formA.studentIds] }
      : {}),
    instructions: formA.instructions,
    assignment_date: formA.due,
    due_date: formA.endDate,
    duration_minutes: formA.duration,
    max_marks: formA.maxMarks,
    ...(formA.resourceLink ? { resource_url: formA.resourceLink } : {}),
  });

  // eslint-disable-next-line no-unused-vars

  const handlePublish = async () => {
    if (!validateAssignmentForm())
      return toast.error("Complete the required fields.");

    const fd = buildFormData();
    fd.append("status", "PUBLISHED");
    if (formA.draftUuid) fd.append("draft_uuid", formA.draftUuid);

    setPublishing(true);
    try {
      const res = await publishAssignment(fd);
      if (res?.success) {
        toast.success(res.message || "Published & notified");
        setOpenA(false);
        setFormA(emptyA);
        loadAssignments();
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

  // Loads an existing assignment into the form and opens the dialog in
  // "edit" mode. Normalizes whatever shape the backend returns the
  // selected-students list in, since that varies by endpoint.
  const handleEdit = async (a) => {
    if (!canModify(a)) {
      toast.error(
        `This assignment was created by ${formatRole(a.createdByRole)}. You can't edit it.`,
      );
      return;
    }
    try {
      const detail = await getAssignmentDetail(a.id);

      const rawSelected =
        detail.selected_student_uuids ??
        detail.selected_students ??
        detail.assigned_student_uuids ??
        detail.student_uuids ??
        [];

      const normalizedSelectedIds = rawSelected.map((s) =>
        typeof s === "string" ? s : (s.student_uuid ?? s.id ?? s.uuid),
      );

      setFormA({
        title: detail.title || "",
        subject: detail.subject_uuid || "",
        classNum: detail.class_uuid || "",
        section: detail.section_uuid || "",
        type: TYPE_REVERSE_MAP[detail.assignment_type] || "Homework",
        assignTo: ASSIGN_TO_REVERSE_MAP[detail.assign_to] || "Entire Class",
        groupName: detail.group_name || "",
        studentIds: new Set(normalizedSelectedIds),
        instructions: detail.instructions || "",
        due: detail.assignment_date || "",
        endDate: detail.due_date || "",
        duration: detail.duration_minutes
          ? String(detail.duration_minutes)
          : "",
        maxMarks: detail.max_marks ?? 20,
        pdfFile: null,
        videoFile: null,
        resourceLink: detail.resource_url || "",
        draftUuid: null,
        existingAttachments: detail.attachments || [],
      });
      setEditingUuid(detail.assignment_uuid || a.id);
      setFormErrors({});
      setOpenA(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load assignment for editing");
    }
  };

  const handleUpdate = async () => {
    if (!validateAssignmentForm())
      return toast.error("Complete the required fields.");

    setUpdating(true);
    try {
      const res = await updateAssignment(editingUuid, buildUpdatePayload());
      if (res?.success) {
        toast.success(res.message || "Assignment updated");
        setOpenA(false);
        setFormA(emptyA);
        setEditingUuid(null);
        loadAssignments();
      } else {
        toast.error(res?.message || "Failed to update assignment");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Failed to update assignment",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (a) => {
    if (!canModify(a)) {
      toast.error(
        `This assignment was created by ${formatRole(a.createdByRole)}. You can't delete it.`,
      );
      return;
    }
    if (
      !window.confirm(`Delete assignment "${a.title}"? This cannot be undone.`)
    )
      return;
    setDeletingId(a.id);
    try {
      const res = await deleteAssignment(a.id);
      if (res?.success !== false) {
        toast.success(res?.message || "Assignment deleted");
        loadAssignments();
      } else {
        toast.error(res?.message || "Failed to delete assignment");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Failed to delete assignment",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ---------------------------------------------------------------------
  // Study materials
  // ---------------------------------------------------------------------
  const emptyM = {
    title: "",
    pdfFile: null,
    externalUrl: "",
    subject: "",
    classNum: "",
    section: "",
    description: "",
  };
  const [formM, setFormM] = useState(emptyM);
  const [formErrorsM, setFormErrorsM] = useState({});
  const [sharingMaterial, setSharingMaterial] = useState(false);

  const [editingMaterialUuid, setEditingMaterialUuid] = useState(null);

  const handleEditMaterial = (m) => {
    setFormM({
      title: m.title || "",
      pdfFile: null,
      externalUrl: m.type === "LINK" ? m.url || "" : "",
      subject: m.subjectUuid || "",
      classNum: m.classUuid || "",
      section: m.sectionUuid || "",
      description: m.description || "",
    });
    setFormErrorsM({});
    setEditingMaterialUuid(m.id);
    setOpenM(true);
  };

  const handleUpdateMaterial = async () => {
    if (!validateMaterialForm(true))
      return toast.error("Complete the required fields.");
    if (!editingMaterialUuid) return;

    const fd = new FormData();
    fd.append("title", formM.title);
    fd.append("subject_uuid", formM.subject);
    fd.append("class_uuid", formM.classNum);
    fd.append("section_uuid", formM.section);
    fd.append("description", formM.description || "");
    fd.append("external_url", formM.externalUrl || "");
    if (formM.pdfFile) fd.append("pdf", formM.pdfFile);

    setSharingMaterial(true);
    try {
      const res = await updateStudyMaterial(editingMaterialUuid, fd);
      if (res?.success) {
        toast.success(res.message || "Study material updated");
        setMaterials((rows) =>
          rows.map((r) =>
            r.id === editingMaterialUuid ? mapMaterial(res.data) : r,
          ),
        );
        setOpenM(false);
        setFormM(emptyM);
        setEditingMaterialUuid(null);
      } else {
        toast.error(res?.message || "Failed to update material");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to update material");
    } finally {
      setSharingMaterial(false);
    }
  };

  const filteredSectionsM = useMemo(
    () => sectionsList.filter((s) => s.class_uuid === formM.classNum),
    [formM.classNum, sectionsList],
  );

  // Whenever the class changes in the material form, drop any
  // section pick that no longer belongs to it.
  useEffect(() => {
    setFormM((prev) => {
      if (!prev.section) return prev;
      const stillValid = filteredSectionsM.some(
        (s) => s.section_uuid === prev.section,
      );
      return stillValid ? prev : { ...prev, section: "" };
    });
  }, [filteredSectionsM]);

  const validateMaterialForm = (isEdit = false) => {
    const errors = {};
    if (!formM.title.trim()) errors.title = "Title is required.";
    if (!formM.subject) errors.subject = "Select a subject.";
    if (!formM.classNum) errors.classNum = "Select a class.";
    if (!formM.section) errors.section = "Select a section.";
    if (!isEdit && !formM.pdfFile && !formM.externalUrl.trim()) {
      errors.attachment = "Attach a PDF or enter a resource URL.";
    }
    setFormErrorsM(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadMaterial = async () => {
    if (!validateMaterialForm(false))
      return toast.error("Complete the required fields.");

    const fd = new FormData();

    fd.append("title", formM.title);
    fd.append("subject_uuid", formM.subject);
    fd.append("class_uuid", formM.classNum);
    fd.append("section_uuid", formM.section);
    if (formM.description.trim()) fd.append("description", formM.description);
    if (formM.externalUrl.trim()) fd.append("external_url", formM.externalUrl);
    if (formM.pdfFile) fd.append("pdf", formM.pdfFile);

    setSharingMaterial(true);
    try {
      const res = await createStudyMaterial(fd);
      if (res?.success) {
        toast.success(res.message || "Study material shared with students");
        setMaterials((rows) => [mapMaterial(res.data), ...rows]);
        setOpenM(false);
        setFormM(emptyM);
        setMainTab("materials");
      } else {
        toast.error(res?.message || "Failed to share material");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to share material");
    } finally {
      setSharingMaterial(false);
    }
  };

  const handleDownloadMaterial = async (m) => {
    try {
      const res = await downloadStudyMaterial(m.id);
      const url = res?.data?.url || res?.url || m.url;
      if (!url) return toast.error("Download link unavailable");
      window.open(url, "_blank", "noopener,noreferrer");
      setMaterials((rows) =>
        rows.map((r) =>
          r.id === m.id ? { ...r, downloads: r.downloads + 1 } : r,
        ),
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to download material");
    }
  };

  // eslint-disable-next-line no-unused-vars

  const pending = mine.reduce((sum, a) => sum + (a.pendingCount ?? 0), 0);
  const graded = mine.reduce((sum, a) => sum + (a.reviewedCount ?? 0), 0);
  const [matPage, setMatPage] = useState(1);
  const [matPageSize, setMatPageSize] = useState(10);

  useEffect(() => {
    setMatPage(1);
  }, [materials.length]);

  const matTotalPages = Math.max(1, Math.ceil(materials.length / matPageSize));
  const pagedMaterials = useMemo(
    () => materials.slice((matPage - 1) * matPageSize, matPage * matPageSize),
    [materials, matPage, matPageSize],
  );
  const matRangeStart = materials.length ? (matPage - 1) * matPageSize + 1 : 0;
  const matRangeEnd = Math.min(matPage * matPageSize, materials.length);

  const existingPdf = useMemo(
    () =>
      (formA.existingAttachments || []).find(
        (att) => att.attachment_type === "PDF",
      ),
    [formA.existingAttachments],
  );
  const existingVideo = useMemo(
    () =>
      (formA.existingAttachments || []).find(
        (att) => att.attachment_type === "VIDEO",
      ),
    [formA.existingAttachments],
  );

  // Resolves an inquiry's student_uuid to a display name using whatever
  // submission rows we already have loaded for the active assignment.
  const studentNameByUuid = useMemo(() => {
    const map = new Map();
    subRows.forEach((s) => map.set(s.studentUuid, s.studentName));
    return map;
  }, [subRows]);

  // Shared dialog for creating a new assignment — rendered inside the
  // Assignments tab so the trigger button lives with that tab's content.
  const NewAssignmentDialog = (
    <Dialog
      open={openA}
      onOpenChange={(v) => {
        setOpenA(v);
        if (!v) {
          setFormA(emptyA);
          setFormErrors({});
          setEditingUuid(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gradient-primary border-0"
          onClick={() => {
            setFormA(emptyA);
            setFormErrors({});
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
            {editingUuid ? "Edit assignment" : "Create assignment"}
          </DialogTitle>
          {/* <DialogDescription>
            Publishing attaches it to every student of the selected class.
          </DialogDescription> */}
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Title (e.g. Chapter 5 — Trigonometry)"
              value={formA.title}
              aria-invalid={Boolean(formErrors.title)}
              onChange={(e) => {
                setFormA({ ...formA, title: e.target.value });
                setFormErrors((errors) => ({ ...errors, title: "" }));
              }}
            />
            {formErrors.title && (
              <p className="text-xs text-destructive">{formErrors.title}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formA.subject}
              onValueChange={(v) => {
                setFormA({ ...formA, subject: v });
                setFormErrors((errors) => ({ ...errors, subject: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsList.map((item) => (
                  <SelectItem key={item.subject_uuid} value={item.subject_uuid}>
                    {item.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.subject && (
              <p className="text-xs text-destructive">{formErrors.subject}</p>
            )}
          </div>

          {/* Class + Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">
                Class <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formA.classNum}
                onValueChange={(v) => {
                  setFormA({ ...formA, classNum: v });
                  setFormErrors((errors) => ({
                    ...errors,
                    classNum: "",
                    section: "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {classesList.map((item) => (
                    <SelectItem key={item.class_uuid} value={item.class_uuid}>
                      {item.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.classNum && (
                <p className="text-xs text-destructive">
                  {formErrors.classNum}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">
                Section <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formA.section}
                onValueChange={(v) => {
                  setFormA({ ...formA, section: v });
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
              {formErrors.section && (
                <p className="text-xs text-destructive">{formErrors.section}</p>
              )}
            </div>
          </div>

          {/* Assignment Type */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">
              Assignment Type
            </Label>
            <Select
              value={formA.type}
              onValueChange={(v) => setFormA({ ...formA, type: v })}
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
            <Label className="text-[11px] uppercase tracking-wider">
              Assign To
            </Label>
            <Select
              value={formA.assignTo}
              onValueChange={(v) =>
                setFormA({ ...formA, assignTo: v, studentIds: new Set() })
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
          {formA.assignTo === "Custom Group" && (
            <Input
              placeholder="Group name (e.g. Team Alpha)"
              value={formA.groupName}
              onChange={(e) =>
                setFormA({ ...formA, groupName: e.target.value })
              }
            />
          )}

          {/* Student picker */}
          {(formA.assignTo === "Selected Students" ||
            formA.assignTo === "Custom Group") && (
            <div className="rounded-md border border-border/60 p-3">
              {!formA.classNum || !formA.section ? (
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
                        checked={formA.studentIds.has(s.student_uuid)}
                        onCheckedChange={() => toggleStudent(s.student_uuid)}
                      />
                      {s.student_name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">
              Instructions
            </Label>
            <Textarea
              placeholder="Instructions"
              rows={4}
              value={formA.instructions}
              onChange={(e) =>
                setFormA({ ...formA, instructions: e.target.value })
              }
            />
          </div>

          {/* Date / End date / Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formA.due}
                aria-invalid={Boolean(formErrors.due)}
                onChange={(e) => {
                  setFormA({ ...formA, due: e.target.value });
                  setFormErrors((errors) => ({ ...errors, due: "" }));
                }}
              />
              {formErrors.due && (
                <p className="text-xs text-destructive">{formErrors.due}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formA.endDate}
                min={formA.due || undefined}
                aria-invalid={Boolean(formErrors.endDate)}
                onChange={(e) => {
                  setFormA({ ...formA, endDate: e.target.value });
                  setFormErrors((errors) => ({ ...errors, endDate: "" }));
                }}
              />
              {formErrors.endDate && (
                <p className="text-xs text-destructive">{formErrors.endDate}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">
                Duration
              </Label>
              <Input
                placeholder="e.g. 60 mins"
                value={formA.duration}
                onChange={(e) =>
                  setFormA({ ...formA, duration: e.target.value })
                }
              />
            </div>
          </div>

          {/* Max marks */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">
              Max Marks
            </Label>
            <Input
              type="number"
              value={formA.maxMarks}
              onChange={(e) =>
                setFormA({ ...formA, maxMarks: Number(e.target.value) })
              }
            />
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">
              Attachments
            </Label>
            <div className="space-y-2">
              {/* PDF file upload */}
              <div className="relative">
                <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <label
                  htmlFor="pdf-upload-teacher"
                  className="flex items-center h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <span
                    className={
                      formA.pdfFile ? "truncate" : "text-muted-foreground"
                    }
                  >
                    {formA.pdfFile
                      ? formA.pdfFile.name
                      : "Attach PDF (file name)"}
                  </span>
                </label>
                <input
                  id="pdf-upload-teacher"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    setFormA({ ...formA, pdfFile: e.target.files?.[0] ?? null })
                  }
                />
              </div>
              {existingPdf && !formA.pdfFile && (
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
                  htmlFor="video-upload-teacher"
                  className="flex items-center h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <span
                    className={
                      formA.videoFile ? "truncate" : "text-muted-foreground"
                    }
                  >
                    {formA.videoFile ? formA.videoFile.name : "Video file name"}
                  </span>
                </label>
                <input
                  id="video-upload-teacher"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) =>
                    setFormA({
                      ...formA,
                      videoFile: e.target.files?.[0] ?? null,
                    })
                  }
                />
              </div>
              {existingVideo && !formA.videoFile && (
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

              {/* Resource link */}
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Resource link (https://...)"
                  value={formA.resourceLink}
                  onChange={(e) =>
                    setFormA({ ...formA, resourceLink: e.target.value })
                  }
                />
              </div>
              {formA.resourceLink && (
                <a
                  href={formA.resourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block pl-1 text-xs text-primary hover:underline truncate"
                >
                  {formA.resourceLink}
                </a>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          {editingUuid ? (
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update Assignment"}
            </Button>
          ) : (
            <>
              {/* <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={savingDraft || publishing}
              >
                {savingDraft ? "Saving..." : "Save draft"}
              </Button> */}
              <Button
                onClick={handlePublish}
                disabled={publishing || savingDraft}
              >
                {publishing ? "Publishing..." : "Publish"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Shared dialog for sharing study material — rendered inside the
  // Study Materials tab so the trigger button lives with that tab's content.
  const UploadMaterialDialog = (
    <Dialog
      open={openM}
      onOpenChange={(v) => {
        setOpenM(v);
        if (!v) {
          setFormM(emptyM);
          setFormErrorsM({});
          setEditingMaterialUuid(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gradient-primary border-0"
          onClick={() => setEditingMaterialUuid(null)}
        >
          <FileBox className="h-4 w-4" />
          Upload Material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingMaterialUuid
              ? "Edit study material"
              : "Share study material"}
          </DialogTitle>
          {/* <DialogDescription>
            Visible and downloadable for students of the selected class.
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formM.title}
              aria-invalid={Boolean(formErrorsM.title)}
              onChange={(e) => {
                setFormM({ ...formM, title: e.target.value });
                setFormErrorsM((errors) => ({ ...errors, title: "" }));
              }}
            />
            {formErrorsM.title && (
              <p className="text-xs text-destructive">{formErrorsM.title}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formM.subject}
              onValueChange={(v) => {
                setFormM({ ...formM, subject: v });
                setFormErrorsM((errors) => ({ ...errors, subject: "" }));
              }}
            >
              <SelectTrigger aria-invalid={Boolean(formErrorsM.subject)}>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsList.map((item) => (
                  <SelectItem key={item.subject_uuid} value={item.subject_uuid}>
                    {item.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrorsM.subject && (
              <p className="text-xs text-destructive">{formErrorsM.subject}</p>
            )}
          </div>
          {/* Class + Section — Section only fills in once a Class is chosen */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                Class <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formM.classNum}
                onValueChange={(v) => {
                  setFormM({ ...formM, classNum: v, section: "" });
                  setFormErrorsM((errors) => ({
                    ...errors,
                    classNum: "",
                    section: "",
                  }));
                }}
              >
                <SelectTrigger aria-invalid={Boolean(formErrorsM.classNum)}>
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {classesList.map((item) => (
                    <SelectItem key={item.class_uuid} value={item.class_uuid}>
                      {item.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrorsM.classNum && (
                <p className="text-xs text-destructive">
                  {formErrorsM.classNum}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Section <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formM.section}
                onValueChange={(v) => {
                  setFormM({ ...formM, section: v });
                  setFormErrorsM((errors) => ({ ...errors, section: "" }));
                }}
                disabled={!formM.classNum}
              >
                <SelectTrigger aria-invalid={Boolean(formErrorsM.section)}>
                  <SelectValue
                    placeholder={
                      formM.classNum ? "Section" : "Select class first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSectionsM.map((item) => (
                    <SelectItem
                      key={item.section_uuid}
                      value={item.section_uuid}
                    >
                      {item.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrorsM.section && (
                <p className="text-xs text-destructive">
                  {formErrorsM.section}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              PDF File <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <label
                htmlFor="material-upload"
                className="flex items-center h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <span
                  className={
                    formM.pdfFile ? "truncate" : "text-muted-foreground"
                  }
                >
                  {formM.pdfFile ? formM.pdfFile.name : "Attach PDF"}
                </span>
              </label>
              <input
                id="material-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  setFormM({ ...formM, pdfFile: e.target.files?.[0] ?? null });
                  setFormErrorsM((errors) => ({ ...errors, attachment: "" }));
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              Resource URL (optional if PDF attached)
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="https://..."
                value={formM.externalUrl}
                onChange={(e) => {
                  setFormM({ ...formM, externalUrl: e.target.value });
                  setFormErrorsM((errors) => ({ ...errors, attachment: "" }));
                }}
              />
            </div>
            {formErrorsM.attachment && (
              <p className="text-xs text-destructive">
                {formErrorsM.attachment}
              </p>
            )}
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
          <Button
            type="button"
            onClick={
              editingMaterialUuid ? handleUpdateMaterial : uploadMaterial
            }
            disabled={sharingMaterial}
          >
            {editingMaterialUuid
              ? sharingMaterial
                ? "Updating..."
                : "Update"
              : sharingMaterial
                ? "Sharing..."
                : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  // ---- Detail view: students of one assignment ----
  if (active) {
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
          description={`Due ${active.due || "—"} · Max ${active.maxMarks} marks · ${subTotal} student(s) assigned`}
        />
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Assigned students
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex justify-end border-b px-4 py-3">
              <RowsPerPageSelect
                pageSize={subPageSize}
                onPageSizeChange={(value) => {
                  loadSubmissions(active.id, 1, value);
                }}
              />
            </div>
            <div className="overflow-x-auto">
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
                  {subLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        Loading submissions...
                      </TableCell>
                    </TableRow>
                  )}
                  {!subLoading &&
                    subRows.map((s) => (
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
                          {s.attachments?.length
                            ? s.attachments.map((f) => f.file_name).join(", ")
                            : "—"}
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
                            {s.late ? " · Late" : ""}
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
                  {!subLoading && subRows.length === 0 && (
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
            </div>
            <PaginationBar
              rangeStart={subRows.length ? (subPage - 1) * subPageSize + 1 : 0}
              rangeEnd={(subPage - 1) * subPageSize + subRows.length}
              totalItems={subTotal}
              page={subPage}
              totalPages={Math.max(1, Math.ceil(subTotal / subPageSize))}
              onPageChange={(p) => loadSubmissions(active.id, p, subPageSize)}
              showPageSize={false}
              itemLabel="students"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Student Inquiries
            </CardTitle>
            <CardDescription className="text-xs">
              Questions students asked about this assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiriesLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading inquiries...
              </p>
            )}
            {!inquiriesLoading && inquiries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No inquiries yet.
              </p>
            )}
            {!inquiriesLoading &&
              inquiries.map((i) => (
                <div
                  key={i.id}
                  className="rounded-md border border-border/60 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium">
                        {studentNameByUuid.get(i.studentUuid) || "Student"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {i.createdAt
                          ? new Date(i.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                    <Badge
                      variant={i.status === "REPLIED" ? "default" : "outline"}
                    >
                      {i.status === "REPLIED" ? "Replied" : "Open"}
                    </Badge>
                  </div>

                  <div className="text-sm">{i.question}</div>

                  {i.status === "REPLIED" ? (
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                      <span className="font-medium">Your reply: </span>
                      {i.reply}
                      {i.repliedAt && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(i.repliedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Write a reply..."
                        value={replyDrafts[i.id] || ""}
                        onChange={(e) =>
                          setReplyDrafts((d) => ({
                            ...d,
                            [i.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        disabled={replyingId === i.id}
                        onClick={() => handleReplyInquiry(i.id)}
                      >
                        {replyingId === i.id ? "Sending..." : "Reply"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        <Dialog
          open={!!activeSub}
          onOpenChange={(v) => !v && setActiveSub(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{activeSub?.studentName}</DialogTitle>
              <DialogDescription>
                {active.title} · {activeSub?.status}
                {activeSub?.late ? " · Late" : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase text-muted-foreground">
                  Attached files
                </div>
                {(activeSub?.attachments ?? []).length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No files uploaded.
                  </div>
                )}
                {(activeSub?.attachments ?? []).map((f) => (
                  <div
                    key={f.attachment_uuid}
                    className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-xs truncate">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {f.file_name}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(f.file_url, "_blank", "noopener,noreferrer")
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
                  <Input
                    defaultValue={activeSub?.feedback ?? ""}
                    id="tsub-fb"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              {/* <Button
    variant="outline"
    onClick={() => activeSub && printSubmission(activeSub, active)}
  >
    <Download className="h-4 w-4" />
    Download as PDF
  </Button> */}
              <Button
                disabled={grading}
                onClick={async () => {
                  if (!activeSub) return;
                  const m = Number(
                    document.getElementById("tsub-marks")?.value || 0,
                  );
                  const fb = document.getElementById("tsub-fb")?.value || "";
                  setGrading(true);
                  try {
                    const res = await gradeSubmission(active.id, activeSub.id, {
                      obtained_marks: m,
                      feedback: fb,
                      grading_is_draft: false,
                    });
                    if (res?.success) {
                      toast.success(
                        res.message || "Grade published to student",
                      );
                      setActiveSub(null);
                      loadSubmissions(active.id, subPage, subPageSize);
                    } else {
                      toast.error(res?.message || "Failed to publish grade");
                    }
                  } catch (err) {
                    console.log(err);
                    toast.error(
                      err?.response?.data?.message || "Failed to publish grade",
                    );
                  } finally {
                    setGrading(false);
                  }
                }}
              >
                {grading ? "Publishing..." : "Publish grade"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Assignments & Materials" />

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
          value={String(materials.length)}
          icon={<FileBox className="h-5 w-5" />}
          tone="info"
        />
      </div>
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
          <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Class</span>
                <Select value={classF} onValueChange={setClassF}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", ...classOptions].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {NewAssignmentDialog}
            </CardContent>
          </Card>

          <Tabs defaultValue="table">
            {/* <TabsList>
              <TabsTrigger value="table">All Assignments</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList> */}

            <TabsContent value="table" className="mt-4">
              <Card className="border-border/60">
                <CardContent className="p-0">
                  <div className="flex justify-end border-b px-4 py-3">
                    <RowsPerPageSelect
                      pageSize={assignPageSize}
                      onPageSizeChange={(value) => {
                        setAssignPageSize(value);
                        setAssignPage(1);
                      }}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagedAssignments.map((a) => {
                          const total = a.totalStudents ?? 0;
                          const done =
                            (a.submittedCount ?? 0) + (a.reviewedCount ?? 0);
                          const pct = total
                            ? Math.round((done / total) * 100)
                            : 0;
                          return (
                            <TableRow
                              key={a.id}
                              className="cursor-pointer hover:bg-muted/40"
                              onClick={(e) => {
                                if (e.target.closest("[data-no-row]")) return;
                                setActiveId(a.id);
                              }}
                            >
                              <TableCell className="font-mono text-xs">
                                {a.assignmentNo || a.id}
                              </TableCell>
                              <TableCell className="font-medium">
                                {a.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{a.subject}</Badge>
                              </TableCell>
                              <TableCell>{a.klass}</TableCell>
                              <TableCell className="text-xs">
                                {a.due || "—"}
                              </TableCell>
                              <TableCell>
                                {canModify(a) ? (
                                  <span className="text-xs text-muted-foreground">
                                    You
                                  </span>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {formatRole(a.createdByRole)}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 w-40">
                                  <Progress value={pct} className="h-1.5" />
                                  <span className="text-xs tabular-nums">
                                    {done}/{total}
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
                                    className={`h-7 w-7 ${!canModify(a) ? "opacity-40" : ""}`}
                                    onClick={() => handleEdit(a)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-7 w-7 text-destructive hover:text-destructive ${!canModify(a) ? "opacity-40" : ""}`}
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
                        {filtered.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className="text-center py-8 text-sm text-muted-foreground"
                            >
                              No assignments yet for your classes.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationBar
                    rangeStart={assignRangeStart}
                    rangeEnd={assignRangeEnd}
                    totalItems={filtered.length}
                    page={assignPage}
                    totalPages={assignTotalPages}
                    onPageChange={setAssignPage}
                    showPageSize={false}
                    itemLabel="assignments"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="cards"
              className="mt-4 grid md:grid-cols-2 gap-4"
            >
              {filtered.map((a) => {
                const total = a.totalStudents ?? 0;
                const done = (a.submittedCount ?? 0) + (a.reviewedCount ?? 0);
                const pct = total ? Math.round((done / total) * 100) : 0;
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
                            {a.assignmentNo || a.id}
                          </div>
                          <CardTitle className="text-sm font-display">
                            {a.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {a.subject} · Class {a.klass} · Due {a.due || "—"}
                            {!canModify(a) && (
                              <>
                                {" "}
                                ·{" "}
                                <span className="text-muted-foreground">
                                  by {formatRole(a.createdByRole)}
                                </span>
                              </>
                            )}
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
                              className={`h-7 w-7 ${!canModify(a) ? "opacity-40" : ""}`}
                              onClick={() => handleEdit(a)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 text-destructive hover:text-destructive ${!canModify(a) ? "opacity-40" : ""}`}
                              onClick={() => handleDelete(a)}
                              disabled={deletingId === a.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Submissions
                        </span>
                        <span className="font-semibold">
                          {done}/{total}
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
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="materials" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-3 flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <FileBox className="h-3.5 w-3.5" />
                {materials.length} material(s) shared
              </div>
              {UploadMaterialDialog}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex justify-end border-b px-4 py-3">
                <RowsPerPageSelect
                  pageSize={matPageSize}
                  onPageSizeChange={(value) => {
                    setMatPageSize(value);
                    setMatPage(1);
                  }}
                />
              </div>
              <div className="overflow-x-auto">
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
                    {pagedMaterials.map((m) => (
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
                        <TableCell className="text-xs">{m.klass}</TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {m.downloads}
                        </TableCell>
                        <TableCell className="text-right" data-no-row>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditMaterial(m)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDownloadMaterial(m)}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {materialsLoading && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-sm text-muted-foreground"
                        >
                          Loading materials...
                        </TableCell>
                      </TableRow>
                    )}
                    {!materialsLoading && materials.length === 0 && (
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
              </div>
              <PaginationBar
                rangeStart={matRangeStart}
                rangeEnd={matRangeEnd}
                totalItems={materials.length}
                page={matPage}
                totalPages={matTotalPages}
                onPageChange={setMatPage}
                showPageSize={false}
                itemLabel="materials"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <LessonPlansTab teacherName={teacherName} setMainTab={setMainTab} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

/** Lesson planning lives inside the assignments workspace for teachers. */
// eslint-disable-next-line no-unused-vars
function LessonPlansTab({ teacherName, setMainTab }) {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await getLessonPlans();
      setPlans((res?.data ?? []).map(mapLessonPlan));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load lesson plans");
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // classes/subjects/sections pickers, uuid-based (mirrors the assignment form)
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (classesList.length || sectionsList.length || subjectsList.length)
      return;

    let cancelled = false;
    (async () => {
      try {
        const res = await getTeacherClasses();
        const rows = res?.data ?? [];
        if (cancelled) return;

        const classesMap = new Map();
        const sectionsMap = new Map();
        const subjectsMap = new Map();
        rows.forEach((row) => {
          if (row.class_uuid && !classesMap.has(row.class_uuid))
            classesMap.set(row.class_uuid, {
              class_uuid: row.class_uuid,
              class_name: row.class_name,
            });
          if (row.section_uuid && !sectionsMap.has(row.section_uuid))
            sectionsMap.set(row.section_uuid, {
              section_uuid: row.section_uuid,
              section_name: row.section_name,
              class_uuid: row.class_uuid,
            });
          if (row.subject_uuid && !subjectsMap.has(row.subject_uuid))
            subjectsMap.set(row.subject_uuid, {
              subject_uuid: row.subject_uuid,
              subject_name: row.subject_name,
            });
        });

        setClassesList([...classesMap.values()]);
        setSectionsList([...sectionsMap.values()]);
        setSubjectsList([...subjectsMap.values()]);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load classes");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, classesList.length, sectionsList.length, subjectsList.length]);

  const empty = {
    title: "",
    subject: "", // subject_uuid
    classNum: "", // class_uuid
    section: "", // section_uuid
    chapter: "",
    topic: "",
    method: "Discussion + worked examples",
    weekOf: "",
    periods: 1,
    objectives: "",
    referenceLink: "",
    pdfFile: null,
    existingPdfName: "",
    existingPdfUrl: "",
  };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [editingUuid, setEditingUuid] = useState(null);

  // Filter sections whenever the chosen class changes; auto-pick the
  // first matching section, and clear it if it no longer belongs.
  useEffect(() => {
    const sec = sectionsList.filter((s) => s.class_uuid === form.classNum);
    setFilteredSections(sec);
    setForm((prev) => ({
      ...prev,
      section: sec.some((s) => s.section_uuid === prev.section)
        ? prev.section
        : sec.length
          ? sec[0].section_uuid
          : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.classNum, sectionsList]);

  const mine = plans;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [mine.length]);

  const totalPages = Math.max(1, Math.ceil(mine.length / pageSize));
  const pagedPlans = useMemo(
    () => mine.slice((page - 1) * pageSize, page * pageSize),
    [mine, page, pageSize],
  );
  const rangeStart = mine.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, mine.length);

  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.subject) errs.subject = "Select a subject.";
    if (!form.classNum) errs.classNum = "Select a class.";
    if (!form.section) errs.section = "Select a section.";
    if (!form.weekOf) errs.weekOf = "Select week of.";
    if (!form.periods || form.periods < 1)
      errs.periods = "Periods must be at least 1.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validateForm()) return toast.error("Complete the required fields.");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subject_uuid", form.subject);
    fd.append("class_uuid", form.classNum);
    fd.append("section_uuid", form.section);
    fd.append("week_of", form.weekOf);
    fd.append("periods", form.periods);
    if (form.chapter) fd.append("chapter", form.chapter);
    if (form.topic) fd.append("topic", form.topic);
    if (form.objectives) fd.append("learning_objectives", form.objectives);
    if (form.method) fd.append("teaching_method", form.method);
    if (form.referenceLink) fd.append("reference_url", form.referenceLink);
    if (form.pdfFile) fd.append("pdf", form.pdfFile);

    setSaving(true);
    try {
      const res = await createLessonPlan(fd);
      if (res?.success) {
        toast.success(res.message || "Lesson plan created");
        setPlans((rows) => [mapLessonPlan(res.data), ...rows]);
        setOpen(false);
        setForm(empty);
        setErrors({});
        setMainTab("plans");
      } else {
        toast.error(res?.message || "Failed to create lesson plan");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Failed to create lesson plan",
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadPlan = async (p) => {
    try {
      const res = await downloadLessonPlan(p.id);
      const url = res?.data?.url || res?.url || p.pdfUrl;
      if (!url) return toast.error("Download link unavailable");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.log(err);
      toast.error("Failed to download lesson plan");
    }
  };

  const handleEditPlan = async (p) => {
    try {
      const res = await getLessonPlanDetail(p.id);
      const d = res?.data ?? res;
      setForm({
        title: d.title || "",
        subject: d.subject_uuid || "",
        classNum: d.class_uuid || "",
        section: d.section_uuid || "",
        chapter: d.chapter || "",
        topic: d.topic || "",
        method: d.teaching_method || "Discussion + worked examples",
        weekOf: d.week_of || "",
        periods: d.periods || 1,
        objectives: d.learning_objectives || "",
        referenceLink: d.reference_url || "",
        pdfFile: null,
        existingPdfName: d.pdf_file_name || "",
        existingPdfUrl: d.pdf_url || "",
      });
      setErrors({});
      setEditingUuid(d.lesson_plan_uuid || p.id);
      setOpen(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load lesson plan for editing");
    }
  };

  const handleUpdatePlan = async () => {
    if (!validateForm()) return toast.error("Complete the required fields.");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subject_uuid", form.subject);
    fd.append("class_uuid", form.classNum);
    fd.append("section_uuid", form.section);
    fd.append("week_of", form.weekOf);
    fd.append("periods", form.periods);
    fd.append("chapter", form.chapter || "");
    fd.append("topic", form.topic || "");
    fd.append("learning_objectives", form.objectives || "");
    fd.append("teaching_method", form.method || "");
    fd.append("reference_url", form.referenceLink || "");
    if (form.pdfFile) fd.append("pdf", form.pdfFile);

    setSaving(true);
    try {
      const res = await updateLessonPlan(editingUuid, fd);
      if (res?.success) {
        toast.success(res.message || "Lesson plan updated");
        setPlans((rows) =>
          rows.map((r) => (r.id === editingUuid ? mapLessonPlan(res.data) : r)),
        );
        setOpen(false);
        setForm(empty);
        setErrors({});
        setEditingUuid(null);
      } else {
        toast.error(res?.message || "Failed to update lesson plan");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Failed to update lesson plan",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardContent className="p-3 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <NotebookPen className="h-3.5 w-3.5" />
            {mine.length} lesson plan(s)
          </div>
          <div className="flex items-center gap-2">
            {mine.length > 0 && (
              <RowsPerPageSelect
                pageSize={pageSize}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            )}
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  setForm(empty);
                  setErrors({});
                  setEditingUuid(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  onClick={() => {
                    setForm(empty);
                    setErrors({});
                    setEditingUuid(null);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Lesson Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingUuid ? "Edit lesson plan" : "Create lesson plan"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 max-h-[65vh] overflow-y-auto pr-1">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.title}
                      aria-invalid={Boolean(errors.title)}
                      onChange={(e) => {
                        setForm({ ...form, title: e.target.value });
                        setErrors((er) => ({ ...er, title: "" }));
                      }}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.subject}
                        onValueChange={(v) => {
                          setForm({ ...form, subject: v });
                          setErrors((er) => ({ ...er, subject: "" }));
                        }}
                      >
                        <SelectTrigger aria-invalid={Boolean(errors.subject)}>
                          <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectsList.map((s) => (
                            <SelectItem
                              key={s.subject_uuid}
                              value={s.subject_uuid}
                            >
                              {s.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subject && (
                        <p className="text-xs text-destructive">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Class <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.classNum}
                        onValueChange={(v) => {
                          setForm({ ...form, classNum: v });
                          setErrors((er) => ({
                            ...er,
                            classNum: "",
                            section: "",
                          }));
                        }}
                      >
                        <SelectTrigger aria-invalid={Boolean(errors.classNum)}>
                          <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classesList.map((c) => (
                            <SelectItem key={c.class_uuid} value={c.class_uuid}>
                              {c.class_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.classNum && (
                        <p className="text-xs text-destructive">
                          {errors.classNum}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Section <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.section}
                        onValueChange={(v) => {
                          setForm({ ...form, section: v });
                          setErrors((er) => ({ ...er, section: "" }));
                        }}
                      >
                        <SelectTrigger aria-invalid={Boolean(errors.section)}>
                          <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSections.map((s) => (
                            <SelectItem
                              key={s.section_uuid}
                              value={s.section_uuid}
                            >
                              {s.section_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.section && (
                        <p className="text-xs text-destructive">
                          {errors.section}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chapter + Topic */}
                  <div className="grid grid-cols-2 gap-3">
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
                  </div>

                  {/* Week Of + Periods */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Week Of <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={form.weekOf}
                        aria-invalid={Boolean(errors.weekOf)}
                        onChange={(e) => {
                          setForm({ ...form, weekOf: e.target.value });
                          setErrors((er) => ({ ...er, weekOf: "" }));
                        }}
                      />
                      {errors.weekOf && (
                        <p className="text-xs text-destructive">
                          {errors.weekOf}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Periods <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.periods}
                        aria-invalid={Boolean(errors.periods)}
                        onChange={(e) => {
                          setForm({ ...form, periods: Number(e.target.value) });
                          setErrors((er) => ({ ...er, periods: "" }));
                        }}
                      />
                      {errors.periods && (
                        <p className="text-xs text-destructive">
                          {errors.periods}
                        </p>
                      )}
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

                  <div className="space-y-1">
                    <Label className="text-xs">Reference URL</Label>
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="https://…"
                        value={form.referenceLink}
                        onChange={(e) =>
                          setForm({ ...form, referenceLink: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Attach PDF</Label>
                    <div className="relative">
                      <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <label
                        htmlFor="lesson-plan-pdf-upload"
                        className="flex items-center h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <span
                          className={
                            form.pdfFile ? "truncate" : "text-muted-foreground"
                          }
                        >
                          {form.pdfFile
                            ? form.pdfFile.name
                            : "Attach PDF (optional)"}
                        </span>
                      </label>
                      <input
                        id="lesson-plan-pdf-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            pdfFile: e.target.files?.[0] ?? null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={editingUuid ? handleUpdatePlan : save}
                    disabled={saving}
                  >
                    {editingUuid
                      ? saving
                        ? "Updating..."
                        : "Update lesson plan"
                      : saving
                        ? "Saving..."
                        : "Create lesson plan"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {pagedPlans.map((p) => (
          <Card key={p.id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="min-w-0">
                {/* <div className="text-[10px] font-mono text-muted-foreground">
                  {p.id}
                </div> */}
                <CardTitle className="text-sm font-display">
                  {p.title}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {p.subject} · Class {p.klass} · Week of {p.weekOf} ·{" "}
                  {p.periods} period(s)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {p.chapter} — {p.topic}
              </div>
              {p.referenceUrl && (
                <Badge variant="secondary" className="text-[10px]">
                  LINK · {p.referenceUrl}
                </Badge>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadPlan(p)}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditPlan(p)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {plansLoading && (
          <Card className="border-border/60 md:col-span-2">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Loading lesson plans...
            </CardContent>
          </Card>
        )}
        {!plansLoading && mine.length === 0 && (
          <Card className="border-border/60 md:col-span-2">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No lesson plans yet.
            </CardContent>
          </Card>
        )}
      </div>

      {!plansLoading && mine.length > 0 && (
        <PaginationBar
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={mine.length}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showPageSize={false}
          itemLabel="lesson plans"
        />
      )}
    </div>
  );
}
