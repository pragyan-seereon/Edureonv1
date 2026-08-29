

// // // // import { useEffect, useMemo, useRef, useState } from "react";
// // // // import { useNavigate } from "react-router-dom";

// // // // import {
// // // //   getAdmissionPipeline,
// // // //   getAdmissionAnalytics,
// // // //   getAdmissionSources,
// // // //   getAdmissionCounselors,
// // // //   getStages,
// // // //   getAllAdmissions,
// // // //   enrollStudent,
// // // //   createAdmission,
// // // //   rejectAdmission,
// // // //   reinstateAdmission
// // // // } from "../../../api/admissions";
// // // // import { getClasses } from "../../../api/class";
// // // // import useAuthStore from "../../../store/authStore";

// // // // import { PageContainer, PageHeader } from "../../../components/page-shell";
// // // // import {
// // // //   Card,
// // // //   CardContent,
// // // //   CardHeader,
// // // //   CardTitle,
// // // // } from "../../../components/ui/card";
// // // // import { Button } from "../../../components/ui/button";
// // // // import { Badge } from "../../../components/ui/badge";
// // // // import { Input } from "../../../components/ui/input";
// // // // import {
// // // //   Select,
// // // //   SelectTrigger,
// // // //   SelectValue,
// // // //   SelectContent,
// // // //   SelectItem,
// // // // } from "../../../components/ui/select";
// // // // import { Checkbox } from "../../../components/ui/checkbox";
// // // // import {
// // // //   Avatar,
// // // //   AvatarImage,
// // // //   AvatarFallback,
// // // // } from "../../../components/ui/avatar";
// // // // import {
// // // //   Tabs,
// // // //   TabsList,
// // // //   TabsTrigger,
// // // //   TabsContent,
// // // // } from "../../../components/ui/tabs";
// // // // import {
// // // //   Dialog,
// // // //   DialogContent,
// // // //   DialogHeader,
// // // //   DialogTitle,
// // // //   DialogDescription,
// // // //   DialogFooter,
// // // // } from "../../../components/ui/dialog";
// // // // import { Label } from "../../../components/ui/label";
// // // // import { Textarea } from "../../../components/ui/textarea";
// // // // import {
// // // //   Table,
// // // //   TableBody,
// // // //   TableCell,
// // // //   TableHead,
// // // //   TableHeader,
// // // //   TableRow,
// // // // } from "../../../components/ui/table";
// // // // import {
// // // //   Plus,
// // // //   Search,
// // // //   Phone,
// // // //   Mail,
// // // //   ArrowRight,
// // // //   Archive,
// // // //   Trash2,
// // // //   Send,
// // // //   TrendingUp,
// // // //   FileText,
// // // //   ClipboardCheck,
// // // //   Eye,
// // // //   XCircle,
// // // //   RotateCcw,
// // // // } from "lucide-react";

// // // // import { toast } from "sonner";
// // // // import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";
// // // // import { ExcelUpload } from "../../../components/excel-upload";
// // // // import { ExcelExport } from "../../../components/excel-export";

// // // // const getApiErrorMessage = (err, fallback = "Something went wrong") => {
// // // //   const detail = err?.response?.data?.detail;
// // // //   const message = err?.response?.data?.message || err?.response?.data?.error;

// // // //   const stringify = (value) => {
// // // //     if (value == null) return "";
// // // //     if (typeof value === "string" || typeof value === "number") return String(value);

// // // //     if (Array.isArray(value)) {
// // // //       return value.map(stringify).filter(Boolean).join("\n");
// // // //     }

// // // //     if (typeof value === "object") {
// // // //       if (value.msg) {
// // // //         const loc = Array.isArray(value.loc)
// // // //           ? value.loc.filter((x) => x !== "body").join(" → ")
// // // //           : "";
// // // //         return loc ? `${loc}: ${String(value.msg)}` : String(value.msg);
// // // //       }
// // // //       if (value.message) return String(value.message);
// // // //       try {
// // // //         return JSON.stringify(value);
// // // //       } catch {
// // // //         return fallback;
// // // //       }
// // // //     }

// // // //     return String(value);
// // // //   };

// // // //   return stringify(detail) || stringify(message) || err?.message || fallback;
// // // // };

// // // // const stageColor = {
// // // //   Inquiry: "border-l-muted-foreground",
// // // //   Lead: "border-l-info",
// // // //   Counseling: "border-l-chart-3",
// // // //   "Admission Test": "border-l-warning",
// // // //   "Doc Verification": "border-l-accent",
// // // //   "Fee Payment": "border-l-chart-5",
// // // //   Enrolled: "border-l-success",
// // // //   Rejected: "border-l-destructive",
// // // // };

// // // // // Stages that are dead-ends in the pipeline — no "advance to next stage"
// // // // // button should ever be shown on cards sitting in these columns, and
// // // // // "Rejected" specifically must never be computed as anyone's "next" stage
// // // // // (rejection has its own dedicated flow via the reject dialog / drag-to-Rejected).
// // // // const TERMINAL_STAGES = ["Enrolled", "Rejected"];



// // // // export default function Admissions() {
// // // //   const navigate = useNavigate();
// // // //   const instituteUUID = useAuthStore((state) => state.instituteUUID);

// // // //   // ---- server data ----
// // // //   const [pipelineData, setPipelineData] = useState([]);
// // // //   const [analytics, setAnalytics] = useState({});
// // // //   const [sources, setSources] = useState([]);
// // // //   const [counselors, setCounselors] = useState([]);
// // // //   const [stages, setStages] = useState([]);
// // // //   const [allAdmissions, setAllAdmissions] = useState([]);

// // // //   // ---- pipeline filters / selection ----
// // // //   const [q, setQ] = useState("");
// // // //   const [src, setSrc] = useState("all");
// // // //   const [counselor, setCounselor] = useState("all");
// // // //   const [selected, setSelected] = useState(new Set());
// // // //   const [dragItem, setDragItem] = useState(null);
// // // //   const [tab, setTab] = useState("pipeline");

// // // //   // ---- search autosuggest ----
// // // //   const [suggestOpen, setSuggestOpen] = useState(false);
// // // //   const [suggestIndex, setSuggestIndex] = useState(-1);
// // // //   const searchBoxRef = useRef(null);

// // // //   // ---- forms / test tabs ----
// // // //   const [viewForm, setViewForm] = useState(null);
// // // //   const [testFilter, setTestFilter] = useState("all");
// // // //   const [stageFilter, setStageFilter] = useState("all");

// // // //   // ---- reject dialog ----
// // // //   const [rejectFor, setRejectFor] = useState(null);
// // // //   const [rejectReason, setRejectReason] = useState("");

// // // //   // ---- view rejection reason dialog (read-only) ----
// // // //   const [viewReasonFor, setViewReasonFor] = useState(null);
// // // //   const [classes, setClasses] = useState([]);
// // // //   const [classesLoading, setClassesLoading] = useState(false);
// // // //   // ---- public form dialog ----
// // // //   const [formOpen, setFormOpen] = useState(false);
// // // //   const [publicForm, setPublicForm] = useState({
// // // //     name: "",
// // // //     email: "",
// // // //     phone: "",
// // // //     location: "",
// // // //     school: "",
// // // //     parent: "",
// // // //     occupation: "",
// // // //      class_uuid: "",
// // // //     notes: "",
// // // //     consent: false,
// // // //   });

// // // // const loadClasses = async () => {
// // // //   try {
// // // //     setClassesLoading(true);

// // // //     const res = await getClasses();

// // // //     const list = res.data?.data || res.data || res || [];

// // // //     setClasses(Array.isArray(list) ? list : []);
// // // //   } catch (err) {
// // // //     console.error("Failed to load classes:", err);
// // // //     setClasses([]);
// // // //     toast.error("Failed to load classes");
// // // //   } finally {
// // // //     setClassesLoading(false);
// // // //   }
// // // // };

// // // // useEffect(() => {
// // // //   loadData();
// // // //   loadClasses();
// // // // }, []);

// // // //   const loadData = async () => {
// // // //     try {
// // // //       const [
// // // //         pipelineRes,
// // // //         analyticsRes,
// // // //         sourceRes,
// // // //         counselorRes,
// // // //         stageRes,
// // // //         allRes,
// // // //       ] = await Promise.all([
// // // //         getAdmissionPipeline(),
// // // //         getAdmissionAnalytics(),
// // // //         getAdmissionSources(),
// // // //         getAdmissionCounselors(),
// // // //         getStages(),
// // // //         getAllAdmissions(),
// // // //       ]);

// // // //       setPipelineData(pipelineRes.data);
// // // //       setAnalytics(analyticsRes.data);
// // // //       setSources(sourceRes.data);
// // // //       setCounselors(counselorRes.data);
// // // //       setStages(stageRes.data.data);
// // // //       setAllAdmissions(allRes.data);
// // // //     } catch (err) {
// // // //       console.error("Failed to load admissions data:", err);
// // // //       toast.error(getApiErrorMessage(err, "Failed to load admissions data"));
// // // //     }
// // // //   };

// // // //   const stageNames = useMemo(() => stages.map((s) => s.stage_name), [stages]);

// // // //   // Shared filter predicate used by both the active pipeline cards and the
// // // //   // rejected list, so every column respects the same search/source/counselor
// // // //   // filters consistently.
// // // //   const matchesFilters = (c) => {
// // // //     if (
// // // //       q &&
// // // //       !(
// // // //         c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
// // // //         c.primary_phone?.includes(q)
// // // //       )
// // // //     )
// // // //       return false;
// // // //     if (src !== "all" && c.source_name !== src) return false;
// // // //     if (counselor !== "all" && c.counselor_name !== counselor) return false;
// // // //     return true;
// // // //   };

// // // //   const byNameAsc = (a, b) =>
// // // //     (a.full_name || "").localeCompare(b.full_name || "", undefined, {
// // // //       sensitivity: "base",
// // // //     });

// // // //   // ============================================================
// // // //   // STATUS VISIBILITY RULES
// // // //   //
// // // //   // Status        Normal Pipeline   Rejected   Pipeline Count
// // // //   // ACTIVE              ✅              —             ✅
// // // //   // TRANSFERRED         ✅              —             ✅
// // // //   // REJECTED            —              ✅             ✅
// // // //   // DELETED             ❌              ❌             ❌
// // // //   //
// // // //   // i.e. DELETED is hidden everywhere and never counted.
// // // //   // Everything else (ACTIVE / TRANSFERRED / REJECTED) is counted in the
// // // //   // Pipeline Count. REJECTED is only ever *displayed* in the Rejected
// // // //   // column/tab; ACTIVE + TRANSFERRED are only ever displayed in the
// // // //   // Normal Pipeline columns.
// // // //   // ============================================================

// // // //   const isDeleted = (admission) =>
// // // //     String(admission?.status || "").toUpperCase() === "DELETED";

// // // //   const isRejected = (admission) => {
// // // //     const status = String(admission?.status || "").toUpperCase();

// // // //     return (
// // // //       status === "REJECTED" ||
// // // //       Number(admission?.stage_id) === 8 ||
// // // //       admission?.stage_name === "Rejected"
// // // //     );
// // // //   };

// // // //   // Normal pipeline cards:
// // // //   // ACTIVE + TRANSFERRED are shown here.
// // // //   // REJECTED is shown in the Rejected column.
// // // //   // DELETED is hidden everywhere.
// // // //   const cards = useMemo(() => {
// // // //     return allAdmissions
// // // //       .filter((c) => {
// // // //         if (isDeleted(c)) return false;
// // // //         if (isRejected(c)) return false;

// // // //         return matchesFilters(c);
// // // //       })
// // // //       .sort(byNameAsc);
// // // //   }, [allAdmissions, q, src, counselor]);

// // // //   // Rejected column:
// // // //   // REJECTED / stage 8 are shown.
// // // //   // DELETED is always hidden.
// // // //   const rejectedList = useMemo(() => {
// // // //     return allAdmissions
// // // //       .filter((c) => {
// // // //         if (isDeleted(c)) return false;
// // // //         return isRejected(c);
// // // //       })
// // // //       .filter(matchesFilters)
// // // //       .sort(byNameAsc);
// // // //   }, [allAdmissions, q, src, counselor]);

// // // //   // Rejected badge/count:
// // // //   // Count rejected records except DELETED.
// // // //   const rejectedTotal = useMemo(() => {
// // // //     return allAdmissions.filter((c) => {
// // // //       if (isDeleted(c)) return false;
// // // //       return isRejected(c);
// // // //     }).length;
// // // //   }, [allAdmissions]);

// // // //   // Pipeline counts (Kanban column badges):
// // // //   // Count ALL statuses except DELETED — i.e. ACTIVE + TRANSFERRED + REJECTED.
// // // //   //
// // // //   // ACTIVE       -> COUNT
// // // //   // TRANSFERRED  -> COUNT
// // // //   // REJECTED     -> COUNT
// // // //   // DELETED      -> NOT COUNTED
// // // //   const pipelineStageCounts = useMemo(() => {
// // // //     const counts = {};

// // // //     allAdmissions.forEach((admission) => {
// // // //       if (isDeleted(admission)) return;

// // // //       const stageName =
// // // //         admission.stage_name ||
// // // //         stages.find(
// // // //           (s) =>
// // // //             String(s.id) === String(admission.stage_id)
// // // //         )?.stage_name;

// // // //       if (!stageName) return;

// // // //       counts[stageName] =
// // // //         (counts[stageName] || 0) + 1;
// // // //     });

// // // //     return counts;
// // // //   }, [allAdmissions, stages]);

// // // //   // Unique applicant names for the search autosuggest dropdown, filtered
// // // //   // against the current query (Google-style — only relevant matches show,
// // // //   // capped to keep the list short).
// // // //   const nameSuggestions = useMemo(() => {
// // // //     const unique = Array.from(
// // // //       new Set(allAdmissions.map((a) => a.full_name).filter(Boolean))
// // // //     ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

// // // //     if (!q.trim()) return [];
// // // //     const query = q.toLowerCase();
// // // //     return unique
// // // //       .filter((name) => name.toLowerCase().includes(query))
// // // //       .slice(0, 8);
// // // //   }, [allAdmissions, q]);

// // // //   // Close the suggestion dropdown on outside click.
// // // //   useEffect(() => {
// // // //     const handleClick = (e) => {
// // // //       if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
// // // //         setSuggestOpen(false);
// // // //         setSuggestIndex(-1);
// // // //       }
// // // //     };
// // // //     document.addEventListener("mousedown", handleClick);
// // // //     return () => document.removeEventListener("mousedown", handleClick);
// // // //   }, []);

// // // //   const chooseSuggestion = (name) => {
// // // //     setQ(name);
// // // //     setSuggestOpen(false);
// // // //     setSuggestIndex(-1);
// // // //   };

// // // //   const handleSearchKeyDown = (e) => {
// // // //     if (!suggestOpen || nameSuggestions.length === 0) return;
// // // //     if (e.key === "ArrowDown") {
// // // //       e.preventDefault();
// // // //       setSuggestIndex((i) => (i + 1) % nameSuggestions.length);
// // // //     } else if (e.key === "ArrowUp") {
// // // //       e.preventDefault();
// // // //       setSuggestIndex(
// // // //         (i) => (i - 1 + nameSuggestions.length) % nameSuggestions.length
// // // //       );
// // // //     } else if (e.key === "Enter") {
// // // //       if (suggestIndex >= 0) {
// // // //         e.preventDefault();
// // // //         chooseSuggestion(nameSuggestions[suggestIndex]);
// // // //       } else {
// // // //         setSuggestOpen(false);
// // // //       }
// // // //     } else if (e.key === "Escape") {
// // // //       setSuggestOpen(false);
// // // //       setSuggestIndex(-1);
// // // //     }
// // // //   };

// // // //   // Highlights the matched substring within a suggestion, like search
// // // //   // engines do.
// // // //   const highlightMatch = (name) => {
// // // //     const idx = name.toLowerCase().indexOf(q.toLowerCase());
// // // //     if (idx === -1) return name;
// // // //     return (
// // // //       <>
// // // //         {name.slice(0, idx)}
// // // //         <span className="font-semibold text-foreground">
// // // //           {name.slice(idx, idx + q.length)}
// // // //         </span>
// // // //         {name.slice(idx + q.length)}
// // // //       </>
// // // //     );
// // // //   };

// // // //   const openStage = (stageName) => {
// // // //     setStageFilter(stageName);
// // // //     setTab(stageName === "Rejected" ? "rejected" : "forms");
// // // //   };

// // // //   const toggleSel = (id) =>
// // // //     setSelected((p) => {
// // // //       const n = new Set(p);
// // // //       if (n.has(id)) n.delete(id);
// // // //       else n.add(id);
// // // //       return n;
// // // //     });

// // // //   const moveToStage = async (admissionUuid, stageName) => {
// // // //     const nextStage = stages.find((s) => s.stage_name === stageName);
// // // //     if (!nextStage) return;
// // // //     const res = await enrollStudent(admissionUuid, nextStage.id);
// // // //     toast.success(res.data.message || `Moved to ${stageName}`);
// // // //   };

// // // //   const onDrop = async (stageName) => {
// // // //     if (!dragItem) return;
// // // //     try {
// // // //       await moveToStage(dragItem.admission_uuid, stageName);
// // // //       setDragItem(null);
// // // //       loadData();
// // // //     } catch (err) {
// // // //       toast.error(getApiErrorMessage(err, "Failed to move stage"));
// // // //     }
// // // //   };

// // // //   const bulkMove = async (stageName) => {
// // // //     try {
// // // //       const nextStage = stages.find((s) => s.stage_name === stageName);
// // // //       if (!nextStage) return;

// // // //       for (const id of selected) {
// // // //         const student = allAdmissions.find((a) => a.id === id);
// // // //         if (student) await enrollStudent(student.admission_uuid, nextStage.id);
// // // //       }

// // // //       toast.success(`${selected.size} moved successfully`);
// // // //       setSelected(new Set());
// // // //       loadData();
// // // //     } catch (err) {
// // // //       toast.error("Failed to move stage");
// // // //     }
// // // //   };

// // // //   const confirmReject = async () => {
// // // //     if (!rejectFor) return;

// // // //     if (!rejectReason.trim()) {
// // // //       toast.error("Reason is required");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       const res = await rejectAdmission(
// // // //         rejectFor.admission_uuid,
// // // //         rejectReason.trim()
// // // //       );

// // // //       toast.success(
// // // //         res.data?.message || "Admission rejected successfully."
// // // //       );

// // // //       setRejectFor(null);
// // // //       setRejectReason("");

// // // //       await loadData();

// // // //     } catch (err) {
// // // //       toast.error(getApiErrorMessage(err, "Failed to reject admission."));
// // // //     }
// // // //   };

// // // //   const reinstate = async (admission) => {
// // // //     try {
// // // //       const res = await reinstateAdmission(
// // // //         admission.admission_uuid
// // // //       );

// // // //       toast.success(
// // // //         res.data?.message ||
// // // //         `${admission.full_name} reinstated successfully.`
// // // //       );

// // // //       await loadData();

// // // //     } catch (err) {
// // // //       toast.error(getApiErrorMessage(err, "Failed to reinstate admission."));
// // // //     }
// // // //   };

// // // //   const submitPublicForm = async () => {
// // // //     try {
// // // //       const fullName = publicForm.name.trim();
// // // //       const phone = publicForm.phone.trim();

// // // //       if (!fullName) {
// // // //         toast.error("Full Name is required");
// // // //         return;
// // // //       }

// // // //       if (!phone) {
// // // //         toast.error("Phone is required");
// // // //         return;
// // // //       }

// // // //       if (!publicForm.class_uuid) {
// // // //         toast.error("Please select a class");
// // // //         return;
// // // //       }

// // // //       if (!publicForm.consent) {
// // // //         toast.error("Please accept the consent");
// // // //         return;
// // // //       }

// // // //       if (!instituteUUID) {
// // // //         toast.error("Institute context missing. Please re-login and try again.");
// // // //         return;
// // // //       }

// // // //       const payload = {
// // // //         institute_uuid: instituteUUID,
// // // //         full_name: fullName,
// // // //         email: publicForm.email.trim() || null,
// // // //         primary_phone: phone,
// // // //         address: publicForm.location.trim() || null,
// // // //         prev_school: publicForm.school.trim() || null,
// // // //         parent_name: publicForm.parent.trim() || null,
// // // //         class_uuid: publicForm.class_uuid,
// // // //         source_name: "Website",
// // // //         notes: [
// // // //           publicForm.occupation.trim()
// // // //             ? `Parent occupation: ${publicForm.occupation.trim()}`
// // // //             : "",
// // // //           publicForm.notes.trim() ? publicForm.notes.trim() : "",
// // // //         ]
// // // //           .filter(Boolean)
// // // //           .join("\n") || null,
// // // //       };

// // // //       console.log("Creating public admission:", payload);

// // // //       const response = await createAdmission(payload);

// // // //       toast.success(
// // // //         response?.data?.message || "Admission enquiry submitted successfully"
// // // //       );

// // // //       setFormOpen(false);
// // // //       setPublicForm({
// // // //         name: "",
// // // //         email: "",
// // // //         phone: "",
// // // //         location: "",
// // // //         school: "",
// // // //         parent: "",
// // // //         occupation: "",
// // // //         class_uuid: "",
// // // //         notes: "",
// // // //         consent: false,
// // // //       });

// // // //       await loadData();
// // // //     } catch (err) {
// // // //       console.error("Public admission error:", err);
// // // //       toast.error(getApiErrorMessage(err, "Failed to submit admission form"));
// // // //     }
// // // //   };

// // // //   // Bulk import rows coming from the Excel upload widget. Expects a header
// // // //   // row of: Name, Class, Phone, Email, Source, Counselor (edit templateHeaders
// // // //   // below to match whatever columns your backend's bulk-import endpoint wants).
// // // //   const bulkImportRows = async (rows) => {
// // // //     let added = 0;
// // // //     let failed = 0;
// // // //     for (const r of rows) {
// // // //       const name = r["Name"]?.trim();
// // // //       if (!name) continue;
// // // //       try {
// // // //         if (!instituteUUID) {
// // // //           throw new Error("Institute context missing");
// // // //         }

// // // //         await createAdmission({
// // // //           institute_uuid: instituteUUID,
// // // //           full_name: name,
// // // //           class_name: r["Class"] || undefined,
// // // //           primary_phone: r["Phone"] || null,
// // // //           email: r["Email"] || null,
// // // //           source_name: r["Source"] || "Walk-in",
// // // //           counselor_name: r["Counselor"] || undefined,
// // // //         });
// // // //         added++;
// // // //       } catch (err) {
// // // //         failed++;
// // // //       }
// // // //     }
// // // //     if (added) toast.success(`${added} inquiries imported`);
// // // //     if (failed) toast.error(`${failed} rows failed to import`);
// // // //     loadData();
// // // //   };

// // // //   // ---- analytics ----
// // // //   // Calculate analytics from ACTIVE admissions only.
// // // //   const activeAdmissions = useMemo(
// // // //     () => allAdmissions.filter(
// // // //       (a) => String(a.status || "").toUpperCase() === "ACTIVE"
// // // //     ),
// // // //     [allAdmissions]
// // // //   );

// // // //   // Stage counts scoped to ACTIVE-only admissions — used by the analytics
// // // //   // "Stage Funnel" chart below. (Distinct from pipelineStageCounts, which
// // // //   // intentionally also includes TRANSFERRED + REJECTED for the Kanban
// // // //   // column badges — see STATUS VISIBILITY RULES above.)
// // // //   const activeStageCounts = useMemo(() => {
// // // //     const counts = {};

// // // //     activeAdmissions.forEach((admission) => {
// // // //       const stageName =
// // // //         admission.stage_name ||
// // // //         stages.find(
// // // //           (s) => String(s.id) === String(admission.stage_id)
// // // //         )?.stage_name;

// // // //       if (!stageName) return;

// // // //       counts[stageName] = (counts[stageName] || 0) + 1;
// // // //     });

// // // //     return counts;
// // // //   }, [activeAdmissions, stages]);

// // // //   const counts = useMemo(
// // // //     () =>
// // // //       pipelineData.map((stage) => ({
// // // //         stage: stage.stage_name,
// // // //         n: activeStageCounts[stage.stage_name] || 0,
// // // //       })),
// // // //     [pipelineData, activeStageCounts]
// // // //   );

// // // //   const total = activeAdmissions.length;

// // // //   const enrolledStageId = stages.find(
// // // //     (s) => s.stage_name === "Enrolled"
// // // //   )?.id;

// // // //   const enrolled = activeAdmissions.filter(
// // // //     (a) =>
// // // //       a.stage_name === "Enrolled" ||
// // // //       a.stage_id === enrolledStageId
// // // //   ).length;

// // // //   const convRate = total
// // // //     ? Number(((enrolled / total) * 100).toFixed(2))
// // // //     : 0;

// // // //   const bySource = useMemo(() => {
// // // //     const sourceMap = {};

// // // //     activeAdmissions.forEach((admission) => {
// // // //       const source = admission.source_name || "Unknown";
// // // //       sourceMap[source] = (sourceMap[source] || 0) + 1;
// // // //     });

// // // //     return Object.entries(sourceMap).map(([source, count]) => ({
// // // //       source,
// // // //       count,
// // // //     }));
// // // //   }, [activeAdmissions]);

// // // //   return (
// // // //     <PageContainer>
// // // //       <PageHeader
// // // //         eyebrow="Admin · Academic"
// // // //         title="Admissions Pipeline"
// // // //         description="Drag prospects across stages. Click any card to open the full counseling, document, payment and communication record."
// // // //         actions={
// // // //           <>
// // // //             <ExcelExport
// // // //               rows={allAdmissions}
// // // //               fileName="admissions.xlsx"
// // // //               columns={[
// // // //                 { header: "ID", accessor: (r) => r.id },
// // // //                 { header: "Name", accessor: (r) => r.full_name },
// // // //                 { header: "Class", accessor: (r) => r.class_name },
// // // //                 { header: "Phone", accessor: (r) => r.primary_phone },
// // // //                 { header: "Email", accessor: (r) => r.email },
// // // //                 { header: "Source", accessor: (r) => r.source_name },
// // // //                 { header: "Stage", accessor: (r) => r.stage_name },
// // // //                 { header: "Counselor", accessor: (r) => r.counselor_name ?? "" },
// // // //               ]}
// // // //             />
// // // //             <ExcelUpload
// // // //               label="Bulk Upload"
// // // //               templateName="admissions-template.xlsx"
// // // //               templateHeaders={["Name", "Class", "Phone", "Email", "Source", "Counselor"]}
// // // //               onRows={bulkImportRows}
// // // //             />
// // // //             <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
// // // //               <FileText className="h-4 w-4" />
// // // //               Public Form
// // // //             </Button>
// // // //             <NewInquiryDialog
// // // //               trigger={
// // // //                 <Button size="sm" className="gradient-primary border-0">
// // // //                   <Plus className="h-4 w-4" />
// // // //                   New Inquiry
// // // //                 </Button>
// // // //               }
// // // //               onCreate={async () => {
// // // //                 await loadData();
// // // //               }}
// // // //             />
// // // //           </>
// // // //         }
// // // //       />

// // // //       <Tabs value={tab} onValueChange={setTab} className="mb-4">
// // // //         <TabsList>
// // // //           <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
// // // //           <TabsTrigger value="forms">Forms</TabsTrigger>
// // // //           <TabsTrigger value="test">Admission Test</TabsTrigger>
// // // //           <TabsTrigger value="rejected">
// // // //             Rejected ({rejectedTotal})
// // // //           </TabsTrigger>
// // // //           <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
// // // //         </TabsList>

// // // //         {/* ---------------- PIPELINE ---------------- */}
// // // //         <TabsContent value="pipeline" className="mt-4 space-y-4">
// // // //           <div className="flex flex-wrap items-center gap-2">
// // // //             <div className="relative" ref={searchBoxRef}>
// // // //               <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
// // // //               <Input
// // // //                 value={q}
// // // //                 onChange={(e) => {
// // // //                   setQ(e.target.value);
// // // //                   setSuggestOpen(true);
// // // //                   setSuggestIndex(-1);
// // // //                 }}
// // // //                 onFocus={() => setSuggestOpen(true)}
// // // //                 onKeyDown={handleSearchKeyDown}
// // // //                 placeholder="Search name / phone…"
// // // //                 className="pl-8 h-9 w-64"
// // // //                 autoComplete="off"
// // // //               />
// // // //               {suggestOpen && nameSuggestions.length > 0 && (
// // // //                 <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-md border bg-popover shadow-lg overflow-hidden py-1">
// // // //                   {nameSuggestions.map((name, idx) => (
// // // //                     <button
// // // //                       type="button"
// // // //                       key={name}
// // // //                       onMouseDown={(e) => {
// // // //                         e.preventDefault();
// // // //                         chooseSuggestion(name);
// // // //                       }}
// // // //                       onMouseEnter={() => setSuggestIndex(idx)}
// // // //                       className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
// // // //                         idx === suggestIndex
// // // //                           ? "bg-muted"
// // // //                           : "hover:bg-muted/60"
// // // //                       }`}
// // // //                     >
// // // //                       <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
// // // //                       <span className="truncate text-foreground/90">
// // // //                         {highlightMatch(name)}
// // // //                       </span>
// // // //                     </button>
// // // //                   ))}
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //             <Select value={src} onValueChange={setSrc}>
// // // //               <SelectTrigger className="h-9 w-40">
// // // //                 <SelectValue placeholder="Source" />
// // // //               </SelectTrigger>
// // // //               <SelectContent>
// // // //                 <SelectItem value="all">All sources</SelectItem>
// // // //                 {sources.map((s) => (
// // // //                   <SelectItem key={s.id} value={s.name}>
// // // //                     {s.name}
// // // //                   </SelectItem>
// // // //                 ))}
// // // //               </SelectContent>
// // // //             </Select>
// // // //             <Select value={counselor} onValueChange={setCounselor}>
// // // //               <SelectTrigger className="h-9 w-40">
// // // //                 <SelectValue placeholder="Counselor" />
// // // //               </SelectTrigger>
// // // //               <SelectContent>
// // // //                 <SelectItem value="all">All counselors</SelectItem>
// // // //                 {counselors.map((c) => (
// // // //                   <SelectItem key={c.id} value={c.counselor_name}>
// // // //                     {c.counselor_name}
// // // //                   </SelectItem>
// // // //                 ))}
// // // //               </SelectContent>
// // // //             </Select>
// // // //             {selected.size > 0 && (
// // // //               <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
// // // //                 <span className="text-xs font-medium">
// // // //                   {selected.size} selected
// // // //                 </span>
// // // //                 <Select onValueChange={(v) => bulkMove(v)}>
// // // //                   <SelectTrigger className="h-7 w-36 text-xs">
// // // //                     <SelectValue placeholder="Move to…" />
// // // //                   </SelectTrigger>
// // // //                   <SelectContent>
// // // //                     {stages.map((s) => (
// // // //                       <SelectItem key={s.id} value={s.stage_name}>
// // // //                         {s.stage_name}
// // // //                       </SelectItem>
// // // //                     ))}
// // // //                   </SelectContent>
// // // //                 </Select>
// // // //                 <Button
// // // //                   size="sm"
// // // //                   variant="ghost"
// // // //                   className="h-7 text-xs"
// // // //                   onClick={() => {
// // // //                     toast.success(`Bulk SMS to ${selected.size}`);
// // // //                     setSelected(new Set());
// // // //                   }}
// // // //                 >
// // // //                   <Send className="h-3 w-3" />
// // // //                   SMS
// // // //                 </Button>
// // // //                 <Button
// // // //                   size="sm"
// // // //                   variant="ghost"
// // // //                   className="h-7 text-xs text-destructive"
// // // //                   onClick={() => {
// // // //                     selected.forEach((id) => {
// // // //                       const student = allAdmissions.find((a) => a.id === id);
// // // //                       if (student) setRejectFor(student);
// // // //                     });
// // // //                     setSelected(new Set());
// // // //                   }}
// // // //                 >
// // // //                   <Trash2 className="h-3 w-3" />
// // // //                 </Button>
// // // //               </div>
// // // //             )}
// // // //           </div>

// // // //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
// // // //             {pipelineData.map((stage) => (
// // // //               <Card
// // // //                 key={stage.stage_name}
// // // //                 role="button"
// // // //                 tabIndex={0}
// // // //                 onClick={() => openStage(stage.stage_name)}
// // // //                 onKeyDown={(e) => {
// // // //                   if (e.key === "Enter") openStage(stage.stage_name);
// // // //                 }}
// // // //                 title={`Open ${stage.stage_name} table`}
// // // //                 className={`cursor-pointer transition hover:shadow-sm ${
// // // //                   stage.stage_name === "Rejected"
// // // //                     ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
// // // //                     : "border-border/60 hover:border-primary/50"
// // // //                 }`}
// // // //               >
// // // //                 <CardContent className="p-3">
// // // //                   <div
// // // //                     className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
// // // //                       stage.stage_name === "Rejected"
// // // //                         ? "text-destructive"
// // // //                         : "text-muted-foreground"
// // // //                     }`}
// // // //                   >
// // // //                     {stage.stage_name === "Rejected" && (
// // // //                       <XCircle className="h-3 w-3" />
// // // //                     )}
// // // //                     {stage.stage_name}
// // // //                   </div>

// // // //                   <div
// // // //                     className={`text-2xl font-display font-semibold mt-1 ${
// // // //                       stage.stage_name === "Rejected"
// // // //                         ? "text-destructive"
// // // //                         : ""
// // // //                     }`}
// // // //                   >
// // // //                     {pipelineStageCounts[stage.stage_name] || 0}
// // // //                   </div>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             ))}

// // // //           </div>

// // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
// // // //             {pipelineData.map((stage) => {
// // // //               const items =
// // // //                 stage.stage_name === "Rejected"
// // // //                   ? rejectedList
// // // //                   : cards.filter(
// // // //                       (c) => c.stage_name === stage.stage_name
// // // //                     );
// // // //               return (
// // // //                 <Card
// // // //                   key={stage.stage_name}
// // // //                   className="border-border/60 bg-muted/20"
// // // //                 >
// // // //                   <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// // // //                     <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
// // // //                       {stage.stage_name}
// // // //                     </CardTitle>
// // // //                     <Badge variant="outline" className="text-[10px]">
// // // //                       {items.length}
// // // //                     </Badge>
// // // //                   </CardHeader>
// // // //                   <CardContent
// // // //                     className="space-y-2 max-h-[560px] overflow-y-auto p-2"
// // // //                     onDragOver={(e) => e.preventDefault()}
// // // //                     onDrop={() => {

// // // //                       if (
// // // //                         stage.stage_name === "Rejected"
// // // //                       ) {

// // // //                         setRejectFor(dragItem);
// // // //                         setRejectReason("");

// // // //                         return;
// // // //                       }

// // // //                       onDrop(stage.stage_name);

// // // //                     }}
// // // //                   >
// // // //                     {items.length === 0 && (
// // // //                       <div className="text-xs text-muted-foreground text-center py-6">
// // // //                         Drop here
// // // //                       </div>
// // // //                     )}
// // // //                     {items.map((c) => {
// // // //                       const stageIdx = stages.findIndex(
// // // //                         (s) => s.stage_name === stage.stage_name,
// // // //                       );
// // // //                       const rawNext = stages[stageIdx + 1]?.stage_name;
// // // //                       // Never surface a "next stage" button on terminal
// // // //                       // stages (Enrolled has nowhere to go), and never let
// // // //                       // "next" resolve to Rejected — rejection only ever
// // // //                       // happens through the explicit reject flow.
// // // //                       const next = TERMINAL_STAGES.includes(stage.stage_name)
// // // //                         ? undefined
// // // //                         : rawNext === "Rejected"
// // // //                         ? undefined
// // // //                         : rawNext;
// // // //                       return (
// // // //                         <div
// // // //                           key={c.id}
// // // //                           draggable={stage.stage_name !== "Rejected"}
// // // //                           onDragStart={() => setDragItem(c)}
// // // //                           className={`bg-card border border-l-4 ${stageColor[stage.stage_name]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${selected.has(c.id) ? "ring-2 ring-primary" : ""}`}
// // // //                           onClick={(e) => {
// // // //                             if (e.target.closest("[data-stop]")) return;
// // // //                             navigate(`/admin/admissions/${c.admission_uuid}`);
// // // //                           }}
// // // //                         >
// // // //                           <div className="flex items-start gap-2.5">
// // // //                             {stage.stage_name !== "Rejected" && (
// // // //                               <div
// // // //                                 data-stop
// // // //                                 onClick={(e) => e.stopPropagation()}
// // // //                               >
// // // //                                 <Checkbox
// // // //                                   checked={selected.has(c.id)}
// // // //                                   onCheckedChange={() => toggleSel(c.id)}
// // // //                                 />
// // // //                               </div>
// // // //                             )}
// // // //                             <Avatar className="h-8 w-8 shrink-0">
// // // //                               {c.passport_photo_file ? (
// // // //                                 <AvatarImage
// // // //                                   src={c.passport_photo_file}
// // // //                                   alt={c.full_name}
// // // //                                   className="object-cover"
// // // //                                 />
// // // //                               ) : (
// // // //                                 <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
// // // //                                   {c.full_name
// // // //                                     ?.split(" ")
// // // //                                     .map((n) => n[0])
// // // //                                     .join("")}
// // // //                                 </AvatarFallback>
// // // //                               )}
// // // //                             </Avatar>
// // // //                             <div className="min-w-0 flex-1">
// // // //                               <div className="text-sm font-medium truncate">
// // // //                                 {c.full_name}
// // // //                               </div>
// // // //                               <div className="text-[10px] text-muted-foreground">
// // // //                                 Class {c.class_name} · {c.source_name}
// // // //                               </div>
// // // //                             </div>
// // // //                           </div>
// // // //                           <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
// // // //                             {stage.stage_name === "Rejected" && (
// // // //                               <>
// // // //                                 <div
// // // //                                   data-stop
// // // //                                   className="text-xs text-destructive cursor-pointer hover:underline truncate"
// // // //                                   onClick={(e) => {
// // // //                                     e.stopPropagation();
// // // //                                     setViewReasonFor(c);
// // // //                                   }}
// // // //                                   title="Click to view full rejection reason"
// // // //                                 >
// // // //                                   Reason : {c.rejection_reason || "-"}
// // // //                                 </div>

// // // //                                 <div className="text-xs text-muted-foreground">
// // // //                                   Rejected :
// // // //                                   {
// // // //                                     c.rejected_at
// // // //                                       ? new Date(
// // // //                                           c.rejected_at
// // // //                                         ).toLocaleDateString()
// // // //                                       : "-"
// // // //                                   }
// // // //                                 </div>
// // // //                               </>
// // // //                             )}
// // // //                             <div className="flex items-center gap-1.5">
// // // //                               <Phone className="h-3 w-3" />
// // // //                               {c.primary_phone}
// // // //                             </div>
// // // //                             <div className="flex items-center gap-1.5 truncate">
// // // //                               <Mail className="h-3 w-3 shrink-0" />
// // // //                               <span className="truncate">{c.email}</span>
// // // //                             </div>
// // // //                             {c.counselor_name && (
// // // //                               <div className="text-[10px]">
// // // //                                 👤 {c.counselor_name}
// // // //                               </div>
// // // //                             )}
// // // //                           </div>
// // // //                           <div
// // // //                             className="flex items-center justify-between mt-2.5 pt-2 border-t gap-1"
// // // //                             data-stop
// // // //                             onClick={(e) => e.stopPropagation()}
// // // //                           >

// // // //                             {stage.stage_name === "Rejected" && (

// // // //                               <Button
// // // //                                 size="sm"
// // // //                                 variant="outline"
// // // //                                 onClick={() => reinstate(c)}
// // // //                               >
// // // //                                 <RotateCcw
// // // //                                   className="h-3 w-3"
// // // //                                 />

// // // //                                 Reinstate

// // // //                               </Button>

// // // //                             )}
// // // //                             <span className="text-[10px] text-muted-foreground">
// // // //                               {new Date(c.created_at).toLocaleDateString()}
// // // //                             </span>
// // // //                             <div className="flex items-center gap-0.5">
// // // //                               {stage.stage_name !== "Rejected" && (
// // // //                                 <Button
// // // //                                   size="sm"
// // // //                                   variant="ghost"
// // // //                                   className="h-6 px-2 text-[10px]
// // // //                                       text-destructive"
// // // //                                   onClick={() => {
// // // //                                     setRejectFor(c);
// // // //                                     setRejectReason("");
// // // //                                   }}
// // // //                                 >
// // // //                                   <XCircle className="h-3 w-3" />
// // // //                                 </Button>
// // // //                               )}
// // // //                               {stage.stage_name !== "Rejected" && next && (
// // // //                                 <Button
// // // //                                   size="sm"
// // // //                                   variant="ghost"
// // // //                                   className="h-6 px-2 text-[10px]"
// // // //                                   onClick={async () => {
// // // //                                     try {
// // // //                                       await moveToStage(c.admission_uuid, next);
// // // //                                       loadData();
// // // //                                     } catch (err) {
// // // //                                       toast.error(
// // // //                                         getApiErrorMessage(err, "Failed to move stage"),
// // // //                                       );
// // // //                                     }
// // // //                                   }}
// // // //                                 >
// // // //                                   {next.split(" ")[0]}
// // // //                                   <ArrowRight className="h-3 w-3" />
// // // //                                 </Button>
// // // //                               )}
// // // //                             </div>
// // // //                           </div>
// // // //                         </div>
// // // //                       );
// // // //                     })}
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               );
// // // //             })}
// // // //           </div>
// // // //         </TabsContent>

// // // //         {/* ---------------- FORMS ---------------- */}
// // // //         <TabsContent value="forms" className="mt-4 space-y-3">
// // // //           <Card>
// // // //             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// // // //               <CardTitle className="text-base flex items-center gap-2">
// // // //                 <FileText className="h-4 w-4" />
// // // //                 Admission Forms Received
// // // //               </CardTitle>
// // // //               <Select value={stageFilter} onValueChange={setStageFilter}>
// // // //                 <SelectTrigger className="h-8 w-44 text-xs">
// // // //                   <SelectValue placeholder="Filter by stage" />
// // // //                 </SelectTrigger>
// // // //                 <SelectContent>
// // // //                   <SelectItem value="all">All stages</SelectItem>
// // // //                   {stageNames.map((s) => (
// // // //                     <SelectItem key={s} value={s}>
// // // //                       {s}
// // // //                     </SelectItem>
// // // //                   ))}
// // // //                 </SelectContent>
// // // //               </Select>
// // // //             </CardHeader>
// // // //             <CardContent className="p-0">
// // // //               <Table>
// // // //                 <TableHeader>
// // // //                   <TableRow>
// // // //                     <TableHead>ID</TableHead>
// // // //                     <TableHead>Applicant</TableHead>
// // // //                     <TableHead>Class</TableHead>
// // // //                     <TableHead>Contact</TableHead>
// // // //                     <TableHead>Stage</TableHead>
// // // //                     <TableHead>Source</TableHead>
// // // //                     <TableHead>Received</TableHead>
// // // //                     <TableHead className="text-right">Action</TableHead>
// // // //                   </TableRow>
// // // //                 </TableHeader>
// // // //                 <TableBody>
// // // //                   {allAdmissions
// // // //                     .filter(
// // // //                       (i) =>
// // // //                         String(i.status || "").toUpperCase() === "ACTIVE" &&
// // // //                         Number(i.stage_id) !== 8 &&
// // // //                         (stageFilter === "all" ||
// // // //                           i.stage_name === stageFilter)
// // // //                     )
// // // //                     .sort(byNameAsc)
// // // //                     .map((i) => (
// // // //                       <TableRow
// // // //                         key={i.id}
// // // //                         className="cursor-pointer"
// // // //                         onClick={() => setViewForm(i)}
// // // //                       >
// // // //                         <TableCell className="font-mono text-xs">
// // // //                           {i.id}
// // // //                         </TableCell>
// // // //                         <TableCell className="font-medium">
// // // //                           {i.full_name}
// // // //                         </TableCell>
// // // //                         <TableCell>{i.class_name}</TableCell>
// // // //                         <TableCell className="text-xs">
// // // //                           {i.primary_phone}
// // // //                         </TableCell>
// // // //                         <TableCell>
// // // //                           <Badge variant="secondary" className="text-[10px]">
// // // //                             {i.stage_name}
// // // //                           </Badge>
// // // //                         </TableCell>
// // // //                         <TableCell>
// // // //                           <Badge variant="outline">{i.source_name}</Badge>
// // // //                         </TableCell>
// // // //                         <TableCell className="text-xs text-muted-foreground">
// // // //                           {new Date(i.created_at).toLocaleDateString()}
// // // //                         </TableCell>
// // // //                         <TableCell
// // // //                           className="text-right"
// // // //                           onClick={(e) => e.stopPropagation()}
// // // //                         >
// // // //                           <Button
// // // //                             size="sm"
// // // //                             variant="ghost"
// // // //                             onClick={() => setViewForm(i)}
// // // //                           >
// // // //                             <Eye className="h-3.5 w-3.5" />
// // // //                             View
// // // //                           </Button>
// // // //                           <Button
// // // //                             size="sm"
// // // //                             variant="ghost"
// // // //                             className="text-destructive"
// // // //                             onClick={() => {
// // // //                               setRejectFor(i);
// // // //                               setRejectReason("");
// // // //                             }}
// // // //                           >
// // // //                             <XCircle className="h-3.5 w-3.5" />
// // // //                             Reject
// // // //                           </Button>
// // // //                         </TableCell>
// // // //                       </TableRow>
// // // //                     ))}
// // // //                 </TableBody>
// // // //               </Table>
// // // //             </CardContent>
// // // //           </Card>
// // // //         </TabsContent>

// // // //         {/* ---------------- REJECTED ---------------- */}
// // // //         <TabsContent value="rejected" className="mt-4 space-y-3">
// // // //           <Card>
// // // //             <CardHeader className="pb-2">
// // // //               <CardTitle className="text-base flex items-center gap-2 text-destructive">
// // // //                 <XCircle className="h-4 w-4" />
// // // //                 Rejected Inquiries
// // // //               </CardTitle>
// // // //             </CardHeader>
// // // //             <CardContent className="p-0">
// // // //               <Table>
// // // //                 <TableHeader>
// // // //                   <TableRow>
// // // //                     <TableHead>ID</TableHead>
// // // //                     <TableHead>Applicant</TableHead>
// // // //                     <TableHead>Class</TableHead>
// // // //                     <TableHead>Reason</TableHead>
// // // //                     <TableHead>Rejected On</TableHead>
// // // //                     <TableHead className="text-right">Action</TableHead>
// // // //                   </TableRow>
// // // //                 </TableHeader>
// // // //                 <TableBody>
// // // //                   {rejectedList.length === 0 && (
// // // //                     <TableRow>
// // // //                       <TableCell
// // // //                         colSpan={6}
// // // //                         className="text-center text-sm text-muted-foreground py-8"
// // // //                       >
// // // //                         No rejected inquiries.
// // // //                       </TableCell>
// // // //                     </TableRow>
// // // //                   )}
// // // //                   {rejectedList.map((i) => (
// // // //                     <TableRow key={i.id}>
// // // //                       <TableCell className="font-mono text-xs">
// // // //                         {i.id}
// // // //                       </TableCell>
// // // //                       <TableCell className="font-medium">
// // // //                         {i.full_name}
// // // //                         <div className="text-[10px] text-muted-foreground">
// // // //                           {i.primary_phone}
// // // //                         </div>
// // // //                       </TableCell>
// // // //                       <TableCell>{i.class_name}</TableCell>
// // // //                       <TableCell
// // // //                         className="text-xs max-w-md cursor-pointer hover:underline"
// // // //                         onClick={() => setViewReasonFor(i)}
// // // //                         title="Click to view full rejection reason"
// // // //                       >
// // // //                         <span className="line-clamp-2">
// // // //                           {i.rejection_reason || "—"}
// // // //                         </span>
// // // //                       </TableCell>
// // // //                       <TableCell className="text-xs text-muted-foreground">
// // // //                         {i.rejected_at
// // // //                           ? new Date(i.rejected_at).toLocaleDateString()
// // // //                           : "—"}
// // // //                       </TableCell>
// // // //                       <TableCell className="text-right">
// // // //                         <Button
// // // //                           size="sm"
// // // //                           variant="outline"
// // // //                           onClick={() => reinstate(i)}
// // // //                         >
// // // //                           <RotateCcw className="h-3.5 w-3.5" />
// // // //                           Reinstate
// // // //                         </Button>
// // // //                       </TableCell>
// // // //                     </TableRow>
// // // //                   ))}
// // // //                 </TableBody>
// // // //               </Table>
// // // //             </CardContent>
// // // //           </Card>
// // // //         </TabsContent>

// // // //         {/* ---------------- ADMISSION TEST ---------------- */}
// // // //         <TabsContent value="test" className="mt-4 space-y-3">
// // // //           <Card>
// // // //             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// // // //               <CardTitle className="text-base flex items-center gap-2">
// // // //                 <ClipboardCheck className="h-4 w-4" />
// // // //                 Admission Test Results
// // // //               </CardTitle>
// // // //               <Select value={testFilter} onValueChange={setTestFilter}>
// // // //                 <SelectTrigger className="h-8 w-44 text-xs">
// // // //                   <SelectValue placeholder="Filter" />
// // // //                 </SelectTrigger>
// // // //                 <SelectContent>
// // // //                   <SelectItem value="all">All scores</SelectItem>
// // // //                   <SelectItem value="85">85 – 100% (Excellent)</SelectItem>
// // // //                   <SelectItem value="70">70 – 85% (Good)</SelectItem>
// // // //                   <SelectItem value="50">50 – 70% (Average)</SelectItem>
// // // //                   <SelectItem value="0">Below 50% (Weak)</SelectItem>
// // // //                   <SelectItem value="pending">Not attempted</SelectItem>
// // // //                 </SelectContent>
// // // //               </Select>
// // // //             </CardHeader>
// // // //             <CardContent className="p-0">
// // // //               <Table>
// // // //                 <TableHeader>
// // // //                   <TableRow>
// // // //                     <TableHead>ID</TableHead>
// // // //                     <TableHead>Candidate</TableHead>
// // // //                     <TableHead>Class</TableHead>
// // // //                     <TableHead>Score</TableHead>
// // // //                     <TableHead>Grade</TableHead>
// // // //                     <TableHead>Stage</TableHead>
// // // //                   </TableRow>
// // // //                 </TableHeader>
// // // //                 <TableBody>
// // // //                   {allAdmissions
// // // //                     .filter((i) => {
// // // //                       // Only ACTIVE admissions are shown.
// // // //                       if (String(i.status || "").toUpperCase() !== "ACTIVE") return false;

// // // //                       // `test_score` is not part of the current admissions
// // // //                       // API response — add it server-side to populate this tab.
// // // //                       const s = i.test_score;
// // // //                       if (testFilter === "all") return true;
// // // //                       if (testFilter === "pending") return s == null;
// // // //                       if (s == null) return false;
// // // //                       const min = Number(testFilter);
// // // //                       const max =
// // // //                         min === 85 ? 100 : min === 70 ? 85 : min === 50 ? 70 : 50;
// // // //                       return s >= min && s < max + (min === 85 ? 1 : 0);
// // // //                     })
// // // //                     .sort(byNameAsc)
// // // //                     .map((i) => {
// // // //                       const s = i.test_score;
// // // //                       const grade =
// // // //                         s == null ? "—" : s >= 85 ? "A+" : s >= 70 ? "A" : s >= 50 ? "B" : "C";
// // // //                       const tone =
// // // //                         s == null ? "outline" : s >= 70 ? "default" : s >= 50 ? "secondary" : "destructive";
// // // //                       return (
// // // //                         <TableRow key={i.id}>
// // // //                           <TableCell className="font-mono text-xs">
// // // //                             {i.id}
// // // //                           </TableCell>
// // // //                           <TableCell className="font-medium">
// // // //                             {i.full_name}
// // // //                           </TableCell>
// // // //                           <TableCell>{i.class_name}</TableCell>
// // // //                           <TableCell className="font-semibold">
// // // //                             {s ?? "—"}
// // // //                             {s != null && "%"}
// // // //                           </TableCell>
// // // //                           <TableCell>
// // // //                             <Badge variant={tone}>{grade}</Badge>
// // // //                           </TableCell>
// // // //                           <TableCell>
// // // //                             <span className="text-xs text-muted-foreground">
// // // //                               {i.stage_name}
// // // //                             </span>
// // // //                           </TableCell>
// // // //                         </TableRow>
// // // //                       );
// // // //                     })}
// // // //                 </TableBody>
// // // //               </Table>
// // // //             </CardContent>
// // // //           </Card>
// // // //         </TabsContent>

// // // //         {/* ---------------- ANALYTICS ---------------- */}
// // // //         <TabsContent value="analytics" className="mt-4">
// // // //           <div className="grid md:grid-cols-3 gap-4 mb-4">
// // // //             <Card>
// // // //               <CardContent className="p-4">
// // // //                 <div className="text-xs text-muted-foreground">
// // // //                   Total Inquiries
// // // //                 </div>
// // // //                 <div className="text-3xl font-display font-semibold mt-1">
// // // //                   {total}
// // // //                 </div>
// // // //               </CardContent>
// // // //             </Card>
// // // //             <Card>
// // // //               <CardContent className="p-4">
// // // //                 <div className="text-xs text-muted-foreground">Enrolled</div>
// // // //                 <div className="text-3xl font-display font-semibold mt-1 text-success">
// // // //                   {enrolled}
// // // //                 </div>
// // // //               </CardContent>
// // // //             </Card>
// // // //             <Card>
// // // //               <CardContent className="p-4">
// // // //                 <div className="text-xs text-muted-foreground flex items-center gap-1">
// // // //                   <TrendingUp className="h-3 w-3" />
// // // //                   Conversion Rate
// // // //                 </div>
// // // //                 <div className="text-3xl font-display font-semibold mt-1">
// // // //                   {convRate}%
// // // //                 </div>
// // // //               </CardContent>
// // // //             </Card>
// // // //           </div>
// // // //           <Card className="mb-4">
// // // //             <CardHeader>
// // // //               <CardTitle className="text-base">Stage Funnel</CardTitle>
// // // //             </CardHeader>
// // // //             <CardContent className="space-y-2">
// // // //               {counts.map((c) => (
// // // //                 <div key={c.stage} className="flex items-center gap-3">
// // // //                   <div className="w-32 text-xs text-muted-foreground">
// // // //                     {c.stage}
// // // //                   </div>
// // // //                   <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
// // // //                     <div
// // // //                       className="h-full bg-gradient-to-r from-primary to-accent"
// // // //                       style={{ width: `${total ? (c.n / total) * 100 : 0}%` }}
// // // //                     />
// // // //                   </div>
// // // //                   <div className="w-12 text-right text-sm font-medium">
// // // //                     {c.n}
// // // //                   </div>
// // // //                 </div>
// // // //               ))}
// // // //             </CardContent>
// // // //           </Card>
// // // //           <Card>
// // // //             <CardHeader>
// // // //               <CardTitle className="text-base">By Source</CardTitle>
// // // //             </CardHeader>
// // // //             <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
// // // //               {bySource.map((s) => (
// // // //                 <div key={s.source} className="p-3 border rounded-md">
// // // //                   <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
// // // //                     {s.source}
// // // //                   </div>
// // // //                   <div className="text-xl font-display font-semibold mt-1">
// // // //                     {s.count}
// // // //                   </div>
// // // //                 </div>
// // // //               ))}
// // // //             </CardContent>
// // // //           </Card>
// // // //         </TabsContent>
// // // //       </Tabs>

// // // //       {/* Public Admission Form */}
// // // //       <Dialog open={formOpen} onOpenChange={setFormOpen}>
// // // //         <DialogContent className="max-w-lg">
// // // //           <DialogHeader>
// // // //             <DialogTitle>Public Admission Form</DialogTitle>
// // // //             <DialogDescription>
// // // //               Minimum details to register an enquiry.
// // // //             </DialogDescription>
// // // //           </DialogHeader>
// // // //           <div className="grid grid-cols-2 gap-3">
// // // //             <div className="col-span-2">
// // // //               <Label>Full Name *</Label>
// // // //               <Input
// // // //                 value={publicForm.name}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, name: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <div>
// // // //               <Label>Email</Label>
// // // //               <Input
// // // //                 type="email"
// // // //                 value={publicForm.email}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, email: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <div>
// // // //               <Label>Phone *</Label>
// // // //               <Input
// // // //                 value={publicForm.phone}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, phone: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <div>
// // // //               <Label>Location</Label>
// // // //               <Input
// // // //                 value={publicForm.location}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, location: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <div>
// // // //               <Label>Previous School</Label>
// // // //               <Input
// // // //                 value={publicForm.school}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, school: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <div>
// // // //               <Label>Parent Name</Label>
// // // //               <Input
// // // //                 value={publicForm.parent}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, parent: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <div>
// // // //               <Label>Parent Occupation</Label>
// // // //               <Input
// // // //                 value={publicForm.occupation}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, occupation: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // // <div className="col-span-2">
// // // //   <Label>Class Applying For</Label>

// // // //   <Select
// // // //     value={publicForm.class_uuid}
// // // //     onValueChange={(value) =>
// // // //       setPublicForm((prev) => ({
// // // //         ...prev,
// // // //         class_uuid: value,
// // // //       }))
// // // //     }
// // // //   >
// // // //     <SelectTrigger disabled={classesLoading}>
// // // //       <SelectValue
// // // //         placeholder={
// // // //           classesLoading
// // // //             ? "Loading classes..."
// // // //             : "Select class"
// // // //         }
// // // //       />
// // // //     </SelectTrigger>

// // // //     <SelectContent>
// // // //       {classes.length === 0 ? (
// // // //         <SelectItem value="no-class" disabled>
// // // //           No classes available
// // // //         </SelectItem>
// // // //       ) : (
// // // //         classes.map((c) => (
// // // //           <SelectItem
// // // //             key={c.class_uuid || c.id}
// // // //             value={String(c.class_uuid || c.id)}
// // // //           >
// // // //             {c.class_name || c.name}
// // // //           </SelectItem>
// // // //         ))
// // // //       )}
// // // //     </SelectContent>
// // // //   </Select>
// // // // </div>
// // // //             <div className="col-span-2">
// // // //               <Label>Notes</Label>
// // // //               <Textarea
// // // //                 rows={2}
// // // //                 value={publicForm.notes}
// // // //                 onChange={(e) =>
// // // //                   setPublicForm({ ...publicForm, notes: e.target.value })
// // // //                 }
// // // //               />
// // // //             </div>
// // // //             <label className="col-span-2 flex items-start gap-2 text-xs">
// // // //               <Checkbox
// // // //                 checked={publicForm.consent}
// // // //                 onCheckedChange={(v) =>
// // // //                   setPublicForm({ ...publicForm, consent: !!v })
// // // //                 }
// // // //               />
// // // //               <span>
// // // //                 I consent to the school storing this information for admission
// // // //                 processing.
// // // //               </span>
// // // //             </label>
// // // //           </div>
// // // //           <DialogFooter>
// // // //             <Button variant="ghost" onClick={() => setFormOpen(false)}>
// // // //               Cancel
// // // //             </Button>
// // // //             <Button
// // // //               disabled={!publicForm.consent || !publicForm.name || !publicForm.phone}
// // // //               onClick={submitPublicForm}
// // // //             >
// // // //               Submit
// // // //             </Button>
// // // //           </DialogFooter>
// // // //         </DialogContent>
// // // //       </Dialog>

// // // //       {/* View Form Details */}
// // // //       <Dialog open={!!viewForm} onOpenChange={(o) => !o && setViewForm(null)}>
// // // //         <DialogContent className="max-w-lg">
// // // //           <DialogHeader>
// // // //             <DialogTitle>
// // // //               {viewForm?.full_name} — {viewForm?.id}
// // // //             </DialogTitle>
// // // //             <DialogDescription>Admission form details</DialogDescription>
// // // //           </DialogHeader>
// // // //           {viewForm && (
// // // //             <div className="grid grid-cols-2 gap-3 text-sm">
// // // //               <div>
// // // //                 <Label className="text-xs">Class</Label>
// // // //                 <div>{viewForm.class_name}</div>
// // // //               </div>
// // // //               <div>
// // // //                 <Label className="text-xs">Source</Label>
// // // //                 <div>{viewForm.source_name}</div>
// // // //               </div>
// // // //               <div>
// // // //                 <Label className="text-xs">Phone</Label>
// // // //                 <div>{viewForm.primary_phone}</div>
// // // //               </div>
// // // //               <div>
// // // //                 <Label className="text-xs">Email</Label>
// // // //                 <div>{viewForm.email}</div>
// // // //               </div>
// // // //               <div className="col-span-2">
// // // //                 <Label className="text-xs">Notes</Label>
// // // //                 <div className="whitespace-pre-wrap">
// // // //                   {viewForm.notes || "—"}
// // // //                 </div>
// // // //               </div>
// // // //               <div>
// // // //                 <Label className="text-xs">Stage</Label>
// // // //                 <div>
// // // //                   <Badge>{viewForm.stage_name}</Badge>
// // // //                 </div>
// // // //               </div>
// // // //               <div>
// // // //                 <Label className="text-xs">Counselor</Label>
// // // //                 <div>{viewForm.counselor_name || "—"}</div>
// // // //               </div>
// // // //             </div>
// // // //           )}
// // // //           <DialogFooter>
// // // //             <Button
// // // //               variant="outline"
// // // //               onClick={() => {
// // // //                 if (viewForm) {
// // // //                   navigate(`/admin/admissions/${viewForm.admission_uuid}`);
// // // //                   setViewForm(null);
// // // //                 }
// // // //               }}
// // // //             >
// // // //               Open full record
// // // //             </Button>
// // // //             <Button onClick={() => setViewForm(null)}>Close</Button>
// // // //           </DialogFooter>
// // // //         </DialogContent>
// // // //       </Dialog>

// // // //       {/* Reject inquiry dialog */}
// // // //       <Dialog
// // // //         open={!!rejectFor}
// // // //         onOpenChange={(o) => {
// // // //           if (!o) {
// // // //             setRejectFor(null);
// // // //             setRejectReason("");
// // // //           }
// // // //         }}
// // // //       >
// // // //         <DialogContent className="max-w-md">
// // // //           <DialogHeader>
// // // //             <DialogTitle>Reason for Rejection</DialogTitle>
// // // //             <DialogDescription>
// // // //               {rejectFor?.full_name} · {rejectFor?.id} — this inquiry will move
// // // //               to the Rejected list.
// // // //             </DialogDescription>
// // // //           </DialogHeader>
// // // //           <div className="space-y-2">
// // // //             <Label className="text-xs">Reason *</Label>
// // // //             <Textarea
// // // //               rows={4}
// // // //               value={rejectReason}
// // // //               onChange={(e) => setRejectReason(e.target.value)}
// // // //               placeholder="e.g. Seats full for the requested class, documents incomplete, applicant withdrew, etc."
// // // //             />
// // // //           </div>
// // // //           <DialogFooter>
// // // //             <Button
// // // //               variant="ghost"
// // // //               onClick={() => {
// // // //                 setRejectFor(null);
// // // //                 setRejectReason("");
// // // //               }}
// // // //             >
// // // //               Cancel
// // // //             </Button>
// // // //             <Button variant="destructive" onClick={confirmReject}>
// // // //               <XCircle className="h-4 w-4" />
// // // //               Reject Inquiry
// // // //             </Button>
// // // //           </DialogFooter>
// // // //         </DialogContent>
// // // //       </Dialog>

// // // //       {/* View rejection reason (read-only) — opened from Kanban card / Rejected table */}
// // // //       <Dialog
// // // //         open={!!viewReasonFor}
// // // //         onOpenChange={(o) => !o && setViewReasonFor(null)}
// // // //       >
// // // //         <DialogContent className="max-w-md">
// // // //           <DialogHeader>
// // // //             <DialogTitle>Reason for Rejection</DialogTitle>
// // // //             <DialogDescription>
// // // //               {viewReasonFor?.full_name} · {viewReasonFor?.id}
// // // //               {viewReasonFor?.rejected_at &&
// // // //                 ` — rejected ${new Date(viewReasonFor.rejected_at).toLocaleDateString()}`}
// // // //             </DialogDescription>
// // // //           </DialogHeader>
// // // //           <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
// // // //             {viewReasonFor?.rejection_reason || "No reason recorded."}
// // // //           </div>
// // // //           <DialogFooter>
// // // //             <Button variant="outline" onClick={() => setViewReasonFor(null)}>
// // // //               Close
// // // //             </Button>
// // // //           </DialogFooter>
// // // //         </DialogContent>
// // // //       </Dialog>
// // // //     </PageContainer>
// // // //   );
// // // // }




// // // import { useEffect, useMemo, useRef, useState } from "react";
// // // import { useNavigate } from "react-router-dom";

// // // import {
// // //   getAdmissionPipeline,
// // //   getAdmissionAnalytics,
// // //   getAdmissionSources,
// // //   getAdmissionCounselors,
// // //   getStages,
// // //   getAllAdmissions,
// // //   enrollStudent,
// // //   createAdmission,
// // //   importAdmissions,
// // //   rejectAdmission,
// // //   reinstateAdmission
// // // } from "../../../api/admissions";
// // // import { getClasses } from "../../../api/Class";
// // // import useAuthStore from "../../../store/authStore";

// // // import { PageContainer, PageHeader } from "../../../components/page-shell";
// // // import {
// // //   Card,
// // //   CardContent,
// // //   CardHeader,
// // //   CardTitle,
// // // } from "../../../components/ui/card";
// // // import { Button } from "../../../components/ui/button";
// // // import { Badge } from "../../../components/ui/badge";
// // // import { Input } from "../../../components/ui/input";
// // // import {
// // //   Select,
// // //   SelectTrigger,
// // //   SelectValue,
// // //   SelectContent,
// // //   SelectItem,
// // // } from "../../../components/ui/select";
// // // import { Checkbox } from "../../../components/ui/checkbox";
// // // import {
// // //   Avatar,
// // //   AvatarImage,
// // //   AvatarFallback,
// // // } from "../../../components/ui/avatar";
// // // import {
// // //   Tabs,
// // //   TabsList,
// // //   TabsTrigger,
// // //   TabsContent,
// // // } from "../../../components/ui/tabs";
// // // import {
// // //   Dialog,
// // //   DialogContent,
// // //   DialogHeader,
// // //   DialogTitle,
// // //   DialogDescription,
// // //   DialogFooter,
// // // } from "../../../components/ui/dialog";
// // // import { Label } from "../../../components/ui/label";
// // // import { Textarea } from "../../../components/ui/textarea";
// // // import {
// // //   Table,
// // //   TableBody,
// // //   TableCell,
// // //   TableHead,
// // //   TableHeader,
// // //   TableRow,
// // // } from "../../../components/ui/table";
// // // import {
// // //   Plus,
// // //   Search,
// // //   Phone,
// // //   Mail,
// // //   ArrowRight,
// // //   Archive,
// // //   Trash2,
// // //   Send,
// // //   TrendingUp,
// // //   FileText,
// // //   ClipboardCheck,
// // //   Eye,
// // //   XCircle,
// // //   RotateCcw,
// // // } from "lucide-react";

// // // import { toast } from "sonner";
// // // import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";
// // // import { ExcelUpload } from "../../../components/excel-upload";
// // // import { ExcelExport } from "../../../components/excel-export";

// // // const getApiErrorMessage = (err, fallback = "Something went wrong") => {
// // //   const detail = err?.response?.data?.detail;
// // //   const message = err?.response?.data?.message || err?.response?.data?.error;

// // //   const stringify = (value) => {
// // //     if (value == null) return "";
// // //     if (typeof value === "string" || typeof value === "number") return String(value);

// // //     if (Array.isArray(value)) {
// // //       return value.map(stringify).filter(Boolean).join("\n");
// // //     }

// // //     if (typeof value === "object") {
// // //       if (value.msg) {
// // //         const loc = Array.isArray(value.loc)
// // //           ? value.loc.filter((x) => x !== "body").join(" → ")
// // //           : "";
// // //         return loc ? `${loc}: ${String(value.msg)}` : String(value.msg);
// // //       }
// // //       if (value.message) return String(value.message);
// // //       try {
// // //         return JSON.stringify(value);
// // //       } catch {
// // //         return fallback;
// // //       }
// // //     }

// // //     return String(value);
// // //   };

// // //   return stringify(detail) || stringify(message) || err?.message || fallback;
// // // };

// // // const stageColor = {
// // //   Inquiry: "border-l-muted-foreground",
// // //   Lead: "border-l-info",
// // //   Counseling: "border-l-chart-3",
// // //   "Admission Test": "border-l-warning",
// // //   "Doc Verification": "border-l-accent",
// // //   "Fee Payment": "border-l-chart-5",
// // //   Enrolled: "border-l-success",
// // //   Rejected: "border-l-destructive",
// // // };

// // // // Stages that are dead-ends in the pipeline — no "advance to next stage"
// // // // button should ever be shown on cards sitting in these columns, and
// // // // "Rejected" specifically must never be computed as anyone's "next" stage
// // // // (rejection has its own dedicated flow via the reject dialog / drag-to-Rejected).
// // // const TERMINAL_STAGES = ["Enrolled", "Rejected"];



// // // export default function Admissions() {
// // //   const navigate = useNavigate();
// // //   const instituteUUID = useAuthStore((state) => state.instituteUUID);

// // //   // ---- server data ----
// // //   const [pipelineData, setPipelineData] = useState([]);
// // //   const [analytics, setAnalytics] = useState({});
// // //   const [sources, setSources] = useState([]);
// // //   const [counselors, setCounselors] = useState([]);
// // //   const [stages, setStages] = useState([]);
// // //   const [allAdmissions, setAllAdmissions] = useState([]);

// // //   // ---- pipeline filters / selection ----
// // //   const [q, setQ] = useState("");
// // //   const [src, setSrc] = useState("all");
// // //   const [counselor, setCounselor] = useState("all");
// // //   const [selected, setSelected] = useState(new Set());
// // //   const [dragItem, setDragItem] = useState(null);
// // //   const [tab, setTab] = useState("pipeline");

// // //   // ---- search autosuggest ----
// // //   const [suggestOpen, setSuggestOpen] = useState(false);
// // //   const [suggestIndex, setSuggestIndex] = useState(-1);
// // //   const searchBoxRef = useRef(null);

// // //   // ---- forms / test tabs ----
// // //   const [viewForm, setViewForm] = useState(null);
// // //   const [testFilter, setTestFilter] = useState("all");
// // //   const [stageFilter, setStageFilter] = useState("all");

// // //   // ---- reject dialog ----
// // //   const [rejectFor, setRejectFor] = useState(null);
// // //   const [rejectReason, setRejectReason] = useState("");

// // //   // ---- view rejection reason dialog (read-only) ----
// // //   const [viewReasonFor, setViewReasonFor] = useState(null);
// // //   const [classes, setClasses] = useState([]);
// // //   const [classesLoading, setClassesLoading] = useState(false);
// // //   // ---- public form dialog ----
// // //   const [formOpen, setFormOpen] = useState(false);
// // //   const [publicForm, setPublicForm] = useState({
// // //     name: "",
// // //     email: "",
// // //     phone: "",
// // //     location: "",
// // //     school: "",
// // //     parent: "",
// // //     occupation: "",
// // //      class_uuid: "",
// // //     notes: "",
// // //     consent: false,
// // //   });

// // // const loadClasses = async () => {
// // //   try {
// // //     setClassesLoading(true);

// // //     const res = await getClasses();

// // //     const list = res.data?.data || res.data || res || [];

// // //     setClasses(Array.isArray(list) ? list : []);
// // //   } catch (err) {
// // //     console.error("Failed to load classes:", err);
// // //     setClasses([]);
// // //     toast.error("Failed to load classes");
// // //   } finally {
// // //     setClassesLoading(false);
// // //   }
// // // };

// // // useEffect(() => {
// // //   loadData();
// // //   loadClasses();
// // // }, []);

// // //   const loadData = async () => {
// // //     try {
// // //       const [
// // //         pipelineRes,
// // //         analyticsRes,
// // //         sourceRes,
// // //         counselorRes,
// // //         stageRes,
// // //         allRes,
// // //       ] = await Promise.all([
// // //         getAdmissionPipeline(),
// // //         getAdmissionAnalytics(),
// // //         getAdmissionSources(),
// // //         getAdmissionCounselors(),
// // //         getStages(),
// // //         getAllAdmissions(),
// // //       ]);

// // //       setPipelineData(pipelineRes.data);
// // //       setAnalytics(analyticsRes.data);
// // //       setSources(sourceRes.data);
// // //       setCounselors(counselorRes.data);
// // //       setStages(stageRes.data.data);
// // //       setAllAdmissions(allRes.data);
// // //     } catch (err) {
// // //       console.error("Failed to load admissions data:", err);
// // //       toast.error(getApiErrorMessage(err, "Failed to load admissions data"));
// // //     }
// // //   };

// // //   const stageNames = useMemo(() => stages.map((s) => s.stage_name), [stages]);

// // //   // Shared filter predicate used by both the active pipeline cards and the
// // //   // rejected list, so every column respects the same search/source/counselor
// // //   // filters consistently.
// // //   const matchesFilters = (c) => {
// // //     if (
// // //       q &&
// // //       !(
// // //         c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
// // //         c.primary_phone?.includes(q)
// // //       )
// // //     )
// // //       return false;
// // //     if (src !== "all" && c.source_name !== src) return false;
// // //     if (counselor !== "all" && c.counselor_name !== counselor) return false;
// // //     return true;
// // //   };

// // //   const byNameAsc = (a, b) =>
// // //     (a.full_name || "").localeCompare(b.full_name || "", undefined, {
// // //       sensitivity: "base",
// // //     });

// // //   // ============================================================
// // //   // STATUS VISIBILITY RULES
// // //   //
// // //   // Status        Normal Pipeline   Rejected   Pipeline Count
// // //   // ACTIVE              ✅              —             ✅
// // //   // TRANSFERRED         ✅              —             ✅
// // //   // REJECTED            —              ✅             ✅
// // //   // DELETED             ❌              ❌             ❌
// // //   //
// // //   // i.e. DELETED is hidden everywhere and never counted.
// // //   // Everything else (ACTIVE / TRANSFERRED / REJECTED) is counted in the
// // //   // Pipeline Count. REJECTED is only ever *displayed* in the Rejected
// // //   // column/tab; ACTIVE + TRANSFERRED are only ever displayed in the
// // //   // Normal Pipeline columns.
// // //   // ============================================================

// // //   const isDeleted = (admission) =>
// // //     String(admission?.status || "").toUpperCase() === "DELETED";

// // //   const isRejected = (admission) => {
// // //     const status = String(admission?.status || "").toUpperCase();

// // //     return (
// // //       status === "REJECTED" ||
// // //       Number(admission?.stage_id) === 8 ||
// // //       admission?.stage_name === "Rejected"
// // //     );
// // //   };

// // //   // Normal pipeline cards:
// // //   // ACTIVE + TRANSFERRED are shown here.
// // //   // REJECTED is shown in the Rejected column.
// // //   // DELETED is hidden everywhere.
// // //   const cards = useMemo(() => {
// // //     return allAdmissions
// // //       .filter((c) => {
// // //         if (isDeleted(c)) return false;
// // //         if (isRejected(c)) return false;

// // //         return matchesFilters(c);
// // //       })
// // //       .sort(byNameAsc);
// // //   }, [allAdmissions, q, src, counselor]);

// // //   // Rejected column:
// // //   // REJECTED / stage 8 are shown.
// // //   // DELETED is always hidden.
// // //   const rejectedList = useMemo(() => {
// // //     return allAdmissions
// // //       .filter((c) => {
// // //         if (isDeleted(c)) return false;
// // //         return isRejected(c);
// // //       })
// // //       .filter(matchesFilters)
// // //       .sort(byNameAsc);
// // //   }, [allAdmissions, q, src, counselor]);

// // //   // Rejected badge/count:
// // //   // Count rejected records except DELETED.
// // //   const rejectedTotal = useMemo(() => {
// // //     return allAdmissions.filter((c) => {
// // //       if (isDeleted(c)) return false;
// // //       return isRejected(c);
// // //     }).length;
// // //   }, [allAdmissions]);

// // //   // Pipeline counts (Kanban column badges):
// // //   // Count ALL statuses except DELETED — i.e. ACTIVE + TRANSFERRED + REJECTED.
// // //   //
// // //   // ACTIVE       -> COUNT
// // //   // TRANSFERRED  -> COUNT
// // //   // REJECTED     -> COUNT
// // //   // DELETED      -> NOT COUNTED
// // //   const pipelineStageCounts = useMemo(() => {
// // //     const counts = {};

// // //     allAdmissions.forEach((admission) => {
// // //       if (isDeleted(admission)) return;

// // //       const stageName =
// // //         admission.stage_name ||
// // //         stages.find(
// // //           (s) =>
// // //             String(s.id) === String(admission.stage_id)
// // //         )?.stage_name;

// // //       if (!stageName) return;

// // //       counts[stageName] =
// // //         (counts[stageName] || 0) + 1;
// // //     });

// // //     return counts;
// // //   }, [allAdmissions, stages]);

// // //   // Unique applicant names for the search autosuggest dropdown, filtered
// // //   // against the current query (Google-style — only relevant matches show,
// // //   // capped to keep the list short).
// // //   const nameSuggestions = useMemo(() => {
// // //     const unique = Array.from(
// // //       new Set(allAdmissions.map((a) => a.full_name).filter(Boolean))
// // //     ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

// // //     if (!q.trim()) return [];
// // //     const query = q.toLowerCase();
// // //     return unique
// // //       .filter((name) => name.toLowerCase().includes(query))
// // //       .slice(0, 8);
// // //   }, [allAdmissions, q]);

// // //   // Close the suggestion dropdown on outside click.
// // //   useEffect(() => {
// // //     const handleClick = (e) => {
// // //       if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
// // //         setSuggestOpen(false);
// // //         setSuggestIndex(-1);
// // //       }
// // //     };
// // //     document.addEventListener("mousedown", handleClick);
// // //     return () => document.removeEventListener("mousedown", handleClick);
// // //   }, []);

// // //   const chooseSuggestion = (name) => {
// // //     setQ(name);
// // //     setSuggestOpen(false);
// // //     setSuggestIndex(-1);
// // //   };

// // //   const handleSearchKeyDown = (e) => {
// // //     if (!suggestOpen || nameSuggestions.length === 0) return;
// // //     if (e.key === "ArrowDown") {
// // //       e.preventDefault();
// // //       setSuggestIndex((i) => (i + 1) % nameSuggestions.length);
// // //     } else if (e.key === "ArrowUp") {
// // //       e.preventDefault();
// // //       setSuggestIndex(
// // //         (i) => (i - 1 + nameSuggestions.length) % nameSuggestions.length
// // //       );
// // //     } else if (e.key === "Enter") {
// // //       if (suggestIndex >= 0) {
// // //         e.preventDefault();
// // //         chooseSuggestion(nameSuggestions[suggestIndex]);
// // //       } else {
// // //         setSuggestOpen(false);
// // //       }
// // //     } else if (e.key === "Escape") {
// // //       setSuggestOpen(false);
// // //       setSuggestIndex(-1);
// // //     }
// // //   };

// // //   // Highlights the matched substring within a suggestion, like search
// // //   // engines do.
// // //   const highlightMatch = (name) => {
// // //     const idx = name.toLowerCase().indexOf(q.toLowerCase());
// // //     if (idx === -1) return name;
// // //     return (
// // //       <>
// // //         {name.slice(0, idx)}
// // //         <span className="font-semibold text-foreground">
// // //           {name.slice(idx, idx + q.length)}
// // //         </span>
// // //         {name.slice(idx + q.length)}
// // //       </>
// // //     );
// // //   };

// // //   const openStage = (stageName) => {
// // //     setStageFilter(stageName);
// // //     setTab(stageName === "Rejected" ? "rejected" : "forms");
// // //   };

// // //   const toggleSel = (id) =>
// // //     setSelected((p) => {
// // //       const n = new Set(p);
// // //       if (n.has(id)) n.delete(id);
// // //       else n.add(id);
// // //       return n;
// // //     });

// // //   const moveToStage = async (admissionUuid, stageName) => {
// // //     const nextStage = stages.find((s) => s.stage_name === stageName);
// // //     if (!nextStage) return;
// // //     const res = await enrollStudent(admissionUuid, nextStage.id);
// // //     toast.success(res.data.message || `Moved to ${stageName}`);
// // //   };

// // //   const onDrop = async (stageName) => {
// // //     if (!dragItem) return;
// // //     try {
// // //       await moveToStage(dragItem.admission_uuid, stageName);
// // //       setDragItem(null);
// // //       loadData();
// // //     } catch (err) {
// // //       toast.error(getApiErrorMessage(err, "Failed to move stage"));
// // //     }
// // //   };

// // //   const bulkMove = async (stageName) => {
// // //     try {
// // //       const nextStage = stages.find((s) => s.stage_name === stageName);
// // //       if (!nextStage) return;

// // //       for (const id of selected) {
// // //         const student = allAdmissions.find((a) => a.id === id);
// // //         if (student) await enrollStudent(student.admission_uuid, nextStage.id);
// // //       }

// // //       toast.success(`${selected.size} moved successfully`);
// // //       setSelected(new Set());
// // //       loadData();
// // //     } catch (err) {
// // //       toast.error("Failed to move stage");
// // //     }
// // //   };

// // //   const confirmReject = async () => {
// // //     if (!rejectFor) return;

// // //     if (!rejectReason.trim()) {
// // //       toast.error("Reason is required");
// // //       return;
// // //     }

// // //     try {
// // //       const res = await rejectAdmission(
// // //         rejectFor.admission_uuid,
// // //         rejectReason.trim()
// // //       );

// // //       toast.success(
// // //         res.data?.message || "Admission rejected successfully."
// // //       );

// // //       setRejectFor(null);
// // //       setRejectReason("");

// // //       await loadData();

// // //     } catch (err) {
// // //       toast.error(getApiErrorMessage(err, "Failed to reject admission."));
// // //     }
// // //   };

// // //   const reinstate = async (admission) => {
// // //     try {
// // //       const res = await reinstateAdmission(
// // //         admission.admission_uuid
// // //       );

// // //       toast.success(
// // //         res.data?.message ||
// // //         `${admission.full_name} reinstated successfully.`
// // //       );

// // //       await loadData();

// // //     } catch (err) {
// // //       toast.error(getApiErrorMessage(err, "Failed to reinstate admission."));
// // //     }
// // //   };

// // //   const submitPublicForm = async () => {
// // //     try {
// // //       const fullName = publicForm.name.trim();
// // //       const phone = publicForm.phone.trim();

// // //       if (!fullName) {
// // //         toast.error("Full Name is required");
// // //         return;
// // //       }

// // //       if (!phone) {
// // //         toast.error("Phone is required");
// // //         return;
// // //       }

// // //       if (!publicForm.class_uuid) {
// // //         toast.error("Please select a class");
// // //         return;
// // //       }

// // //       if (!publicForm.consent) {
// // //         toast.error("Please accept the consent");
// // //         return;
// // //       }

// // //       if (!instituteUUID) {
// // //         toast.error("Institute context missing. Please re-login and try again.");
// // //         return;
// // //       }

// // //       const payload = {
// // //         institute_uuid: instituteUUID,
// // //         full_name: fullName,
// // //         email: publicForm.email.trim() || null,
// // //         primary_phone: phone,
// // //         address: publicForm.location.trim() || null,
// // //         prev_school: publicForm.school.trim() || null,
// // //         parent_name: publicForm.parent.trim() || null,
// // //         class_uuid: publicForm.class_uuid,
// // //         source_name: "Website",
// // //         notes: [
// // //           publicForm.occupation.trim()
// // //             ? `Parent occupation: ${publicForm.occupation.trim()}`
// // //             : "",
// // //           publicForm.notes.trim() ? publicForm.notes.trim() : "",
// // //         ]
// // //           .filter(Boolean)
// // //           .join("\n") || null,
// // //       };

// // //       console.log("Creating public admission:", payload);

// // //       const response = await createAdmission(payload);

// // //       toast.success(
// // //         response?.data?.message || "Admission enquiry submitted successfully"
// // //       );

// // //       setFormOpen(false);
// // //       setPublicForm({
// // //         name: "",
// // //         email: "",
// // //         phone: "",
// // //         location: "",
// // //         school: "",
// // //         parent: "",
// // //         occupation: "",
// // //         class_uuid: "",
// // //         notes: "",
// // //         consent: false,
// // //       });

// // //       await loadData();
// // //     } catch (err) {
// // //       console.error("Public admission error:", err);
// // //       toast.error(getApiErrorMessage(err, "Failed to submit admission form"));
// // //     }
// // //   };

// // //   // ============================================================
// // //   // Admissions Excel Import
// // //   // Sends the original Excel file directly to the backend:
// // //   // POST /admissions/import
// // //   // ============================================================
// // //  const handleAdmissionsImport = async (file) => {
// // //   try {
// // //     if (!file) {
// // //       toast.error("Please select an Excel file");
// // //       return;
// // //     }

// // //     if (!instituteUUID) {
// // //       toast.error(
// // //         "Institute context missing. Please re-login and try again."
// // //       );
// // //       return;
// // //     }

// // //     console.log("Uploading Excel file:", {
// // //       name: file.name,
// // //       type: file.type,
// // //       size: file.size,
// // //     });

// // //     const response = await importAdmissions(file);

// // //     console.log(
// // //       "Admission import response:",
// // //       response.data
// // //     );

// // //     const result = response?.data || {};

// // //     const imported = Number(
// // //       result.imported || 0
// // //     );

// // //     const skipped = Array.isArray(
// // //       result.skipped
// // //     )
// // //       ? result.skipped
// // //       : [];

// // //     if (imported > 0) {
// // //       toast.success(
// // //         `${imported} admissions imported successfully`
// // //       );
// // //     } else {
// // //       toast.info(
// // //         "No admissions were imported"
// // //       );
// // //     }

// // //     if (skipped.length > 0) {
// // //       console.warn(
// // //         "Skipped rows:",
// // //         skipped
// // //       );

// // //       toast.warning(
// // //         `${skipped.length} rows skipped`
// // //       );
// // //     }

// // //     await loadData();

// // //   } catch (err) {
// // //     console.error(
// // //       "Admission Excel import failed:",
// // //       err
// // //     );

// // //     const detail =
// // //       err?.response?.data?.detail;

// // //     if (Array.isArray(detail)) {
// // //       toast.error(
// // //         detail
// // //           .map(
// // //             (item) =>
// // //               item?.msg ||
// // //               "Validation error"
// // //           )
// // //           .join(", ")
// // //       );
// // //     } else {
// // //       toast.error(
// // //         detail ||
// // //           err?.response?.data?.message ||
// // //           err?.message ||
// // //           "Failed to import admissions"
// // //       );
// // //     }
// // //   }
// // // };
// // //   // ---- analytics ----
// // //   // Calculate analytics from ACTIVE admissions only.
// // //   const activeAdmissions = useMemo(
// // //     () => allAdmissions.filter(
// // //       (a) => String(a.status || "").toUpperCase() === "ACTIVE"
// // //     ),
// // //     [allAdmissions]
// // //   );

// // //   // Stage counts scoped to ACTIVE-only admissions — used by the analytics
// // //   // "Stage Funnel" chart below. (Distinct from pipelineStageCounts, which
// // //   // intentionally also includes TRANSFERRED + REJECTED for the Kanban
// // //   // column badges — see STATUS VISIBILITY RULES above.)
// // //   const activeStageCounts = useMemo(() => {
// // //     const counts = {};

// // //     activeAdmissions.forEach((admission) => {
// // //       const stageName =
// // //         admission.stage_name ||
// // //         stages.find(
// // //           (s) => String(s.id) === String(admission.stage_id)
// // //         )?.stage_name;

// // //       if (!stageName) return;

// // //       counts[stageName] = (counts[stageName] || 0) + 1;
// // //     });

// // //     return counts;
// // //   }, [activeAdmissions, stages]);

// // //   const counts = useMemo(
// // //     () =>
// // //       pipelineData.map((stage) => ({
// // //         stage: stage.stage_name,
// // //         n: activeStageCounts[stage.stage_name] || 0,
// // //       })),
// // //     [pipelineData, activeStageCounts]
// // //   );

// // //   const total = activeAdmissions.length;

// // //   const enrolledStageId = stages.find(
// // //     (s) => s.stage_name === "Enrolled"
// // //   )?.id;

// // //   const enrolled = activeAdmissions.filter(
// // //     (a) =>
// // //       a.stage_name === "Enrolled" ||
// // //       a.stage_id === enrolledStageId
// // //   ).length;

// // //   const convRate = total
// // //     ? Number(((enrolled / total) * 100).toFixed(2))
// // //     : 0;

// // //   const bySource = useMemo(() => {
// // //     const sourceMap = {};

// // //     activeAdmissions.forEach((admission) => {
// // //       const source = admission.source_name || "Unknown";
// // //       sourceMap[source] = (sourceMap[source] || 0) + 1;
// // //     });

// // //     return Object.entries(sourceMap).map(([source, count]) => ({
// // //       source,
// // //       count,
// // //     }));
// // //   }, [activeAdmissions]);

// // //   return (
// // //     <PageContainer>
// // //       <PageHeader
// // //         eyebrow="Admin · Academic"
// // //         title="Admissions Pipeline"
// // //         description="Drag prospects across stages. Click any card to open the full counseling, document, payment and communication record."
// // //         actions={
// // //           <>
// // //             <ExcelExport
// // //               rows={allAdmissions}
// // //               fileName="admissions.xlsx"
// // //               columns={[
// // //                 { header: "ID", accessor: (r) => r.id },
// // //                 { header: "Name", accessor: (r) => r.full_name },
// // //                 { header: "Class", accessor: (r) => r.class_name },
// // //                 { header: "Phone", accessor: (r) => r.primary_phone },
// // //                 { header: "Email", accessor: (r) => r.email },
// // //                 { header: "Source", accessor: (r) => r.source_name },
// // //                 { header: "Stage", accessor: (r) => r.stage_name },
// // //                 { header: "Counselor", accessor: (r) => r.counselor_name ?? "" },
// // //               ]}
// // //             />
// // // <ExcelUpload
// // //   label="Bulk Upload"
// // //   templateName="admissions-template.xlsx"
// // //   templateHeaders={[
// // //     "Name",
// // //     "Class",
// // //     "Parent",
// // //     "Phone",
// // //     "Email",
// // //     "Source",
// // //     "Counselor", 
// // //     "Session Year",
// // //   ]}
// // //   onFile={handleAdmissionsImport}
// // // />
// // //             <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
// // //               <FileText className="h-4 w-4" />
// // //               Public Form
// // //             </Button>
// // //             <NewInquiryDialog
// // //               trigger={
// // //                 <Button size="sm" className="gradient-primary border-0">
// // //                   <Plus className="h-4 w-4" />
// // //                   New Inquiry
// // //                 </Button>
// // //               }
// // //               onCreate={async () => {
// // //                 await loadData();
// // //               }}
// // //             />
// // //           </>
// // //         }
// // //       />

// // //       <Tabs value={tab} onValueChange={setTab} className="mb-4">
// // //         <TabsList>
// // //           <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
// // //           <TabsTrigger value="forms">Forms</TabsTrigger>
// // //           <TabsTrigger value="test">Admission Test</TabsTrigger>
// // //           <TabsTrigger value="rejected">
// // //             Rejected ({rejectedTotal})
// // //           </TabsTrigger>
// // //           <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
// // //         </TabsList>

// // //         {/* ---------------- PIPELINE ---------------- */}
// // //         <TabsContent value="pipeline" className="mt-4 space-y-4">
// // //           <div className="flex flex-wrap items-center gap-2">
// // //             <div className="relative" ref={searchBoxRef}>
// // //               <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
// // //               <Input
// // //                 value={q}
// // //                 onChange={(e) => {
// // //                   setQ(e.target.value);
// // //                   setSuggestOpen(true);
// // //                   setSuggestIndex(-1);
// // //                 }}
// // //                 onFocus={() => setSuggestOpen(true)}
// // //                 onKeyDown={handleSearchKeyDown}
// // //                 placeholder="Search name / phone…"
// // //                 className="pl-8 h-9 w-64"
// // //                 autoComplete="off"
// // //               />
// // //               {suggestOpen && nameSuggestions.length > 0 && (
// // //                 <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-md border bg-popover shadow-lg overflow-hidden py-1">
// // //                   {nameSuggestions.map((name, idx) => (
// // //                     <button
// // //                       type="button"
// // //                       key={name}
// // //                       onMouseDown={(e) => {
// // //                         e.preventDefault();
// // //                         chooseSuggestion(name);
// // //                       }}
// // //                       onMouseEnter={() => setSuggestIndex(idx)}
// // //                       className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
// // //                         idx === suggestIndex
// // //                           ? "bg-muted"
// // //                           : "hover:bg-muted/60"
// // //                       }`}
// // //                     >
// // //                       <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
// // //                       <span className="truncate text-foreground/90">
// // //                         {highlightMatch(name)}
// // //                       </span>
// // //                     </button>
// // //                   ))}
// // //                 </div>
// // //               )}
// // //             </div>
// // //             <Select value={src} onValueChange={setSrc}>
// // //               <SelectTrigger className="h-9 w-40">
// // //                 <SelectValue placeholder="Source" />
// // //               </SelectTrigger>
// // //               <SelectContent>
// // //                 <SelectItem value="all">All sources</SelectItem>
// // //                 {sources.map((s) => (
// // //                   <SelectItem key={s.id} value={s.name}>
// // //                     {s.name}
// // //                   </SelectItem>
// // //                 ))}
// // //               </SelectContent>
// // //             </Select>
// // //             <Select value={counselor} onValueChange={setCounselor}>
// // //               <SelectTrigger className="h-9 w-40">
// // //                 <SelectValue placeholder="Counselor" />
// // //               </SelectTrigger>
// // //               <SelectContent>
// // //                 <SelectItem value="all">All counselors</SelectItem>
// // //                 {counselors.map((c) => (
// // //                   <SelectItem key={c.id} value={c.counselor_name}>
// // //                     {c.counselor_name}
// // //                   </SelectItem>
// // //                 ))}
// // //               </SelectContent>
// // //             </Select>
// // //             {selected.size > 0 && (
// // //               <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
// // //                 <span className="text-xs font-medium">
// // //                   {selected.size} selected
// // //                 </span>
// // //                 <Select onValueChange={(v) => bulkMove(v)}>
// // //                   <SelectTrigger className="h-7 w-36 text-xs">
// // //                     <SelectValue placeholder="Move to…" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     {stages.map((s) => (
// // //                       <SelectItem key={s.id} value={s.stage_name}>
// // //                         {s.stage_name}
// // //                       </SelectItem>
// // //                     ))}
// // //                   </SelectContent>
// // //                 </Select>
// // //                 <Button
// // //                   size="sm"
// // //                   variant="ghost"
// // //                   className="h-7 text-xs"
// // //                   onClick={() => {
// // //                     toast.success(`Bulk SMS to ${selected.size}`);
// // //                     setSelected(new Set());
// // //                   }}
// // //                 >
// // //                   <Send className="h-3 w-3" />
// // //                   SMS
// // //                 </Button>
// // //                 <Button
// // //                   size="sm"
// // //                   variant="ghost"
// // //                   className="h-7 text-xs text-destructive"
// // //                   onClick={() => {
// // //                     selected.forEach((id) => {
// // //                       const student = allAdmissions.find((a) => a.id === id);
// // //                       if (student) setRejectFor(student);
// // //                     });
// // //                     setSelected(new Set());
// // //                   }}
// // //                 >
// // //                   <Trash2 className="h-3 w-3" />
// // //                 </Button>
// // //               </div>
// // //             )}
// // //           </div>

// // //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
// // //             {pipelineData.map((stage) => (
// // //               <Card
// // //                 key={stage.stage_name}
// // //                 role="button"
// // //                 tabIndex={0}
// // //                 onClick={() => openStage(stage.stage_name)}
// // //                 onKeyDown={(e) => {
// // //                   if (e.key === "Enter") openStage(stage.stage_name);
// // //                 }}
// // //                 title={`Open ${stage.stage_name} table`}
// // //                 className={`cursor-pointer transition hover:shadow-sm ${
// // //                   stage.stage_name === "Rejected"
// // //                     ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
// // //                     : "border-border/60 hover:border-primary/50"
// // //                 }`}
// // //               >
// // //                 <CardContent className="p-3">
// // //                   <div
// // //                     className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
// // //                       stage.stage_name === "Rejected"
// // //                         ? "text-destructive"
// // //                         : "text-muted-foreground"
// // //                     }`}
// // //                   >
// // //                     {stage.stage_name === "Rejected" && (
// // //                       <XCircle className="h-3 w-3" />
// // //                     )}
// // //                     {stage.stage_name}
// // //                   </div>

// // //                   <div
// // //                     className={`text-2xl font-display font-semibold mt-1 ${
// // //                       stage.stage_name === "Rejected"
// // //                         ? "text-destructive"
// // //                         : ""
// // //                     }`}
// // //                   >
// // //                     {pipelineStageCounts[stage.stage_name] || 0}
// // //                   </div>
// // //                 </CardContent>
// // //               </Card>
// // //             ))}

// // //           </div>

// // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
// // //             {pipelineData.map((stage) => {
// // //               const items =
// // //                 stage.stage_name === "Rejected"
// // //                   ? rejectedList
// // //                   : cards.filter(
// // //                       (c) => c.stage_name === stage.stage_name
// // //                     );
// // //               return (
// // //                 <Card
// // //                   key={stage.stage_name}
// // //                   className="border-border/60 bg-muted/20"
// // //                 >
// // //                   <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// // //                     <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
// // //                       {stage.stage_name}
// // //                     </CardTitle>
// // //                     <Badge variant="outline" className="text-[10px]">
// // //                       {items.length}
// // //                     </Badge>
// // //                   </CardHeader>
// // //                   <CardContent
// // //                     className="space-y-2 max-h-[560px] overflow-y-auto p-2"
// // //                     onDragOver={(e) => e.preventDefault()}
// // //                     onDrop={() => {

// // //                       if (
// // //                         stage.stage_name === "Rejected"
// // //                       ) {

// // //                         setRejectFor(dragItem);
// // //                         setRejectReason("");

// // //                         return;
// // //                       }

// // //                       onDrop(stage.stage_name);

// // //                     }}
// // //                   >
// // //                     {items.length === 0 && (
// // //                       <div className="text-xs text-muted-foreground text-center py-6">
// // //                         Drop here
// // //                       </div>
// // //                     )}
// // //                     {items.map((c) => {
// // //                       const stageIdx = stages.findIndex(
// // //                         (s) => s.stage_name === stage.stage_name,
// // //                       );
// // //                       const rawNext = stages[stageIdx + 1]?.stage_name;
// // //                       // Never surface a "next stage" button on terminal
// // //                       // stages (Enrolled has nowhere to go), and never let
// // //                       // "next" resolve to Rejected — rejection only ever
// // //                       // happens through the explicit reject flow.
// // //                       const next = TERMINAL_STAGES.includes(stage.stage_name)
// // //                         ? undefined
// // //                         : rawNext === "Rejected"
// // //                         ? undefined
// // //                         : rawNext;
// // //                       return (
// // //                         <div
// // //                           key={c.id}
// // //                           draggable={stage.stage_name !== "Rejected"}
// // //                           onDragStart={() => setDragItem(c)}
// // //                           className={`bg-card border border-l-4 ${stageColor[stage.stage_name]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${selected.has(c.id) ? "ring-2 ring-primary" : ""}`}
// // //                           onClick={(e) => {
// // //                             if (e.target.closest("[data-stop]")) return;
// // //                             navigate(`/admin/admissions/${c.admission_uuid}`);
// // //                           }}
// // //                         >
// // //                           <div className="flex items-start gap-2.5">
// // //                             {stage.stage_name !== "Rejected" && (
// // //                               <div
// // //                                 data-stop
// // //                                 onClick={(e) => e.stopPropagation()}
// // //                               >
// // //                                 <Checkbox
// // //                                   checked={selected.has(c.id)}
// // //                                   onCheckedChange={() => toggleSel(c.id)}
// // //                                 />
// // //                               </div>
// // //                             )}
// // //                             <Avatar className="h-8 w-8 shrink-0">
// // //                               {c.passport_photo_file ? (
// // //                                 <AvatarImage
// // //                                   src={c.passport_photo_file}
// // //                                   alt={c.full_name}
// // //                                   className="object-cover"
// // //                                 />
// // //                               ) : (
// // //                                 <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
// // //                                   {c.full_name
// // //                                     ?.split(" ")
// // //                                     .map((n) => n[0])
// // //                                     .join("")}
// // //                                 </AvatarFallback>
// // //                               )}
// // //                             </Avatar>
// // //                             <div className="min-w-0 flex-1">
// // //                               <div className="text-sm font-medium truncate">
// // //                                 {c.full_name}
// // //                               </div>
// // //                               <div className="text-[10px] text-muted-foreground">
// // //                                 Class {c.class_name} · {c.source_name}
// // //                               </div>
// // //                             </div>
// // //                           </div>
// // //                           <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
// // //                             {stage.stage_name === "Rejected" && (
// // //                               <>
// // //                                 <div
// // //                                   data-stop
// // //                                   className="text-xs text-destructive cursor-pointer hover:underline truncate"
// // //                                   onClick={(e) => {
// // //                                     e.stopPropagation();
// // //                                     setViewReasonFor(c);
// // //                                   }}
// // //                                   title="Click to view full rejection reason"
// // //                                 >
// // //                                   Reason : {c.rejection_reason || "-"}
// // //                                 </div>

// // //                                 <div className="text-xs text-muted-foreground">
// // //                                   Rejected :
// // //                                   {
// // //                                     c.rejected_at
// // //                                       ? new Date(
// // //                                           c.rejected_at
// // //                                         ).toLocaleDateString()
// // //                                       : "-"
// // //                                   }
// // //                                 </div>
// // //                               </>
// // //                             )}
// // //                             <div className="flex items-center gap-1.5">
// // //                               <Phone className="h-3 w-3" />
// // //                               {c.primary_phone}
// // //                             </div>
// // //                             <div className="flex items-center gap-1.5 truncate">
// // //                               <Mail className="h-3 w-3 shrink-0" />
// // //                               <span className="truncate">{c.email}</span>
// // //                             </div>
// // //                             {c.counselor_name && (
// // //                               <div className="text-[10px]">
// // //                                 👤 {c.counselor_name}
// // //                               </div>
// // //                             )}
// // //                           </div>
// // //                           <div
// // //                             className="flex items-center justify-between mt-2.5 pt-2 border-t gap-1"
// // //                             data-stop
// // //                             onClick={(e) => e.stopPropagation()}
// // //                           >

// // //                             {stage.stage_name === "Rejected" && (

// // //                               <Button
// // //                                 size="sm"
// // //                                 variant="outline"
// // //                                 onClick={() => reinstate(c)}
// // //                               >
// // //                                 <RotateCcw
// // //                                   className="h-3 w-3"
// // //                                 />

// // //                                 Reinstate

// // //                               </Button>

// // //                             )}
// // //                             <span className="text-[10px] text-muted-foreground">
// // //                               {new Date(c.created_at).toLocaleDateString()}
// // //                             </span>
// // //                             <div className="flex items-center gap-0.5">
// // //                               {stage.stage_name !== "Rejected" && (
// // //                                 <Button
// // //                                   size="sm"
// // //                                   variant="ghost"
// // //                                   className="h-6 px-2 text-[10px]
// // //                                       text-destructive"
// // //                                   onClick={() => {
// // //                                     setRejectFor(c);
// // //                                     setRejectReason("");
// // //                                   }}
// // //                                 >
// // //                                   <XCircle className="h-3 w-3" />
// // //                                 </Button>
// // //                               )}
// // //                               {stage.stage_name !== "Rejected" && next && (
// // //                                 <Button
// // //                                   size="sm"
// // //                                   variant="ghost"
// // //                                   className="h-6 px-2 text-[10px]"
// // //                                   onClick={async () => {
// // //                                     try {
// // //                                       await moveToStage(c.admission_uuid, next);
// // //                                       loadData();
// // //                                     } catch (err) {
// // //                                       toast.error(
// // //                                         getApiErrorMessage(err, "Failed to move stage"),
// // //                                       );
// // //                                     }
// // //                                   }}
// // //                                 >
// // //                                   {next.split(" ")[0]}
// // //                                   <ArrowRight className="h-3 w-3" />
// // //                                 </Button>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                       );
// // //                     })}
// // //                   </CardContent>
// // //                 </Card>
// // //               );
// // //             })}
// // //           </div>
// // //         </TabsContent>

// // //         {/* ---------------- FORMS ---------------- */}
// // //         <TabsContent value="forms" className="mt-4 space-y-3">
// // //           <Card>
// // //             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// // //               <CardTitle className="text-base flex items-center gap-2">
// // //                 <FileText className="h-4 w-4" />
// // //                 Admission Forms Received
// // //               </CardTitle>
// // //               <Select value={stageFilter} onValueChange={setStageFilter}>
// // //                 <SelectTrigger className="h-8 w-44 text-xs">
// // //                   <SelectValue placeholder="Filter by stage" />
// // //                 </SelectTrigger>
// // //                 <SelectContent>
// // //                   <SelectItem value="all">All stages</SelectItem>
// // //                   {stageNames.map((s) => (
// // //                     <SelectItem key={s} value={s}>
// // //                       {s}
// // //                     </SelectItem>
// // //                   ))}
// // //                 </SelectContent>
// // //               </Select>
// // //             </CardHeader>
// // //             <CardContent className="p-0">
// // //               <Table>
// // //                 <TableHeader>
// // //                   <TableRow>
// // //                     <TableHead>ID</TableHead>
// // //                     <TableHead>Applicant</TableHead>
// // //                     <TableHead>Class</TableHead>
// // //                     <TableHead>Contact</TableHead>
// // //                     <TableHead>Stage</TableHead>
// // //                     <TableHead>Source</TableHead>
// // //                     <TableHead>Received</TableHead>
// // //                     <TableHead className="text-right">Action</TableHead>
// // //                   </TableRow>
// // //                 </TableHeader>
// // //                 <TableBody>
// // //                   {allAdmissions
// // //                     .filter(
// // //                       (i) =>
// // //                         String(i.status || "").toUpperCase() === "ACTIVE" &&
// // //                         Number(i.stage_id) !== 8 &&
// // //                         (stageFilter === "all" ||
// // //                           i.stage_name === stageFilter)
// // //                     )
// // //                     .sort(byNameAsc)
// // //                     .map((i) => (
// // //                       <TableRow
// // //                         key={i.id}
// // //                         className="cursor-pointer"
// // //                         onClick={() => setViewForm(i)}
// // //                       >
// // //                         <TableCell className="font-mono text-xs">
// // //                           {i.id}
// // //                         </TableCell>
// // //                         <TableCell className="font-medium">
// // //                           {i.full_name}
// // //                         </TableCell>
// // //                         <TableCell>{i.class_name}</TableCell>
// // //                         <TableCell className="text-xs">
// // //                           {i.primary_phone}
// // //                         </TableCell>
// // //                         <TableCell>
// // //                           <Badge variant="secondary" className="text-[10px]">
// // //                             {i.stage_name}
// // //                           </Badge>
// // //                         </TableCell>
// // //                         <TableCell>
// // //                           <Badge variant="outline">{i.source_name}</Badge>
// // //                         </TableCell>
// // //                         <TableCell className="text-xs text-muted-foreground">
// // //                           {new Date(i.created_at).toLocaleDateString()}
// // //                         </TableCell>
// // //                         <TableCell
// // //                           className="text-right"
// // //                           onClick={(e) => e.stopPropagation()}
// // //                         >
// // //                           <Button
// // //                             size="sm"
// // //                             variant="ghost"
// // //                             onClick={() => setViewForm(i)}
// // //                           >
// // //                             <Eye className="h-3.5 w-3.5" />
// // //                             View
// // //                           </Button>
// // //                           <Button
// // //                             size="sm"
// // //                             variant="ghost"
// // //                             className="text-destructive"
// // //                             onClick={() => {
// // //                               setRejectFor(i);
// // //                               setRejectReason("");
// // //                             }}
// // //                           >
// // //                             <XCircle className="h-3.5 w-3.5" />
// // //                             Reject
// // //                           </Button>
// // //                         </TableCell>
// // //                       </TableRow>
// // //                     ))}
// // //                 </TableBody>
// // //               </Table>
// // //             </CardContent>
// // //           </Card>
// // //         </TabsContent>

// // //         {/* ---------------- REJECTED ---------------- */}
// // //         <TabsContent value="rejected" className="mt-4 space-y-3">
// // //           <Card>
// // //             <CardHeader className="pb-2">
// // //               <CardTitle className="text-base flex items-center gap-2 text-destructive">
// // //                 <XCircle className="h-4 w-4" />
// // //                 Rejected Inquiries
// // //               </CardTitle>
// // //             </CardHeader>
// // //             <CardContent className="p-0">
// // //               <Table>
// // //                 <TableHeader>
// // //                   <TableRow>
// // //                     <TableHead>ID</TableHead>
// // //                     <TableHead>Applicant</TableHead>
// // //                     <TableHead>Class</TableHead>
// // //                     <TableHead>Reason</TableHead>
// // //                     <TableHead>Rejected On</TableHead>
// // //                     <TableHead className="text-right">Action</TableHead>
// // //                   </TableRow>
// // //                 </TableHeader>
// // //                 <TableBody>
// // //                   {rejectedList.length === 0 && (
// // //                     <TableRow>
// // //                       <TableCell
// // //                         colSpan={6}
// // //                         className="text-center text-sm text-muted-foreground py-8"
// // //                       >
// // //                         No rejected inquiries.
// // //                       </TableCell>
// // //                     </TableRow>
// // //                   )}
// // //                   {rejectedList.map((i) => (
// // //                     <TableRow key={i.id}>
// // //                       <TableCell className="font-mono text-xs">
// // //                         {i.id}
// // //                       </TableCell>
// // //                       <TableCell className="font-medium">
// // //                         {i.full_name}
// // //                         <div className="text-[10px] text-muted-foreground">
// // //                           {i.primary_phone}
// // //                         </div>
// // //                       </TableCell>
// // //                       <TableCell>{i.class_name}</TableCell>
// // //                       <TableCell
// // //                         className="text-xs max-w-md cursor-pointer hover:underline"
// // //                         onClick={() => setViewReasonFor(i)}
// // //                         title="Click to view full rejection reason"
// // //                       >
// // //                         <span className="line-clamp-2">
// // //                           {i.rejection_reason || "—"}
// // //                         </span>
// // //                       </TableCell>
// // //                       <TableCell className="text-xs text-muted-foreground">
// // //                         {i.rejected_at
// // //                           ? new Date(i.rejected_at).toLocaleDateString()
// // //                           : "—"}
// // //                       </TableCell>
// // //                       <TableCell className="text-right">
// // //                         <Button
// // //                           size="sm"
// // //                           variant="outline"
// // //                           onClick={() => reinstate(i)}
// // //                         >
// // //                           <RotateCcw className="h-3.5 w-3.5" />
// // //                           Reinstate
// // //                         </Button>
// // //                       </TableCell>
// // //                     </TableRow>
// // //                   ))}
// // //                 </TableBody>
// // //               </Table>
// // //             </CardContent>
// // //           </Card>
// // //         </TabsContent>

// // //         {/* ---------------- ADMISSION TEST ---------------- */}
// // //         <TabsContent value="test" className="mt-4 space-y-3">
// // //           <Card>
// // //             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// // //               <CardTitle className="text-base flex items-center gap-2">
// // //                 <ClipboardCheck className="h-4 w-4" />
// // //                 Admission Test Results
// // //               </CardTitle>
// // //               <Select value={testFilter} onValueChange={setTestFilter}>
// // //                 <SelectTrigger className="h-8 w-44 text-xs">
// // //                   <SelectValue placeholder="Filter" />
// // //                 </SelectTrigger>
// // //                 <SelectContent>
// // //                   <SelectItem value="all">All scores</SelectItem>
// // //                   <SelectItem value="85">85 – 100% (Excellent)</SelectItem>
// // //                   <SelectItem value="70">70 – 85% (Good)</SelectItem>
// // //                   <SelectItem value="50">50 – 70% (Average)</SelectItem>
// // //                   <SelectItem value="0">Below 50% (Weak)</SelectItem>
// // //                   <SelectItem value="pending">Not attempted</SelectItem>
// // //                 </SelectContent>
// // //               </Select>
// // //             </CardHeader>
// // //             <CardContent className="p-0">
// // //               <Table>
// // //                 <TableHeader>
// // //                   <TableRow>
// // //                     <TableHead>ID</TableHead>
// // //                     <TableHead>Candidate</TableHead>
// // //                     <TableHead>Class</TableHead>
// // //                     <TableHead>Score</TableHead>
// // //                     <TableHead>Grade</TableHead>
// // //                     <TableHead>Stage</TableHead>
// // //                   </TableRow>
// // //                 </TableHeader>
// // //                 <TableBody>
// // //                   {allAdmissions
// // //                     .filter((i) => {
// // //                       // Only ACTIVE admissions are shown.
// // //                       if (String(i.status || "").toUpperCase() !== "ACTIVE") return false;

// // //                       // `test_score` is not part of the current admissions
// // //                       // API response — add it server-side to populate this tab.
// // //                       const s = i.test_score;
// // //                       if (testFilter === "all") return true;
// // //                       if (testFilter === "pending") return s == null;
// // //                       if (s == null) return false;
// // //                       const min = Number(testFilter);
// // //                       const max =
// // //                         min === 85 ? 100 : min === 70 ? 85 : min === 50 ? 70 : 50;
// // //                       return s >= min && s < max + (min === 85 ? 1 : 0);
// // //                     })
// // //                     .sort(byNameAsc)
// // //                     .map((i) => {
// // //                       const s = i.test_score;
// // //                       const grade =
// // //                         s == null ? "—" : s >= 85 ? "A+" : s >= 70 ? "A" : s >= 50 ? "B" : "C";
// // //                       const tone =
// // //                         s == null ? "outline" : s >= 70 ? "default" : s >= 50 ? "secondary" : "destructive";
// // //                       return (
// // //                         <TableRow key={i.id}>
// // //                           <TableCell className="font-mono text-xs">
// // //                             {i.id}
// // //                           </TableCell>
// // //                           <TableCell className="font-medium">
// // //                             {i.full_name}
// // //                           </TableCell>
// // //                           <TableCell>{i.class_name}</TableCell>
// // //                           <TableCell className="font-semibold">
// // //                             {s ?? "—"}
// // //                             {s != null && "%"}
// // //                           </TableCell>
// // //                           <TableCell>
// // //                             <Badge variant={tone}>{grade}</Badge>
// // //                           </TableCell>
// // //                           <TableCell>
// // //                             <span className="text-xs text-muted-foreground">
// // //                               {i.stage_name}
// // //                             </span>
// // //                           </TableCell>
// // //                         </TableRow>
// // //                       );
// // //                     })}
// // //                 </TableBody>
// // //               </Table>
// // //             </CardContent>
// // //           </Card>
// // //         </TabsContent>

// // //         {/* ---------------- ANALYTICS ---------------- */}
// // //         <TabsContent value="analytics" className="mt-4">
// // //           <div className="grid md:grid-cols-3 gap-4 mb-4">
// // //             <Card>
// // //               <CardContent className="p-4">
// // //                 <div className="text-xs text-muted-foreground">
// // //                   Total Inquiries
// // //                 </div>
// // //                 <div className="text-3xl font-display font-semibold mt-1">
// // //                   {total}
// // //                 </div>
// // //               </CardContent>
// // //             </Card>
// // //             <Card>
// // //               <CardContent className="p-4">
// // //                 <div className="text-xs text-muted-foreground">Enrolled</div>
// // //                 <div className="text-3xl font-display font-semibold mt-1 text-success">
// // //                   {enrolled}
// // //                 </div>
// // //               </CardContent>
// // //             </Card>
// // //             <Card>
// // //               <CardContent className="p-4">
// // //                 <div className="text-xs text-muted-foreground flex items-center gap-1">
// // //                   <TrendingUp className="h-3 w-3" />
// // //                   Conversion Rate
// // //                 </div>
// // //                 <div className="text-3xl font-display font-semibold mt-1">
// // //                   {convRate}%
// // //                 </div>
// // //               </CardContent>
// // //             </Card>
// // //           </div>
// // //           <Card className="mb-4">
// // //             <CardHeader>
// // //               <CardTitle className="text-base">Stage Funnel</CardTitle>
// // //             </CardHeader>
// // //             <CardContent className="space-y-2">
// // //               {counts.map((c) => (
// // //                 <div key={c.stage} className="flex items-center gap-3">
// // //                   <div className="w-32 text-xs text-muted-foreground">
// // //                     {c.stage}
// // //                   </div>
// // //                   <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
// // //                     <div
// // //                       className="h-full bg-gradient-to-r from-primary to-accent"
// // //                       style={{ width: `${total ? (c.n / total) * 100 : 0}%` }}
// // //                     />
// // //                   </div>
// // //                   <div className="w-12 text-right text-sm font-medium">
// // //                     {c.n}
// // //                   </div>
// // //                 </div>
// // //               ))}
// // //             </CardContent>
// // //           </Card>
// // //           <Card>
// // //             <CardHeader>
// // //               <CardTitle className="text-base">By Source</CardTitle>
// // //             </CardHeader>
// // //             <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
// // //               {bySource.map((s) => (
// // //                 <div key={s.source} className="p-3 border rounded-md">
// // //                   <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
// // //                     {s.source}
// // //                   </div>
// // //                   <div className="text-xl font-display font-semibold mt-1">
// // //                     {s.count}
// // //                   </div>
// // //                 </div>
// // //               ))}
// // //             </CardContent>
// // //           </Card>
// // //         </TabsContent>
// // //       </Tabs>

// // //       {/* Public Admission Form */}
// // //       <Dialog open={formOpen} onOpenChange={setFormOpen}>
// // //         <DialogContent className="max-w-lg">
// // //           <DialogHeader>
// // //             <DialogTitle>Public Admission Form</DialogTitle>
// // //             <DialogDescription>
// // //               Minimum details to register an enquiry.
// // //             </DialogDescription>
// // //           </DialogHeader>
// // //           <div className="grid grid-cols-2 gap-3">
// // //             <div className="col-span-2">
// // //               <Label>Full Name *</Label>
// // //               <Input
// // //                 value={publicForm.name}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, name: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <div>
// // //               <Label>Email</Label>
// // //               <Input
// // //                 type="email"
// // //                 value={publicForm.email}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, email: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <div>
// // //               <Label>Phone *</Label>
// // //               <Input
// // //                 value={publicForm.phone}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, phone: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <div>
// // //               <Label>Location</Label>
// // //               <Input
// // //                 value={publicForm.location}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, location: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <div>
// // //               <Label>Previous School</Label>
// // //               <Input
// // //                 value={publicForm.school}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, school: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <div>
// // //               <Label>Parent Name</Label>
// // //               <Input
// // //                 value={publicForm.parent}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, parent: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <div>
// // //               <Label>Parent Occupation</Label>
// // //               <Input
// // //                 value={publicForm.occupation}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, occupation: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // // <div className="col-span-2">
// // //   <Label>Class Applying For</Label>

// // //   <Select
// // //     value={publicForm.class_uuid}
// // //     onValueChange={(value) =>
// // //       setPublicForm((prev) => ({
// // //         ...prev,
// // //         class_uuid: value,
// // //       }))
// // //     }
// // //   >
// // //     <SelectTrigger disabled={classesLoading}>
// // //       <SelectValue
// // //         placeholder={
// // //           classesLoading
// // //             ? "Loading classes..."
// // //             : "Select class"
// // //         }
// // //       />
// // //     </SelectTrigger>

// // //     <SelectContent>
// // //       {classes.length === 0 ? (
// // //         <SelectItem value="no-class" disabled>
// // //           No classes available
// // //         </SelectItem>
// // //       ) : (
// // //         classes.map((c) => (
// // //           <SelectItem
// // //             key={c.class_uuid || c.id}
// // //             value={String(c.class_uuid || c.id)}
// // //           >
// // //             {c.class_name || c.name}
// // //           </SelectItem>
// // //         ))
// // //       )}
// // //     </SelectContent>
// // //   </Select>
// // // </div>
// // //             <div className="col-span-2">
// // //               <Label>Notes</Label>
// // //               <Textarea
// // //                 rows={2}
// // //                 value={publicForm.notes}
// // //                 onChange={(e) =>
// // //                   setPublicForm({ ...publicForm, notes: e.target.value })
// // //                 }
// // //               />
// // //             </div>
// // //             <label className="col-span-2 flex items-start gap-2 text-xs">
// // //               <Checkbox
// // //                 checked={publicForm.consent}
// // //                 onCheckedChange={(v) =>
// // //                   setPublicForm({ ...publicForm, consent: !!v })
// // //                 }
// // //               />
// // //               <span>
// // //                 I consent to the school storing this information for admission
// // //                 processing.
// // //               </span>
// // //             </label>
// // //           </div>
// // //           <DialogFooter>
// // //             <Button variant="ghost" onClick={() => setFormOpen(false)}>
// // //               Cancel
// // //             </Button>
// // //             <Button
// // //               disabled={!publicForm.consent || !publicForm.name || !publicForm.phone}
// // //               onClick={submitPublicForm}
// // //             >
// // //               Submit
// // //             </Button>
// // //           </DialogFooter>
// // //         </DialogContent>
// // //       </Dialog>

// // //       {/* View Form Details */}
// // //       <Dialog open={!!viewForm} onOpenChange={(o) => !o && setViewForm(null)}>
// // //         <DialogContent className="max-w-lg">
// // //           <DialogHeader>
// // //             <DialogTitle>
// // //               {viewForm?.full_name} — {viewForm?.id}
// // //             </DialogTitle>
// // //             <DialogDescription>Admission form details</DialogDescription>
// // //           </DialogHeader>
// // //           {viewForm && (
// // //             <div className="grid grid-cols-2 gap-3 text-sm">
// // //               <div>
// // //                 <Label className="text-xs">Class</Label>
// // //                 <div>{viewForm.class_name}</div>
// // //               </div>
// // //               <div>
// // //                 <Label className="text-xs">Source</Label>
// // //                 <div>{viewForm.source_name}</div>
// // //               </div>
// // //               <div>
// // //                 <Label className="text-xs">Phone</Label>
// // //                 <div>{viewForm.primary_phone}</div>
// // //               </div>
// // //               <div>
// // //                 <Label className="text-xs">Email</Label>
// // //                 <div>{viewForm.email}</div>
// // //               </div>
// // //               <div className="col-span-2">
// // //                 <Label className="text-xs">Notes</Label>
// // //                 <div className="whitespace-pre-wrap">
// // //                   {viewForm.notes || "—"}
// // //                 </div>
// // //               </div>
// // //               <div>
// // //                 <Label className="text-xs">Stage</Label>
// // //                 <div>
// // //                   <Badge>{viewForm.stage_name}</Badge>
// // //                 </div>
// // //               </div>
// // //               <div>
// // //                 <Label className="text-xs">Counselor</Label>
// // //                 <div>{viewForm.counselor_name || "—"}</div>
// // //               </div>
// // //             </div>
// // //           )}
// // //           <DialogFooter>
// // //             <Button
// // //               variant="outline"
// // //               onClick={() => {
// // //                 if (viewForm) {
// // //                   navigate(`/admin/admissions/${viewForm.admission_uuid}`);
// // //                   setViewForm(null);
// // //                 }
// // //               }}
// // //             >
// // //               Open full record
// // //             </Button>
// // //             <Button onClick={() => setViewForm(null)}>Close</Button>
// // //           </DialogFooter>
// // //         </DialogContent>
// // //       </Dialog>

// // //       {/* Reject inquiry dialog */}
// // //       <Dialog
// // //         open={!!rejectFor}
// // //         onOpenChange={(o) => {
// // //           if (!o) {
// // //             setRejectFor(null);
// // //             setRejectReason("");
// // //           }
// // //         }}
// // //       >
// // //         <DialogContent className="max-w-md">
// // //           <DialogHeader>
// // //             <DialogTitle>Reason for Rejection</DialogTitle>
// // //             <DialogDescription>
// // //               {rejectFor?.full_name} · {rejectFor?.id} — this inquiry will move
// // //               to the Rejected list.
// // //             </DialogDescription>
// // //           </DialogHeader>
// // //           <div className="space-y-2">
// // //             <Label className="text-xs">Reason *</Label>
// // //             <Textarea
// // //               rows={4}
// // //               value={rejectReason}
// // //               onChange={(e) => setRejectReason(e.target.value)}
// // //               placeholder="e.g. Seats full for the requested class, documents incomplete, applicant withdrew, etc."
// // //             />
// // //           </div>
// // //           <DialogFooter>
// // //             <Button
// // //               variant="ghost"
// // //               onClick={() => {
// // //                 setRejectFor(null);
// // //                 setRejectReason("");
// // //               }}
// // //             >
// // //               Cancel
// // //             </Button>
// // //             <Button variant="destructive" onClick={confirmReject}>
// // //               <XCircle className="h-4 w-4" />
// // //               Reject Inquiry
// // //             </Button>
// // //           </DialogFooter>
// // //         </DialogContent>
// // //       </Dialog>

// // //       {/* View rejection reason (read-only) — opened from Kanban card / Rejected table */}
// // //       <Dialog
// // //         open={!!viewReasonFor}
// // //         onOpenChange={(o) => !o && setViewReasonFor(null)}
// // //       >
// // //         <DialogContent className="max-w-md">
// // //           <DialogHeader>
// // //             <DialogTitle>Reason for Rejection</DialogTitle>
// // //             <DialogDescription>
// // //               {viewReasonFor?.full_name} · {viewReasonFor?.id}
// // //               {viewReasonFor?.rejected_at &&
// // //                 ` — rejected ${new Date(viewReasonFor.rejected_at).toLocaleDateString()}`}
// // //             </DialogDescription>
// // //           </DialogHeader>
// // //           <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
// // //             {viewReasonFor?.rejection_reason || "No reason recorded."}
// // //           </div>
// // //           <DialogFooter>
// // //             <Button variant="outline" onClick={() => setViewReasonFor(null)}>
// // //               Close
// // //             </Button>
// // //           </DialogFooter>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </PageContainer>
// // //   );
// // // }





// // import { useEffect, useMemo, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // import {
// //   getAdmissionPipeline,
// //   getAdmissionAnalytics,
// //   getAdmissionSources,
// //   getAdmissionCounselors,
// //   getStages,
// //   getAllAdmissions,
// //   enrollStudent,
// //   createAdmission,
// //   importAdmissions,
// //   rejectAdmission,
// //   reinstateAdmission
// // } from "../../../api/admissions";
// // import { getClasses } from "../../../api/Class";
// // import useAuthStore from "../../../store/authStore";

// // import { PageContainer, PageHeader } from "../../../components/page-shell";
// // import {
// //   Card,
// //   CardContent,
// //   CardHeader,
// //   CardTitle,
// // } from "../../../components/ui/card";
// // import { Button } from "../../../components/ui/button";
// // import { Badge } from "../../../components/ui/badge";
// // import { Input } from "../../../components/ui/input";
// // import {
// //   Select,
// //   SelectTrigger,
// //   SelectValue,
// //   SelectContent,
// //   SelectItem,
// // } from "../../../components/ui/select";
// // import { Checkbox } from "../../../components/ui/checkbox";
// // import {
// //   Avatar,
// //   AvatarImage,
// //   AvatarFallback,
// // } from "../../../components/ui/avatar";
// // import {
// //   Tabs,
// //   TabsList,
// //   TabsTrigger,
// //   TabsContent,
// // } from "../../../components/ui/tabs";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogDescription,
// //   DialogFooter,
// // } from "../../../components/ui/dialog";
// // import { Label } from "../../../components/ui/label";
// // import { Textarea } from "../../../components/ui/textarea";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "../../../components/ui/table";
// // import {
// //   Plus,
// //   Search,
// //   Phone,
// //   Mail,
// //   ArrowRight,
// //   Archive,
// //   Trash2,
// //   Send,
// //   TrendingUp,
// //   FileText,
// //   ClipboardCheck,
// //   Eye,
// //   XCircle,
// //   RotateCcw,
// // } from "lucide-react";

// // import { toast } from "sonner";
// // import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";
// // import { ExcelUpload } from "../../../components/excel-upload";
// // import { ExcelExport } from "../../../components/excel-export";

// // const getApiErrorMessage = (err, fallback = "Something went wrong") => {
// //   const detail = err?.response?.data?.detail;
// //   const message = err?.response?.data?.message || err?.response?.data?.error;

// //   const stringify = (value) => {
// //     if (value == null) return "";
// //     if (typeof value === "string" || typeof value === "number") return String(value);

// //     if (Array.isArray(value)) {
// //       return value.map(stringify).filter(Boolean).join("\n");
// //     }

// //     if (typeof value === "object") {
// //       if (value.msg) {
// //         const loc = Array.isArray(value.loc)
// //           ? value.loc.filter((x) => x !== "body").join(" → ")
// //           : "";
// //         return loc ? `${loc}: ${String(value.msg)}` : String(value.msg);
// //       }
// //       if (value.message) return String(value.message);
// //       try {
// //         return JSON.stringify(value);
// //       } catch {
// //         return fallback;
// //       }
// //     }

// //     return String(value);
// //   };

// //   return stringify(detail) || stringify(message) || err?.message || fallback;
// // };

// // const stageColor = {
// //   Inquiry: "border-l-muted-foreground",
// //   Lead: "border-l-info",
// //   Counseling: "border-l-chart-3",
// //   "Admission Test": "border-l-warning",
// //   "Doc Verification": "border-l-accent",
// //   "Fee Payment": "border-l-chart-5",
// //   Enrolled: "border-l-success",
// //   Rejected: "border-l-destructive",
// // };

// // // Stages that are dead-ends in the pipeline — no "advance to next stage"
// // // button should ever be shown on cards sitting in these columns, and
// // // "Rejected" specifically must never be computed as anyone's "next" stage
// // // (rejection has its own dedicated flow via the reject dialog / drag-to-Rejected).
// // const TERMINAL_STAGES = ["Enrolled", "Rejected"];



// // export default function Admissions() {
// //   const navigate = useNavigate();
// //   const instituteUUID = useAuthStore((state) => state.instituteUUID);

// //   // ---- server data ----
// //   const [pipelineData, setPipelineData] = useState([]);
// //   const [analytics, setAnalytics] = useState({});
// //   const [sources, setSources] = useState([]);
// //   const [counselors, setCounselors] = useState([]);
// //   const [stages, setStages] = useState([]);
// //   const [allAdmissions, setAllAdmissions] = useState([]);

// //   // ---- pipeline filters / selection ----
// //   const [q, setQ] = useState("");
// //   const [src, setSrc] = useState("all");
// //   const [counselor, setCounselor] = useState("all");
// //   const [selected, setSelected] = useState(new Set());
// //   const [dragItem, setDragItem] = useState(null);
// //   const [tab, setTab] = useState("pipeline");

// //   // ---- search autosuggest ----
// //   const [suggestOpen, setSuggestOpen] = useState(false);
// //   const [suggestIndex, setSuggestIndex] = useState(-1);
// //   const searchBoxRef = useRef(null);

// //   // ---- forms / test tabs ----
// //   const [viewForm, setViewForm] = useState(null);
// //   const [testFilter, setTestFilter] = useState("all");
// //   const [stageFilter, setStageFilter] = useState("all");

// //   // ---- reject dialog ----
// //   const [rejectFor, setRejectFor] = useState(null);
// //   const [rejectReason, setRejectReason] = useState("");

// //   // ---- view rejection reason dialog (read-only) ----
// //   const [viewReasonFor, setViewReasonFor] = useState(null);
// //   const [classes, setClasses] = useState([]);
// //   const [classesLoading, setClassesLoading] = useState(false);
// //   // ---- public form dialog ----
// //   const [formOpen, setFormOpen] = useState(false);
// //   const [publicForm, setPublicForm] = useState({
// //     name: "",
// //     email: "",
// //     phone: "",
// //     location: "",
// //     school: "",
// //     parent: "",
// //     occupation: "",
// //      class_uuid: "",
// //     notes: "",
// //     consent: false,
// //   });

// // const loadClasses = async () => {
// //   try {
// //     setClassesLoading(true);

// //     const res = await getClasses();

// //     const list = res.data?.data || res.data || res || [];

// //     setClasses(Array.isArray(list) ? list : []);
// //   } catch (err) {
// //     console.error("Failed to load classes:", err);
// //     setClasses([]);
// //     toast.error("Failed to load classes");
// //   } finally {
// //     setClassesLoading(false);
// //   }
// // };

// // useEffect(() => {
// //   loadData();
// //   loadClasses();
// // }, []);

// //   const loadData = async () => {
// //     try {
// //       const [
// //         pipelineRes,
// //         analyticsRes,
// //         sourceRes,
// //         counselorRes,
// //         stageRes,
// //         allRes,
// //       ] = await Promise.all([
// //         getAdmissionPipeline(),
// //         getAdmissionAnalytics(),
// //         getAdmissionSources(),
// //         getAdmissionCounselors(),
// //         getStages(),
// //         getAllAdmissions(),
// //       ]);

// //       const pipeline = Array.isArray(pipelineRes.data)
// //         ? pipelineRes.data
// //         : [];

// //       // The pipeline API now returns the timestamp for the latest
// //       // movement into the current stage as `stage_updated_at`.
// //       // Merge that value into the full-admission records used by
// //       // the cards/tables so the UI shows the current-stage date
// //       // instead of the original admission creation date.
// //       const stageDateMap = {};
// //       pipeline.forEach((stage) => {
// //         (Array.isArray(stage.students) ? stage.students : []).forEach((item) => {
// //           if (!item?.admission_uuid) return;
// //           stageDateMap[item.admission_uuid] = {
// //             stage_name: item.stage_name || stage.stage_name,
// //             stage_id: item.stage_id,
// //             stage_updated_at: item.stage_updated_at || item.created_at || null,
// //           };
// //         });
// //       });

// //       const fullAdmissions = (Array.isArray(allRes.data) ? allRes.data : []).map(
// //         (admission) => ({
// //           ...admission,
// //           ...(stageDateMap[admission.admission_uuid] || {}),
// //         })
// //       );

// //       setPipelineData(pipeline);
// //       setAnalytics(analyticsRes.data);
// //       setSources(sourceRes.data);
// //       setCounselors(counselorRes.data);
// //       setStages(stageRes.data?.data || []);
// //       setAllAdmissions(fullAdmissions);
// //     } catch (err) {
// //       console.error("Failed to load admissions data:", err);
// //       toast.error(getApiErrorMessage(err, "Failed to load admissions data"));
// //     }
// //   };

// //   const stageNames = useMemo(() => stages.map((s) => s.stage_name), [stages]);

// //   // Shared filter predicate used by both the active pipeline cards and the
// //   // rejected list, so every column respects the same search/source/counselor
// //   // filters consistently.
// //   const matchesFilters = (c) => {
// //     if (
// //       q &&
// //       !(
// //         c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
// //         c.primary_phone?.includes(q)
// //       )
// //     )
// //       return false;
// //     if (src !== "all" && c.source_name !== src) return false;
// //     if (counselor !== "all" && c.counselor_name !== counselor) return false;
// //     return true;
// //   };

// //   const byNameAsc = (a, b) =>
// //     (a.full_name || "").localeCompare(b.full_name || "", undefined, {
// //       sensitivity: "base",
// //     });

// //   // ============================================================
// //   // STATUS VISIBILITY RULES
// //   //
// //   // Status        Normal Pipeline   Rejected   Pipeline Count
// //   // ACTIVE              ✅              —             ✅
// //   // TRANSFERRED         ✅              —             ✅
// //   // REJECTED            —              ✅             ✅
// //   // DELETED             ❌              ❌             ❌
// //   //
// //   // i.e. DELETED is hidden everywhere and never counted.
// //   // Everything else (ACTIVE / TRANSFERRED / REJECTED) is counted in the
// //   // Pipeline Count. REJECTED is only ever *displayed* in the Rejected
// //   // column/tab; ACTIVE + TRANSFERRED are only ever displayed in the
// //   // Normal Pipeline columns.
// //   // ============================================================

// //   const isDeleted = (admission) =>
// //     String(admission?.status || "").toUpperCase() === "DELETED";

// //   const isRejected = (admission) => {
// //     const status = String(admission?.status || "").toUpperCase();

// //     return (
// //       status === "REJECTED" ||
// //       Number(admission?.stage_id) === 8 ||
// //       admission?.stage_name === "Rejected"
// //     );
// //   };

// //   // Normal pipeline cards:
// //   // ACTIVE + TRANSFERRED are shown here.
// //   // REJECTED is shown in the Rejected column.
// //   // DELETED is hidden everywhere.
// //   const cards = useMemo(() => {
// //     return allAdmissions
// //       .filter((c) => {
// //         if (isDeleted(c)) return false;
// //         if (isRejected(c)) return false;

// //         return matchesFilters(c);
// //       })
// //       .sort(byNameAsc);
// //   }, [allAdmissions, q, src, counselor]);

// //   // Rejected column:
// //   // REJECTED / stage 8 are shown.
// //   // DELETED is always hidden.
// //   const rejectedList = useMemo(() => {
// //     return allAdmissions
// //       .filter((c) => {
// //         if (isDeleted(c)) return false;
// //         return isRejected(c);
// //       })
// //       .filter(matchesFilters)
// //       .sort(byNameAsc);
// //   }, [allAdmissions, q, src, counselor]);

// //   // Rejected badge/count:
// //   // Count rejected records except DELETED.
// //   const rejectedTotal = useMemo(() => {
// //     return allAdmissions.filter((c) => {
// //       if (isDeleted(c)) return false;
// //       return isRejected(c);
// //     }).length;
// //   }, [allAdmissions]);

// //   // Pipeline counts (Kanban column badges):
// //   // Count ALL statuses except DELETED — i.e. ACTIVE + TRANSFERRED + REJECTED.
// //   //
// //   // ACTIVE       -> COUNT
// //   // TRANSFERRED  -> COUNT
// //   // REJECTED     -> COUNT
// //   // DELETED      -> NOT COUNTED
// //   const pipelineStageCounts = useMemo(() => {
// //     const counts = {};

// //     allAdmissions.forEach((admission) => {
// //       if (isDeleted(admission)) return;

// //       const stageName =
// //         admission.stage_name ||
// //         stages.find(
// //           (s) =>
// //             String(s.id) === String(admission.stage_id)
// //         )?.stage_name;

// //       if (!stageName) return;

// //       counts[stageName] =
// //         (counts[stageName] || 0) + 1;
// //     });

// //     return counts;
// //   }, [allAdmissions, stages]);

// //   // Unique applicant names for the search autosuggest dropdown, filtered
// //   // against the current query (Google-style — only relevant matches show,
// //   // capped to keep the list short).
// //   const nameSuggestions = useMemo(() => {
// //     const unique = Array.from(
// //       new Set(allAdmissions.map((a) => a.full_name).filter(Boolean))
// //     ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

// //     if (!q.trim()) return [];
// //     const query = q.toLowerCase();
// //     return unique
// //       .filter((name) => name.toLowerCase().includes(query))
// //       .slice(0, 8);
// //   }, [allAdmissions, q]);

// //   // Close the suggestion dropdown on outside click.
// //   useEffect(() => {
// //     const handleClick = (e) => {
// //       if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
// //         setSuggestOpen(false);
// //         setSuggestIndex(-1);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClick);
// //     return () => document.removeEventListener("mousedown", handleClick);
// //   }, []);

// //   const chooseSuggestion = (name) => {
// //     setQ(name);
// //     setSuggestOpen(false);
// //     setSuggestIndex(-1);
// //   };

// //   const handleSearchKeyDown = (e) => {
// //     if (!suggestOpen || nameSuggestions.length === 0) return;
// //     if (e.key === "ArrowDown") {
// //       e.preventDefault();
// //       setSuggestIndex((i) => (i + 1) % nameSuggestions.length);
// //     } else if (e.key === "ArrowUp") {
// //       e.preventDefault();
// //       setSuggestIndex(
// //         (i) => (i - 1 + nameSuggestions.length) % nameSuggestions.length
// //       );
// //     } else if (e.key === "Enter") {
// //       if (suggestIndex >= 0) {
// //         e.preventDefault();
// //         chooseSuggestion(nameSuggestions[suggestIndex]);
// //       } else {
// //         setSuggestOpen(false);
// //       }
// //     } else if (e.key === "Escape") {
// //       setSuggestOpen(false);
// //       setSuggestIndex(-1);
// //     }
// //   };

// //   // Highlights the matched substring within a suggestion, like search
// //   // engines do.
// //   const highlightMatch = (name) => {
// //     const idx = name.toLowerCase().indexOf(q.toLowerCase());
// //     if (idx === -1) return name;
// //     return (
// //       <>
// //         {name.slice(0, idx)}
// //         <span className="font-semibold text-foreground">
// //           {name.slice(idx, idx + q.length)}
// //         </span>
// //         {name.slice(idx + q.length)}
// //       </>
// //     );
// //   };

// //   const openStage = (stageName) => {
// //     setStageFilter(stageName);
// //     setTab(stageName === "Rejected" ? "rejected" : "forms");
// //   };

// //   const toggleSel = (id) =>
// //     setSelected((p) => {
// //       const n = new Set(p);
// //       if (n.has(id)) n.delete(id);
// //       else n.add(id);
// //       return n;
// //     });

// //   const moveToStage = async (admissionUuid, stageName) => {
// //     const nextStage = stages.find((s) => s.stage_name === stageName);
// //     if (!nextStage) return;
// //     const res = await enrollStudent(admissionUuid, nextStage.id);
// //     toast.success(res.data.message || `Moved to ${stageName}`);
// //   };

// //   const onDrop = async (stageName) => {
// //     if (!dragItem) return;
// //     try {
// //       await moveToStage(dragItem.admission_uuid, stageName);
// //       setDragItem(null);
// //       loadData();
// //     } catch (err) {
// //       toast.error(getApiErrorMessage(err, "Failed to move stage"));
// //     }
// //   };

// //   const bulkMove = async (stageName) => {
// //     try {
// //       const nextStage = stages.find((s) => s.stage_name === stageName);
// //       if (!nextStage) return;

// //       for (const id of selected) {
// //         const student = allAdmissions.find((a) => a.id === id);
// //         if (student) await enrollStudent(student.admission_uuid, nextStage.id);
// //       }

// //       toast.success(`${selected.size} moved successfully`);
// //       setSelected(new Set());
// //       loadData();
// //     } catch (err) {
// //       toast.error("Failed to move stage");
// //     }
// //   };

// //   const confirmReject = async () => {
// //     if (!rejectFor) return;

// //     if (!rejectReason.trim()) {
// //       toast.error("Reason is required");
// //       return;
// //     }

// //     try {
// //       const res = await rejectAdmission(
// //         rejectFor.admission_uuid,
// //         rejectReason.trim()
// //       );

// //       toast.success(
// //         res.data?.message || "Admission rejected successfully."
// //       );

// //       setRejectFor(null);
// //       setRejectReason("");

// //       await loadData();

// //     } catch (err) {
// //       toast.error(getApiErrorMessage(err, "Failed to reject admission."));
// //     }
// //   };

// //   const reinstate = async (admission) => {
// //     try {
// //       const res = await reinstateAdmission(
// //         admission.admission_uuid
// //       );

// //       toast.success(
// //         res.data?.message ||
// //         `${admission.full_name} reinstated successfully.`
// //       );

// //       await loadData();

// //     } catch (err) {
// //       toast.error(getApiErrorMessage(err, "Failed to reinstate admission."));
// //     }
// //   };

// //   const submitPublicForm = async () => {
// //     try {
// //       const fullName = publicForm.name.trim();
// //       const phone = publicForm.phone.trim();

// //       if (!fullName) {
// //         toast.error("Full Name is required");
// //         return;
// //       }

// //       if (!phone) {
// //         toast.error("Phone is required");
// //         return;
// //       }

// //       if (!publicForm.class_uuid) {
// //         toast.error("Please select a class");
// //         return;
// //       }

// //       if (!publicForm.consent) {
// //         toast.error("Please accept the consent");
// //         return;
// //       }

// //       if (!instituteUUID) {
// //         toast.error("Institute context missing. Please re-login and try again.");
// //         return;
// //       }

// //       const payload = {
// //         institute_uuid: instituteUUID,
// //         full_name: fullName,
// //         email: publicForm.email.trim() || null,
// //         primary_phone: phone,
// //         address: publicForm.location.trim() || null,
// //         prev_school: publicForm.school.trim() || null,
// //         parent_name: publicForm.parent.trim() || null,
// //         class_uuid: publicForm.class_uuid,
// //         source_name: "Website",
// //         notes: [
// //           publicForm.occupation.trim()
// //             ? `Parent occupation: ${publicForm.occupation.trim()}`
// //             : "",
// //           publicForm.notes.trim() ? publicForm.notes.trim() : "",
// //         ]
// //           .filter(Boolean)
// //           .join("\n") || null,
// //       };

// //       console.log("Creating public admission:", payload);

// //       const response = await createAdmission(payload);

// //       toast.success(
// //         response?.data?.message || "Admission enquiry submitted successfully"
// //       );

// //       setFormOpen(false);
// //       setPublicForm({
// //         name: "",
// //         email: "",
// //         phone: "",
// //         location: "",
// //         school: "",
// //         parent: "",
// //         occupation: "",
// //         class_uuid: "",
// //         notes: "",
// //         consent: false,
// //       });

// //       await loadData();
// //     } catch (err) {
// //       console.error("Public admission error:", err);
// //       toast.error(getApiErrorMessage(err, "Failed to submit admission form"));
// //     }
// //   };

// //   // ============================================================
// //   // Admissions Excel Import
// //   // Sends the original Excel file directly to the backend:
// //   // POST /admissions/import
// //   // ============================================================
// //  const handleAdmissionsImport = async (file) => {
// //   try {
// //     if (!file) {
// //       toast.error("Please select an Excel file");
// //       return;
// //     }

// //     if (!instituteUUID) {
// //       toast.error(
// //         "Institute context missing. Please re-login and try again."
// //       );
// //       return;
// //     }

// //     console.log("Uploading Excel file:", {
// //       name: file.name,
// //       type: file.type,
// //       size: file.size,
// //     });

// //     const response = await importAdmissions(file);

// //     console.log(
// //       "Admission import response:",
// //       response.data
// //     );

// //     const result = response?.data || {};

// //     const imported = Number(
// //       result.imported || 0
// //     );

// //     const skipped = Array.isArray(
// //       result.skipped
// //     )
// //       ? result.skipped
// //       : [];

// //     if (imported > 0) {
// //       toast.success(
// //         `${imported} admissions imported successfully`
// //       );
// //     } else {
// //       toast.info(
// //         "No admissions were imported"
// //       );
// //     }

// //     if (skipped.length > 0) {
// //       console.warn(
// //         "Skipped rows:",
// //         skipped
// //       );

// //       toast.warning(
// //         `${skipped.length} rows skipped`
// //       );
// //     }

// //     await loadData();

// //   } catch (err) {
// //     console.error(
// //       "Admission Excel import failed:",
// //       err
// //     );

// //     const detail =
// //       err?.response?.data?.detail;

// //     if (Array.isArray(detail)) {
// //       toast.error(
// //         detail
// //           .map(
// //             (item) =>
// //               item?.msg ||
// //               "Validation error"
// //           )
// //           .join(", ")
// //       );
// //     } else {
// //       toast.error(
// //         detail ||
// //           err?.response?.data?.message ||
// //           err?.message ||
// //           "Failed to import admissions"
// //       );
// //     }
// //   }
// // };
// //   // ---- analytics ----
// //   // Calculate analytics from ACTIVE admissions only.
// //   const activeAdmissions = useMemo(
// //     () => allAdmissions.filter(
// //       (a) => String(a.status || "").toUpperCase() === "ACTIVE"
// //     ),
// //     [allAdmissions]
// //   );

// //   // Stage counts scoped to ACTIVE-only admissions — used by the analytics
// //   // "Stage Funnel" chart below. (Distinct from pipelineStageCounts, which
// //   // intentionally also includes TRANSFERRED + REJECTED for the Kanban
// //   // column badges — see STATUS VISIBILITY RULES above.)
// //   const activeStageCounts = useMemo(() => {
// //     const counts = {};

// //     activeAdmissions.forEach((admission) => {
// //       const stageName =
// //         admission.stage_name ||
// //         stages.find(
// //           (s) => String(s.id) === String(admission.stage_id)
// //         )?.stage_name;

// //       if (!stageName) return;

// //       counts[stageName] = (counts[stageName] || 0) + 1;
// //     });

// //     return counts;
// //   }, [activeAdmissions, stages]);

// //   const counts = useMemo(
// //     () =>
// //       pipelineData.map((stage) => ({
// //         stage: stage.stage_name,
// //         n: activeStageCounts[stage.stage_name] || 0,
// //       })),
// //     [pipelineData, activeStageCounts]
// //   );

// //   const total = activeAdmissions.length;

// //   const enrolledStageId = stages.find(
// //     (s) => s.stage_name === "Enrolled"
// //   )?.id;

// //   const enrolled = activeAdmissions.filter(
// //     (a) =>
// //       a.stage_name === "Enrolled" ||
// //       a.stage_id === enrolledStageId
// //   ).length;

// //   const convRate = total
// //     ? Number(((enrolled / total) * 100).toFixed(2))
// //     : 0;

// //   const bySource = useMemo(() => {
// //     const sourceMap = {};

// //     activeAdmissions.forEach((admission) => {
// //       const source = admission.source_name || "Unknown";
// //       sourceMap[source] = (sourceMap[source] || 0) + 1;
// //     });

// //     return Object.entries(sourceMap).map(([source, count]) => ({
// //       source,
// //       count,
// //     }));
// //   }, [activeAdmissions]);

// //   return (
// //     <PageContainer>
// //       <PageHeader
// //         eyebrow="Admin · Academic"
// //         title="Admissions Pipeline"
// //         description="Drag prospects across stages. Click any card to open the full counseling, document, payment and communication record."
// //         actions={
// //           <>
// //             <ExcelExport
// //               rows={allAdmissions}
// //               fileName="admissions.xlsx"
// //               columns={[
// //                 { header: "ID", accessor: (r) => r.id },
// //                 { header: "Name", accessor: (r) => r.full_name },
// //                 { header: "Class", accessor: (r) => r.class_name },
// //                 { header: "Phone", accessor: (r) => r.primary_phone },
// //                 { header: "Email", accessor: (r) => r.email },
// //                 { header: "Source", accessor: (r) => r.source_name },
// //                 { header: "Stage", accessor: (r) => r.stage_name },
// //                 { header: "Counselor", accessor: (r) => r.counselor_name ?? "" },
// //               ]}
// //             />
// // <ExcelUpload
// //   label="Bulk Upload"
// //   templateName="admissions-template.xlsx"
// //   templateHeaders={[
// //     "Name",
// //     "Class",
// //     "Parent",
// //     "Phone",
// //     "Email",
// //     "Source",
// //     "Counselor", 
// //     "Session Year",
// //   ]}
// //   onFile={handleAdmissionsImport}
// // />
// //             <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
// //               <FileText className="h-4 w-4" />
// //               Public Form
// //             </Button>
// //             <NewInquiryDialog
// //               trigger={
// //                 <Button size="sm" className="gradient-primary border-0">
// //                   <Plus className="h-4 w-4" />
// //                   New Inquiry
// //                 </Button>
// //               }
// //               onCreate={async () => {
// //                 await loadData();
// //               }}
// //             />
// //           </>
// //         }
// //       />

// //       <Tabs value={tab} onValueChange={setTab} className="mb-4">
// //         <TabsList>
// //           <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
// //           <TabsTrigger value="forms">Forms</TabsTrigger>
// //           <TabsTrigger value="test">Admission Test</TabsTrigger>
// //           <TabsTrigger value="rejected">
// //             Rejected ({rejectedTotal})
// //           </TabsTrigger>
// //           <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
// //         </TabsList>

// //         {/* ---------------- PIPELINE ---------------- */}
// //         <TabsContent value="pipeline" className="mt-4 space-y-4">
// //           <div className="flex flex-wrap items-center gap-2">
// //             <div className="relative" ref={searchBoxRef}>
// //               <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
// //               <Input
// //                 value={q}
// //                 onChange={(e) => {
// //                   setQ(e.target.value);
// //                   setSuggestOpen(true);
// //                   setSuggestIndex(-1);
// //                 }}
// //                 onFocus={() => setSuggestOpen(true)}
// //                 onKeyDown={handleSearchKeyDown}
// //                 placeholder="Search name / phone…"
// //                 className="pl-8 h-9 w-64"
// //                 autoComplete="off"
// //               />
// //               {suggestOpen && nameSuggestions.length > 0 && (
// //                 <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-md border bg-popover shadow-lg overflow-hidden py-1">
// //                   {nameSuggestions.map((name, idx) => (
// //                     <button
// //                       type="button"
// //                       key={name}
// //                       onMouseDown={(e) => {
// //                         e.preventDefault();
// //                         chooseSuggestion(name);
// //                       }}
// //                       onMouseEnter={() => setSuggestIndex(idx)}
// //                       className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
// //                         idx === suggestIndex
// //                           ? "bg-muted"
// //                           : "hover:bg-muted/60"
// //                       }`}
// //                     >
// //                       <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
// //                       <span className="truncate text-foreground/90">
// //                         {highlightMatch(name)}
// //                       </span>
// //                     </button>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //             <Select value={src} onValueChange={setSrc}>
// //               <SelectTrigger className="h-9 w-40">
// //                 <SelectValue placeholder="Source" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="all">All sources</SelectItem>
// //                 {sources.map((s) => (
// //                   <SelectItem key={s.id} value={s.name}>
// //                     {s.name}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //             <Select value={counselor} onValueChange={setCounselor}>
// //               <SelectTrigger className="h-9 w-40">
// //                 <SelectValue placeholder="Counselor" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="all">All counselors</SelectItem>
// //                 {counselors.map((c) => (
// //                   <SelectItem key={c.id} value={c.counselor_name}>
// //                     {c.counselor_name}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //             {selected.size > 0 && (
// //               <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
// //                 <span className="text-xs font-medium">
// //                   {selected.size} selected
// //                 </span>
// //                 <Select onValueChange={(v) => bulkMove(v)}>
// //                   <SelectTrigger className="h-7 w-36 text-xs">
// //                     <SelectValue placeholder="Move to…" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {stages.map((s) => (
// //                       <SelectItem key={s.id} value={s.stage_name}>
// //                         {s.stage_name}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   className="h-7 text-xs"
// //                   onClick={() => {
// //                     toast.success(`Bulk SMS to ${selected.size}`);
// //                     setSelected(new Set());
// //                   }}
// //                 >
// //                   <Send className="h-3 w-3" />
// //                   SMS
// //                 </Button>
// //                 <Button
// //                   size="sm"
// //                   variant="ghost"
// //                   className="h-7 text-xs text-destructive"
// //                   onClick={() => {
// //                     selected.forEach((id) => {
// //                       const student = allAdmissions.find((a) => a.id === id);
// //                       if (student) setRejectFor(student);
// //                     });
// //                     setSelected(new Set());
// //                   }}
// //                 >
// //                   <Trash2 className="h-3 w-3" />
// //                 </Button>
// //               </div>
// //             )}
// //           </div>

// //           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
// //             {pipelineData.map((stage) => (
// //               <Card
// //                 key={stage.stage_name}
// //                 role="button"
// //                 tabIndex={0}
// //                 onClick={() => openStage(stage.stage_name)}
// //                 onKeyDown={(e) => {
// //                   if (e.key === "Enter") openStage(stage.stage_name);
// //                 }}
// //                 title={`Open ${stage.stage_name} table`}
// //                 className={`cursor-pointer transition hover:shadow-sm ${
// //                   stage.stage_name === "Rejected"
// //                     ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
// //                     : "border-border/60 hover:border-primary/50"
// //                 }`}
// //               >
// //                 <CardContent className="p-3">
// //                   <div
// //                     className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
// //                       stage.stage_name === "Rejected"
// //                         ? "text-destructive"
// //                         : "text-muted-foreground"
// //                     }`}
// //                   >
// //                     {stage.stage_name === "Rejected" && (
// //                       <XCircle className="h-3 w-3" />
// //                     )}
// //                     {stage.stage_name}
// //                   </div>

// //                   <div
// //                     className={`text-2xl font-display font-semibold mt-1 ${
// //                       stage.stage_name === "Rejected"
// //                         ? "text-destructive"
// //                         : ""
// //                     }`}
// //                   >
// //                     {pipelineStageCounts[stage.stage_name] || 0}
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             ))}

// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
// //             {pipelineData.map((stage) => {
// //               const items =
// //                 stage.stage_name === "Rejected"
// //                   ? rejectedList
// //                   : cards.filter(
// //                       (c) => c.stage_name === stage.stage_name
// //                     );
// //               return (
// //                 <Card
// //                   key={stage.stage_name}
// //                   className="border-border/60 bg-muted/20"
// //                 >
// //                   <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// //                     <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
// //                       {stage.stage_name}
// //                     </CardTitle>
// //                     <Badge variant="outline" className="text-[10px]">
// //                       {items.length}
// //                     </Badge>
// //                   </CardHeader>
// //                   <CardContent
// //                     className="space-y-2 max-h-[560px] overflow-y-auto p-2"
// //                     onDragOver={(e) => e.preventDefault()}
// //                     onDrop={() => {

// //                       if (
// //                         stage.stage_name === "Rejected"
// //                       ) {

// //                         setRejectFor(dragItem);
// //                         setRejectReason("");

// //                         return;
// //                       }

// //                       onDrop(stage.stage_name);

// //                     }}
// //                   >
// //                     {items.length === 0 && (
// //                       <div className="text-xs text-muted-foreground text-center py-6">
// //                         Drop here
// //                       </div>
// //                     )}
// //                     {items.map((c) => {
// //                       const stageIdx = stages.findIndex(
// //                         (s) => s.stage_name === stage.stage_name,
// //                       );
// //                       const rawNext = stages[stageIdx + 1]?.stage_name;
// //                       // Never surface a "next stage" button on terminal
// //                       // stages (Enrolled has nowhere to go), and never let
// //                       // "next" resolve to Rejected — rejection only ever
// //                       // happens through the explicit reject flow.
// //                       const next = TERMINAL_STAGES.includes(stage.stage_name)
// //                         ? undefined
// //                         : rawNext === "Rejected"
// //                         ? undefined
// //                         : rawNext;
// //                       return (
// //                         <div
// //                           key={c.id}
// //                           draggable={stage.stage_name !== "Rejected"}
// //                           onDragStart={() => setDragItem(c)}
// //                           className={`bg-card border border-l-4 ${stageColor[stage.stage_name]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${selected.has(c.id) ? "ring-2 ring-primary" : ""}`}
// //                           onClick={(e) => {
// //                             if (e.target.closest("[data-stop]")) return;
// //                             navigate(`/admin/admissions/${c.admission_uuid}`);
// //                           }}
// //                         >
// //                           <div className="flex items-start gap-2.5">
// //                             {stage.stage_name !== "Rejected" && (
// //                               <div
// //                                 data-stop
// //                                 onClick={(e) => e.stopPropagation()}
// //                               >
// //                                 <Checkbox
// //                                   checked={selected.has(c.id)}
// //                                   onCheckedChange={() => toggleSel(c.id)}
// //                                 />
// //                               </div>
// //                             )}
// //                             <Avatar className="h-8 w-8 shrink-0">
// //                               {c.passport_photo_file ? (
// //                                 <AvatarImage
// //                                   src={c.passport_photo_file}
// //                                   alt={c.full_name}
// //                                   className="object-cover"
// //                                 />
// //                               ) : (
// //                                 <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
// //                                   {c.full_name
// //                                     ?.split(" ")
// //                                     .map((n) => n[0])
// //                                     .join("")}
// //                                 </AvatarFallback>
// //                               )}
// //                             </Avatar>
// //                             <div className="min-w-0 flex-1">
// //                               <div className="text-sm font-medium truncate">
// //                                 {c.full_name}
// //                               </div>
// //                               <div className="text-[10px] text-muted-foreground">
// //                                 Class {c.class_name} · {c.source_name}
// //                               </div>
// //                             </div>
// //                           </div>
// //                           <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
// //                             {stage.stage_name === "Rejected" && (
// //                               <>
// //                                 <div
// //                                   data-stop
// //                                   className="text-xs text-destructive cursor-pointer hover:underline truncate"
// //                                   onClick={(e) => {
// //                                     e.stopPropagation();
// //                                     setViewReasonFor(c);
// //                                   }}
// //                                   title="Click to view full rejection reason"
// //                                 >
// //                                   Reason : {c.rejection_reason || "-"}
// //                                 </div>

// //                                 <div className="text-xs text-muted-foreground">
// //                                   Rejected :
// //                                   {
// //                                     c.rejected_at
// //                                       ? new Date(
// //                                           c.rejected_at
// //                                         ).toLocaleDateString()
// //                                       : "-"
// //                                   }
// //                                 </div>
// //                               </>
// //                             )}
// //                             <div className="flex items-center gap-1.5">
// //                               <Phone className="h-3 w-3" />
// //                               {c.primary_phone}
// //                             </div>
// //                             <div className="flex items-center gap-1.5 truncate">
// //                               <Mail className="h-3 w-3 shrink-0" />
// //                               <span className="truncate">{c.email}</span>
// //                             </div>
// //                             {c.counselor_name && (
// //                               <div className="text-[10px]">
// //                                 👤 {c.counselor_name}
// //                               </div>
// //                             )}
// //                           </div>
// //                           <div
// //                             className="flex items-center justify-between mt-2.5 pt-2 border-t gap-1"
// //                             data-stop
// //                             onClick={(e) => e.stopPropagation()}
// //                           >

// //                             {stage.stage_name === "Rejected" && (

// //                               <Button
// //                                 size="sm"
// //                                 variant="outline"
// //                                 onClick={() => reinstate(c)}
// //                               >
// //                                 <RotateCcw
// //                                   className="h-3 w-3"
// //                                 />

// //                                 Reinstate

// //                               </Button>

// //                             )}
// //                             <span
// //                               className="text-[10px] text-muted-foreground"
// //                               title="Date when this admission entered the current stage"
// //                             >
// //                               {new Date(
// //                                 c.stage_updated_at || c.created_at
// //                               ).toLocaleDateString()}
// //                             </span>
// //                             <div className="flex items-center gap-0.5">
// //                               {stage.stage_name !== "Rejected" && (
// //                                 <Button
// //                                   size="sm"
// //                                   variant="ghost"
// //                                   className="h-6 px-2 text-[10px]
// //                                       text-destructive"
// //                                   onClick={() => {
// //                                     setRejectFor(c);
// //                                     setRejectReason("");
// //                                   }}
// //                                 >
// //                                   <XCircle className="h-3 w-3" />
// //                                 </Button>
// //                               )}
// //                               {stage.stage_name !== "Rejected" && next && (
// //                                 <Button
// //                                   size="sm"
// //                                   variant="ghost"
// //                                   className="h-6 px-2 text-[10px]"
// //                                   onClick={async () => {
// //                                     try {
// //                                       await moveToStage(c.admission_uuid, next);
// //                                       loadData();
// //                                     } catch (err) {
// //                                       toast.error(
// //                                         getApiErrorMessage(err, "Failed to move stage"),
// //                                       );
// //                                     }
// //                                   }}
// //                                 >
// //                                   {next.split(" ")[0]}
// //                                   <ArrowRight className="h-3 w-3" />
// //                                 </Button>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       );
// //                     })}
// //                   </CardContent>
// //                 </Card>
// //               );
// //             })}
// //           </div>
// //         </TabsContent>

// //         {/* ---------------- FORMS ---------------- */}
// //         <TabsContent value="forms" className="mt-4 space-y-3">
// //           <Card>
// //             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// //               <CardTitle className="text-base flex items-center gap-2">
// //                 <FileText className="h-4 w-4" />
// //                 Admission Forms Received
// //               </CardTitle>
// //               <Select value={stageFilter} onValueChange={setStageFilter}>
// //                 <SelectTrigger className="h-8 w-44 text-xs">
// //                   <SelectValue placeholder="Filter by stage" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="all">All stages</SelectItem>
// //                   {stageNames.map((s) => (
// //                     <SelectItem key={s} value={s}>
// //                       {s}
// //                     </SelectItem>
// //                   ))}
// //                 </SelectContent>
// //               </Select>
// //             </CardHeader>
// //             <CardContent className="p-0">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow>
// //                     <TableHead>ID</TableHead>
// //                     <TableHead>Applicant</TableHead>
// //                     <TableHead>Class</TableHead>
// //                     <TableHead>Contact</TableHead>
// //                     <TableHead>Stage</TableHead>
// //                     <TableHead>Source</TableHead>
// //                     <TableHead>Received</TableHead>
// //                     <TableHead className="text-right">Action</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {allAdmissions
// //                     .filter(
// //                       (i) =>
// //                         String(i.status || "").toUpperCase() === "ACTIVE" &&
// //                         Number(i.stage_id) !== 8 &&
// //                         (stageFilter === "all" ||
// //                           i.stage_name === stageFilter)
// //                     )
// //                     .sort(byNameAsc)
// //                     .map((i) => (
// //                       <TableRow
// //                         key={i.id}
// //                         className="cursor-pointer"
// //                         onClick={() => setViewForm(i)}
// //                       >
// //                         <TableCell className="font-mono text-xs">
// //                           {i.id}
// //                         </TableCell>
// //                         <TableCell className="font-medium">
// //                           {i.full_name}
// //                         </TableCell>
// //                         <TableCell>{i.class_name}</TableCell>
// //                         <TableCell className="text-xs">
// //                           {i.primary_phone}
// //                         </TableCell>
// //                         <TableCell>
// //                           <Badge variant="secondary" className="text-[10px]">
// //                             {i.stage_name}
// //                           </Badge>
// //                         </TableCell>
// //                         <TableCell>
// //                           <Badge variant="outline">{i.source_name}</Badge>
// //                         </TableCell>
// //                         <TableCell className="text-xs text-muted-foreground">
// //                           {new Date(i.stage_updated_at || i.created_at).toLocaleDateString()}
// //                         </TableCell>
// //                         <TableCell
// //                           className="text-right"
// //                           onClick={(e) => e.stopPropagation()}
// //                         >
// //                           <Button
// //                             size="sm"
// //                             variant="ghost"
// //                             onClick={() => setViewForm(i)}
// //                           >
// //                             <Eye className="h-3.5 w-3.5" />
// //                             View
// //                           </Button>
// //                           <Button
// //                             size="sm"
// //                             variant="ghost"
// //                             className="text-destructive"
// //                             onClick={() => {
// //                               setRejectFor(i);
// //                               setRejectReason("");
// //                             }}
// //                           >
// //                             <XCircle className="h-3.5 w-3.5" />
// //                             Reject
// //                           </Button>
// //                         </TableCell>
// //                       </TableRow>
// //                     ))}
// //                 </TableBody>
// //               </Table>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         {/* ---------------- REJECTED ---------------- */}
// //         <TabsContent value="rejected" className="mt-4 space-y-3">
// //           <Card>
// //             <CardHeader className="pb-2">
// //               <CardTitle className="text-base flex items-center gap-2 text-destructive">
// //                 <XCircle className="h-4 w-4" />
// //                 Rejected Inquiries
// //               </CardTitle>
// //             </CardHeader>
// //             <CardContent className="p-0">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow>
// //                     <TableHead>ID</TableHead>
// //                     <TableHead>Applicant</TableHead>
// //                     <TableHead>Class</TableHead>
// //                     <TableHead>Reason</TableHead>
// //                     <TableHead>Rejected On</TableHead>
// //                     <TableHead className="text-right">Action</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {rejectedList.length === 0 && (
// //                     <TableRow>
// //                       <TableCell
// //                         colSpan={6}
// //                         className="text-center text-sm text-muted-foreground py-8"
// //                       >
// //                         No rejected inquiries.
// //                       </TableCell>
// //                     </TableRow>
// //                   )}
// //                   {rejectedList.map((i) => (
// //                     <TableRow key={i.id}>
// //                       <TableCell className="font-mono text-xs">
// //                         {i.id}
// //                       </TableCell>
// //                       <TableCell className="font-medium">
// //                         {i.full_name}
// //                         <div className="text-[10px] text-muted-foreground">
// //                           {i.primary_phone}
// //                         </div>
// //                       </TableCell>
// //                       <TableCell>{i.class_name}</TableCell>
// //                       <TableCell
// //                         className="text-xs max-w-md cursor-pointer hover:underline"
// //                         onClick={() => setViewReasonFor(i)}
// //                         title="Click to view full rejection reason"
// //                       >
// //                         <span className="line-clamp-2">
// //                           {i.rejection_reason || "—"}
// //                         </span>
// //                       </TableCell>
// //                       <TableCell className="text-xs text-muted-foreground">
// //                         {i.rejected_at
// //                           ? new Date(i.rejected_at).toLocaleDateString()
// //                           : "—"}
// //                       </TableCell>
// //                       <TableCell className="text-right">
// //                         <Button
// //                           size="sm"
// //                           variant="outline"
// //                           onClick={() => reinstate(i)}
// //                         >
// //                           <RotateCcw className="h-3.5 w-3.5" />
// //                           Reinstate
// //                         </Button>
// //                       </TableCell>
// //                     </TableRow>
// //                   ))}
// //                 </TableBody>
// //               </Table>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         {/* ---------------- ADMISSION TEST ---------------- */}
// //         <TabsContent value="test" className="mt-4 space-y-3">
// //           <Card>
// //             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
// //               <CardTitle className="text-base flex items-center gap-2">
// //                 <ClipboardCheck className="h-4 w-4" />
// //                 Admission Test Results
// //               </CardTitle>
// //               <Select value={testFilter} onValueChange={setTestFilter}>
// //                 <SelectTrigger className="h-8 w-44 text-xs">
// //                   <SelectValue placeholder="Filter" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="all">All scores</SelectItem>
// //                   <SelectItem value="85">85 – 100% (Excellent)</SelectItem>
// //                   <SelectItem value="70">70 – 85% (Good)</SelectItem>
// //                   <SelectItem value="50">50 – 70% (Average)</SelectItem>
// //                   <SelectItem value="0">Below 50% (Weak)</SelectItem>
// //                   <SelectItem value="pending">Not attempted</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </CardHeader>
// //             <CardContent className="p-0">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow>
// //                     <TableHead>ID</TableHead>
// //                     <TableHead>Candidate</TableHead>
// //                     <TableHead>Class</TableHead>
// //                     <TableHead>Score</TableHead>
// //                     <TableHead>Grade</TableHead>
// //                     <TableHead>Stage</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {allAdmissions
// //                     .filter((i) => {
// //                       // Only ACTIVE admissions are shown.
// //                       if (String(i.status || "").toUpperCase() !== "ACTIVE") return false;

// //                       // `test_score` is not part of the current admissions
// //                       // API response — add it server-side to populate this tab.
// //                       const s = i.test_score;
// //                       if (testFilter === "all") return true;
// //                       if (testFilter === "pending") return s == null;
// //                       if (s == null) return false;
// //                       const min = Number(testFilter);
// //                       const max =
// //                         min === 85 ? 100 : min === 70 ? 85 : min === 50 ? 70 : 50;
// //                       return s >= min && s < max + (min === 85 ? 1 : 0);
// //                     })
// //                     .sort(byNameAsc)
// //                     .map((i) => {
// //                       const s = i.test_score;
// //                       const grade =
// //                         s == null ? "—" : s >= 85 ? "A+" : s >= 70 ? "A" : s >= 50 ? "B" : "C";
// //                       const tone =
// //                         s == null ? "outline" : s >= 70 ? "default" : s >= 50 ? "secondary" : "destructive";
// //                       return (
// //                         <TableRow key={i.id}>
// //                           <TableCell className="font-mono text-xs">
// //                             {i.id}
// //                           </TableCell>
// //                           <TableCell className="font-medium">
// //                             {i.full_name}
// //                           </TableCell>
// //                           <TableCell>{i.class_name}</TableCell>
// //                           <TableCell className="font-semibold">
// //                             {s ?? "—"}
// //                             {s != null && "%"}
// //                           </TableCell>
// //                           <TableCell>
// //                             <Badge variant={tone}>{grade}</Badge>
// //                           </TableCell>
// //                           <TableCell>
// //                             <span className="text-xs text-muted-foreground">
// //                               {i.stage_name}
// //                             </span>
// //                           </TableCell>
// //                         </TableRow>
// //                       );
// //                     })}
// //                 </TableBody>
// //               </Table>
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         {/* ---------------- ANALYTICS ---------------- */}
// //         <TabsContent value="analytics" className="mt-4">
// //           <div className="grid md:grid-cols-3 gap-4 mb-4">
// //             <Card>
// //               <CardContent className="p-4">
// //                 <div className="text-xs text-muted-foreground">
// //                   Total Inquiries
// //                 </div>
// //                 <div className="text-3xl font-display font-semibold mt-1">
// //                   {total}
// //                 </div>
// //               </CardContent>
// //             </Card>
// //             <Card>
// //               <CardContent className="p-4">
// //                 <div className="text-xs text-muted-foreground">Enrolled</div>
// //                 <div className="text-3xl font-display font-semibold mt-1 text-success">
// //                   {enrolled}
// //                 </div>
// //               </CardContent>
// //             </Card>
// //             <Card>
// //               <CardContent className="p-4">
// //                 <div className="text-xs text-muted-foreground flex items-center gap-1">
// //                   <TrendingUp className="h-3 w-3" />
// //                   Conversion Rate
// //                 </div>
// //                 <div className="text-3xl font-display font-semibold mt-1">
// //                   {convRate}%
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //           <Card className="mb-4">
// //             <CardHeader>
// //               <CardTitle className="text-base">Stage Funnel</CardTitle>
// //             </CardHeader>
// //             <CardContent className="space-y-2">
// //               {counts.map((c) => (
// //                 <div key={c.stage} className="flex items-center gap-3">
// //                   <div className="w-32 text-xs text-muted-foreground">
// //                     {c.stage}
// //                   </div>
// //                   <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
// //                     <div
// //                       className="h-full bg-gradient-to-r from-primary to-accent"
// //                       style={{ width: `${total ? (c.n / total) * 100 : 0}%` }}
// //                     />
// //                   </div>
// //                   <div className="w-12 text-right text-sm font-medium">
// //                     {c.n}
// //                   </div>
// //                 </div>
// //               ))}
// //             </CardContent>
// //           </Card>
// //           <Card>
// //             <CardHeader>
// //               <CardTitle className="text-base">By Source</CardTitle>
// //             </CardHeader>
// //             <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
// //               {bySource.map((s) => (
// //                 <div key={s.source} className="p-3 border rounded-md">
// //                   <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
// //                     {s.source}
// //                   </div>
// //                   <div className="text-xl font-display font-semibold mt-1">
// //                     {s.count}
// //                   </div>
// //                 </div>
// //               ))}
// //             </CardContent>
// //           </Card>
// //         </TabsContent>
// //       </Tabs>

// //       {/* Public Admission Form */}
// //       <Dialog open={formOpen} onOpenChange={setFormOpen}>
// //         <DialogContent className="max-w-lg">
// //           <DialogHeader>
// //             <DialogTitle>Public Admission Form</DialogTitle>
// //             <DialogDescription>
// //               Minimum details to register an enquiry.
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="grid grid-cols-2 gap-3">
// //             <div className="col-span-2">
// //               <Label>Full Name *</Label>
// //               <Input
// //                 value={publicForm.name}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, name: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <div>
// //               <Label>Email</Label>
// //               <Input
// //                 type="email"
// //                 value={publicForm.email}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, email: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <div>
// //               <Label>Phone *</Label>
// //               <Input
// //                 value={publicForm.phone}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, phone: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <div>
// //               <Label>Location</Label>
// //               <Input
// //                 value={publicForm.location}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, location: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <div>
// //               <Label>Previous School</Label>
// //               <Input
// //                 value={publicForm.school}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, school: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <div>
// //               <Label>Parent Name</Label>
// //               <Input
// //                 value={publicForm.parent}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, parent: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <div>
// //               <Label>Parent Occupation</Label>
// //               <Input
// //                 value={publicForm.occupation}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, occupation: e.target.value })
// //                 }
// //               />
// //             </div>
// // <div className="col-span-2">
// //   <Label>Class Applying For</Label>

// //   <Select
// //     value={publicForm.class_uuid}
// //     onValueChange={(value) =>
// //       setPublicForm((prev) => ({
// //         ...prev,
// //         class_uuid: value,
// //       }))
// //     }
// //   >
// //     <SelectTrigger disabled={classesLoading}>
// //       <SelectValue
// //         placeholder={
// //           classesLoading
// //             ? "Loading classes..."
// //             : "Select class"
// //         }
// //       />
// //     </SelectTrigger>

// //     <SelectContent>
// //       {classes.length === 0 ? (
// //         <SelectItem value="no-class" disabled>
// //           No classes available
// //         </SelectItem>
// //       ) : (
// //         classes.map((c) => (
// //           <SelectItem
// //             key={c.class_uuid || c.id}
// //             value={String(c.class_uuid || c.id)}
// //           >
// //             {c.class_name || c.name}
// //           </SelectItem>
// //         ))
// //       )}
// //     </SelectContent>
// //   </Select>
// // </div>
// //             <div className="col-span-2">
// //               <Label>Notes</Label>
// //               <Textarea
// //                 rows={2}
// //                 value={publicForm.notes}
// //                 onChange={(e) =>
// //                   setPublicForm({ ...publicForm, notes: e.target.value })
// //                 }
// //               />
// //             </div>
// //             <label className="col-span-2 flex items-start gap-2 text-xs">
// //               <Checkbox
// //                 checked={publicForm.consent}
// //                 onCheckedChange={(v) =>
// //                   setPublicForm({ ...publicForm, consent: !!v })
// //                 }
// //               />
// //               <span>
// //                 I consent to the school storing this information for admission
// //                 processing.
// //               </span>
// //             </label>
// //           </div>
// //           <DialogFooter>
// //             <Button variant="ghost" onClick={() => setFormOpen(false)}>
// //               Cancel
// //             </Button>
// //             <Button
// //               disabled={!publicForm.consent || !publicForm.name || !publicForm.phone}
// //               onClick={submitPublicForm}
// //             >
// //               Submit
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* View Form Details */}
// //       <Dialog open={!!viewForm} onOpenChange={(o) => !o && setViewForm(null)}>
// //         <DialogContent className="max-w-lg">
// //           <DialogHeader>
// //             <DialogTitle>
// //               {viewForm?.full_name} — {viewForm?.id}
// //             </DialogTitle>
// //             <DialogDescription>Admission form details</DialogDescription>
// //           </DialogHeader>
// //           {viewForm && (
// //             <div className="grid grid-cols-2 gap-3 text-sm">
// //               <div>
// //                 <Label className="text-xs">Class</Label>
// //                 <div>{viewForm.class_name}</div>
// //               </div>
// //               <div>
// //                 <Label className="text-xs">Source</Label>
// //                 <div>{viewForm.source_name}</div>
// //               </div>
// //               <div>
// //                 <Label className="text-xs">Phone</Label>
// //                 <div>{viewForm.primary_phone}</div>
// //               </div>
// //               <div>
// //                 <Label className="text-xs">Email</Label>
// //                 <div>{viewForm.email}</div>
// //               </div>
// //               <div className="col-span-2">
// //                 <Label className="text-xs">Notes</Label>
// //                 <div className="whitespace-pre-wrap">
// //                   {viewForm.notes || "—"}
// //                 </div>
// //               </div>
// //               <div>
// //                 <Label className="text-xs">Stage</Label>
// //                 <div>
// //                   <Badge>{viewForm.stage_name}</Badge>
// //                 </div>
// //               </div>
// //               <div>
// //                 <Label className="text-xs">Counselor</Label>
// //                 <div>{viewForm.counselor_name || "—"}</div>
// //               </div>
// //             </div>
// //           )}
// //           <DialogFooter>
// //             <Button
// //               variant="outline"
// //               onClick={() => {
// //                 if (viewForm) {
// //                   navigate(`/admin/admissions/${viewForm.admission_uuid}`);
// //                   setViewForm(null);
// //                 }
// //               }}
// //             >
// //               Open full record
// //             </Button>
// //             <Button onClick={() => setViewForm(null)}>Close</Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Reject inquiry dialog */}
// //       <Dialog
// //         open={!!rejectFor}
// //         onOpenChange={(o) => {
// //           if (!o) {
// //             setRejectFor(null);
// //             setRejectReason("");
// //           }
// //         }}
// //       >
// //         <DialogContent className="max-w-md">
// //           <DialogHeader>
// //             <DialogTitle>Reason for Rejection</DialogTitle>
// //             <DialogDescription>
// //               {rejectFor?.full_name} · {rejectFor?.id} — this inquiry will move
// //               to the Rejected list.
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="space-y-2">
// //             <Label className="text-xs">Reason *</Label>
// //             <Textarea
// //               rows={4}
// //               value={rejectReason}
// //               onChange={(e) => setRejectReason(e.target.value)}
// //               placeholder="e.g. Seats full for the requested class, documents incomplete, applicant withdrew, etc."
// //             />
// //           </div>
// //           <DialogFooter>
// //             <Button
// //               variant="ghost"
// //               onClick={() => {
// //                 setRejectFor(null);
// //                 setRejectReason("");
// //               }}
// //             >
// //               Cancel
// //             </Button>
// //             <Button variant="destructive" onClick={confirmReject}>
// //               <XCircle className="h-4 w-4" />
// //               Reject Inquiry
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* View rejection reason (read-only) — opened from Kanban card / Rejected table */}
// //       <Dialog
// //         open={!!viewReasonFor}
// //         onOpenChange={(o) => !o && setViewReasonFor(null)}
// //       >
// //         <DialogContent className="max-w-md">
// //           <DialogHeader>
// //             <DialogTitle>Reason for Rejection</DialogTitle>
// //             <DialogDescription>
// //               {viewReasonFor?.full_name} · {viewReasonFor?.id}
// //               {viewReasonFor?.rejected_at &&
// //                 ` — rejected ${new Date(viewReasonFor.rejected_at).toLocaleDateString()}`}
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
// //             {viewReasonFor?.rejection_reason || "No reason recorded."}
// //           </div>
// //           <DialogFooter>
// //             <Button variant="outline" onClick={() => setViewReasonFor(null)}>
// //               Close
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </PageContainer>
// //   );
// // }


// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getAdmissionPipeline,
//   getAdmissionAnalytics,
//   getAdmissionSources,
//   getAdmissionCounselors,
//   getStages,
//   getAllAdmissions,
//   enrollStudent,
//   createAdmission,
//   importAdmissions,
//   rejectAdmission,
//   reinstateAdmission
// } from "../../../api/admissions";
// import { getClasses } from "../../../api/Class";
// import useAuthStore from "../../../store/authStore";

// import { PageContainer, PageHeader } from "../../../components/page-shell";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "../../../components/ui/card";
// import { Button } from "../../../components/ui/button";
// import { Badge } from "../../../components/ui/badge";
// import { Input } from "../../../components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../../../components/ui/select";
// import { Checkbox } from "../../../components/ui/checkbox";
// import {
//   Avatar,
//   AvatarImage,
//   AvatarFallback,
// } from "../../../components/ui/avatar";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "../../../components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "../../../components/ui/dialog";
// import { Label } from "../../../components/ui/label";
// import { Textarea } from "../../../components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../../components/ui/table";
// import {
//   Plus,
//   Search,
//   Phone,
//   Mail,
//   ArrowRight,
//   Archive,
//   Trash2,
//   Send,
//   TrendingUp,
//   FileText,
//   ClipboardCheck,
//   Eye,
//   XCircle,
//   RotateCcw,
//   CheckCircle2,
//   Clock3,
// } from "lucide-react";

// import { toast } from "sonner";
// import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";
// import { ExcelUpload } from "../../../components/excel-upload";
// import { ExcelExport } from "../../../components/excel-export";

// const getApiErrorMessage = (err, fallback = "Something went wrong") => {
//   const detail = err?.response?.data?.detail;
//   const message = err?.response?.data?.message || err?.response?.data?.error;

//   const stringify = (value) => {
//     if (value == null) return "";
//     if (typeof value === "string" || typeof value === "number") return String(value);

//     if (Array.isArray(value)) {
//       return value.map(stringify).filter(Boolean).join("\n");
//     }

//     if (typeof value === "object") {
//       if (value.msg) {
//         const loc = Array.isArray(value.loc)
//           ? value.loc.filter((x) => x !== "body").join(" → ")
//           : "";
//         return loc ? `${loc}: ${String(value.msg)}` : String(value.msg);
//       }
//       if (value.message) return String(value.message);
//       try {
//         return JSON.stringify(value);
//       } catch {
//         return fallback;
//       }
//     }

//     return String(value);
//   };

//   return stringify(detail) || stringify(message) || err?.message || fallback;
// };

// const stageColor = {
//   Inquiry: "border-l-muted-foreground",
//   Lead: "border-l-info",
//   Counseling: "border-l-chart-3",
//   "Admission Test": "border-l-warning",
//   "Doc Verification": "border-l-accent",
//   "Fee Payment": "border-l-chart-5",
//   Enrolled: "border-l-success",
//   Rejected: "border-l-destructive",
// };

// // Stages that are dead-ends in the pipeline — no "advance to next stage"
// // button should ever be shown on cards sitting in these columns, and
// // "Rejected" specifically must never be computed as anyone's "next" stage
// // (rejection has its own dedicated flow via the reject dialog / drag-to-Rejected).
// const TERMINAL_STAGES = ["Enrolled", "Rejected"];

// const formatStageDate = (value) => {
//   if (!value) return "—";
//   const date = new Date(value);
//   return Number.isNaN(date.getTime())
//     ? "—"
//     : date.toLocaleString();
// };

// const parentConfirmationStatus = (admission) =>
//   admission?.parent_submitted
//     ? { label: "Parent Submitted", submitted: true }
//     : { label: "Parent Pending", submitted: false };




// export default function Admissions() {
//   const navigate = useNavigate();
//   const instituteUUID = useAuthStore((state) => state.instituteUUID);

//   // ---- server data ----
//   const [pipelineData, setPipelineData] = useState([]);
//   const [analytics, setAnalytics] = useState({});
//   const [sources, setSources] = useState([]);
//   const [counselors, setCounselors] = useState([]);
//   const [stages, setStages] = useState([]);
//   const [allAdmissions, setAllAdmissions] = useState([]);

//   // ---- pipeline filters / selection ----
//   const [q, setQ] = useState("");
//   const [src, setSrc] = useState("all");
//   const [counselor, setCounselor] = useState("all");
//   const [selected, setSelected] = useState(new Set());
//   const [dragItem, setDragItem] = useState(null);
//   const [tab, setTab] = useState("pipeline");

//   // ---- search autosuggest ----
//   const [suggestOpen, setSuggestOpen] = useState(false);
//   const [suggestIndex, setSuggestIndex] = useState(-1);
//   const searchBoxRef = useRef(null);

//   // ---- forms / test tabs ----
//   const [viewForm, setViewForm] = useState(null);
//   const [testFilter, setTestFilter] = useState("all");
//   const [stageFilter, setStageFilter] = useState("all");

//   // ---- reject dialog ----
//   const [rejectFor, setRejectFor] = useState(null);
//   const [rejectReason, setRejectReason] = useState("");

//   // ---- view rejection reason dialog (read-only) ----
//   const [viewReasonFor, setViewReasonFor] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [classesLoading, setClassesLoading] = useState(false);
//   // ---- public form dialog ----
//   const [formOpen, setFormOpen] = useState(false);
//   const [publicForm, setPublicForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     location: "",
//     school: "",
//     parent: "",
//     occupation: "",
//      class_uuid: "",
//     notes: "",
//     consent: false,
//   });

// const loadClasses = async () => {
//   try {
//     setClassesLoading(true);

//     const res = await getClasses();

//     const list = res.data?.data || res.data || res || [];

//     setClasses(Array.isArray(list) ? list : []);
//   } catch (err) {
//     console.error("Failed to load classes:", err);
//     setClasses([]);
//     toast.error("Failed to load classes");
//   } finally {
//     setClassesLoading(false);
//   }
// };

// useEffect(() => {
//   loadData();
//   loadClasses();
// }, []);

//   const loadData = async () => {
//     try {
//       const [
//         pipelineRes,
//         analyticsRes,
//         sourceRes,
//         counselorRes,
//         stageRes,
//         allRes,
//       ] = await Promise.all([
//         getAdmissionPipeline(),
//         getAdmissionAnalytics(),
//         getAdmissionSources(),
//         getAdmissionCounselors(),
//         getStages(),
//         getAllAdmissions(),
//       ]);

//       const pipeline = Array.isArray(pipelineRes.data)
//         ? pipelineRes.data
//         : [];

//       // The pipeline API now returns the timestamp for the latest
//       // movement into the current stage as `stage_updated_at`.
//       // Merge that value into the full-admission records used by
//       // the cards/tables so the UI shows the current-stage date
//       // instead of the original admission creation date.
//       const stageDateMap = {};
//       pipeline.forEach((stage) => {
//         (Array.isArray(stage.students) ? stage.students : []).forEach((item) => {
//           if (!item?.admission_uuid) return;
//           stageDateMap[item.admission_uuid] = {
//             stage_name: item.stage_name || stage.stage_name,
//             stage_id: item.stage_id,
//             stage_updated_at: item.stage_updated_at || item.created_at || null,
//           };
//         });
//       });

//       const fullAdmissions = (Array.isArray(allRes.data) ? allRes.data : []).map(
//         (admission) => ({
//           ...admission,
//           ...(stageDateMap[admission.admission_uuid] || {}),
//         })
//       );

//       setPipelineData(pipeline);
//       setAnalytics(analyticsRes.data);
//       setSources(sourceRes.data);
//       setCounselors(counselorRes.data);
//       setStages(stageRes.data?.data || []);
//       setAllAdmissions(fullAdmissions);
//     } catch (err) {
//       console.error("Failed to load admissions data:", err);
//       toast.error(getApiErrorMessage(err, "Failed to load admissions data"));
//     }
//   };

//   const stageNames = useMemo(() => stages.map((s) => s.stage_name), [stages]);

//   // Shared filter predicate used by both the active pipeline cards and the
//   // rejected list, so every column respects the same search/source/counselor
//   // filters consistently.
//   const matchesFilters = (c) => {
//     if (
//       q &&
//       !(
//         c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
//         c.primary_phone?.includes(q)
//       )
//     )
//       return false;
//     if (src !== "all" && c.source_name !== src) return false;
//     if (counselor !== "all" && c.counselor_name !== counselor) return false;
//     return true;
//   };

//   const byNameAsc = (a, b) =>
//     (a.full_name || "").localeCompare(b.full_name || "", undefined, {
//       sensitivity: "base",
//     });

//   // ============================================================
//   // STATUS VISIBILITY RULES
//   //
//   // Status        Normal Pipeline   Rejected   Pipeline Count
//   // ACTIVE              ✅              —             ✅
//   // TRANSFERRED         ✅              —             ✅
//   // REJECTED            —              ✅             ✅
//   // DELETED             ❌              ❌             ❌
//   //
//   // i.e. DELETED is hidden everywhere and never counted.
//   // Everything else (ACTIVE / TRANSFERRED / REJECTED) is counted in the
//   // Pipeline Count. REJECTED is only ever *displayed* in the Rejected
//   // column/tab; ACTIVE + TRANSFERRED are only ever displayed in the
//   // Normal Pipeline columns.
//   // ============================================================

//   const isDeleted = (admission) =>
//     String(admission?.status || "").toUpperCase() === "DELETED";

//   const isRejected = (admission) => {
//     const status = String(admission?.status || "").toUpperCase();

//     return (
//       status === "REJECTED" ||
//       Number(admission?.stage_id) === 8 ||
//       admission?.stage_name === "Rejected"
//     );
//   };

//   // Normal pipeline cards:
//   // ACTIVE + TRANSFERRED are shown here.
//   // REJECTED is shown in the Rejected column.
//   // DELETED is hidden everywhere.
//   const cards = useMemo(() => {
//     return allAdmissions
//       .filter((c) => {
//         if (isDeleted(c)) return false;
//         if (isRejected(c)) return false;

//         return matchesFilters(c);
//       })
//       .sort(byNameAsc);
//   }, [allAdmissions, q, src, counselor]);

//   // Rejected column:
//   // REJECTED / stage 8 are shown.
//   // DELETED is always hidden.
//   const rejectedList = useMemo(() => {
//     return allAdmissions
//       .filter((c) => {
//         if (isDeleted(c)) return false;
//         return isRejected(c);
//       })
//       .filter(matchesFilters)
//       .sort(byNameAsc);
//   }, [allAdmissions, q, src, counselor]);

//   // Rejected badge/count:
//   // Count rejected records except DELETED.
//   const rejectedTotal = useMemo(() => {
//     return allAdmissions.filter((c) => {
//       if (isDeleted(c)) return false;
//       return isRejected(c);
//     }).length;
//   }, [allAdmissions]);

//   // Pipeline counts (Kanban column badges):
//   // Count ALL statuses except DELETED — i.e. ACTIVE + TRANSFERRED + REJECTED.
//   //
//   // ACTIVE       -> COUNT
//   // TRANSFERRED  -> COUNT
//   // REJECTED     -> COUNT
//   // DELETED      -> NOT COUNTED
//   const pipelineStageCounts = useMemo(() => {
//     const counts = {};

//     allAdmissions.forEach((admission) => {
//       if (isDeleted(admission)) return;

//       const stageName =
//         admission.stage_name ||
//         stages.find(
//           (s) =>
//             String(s.id) === String(admission.stage_id)
//         )?.stage_name;

//       if (!stageName) return;

//       counts[stageName] =
//         (counts[stageName] || 0) + 1;
//     });

//     return counts;
//   }, [allAdmissions, stages]);

//   // Unique applicant names for the search autosuggest dropdown, filtered
//   // against the current query (Google-style — only relevant matches show,
//   // capped to keep the list short).
//   const nameSuggestions = useMemo(() => {
//     const unique = Array.from(
//       new Set(allAdmissions.map((a) => a.full_name).filter(Boolean))
//     ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

//     if (!q.trim()) return [];
//     const query = q.toLowerCase();
//     return unique
//       .filter((name) => name.toLowerCase().includes(query))
//       .slice(0, 8);
//   }, [allAdmissions, q]);

//   // Close the suggestion dropdown on outside click.
//   useEffect(() => {
//     const handleClick = (e) => {
//       if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
//         setSuggestOpen(false);
//         setSuggestIndex(-1);
//       }
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   const chooseSuggestion = (name) => {
//     setQ(name);
//     setSuggestOpen(false);
//     setSuggestIndex(-1);
//   };

//   const handleSearchKeyDown = (e) => {
//     if (!suggestOpen || nameSuggestions.length === 0) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setSuggestIndex((i) => (i + 1) % nameSuggestions.length);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setSuggestIndex(
//         (i) => (i - 1 + nameSuggestions.length) % nameSuggestions.length
//       );
//     } else if (e.key === "Enter") {
//       if (suggestIndex >= 0) {
//         e.preventDefault();
//         chooseSuggestion(nameSuggestions[suggestIndex]);
//       } else {
//         setSuggestOpen(false);
//       }
//     } else if (e.key === "Escape") {
//       setSuggestOpen(false);
//       setSuggestIndex(-1);
//     }
//   };

//   // Highlights the matched substring within a suggestion, like search
//   // engines do.
//   const highlightMatch = (name) => {
//     const idx = name.toLowerCase().indexOf(q.toLowerCase());
//     if (idx === -1) return name;
//     return (
//       <>
//         {name.slice(0, idx)}
//         <span className="font-semibold text-foreground">
//           {name.slice(idx, idx + q.length)}
//         </span>
//         {name.slice(idx + q.length)}
//       </>
//     );
//   };

//   const openStage = (stageName) => {
//     setStageFilter(stageName);
//     setTab(stageName === "Rejected" ? "rejected" : "forms");
//   };

//   const toggleSel = (id) =>
//     setSelected((p) => {
//       const n = new Set(p);
//       if (n.has(id)) n.delete(id);
//       else n.add(id);
//       return n;
//     });

//   const moveToStage = async (admissionUuid, stageName) => {
//     const nextStage = stages.find((s) => s.stage_name === stageName);
//     if (!nextStage) return;
//     const res = await enrollStudent(admissionUuid, nextStage.id);
//     toast.success(res.data.message || `Moved to ${stageName}`);
//   };

//   const onDrop = async (stageName) => {
//     if (!dragItem) return;
//     try {
//       await moveToStage(dragItem.admission_uuid, stageName);
//       setDragItem(null);
//       loadData();
//     } catch (err) {
//       toast.error(getApiErrorMessage(err, "Failed to move stage"));
//     }
//   };

//   const bulkMove = async (stageName) => {
//     try {
//       const nextStage = stages.find((s) => s.stage_name === stageName);
//       if (!nextStage) return;

//       for (const id of selected) {
//         const student = allAdmissions.find((a) => a.id === id);
//         if (student) await enrollStudent(student.admission_uuid, nextStage.id);
//       }

//       toast.success(`${selected.size} moved successfully`);
//       setSelected(new Set());
//       loadData();
//     } catch (err) {
//       toast.error("Failed to move stage");
//     }
//   };

//   const confirmReject = async () => {
//     if (!rejectFor) return;

//     if (!rejectReason.trim()) {
//       toast.error("Reason is required");
//       return;
//     }

//     try {
//       const res = await rejectAdmission(
//         rejectFor.admission_uuid,
//         rejectReason.trim()
//       );

//       toast.success(
//         res.data?.message || "Admission rejected successfully."
//       );

//       setRejectFor(null);
//       setRejectReason("");

//       await loadData();

//     } catch (err) {
//       toast.error(getApiErrorMessage(err, "Failed to reject admission."));
//     }
//   };

//   const reinstate = async (admission) => {
//     try {
//       const res = await reinstateAdmission(
//         admission.admission_uuid
//       );

//       toast.success(
//         res.data?.message ||
//         `${admission.full_name} reinstated successfully.`
//       );

//       await loadData();

//     } catch (err) {
//       toast.error(getApiErrorMessage(err, "Failed to reinstate admission."));
//     }
//   };

//   const submitPublicForm = async () => {
//     try {
//       const fullName = publicForm.name.trim();
//       const phone = publicForm.phone.trim();

//       if (!fullName) {
//         toast.error("Full Name is required");
//         return;
//       }

//       if (!phone) {
//         toast.error("Phone is required");
//         return;
//       }

//       if (!publicForm.class_uuid) {
//         toast.error("Please select a class");
//         return;
//       }

//       if (!publicForm.consent) {
//         toast.error("Please accept the consent");
//         return;
//       }

//       if (!instituteUUID) {
//         toast.error("Institute context missing. Please re-login and try again.");
//         return;
//       }

//       const payload = {
//         institute_uuid: instituteUUID,
//         full_name: fullName,
//         email: publicForm.email.trim() || null,
//         primary_phone: phone,
//         address: publicForm.location.trim() || null,
//         prev_school: publicForm.school.trim() || null,
//         parent_name: publicForm.parent.trim() || null,
//         class_uuid: publicForm.class_uuid,
//         source_name: "Website",
//         notes: [
//           publicForm.occupation.trim()
//             ? `Parent occupation: ${publicForm.occupation.trim()}`
//             : "",
//           publicForm.notes.trim() ? publicForm.notes.trim() : "",
//         ]
//           .filter(Boolean)
//           .join("\n") || null,
//       };

//       console.log("Creating public admission:", payload);

//       const response = await createAdmission(payload);

//       toast.success(
//         response?.data?.message || "Admission enquiry submitted successfully"
//       );

//       setFormOpen(false);
//       setPublicForm({
//         name: "",
//         email: "",
//         phone: "",
//         location: "",
//         school: "",
//         parent: "",
//         occupation: "",
//         class_uuid: "",
//         notes: "",
//         consent: false,
//       });

//       await loadData();
//     } catch (err) {
//       console.error("Public admission error:", err);
//       toast.error(getApiErrorMessage(err, "Failed to submit admission form"));
//     }
//   };

//   // ============================================================
//   // Admissions Excel Import
//   // Sends the original Excel file directly to the backend:
//   // POST /admissions/import
//   // ============================================================
//  const handleAdmissionsImport = async (file) => {
//   try {
//     if (!file) {
//       toast.error("Please select an Excel file");
//       return;
//     }

//     if (!instituteUUID) {
//       toast.error(
//         "Institute context missing. Please re-login and try again."
//       );
//       return;
//     }

//     console.log("Uploading Excel file:", {
//       name: file.name,
//       type: file.type,
//       size: file.size,
//     });

//     const response = await importAdmissions(file);

//     console.log(
//       "Admission import response:",
//       response.data
//     );

//     const result = response?.data || {};

//     const imported = Number(
//       result.imported || 0
//     );

//     const skipped = Array.isArray(
//       result.skipped
//     )
//       ? result.skipped
//       : [];

//     if (imported > 0) {
//       toast.success(
//         `${imported} admissions imported successfully`
//       );
//     } else {
//       toast.info(
//         "No admissions were imported"
//       );
//     }

//     if (skipped.length > 0) {
//       console.warn(
//         "Skipped rows:",
//         skipped
//       );

//       toast.warning(
//         `${skipped.length} rows skipped`
//       );
//     }

//     await loadData();

//   } catch (err) {
//     console.error(
//       "Admission Excel import failed:",
//       err
//     );

//     const detail =
//       err?.response?.data?.detail;

//     if (Array.isArray(detail)) {
//       toast.error(
//         detail
//           .map(
//             (item) =>
//               item?.msg ||
//               "Validation error"
//           )
//           .join(", ")
//       );
//     } else {
//       toast.error(
//         detail ||
//           err?.response?.data?.message ||
//           err?.message ||
//           "Failed to import admissions"
//       );
//     }
//   }
// };
//   // ---- analytics ----
//   // Calculate analytics from ACTIVE admissions only.
//   const activeAdmissions = useMemo(
//     () => allAdmissions.filter(
//       (a) => String(a.status || "").toUpperCase() === "ACTIVE"
//     ),
//     [allAdmissions]
//   );

//   // Stage counts scoped to ACTIVE-only admissions — used by the analytics
//   // "Stage Funnel" chart below. (Distinct from pipelineStageCounts, which
//   // intentionally also includes TRANSFERRED + REJECTED for the Kanban
//   // column badges — see STATUS VISIBILITY RULES above.)
//   const activeStageCounts = useMemo(() => {
//     const counts = {};

//     activeAdmissions.forEach((admission) => {
//       const stageName =
//         admission.stage_name ||
//         stages.find(
//           (s) => String(s.id) === String(admission.stage_id)
//         )?.stage_name;

//       if (!stageName) return;

//       counts[stageName] = (counts[stageName] || 0) + 1;
//     });

//     return counts;
//   }, [activeAdmissions, stages]);

//   const counts = useMemo(
//     () =>
//       pipelineData.map((stage) => ({
//         stage: stage.stage_name,
//         n: activeStageCounts[stage.stage_name] || 0,
//       })),
//     [pipelineData, activeStageCounts]
//   );

//   const total = activeAdmissions.length;

//   const enrolledStageId = stages.find(
//     (s) => s.stage_name === "Enrolled"
//   )?.id;

//   const enrolled = activeAdmissions.filter(
//     (a) =>
//       a.stage_name === "Enrolled" ||
//       a.stage_id === enrolledStageId
//   ).length;

//   const convRate = total
//     ? Number(((enrolled / total) * 100).toFixed(2))
//     : 0;

//   const bySource = useMemo(() => {
//     const sourceMap = {};

//     activeAdmissions.forEach((admission) => {
//       const source = admission.source_name || "Unknown";
//       sourceMap[source] = (sourceMap[source] || 0) + 1;
//     });

//     return Object.entries(sourceMap).map(([source, count]) => ({
//       source,
//       count,
//     }));
//   }, [activeAdmissions]);

//   return (
//     <PageContainer>
//       <PageHeader
//         eyebrow="Admin · Academic"
//         title="Admissions Pipeline"
//         description="Drag prospects across stages. Click any card to open the full counseling, document, payment and communication record."
//         actions={
//           <>
//             <ExcelExport
//               rows={allAdmissions}
//               fileName="admissions.xlsx"
//               columns={[
//                 { header: "ID", accessor: (r) => r.id },
//                 { header: "Name", accessor: (r) => r.full_name },
//                 { header: "Class", accessor: (r) => r.class_name },
//                 { header: "Phone", accessor: (r) => r.primary_phone },
//                 { header: "Email", accessor: (r) => r.email },
//                 { header: "Source", accessor: (r) => r.source_name },
//                 { header: "Stage", accessor: (r) => r.stage_name },
//                 { header: "Counselor", accessor: (r) => r.counselor_name ?? "" },
//               ]}
//             />
// <ExcelUpload
//   label="Bulk Upload"
//   templateName="admissions-template.xlsx"
//   templateHeaders={[
//     "Name",
//     "Class",
//     "Parent",
//     "Phone",
//     "Email",
//     "Source",
//     "Counselor", 
//     "Session Year",
//   ]}
//   onFile={handleAdmissionsImport}
// />
//             <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
//               <FileText className="h-4 w-4" />
//               Public Form
//             </Button>
//             <NewInquiryDialog
//               trigger={
//                 <Button size="sm" className="gradient-primary border-0">
//                   <Plus className="h-4 w-4" />
//                   New Inquiry
//                 </Button>
//               }
//               onCreate={async () => {
//                 await loadData();
//               }}
//             />
//           </>
//         }
//       />

//       <Tabs value={tab} onValueChange={setTab} className="mb-4">
//         <TabsList>
//           <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
//           <TabsTrigger value="forms">Forms</TabsTrigger>
//           <TabsTrigger value="test">Admission Test</TabsTrigger>
//           <TabsTrigger value="rejected">
//             Rejected ({rejectedTotal})
//           </TabsTrigger>
//           <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
//         </TabsList>

//         {/* ---------------- PIPELINE ---------------- */}
//         <TabsContent value="pipeline" className="mt-4 space-y-4">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative" ref={searchBoxRef}>
//               <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
//               <Input
//                 value={q}
//                 onChange={(e) => {
//                   setQ(e.target.value);
//                   setSuggestOpen(true);
//                   setSuggestIndex(-1);
//                 }}
//                 onFocus={() => setSuggestOpen(true)}
//                 onKeyDown={handleSearchKeyDown}
//                 placeholder="Search name / phone…"
//                 className="pl-8 h-9 w-64"
//                 autoComplete="off"
//               />
//               {suggestOpen && nameSuggestions.length > 0 && (
//                 <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-md border bg-popover shadow-lg overflow-hidden py-1">
//                   {nameSuggestions.map((name, idx) => (
//                     <button
//                       type="button"
//                       key={name}
//                       onMouseDown={(e) => {
//                         e.preventDefault();
//                         chooseSuggestion(name);
//                       }}
//                       onMouseEnter={() => setSuggestIndex(idx)}
//                       className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
//                         idx === suggestIndex
//                           ? "bg-muted"
//                           : "hover:bg-muted/60"
//                       }`}
//                     >
//                       <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
//                       <span className="truncate text-foreground/90">
//                         {highlightMatch(name)}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <Select value={src} onValueChange={setSrc}>
//               <SelectTrigger className="h-9 w-40">
//                 <SelectValue placeholder="Source" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All sources</SelectItem>
//                 {sources.map((s) => (
//                   <SelectItem key={s.id} value={s.name}>
//                     {s.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={counselor} onValueChange={setCounselor}>
//               <SelectTrigger className="h-9 w-40">
//                 <SelectValue placeholder="Counselor" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All counselors</SelectItem>
//                 {counselors.map((c) => (
//                   <SelectItem key={c.id} value={c.counselor_name}>
//                     {c.counselor_name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {selected.size > 0 && (
//               <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
//                 <span className="text-xs font-medium">
//                   {selected.size} selected
//                 </span>
//                 <Select onValueChange={(v) => bulkMove(v)}>
//                   <SelectTrigger className="h-7 w-36 text-xs">
//                     <SelectValue placeholder="Move to…" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {stages.map((s) => (
//                       <SelectItem key={s.id} value={s.stage_name}>
//                         {s.stage_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-7 text-xs"
//                   onClick={() => {
//                     toast.success(`Bulk SMS to ${selected.size}`);
//                     setSelected(new Set());
//                   }}
//                 >
//                   <Send className="h-3 w-3" />
//                   SMS
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-7 text-xs text-destructive"
//                   onClick={() => {
//                     selected.forEach((id) => {
//                       const student = allAdmissions.find((a) => a.id === id);
//                       if (student) setRejectFor(student);
//                     });
//                     setSelected(new Set());
//                   }}
//                 >
//                   <Trash2 className="h-3 w-3" />
//                 </Button>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
//             {pipelineData.map((stage) => (
//               <Card
//                 key={stage.stage_name}
//                 role="button"
//                 tabIndex={0}
//                 onClick={() => openStage(stage.stage_name)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") openStage(stage.stage_name);
//                 }}
//                 title={`Open ${stage.stage_name} table`}
//                 className={`cursor-pointer transition hover:shadow-sm ${
//                   stage.stage_name === "Rejected"
//                     ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
//                     : "border-border/60 hover:border-primary/50"
//                 }`}
//               >
//                 <CardContent className="p-3">
//                   <div
//                     className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
//                       stage.stage_name === "Rejected"
//                         ? "text-destructive"
//                         : "text-muted-foreground"
//                     }`}
//                   >
//                     {stage.stage_name === "Rejected" && (
//                       <XCircle className="h-3 w-3" />
//                     )}
//                     {stage.stage_name}
//                   </div>

//                   <div
//                     className={`text-2xl font-display font-semibold mt-1 ${
//                       stage.stage_name === "Rejected"
//                         ? "text-destructive"
//                         : ""
//                     }`}
//                   >
//                     {pipelineStageCounts[stage.stage_name] || 0}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}

//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {pipelineData.map((stage) => {
//               const items =
//                 stage.stage_name === "Rejected"
//                   ? rejectedList
//                   : cards.filter(
//                       (c) => c.stage_name === stage.stage_name
//                     );
//               return (
//                 <Card
//                   key={stage.stage_name}
//                   className="border-border/60 bg-muted/20"
//                 >
//                   <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
//                     <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
//                       {stage.stage_name}
//                     </CardTitle>
//                     <Badge variant="outline" className="text-[10px]">
//                       {items.length}
//                     </Badge>
//                   </CardHeader>
//                   <CardContent
//                     className="space-y-2 max-h-[560px] overflow-y-auto p-2"
//                     onDragOver={(e) => e.preventDefault()}
//                     onDrop={() => {

//                       if (
//                         stage.stage_name === "Rejected"
//                       ) {

//                         setRejectFor(dragItem);
//                         setRejectReason("");

//                         return;
//                       }

//                       onDrop(stage.stage_name);

//                     }}
//                   >
//                     {items.length === 0 && (
//                       <div className="text-xs text-muted-foreground text-center py-6">
//                         Drop here
//                       </div>
//                     )}
//                     {items.map((c) => {
//                       const stageIdx = stages.findIndex(
//                         (s) => s.stage_name === stage.stage_name,
//                       );
//                       const rawNext = stages[stageIdx + 1]?.stage_name;
//                       // Never surface a "next stage" button on terminal
//                       // stages (Enrolled has nowhere to go), and never let
//                       // "next" resolve to Rejected — rejection only ever
//                       // happens through the explicit reject flow.
//                       const next = TERMINAL_STAGES.includes(stage.stage_name)
//                         ? undefined
//                         : rawNext === "Rejected"
//                         ? undefined
//                         : rawNext;
//                       return (
//                         <div
//                           key={c.id}
//                           draggable={stage.stage_name !== "Rejected"}
//                           onDragStart={() => setDragItem(c)}
//                           className={`bg-card border border-l-4 ${stageColor[stage.stage_name]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${selected.has(c.id) ? "ring-2 ring-primary" : ""}`}
//                           onClick={(e) => {
//                             if (e.target.closest("[data-stop]")) return;
//                             navigate(`/admin/admissions/${c.admission_uuid}`);
//                           }}
//                         >
//                           <div className="flex items-start gap-2.5">
//                             {stage.stage_name !== "Rejected" && (
//                               <div
//                                 data-stop
//                                 onClick={(e) => e.stopPropagation()}
//                               >
//                                 <Checkbox
//                                   checked={selected.has(c.id)}
//                                   onCheckedChange={() => toggleSel(c.id)}
//                                 />
//                               </div>
//                             )}
//                             <Avatar className="h-8 w-8 shrink-0">
//                               {c.passport_photo_file ? (
//                                 <AvatarImage
//                                   src={c.passport_photo_file}
//                                   alt={c.full_name}
//                                   className="object-cover"
//                                 />
//                               ) : (
//                                 <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
//                                   {c.full_name
//                                     ?.split(" ")
//                                     .map((n) => n[0])
//                                     .join("")}
//                                 </AvatarFallback>
//                               )}
//                             </Avatar>
//                             <div className="min-w-0 flex-1">
//                               <div className="text-sm font-medium truncate">
//                                 {c.full_name}
//                               </div>
//                               <div className="text-[10px] text-muted-foreground">
//                                 Class {c.class_name} · {c.source_name}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
//                             {stage.stage_name === "Rejected" && (
//                               <>
//                                 <div
//                                   data-stop
//                                   className="text-xs text-destructive cursor-pointer hover:underline truncate"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setViewReasonFor(c);
//                                   }}
//                                   title="Click to view full rejection reason"
//                                 >
//                                   Reason : {c.rejection_reason || "-"}
//                                 </div>

//                                 <div className="text-xs text-muted-foreground">
//                                   Rejected :
//                                   {
//                                     c.rejected_at
//                                       ? new Date(
//                                           c.rejected_at
//                                         ).toLocaleDateString()
//                                       : "-"
//                                   }
//                                 </div>
//                               </>
//                             )}
//                             <div className="flex items-center gap-1.5">
//                               <Phone className="h-3 w-3" />
//                               {c.primary_phone}
//                             </div>
//                             <div className="flex items-center gap-1.5 truncate">
//                               <Mail className="h-3 w-3 shrink-0" />
//                               <span className="truncate">{c.email}</span>
//                             </div>
//                             {c.counselor_name && (
//                               <div className="text-[10px]">
//                                 👤 {c.counselor_name}
//                               </div>
//                             )}

//                             {stage.stage_name === "Admission Test" && (
//                               <div
//                                 className={`flex items-center gap-1 text-[10px] ${
//                                   parentConfirmationStatus(c).submitted
//                                     ? "text-success"
//                                     : "text-warning"
//                                 }`}
//                               >
//                                 {parentConfirmationStatus(c).submitted ? (
//                                   <CheckCircle2 className="h-3 w-3" />
//                                 ) : (
//                                   <Clock3 className="h-3 w-3" />
//                                 )}
//                                 <span>
//                                   {parentConfirmationStatus(c).label}
//                                 </span>
//                                 {c.parent_submitted_at && (
//                                   <span className="text-muted-foreground">
//                                     · {new Date(c.parent_submitted_at).toLocaleDateString()}
//                                   </span>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                           <div
//                             className="flex items-center justify-between mt-2.5 pt-2 border-t gap-1"
//                             data-stop
//                             onClick={(e) => e.stopPropagation()}
//                           >

//                             {stage.stage_name === "Rejected" && (

//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => reinstate(c)}
//                               >
//                                 <RotateCcw
//                                   className="h-3 w-3"
//                                 />

//                                 Reinstate

//                               </Button>

//                             )}
//                             <span
//                               className="text-[10px] text-muted-foreground"
//                               title="Date when this admission entered the current stage"
//                             >
//                               {new Date(
//                                 c.stage_updated_at || c.created_at
//                               ).toLocaleDateString()}
//                             </span>
//                             <div className="flex items-center gap-0.5">
//                               {stage.stage_name !== "Rejected" && (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="h-6 px-2 text-[10px]
//                                       text-destructive"
//                                   onClick={() => {
//                                     setRejectFor(c);
//                                     setRejectReason("");
//                                   }}
//                                 >
//                                   <XCircle className="h-3 w-3" />
//                                 </Button>
//                               )}
//                               {stage.stage_name !== "Rejected" && next && (
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="h-6 px-2 text-[10px]"
//                                   onClick={async () => {
//                                     try {
//                                       await moveToStage(c.admission_uuid, next);
//                                       loadData();
//                                     } catch (err) {
//                                       toast.error(
//                                         getApiErrorMessage(err, "Failed to move stage"),
//                                       );
//                                     }
//                                   }}
//                                 >
//                                   {next.split(" ")[0]}
//                                   <ArrowRight className="h-3 w-3" />
//                                 </Button>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         </TabsContent>

//         {/* ---------------- FORMS ---------------- */}
//         <TabsContent value="forms" className="mt-4 space-y-3">
//           <Card>
//             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <FileText className="h-4 w-4" />
//                 Admission Forms Received
//               </CardTitle>
//               <Select value={stageFilter} onValueChange={setStageFilter}>
//                 <SelectTrigger className="h-8 w-44 text-xs">
//                   <SelectValue placeholder="Filter by stage" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All stages</SelectItem>
//                   {stageNames.map((s) => (
//                     <SelectItem key={s} value={s}>
//                       {s}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Applicant</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Contact</TableHead>
//                     <TableHead>Stage</TableHead>
//                     <TableHead>Parent Confirmation</TableHead>
//                     <TableHead>Source</TableHead>
//                     <TableHead>Received</TableHead>
//                     <TableHead className="text-right">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {allAdmissions
//                     .filter(
//                       (i) =>
//                         String(i.status || "").toUpperCase() === "ACTIVE" &&
//                         Number(i.stage_id) !== 8 &&
//                         (stageFilter === "all" ||
//                           i.stage_name === stageFilter)
//                     )
//                     .sort(byNameAsc)
//                     .map((i) => (
//                       <TableRow
//                         key={i.id}
//                         className="cursor-pointer"
//                         onClick={() => setViewForm(i)}
//                       >
//                         <TableCell className="font-mono text-xs">
//                           {i.id}
//                         </TableCell>
//                         <TableCell className="font-medium">
//                           {i.full_name}
//                         </TableCell>
//                         <TableCell>{i.class_name}</TableCell>
//                         <TableCell className="text-xs">
//                           {i.primary_phone}
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="secondary" className="text-[10px]">
//                             {i.stage_name}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-1.5">
//                             {i.parent_submitted ? (
//                               <>
//                                 <CheckCircle2 className="h-3.5 w-3.5 text-success" />
//                                 <Badge variant="outline" className="border-success/40 text-success">
//                                   Parent Submitted
//                                 </Badge>
//                               </>
//                             ) : (
//                               <>
//                                 <Clock3 className="h-3.5 w-3.5 text-warning" />
//                                 <Badge variant="outline" className="border-warning/40 text-warning">
//                                   Parent Pending
//                                 </Badge>
//                               </>
//                             )}
//                           </div>
//                           {i.parent_submitted_at && (
//                             <div className="mt-1 text-[10px] text-muted-foreground">
//                               {formatStageDate(i.parent_submitted_at)}
//                             </div>
//                           )}
//                         </TableCell>

//                         <TableCell>
//                           <Badge variant="outline">{i.source_name}</Badge>
//                         </TableCell>
//                         <TableCell className="text-xs text-muted-foreground">
//                           {new Date(i.stage_updated_at || i.created_at).toLocaleDateString()}
//                         </TableCell>
//                         <TableCell
//                           className="text-right"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => setViewForm(i)}
//                           >
//                             <Eye className="h-3.5 w-3.5" />
//                             View
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             className="text-destructive"
//                             onClick={() => {
//                               setRejectFor(i);
//                               setRejectReason("");
//                             }}
//                           >
//                             <XCircle className="h-3.5 w-3.5" />
//                             Reject
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ---------------- REJECTED ---------------- */}
//         <TabsContent value="rejected" className="mt-4 space-y-3">
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-base flex items-center gap-2 text-destructive">
//                 <XCircle className="h-4 w-4" />
//                 Rejected Inquiries
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Applicant</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Reason</TableHead>
//                     <TableHead>Rejected On</TableHead>
//                     <TableHead className="text-right">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {rejectedList.length === 0 && (
//                     <TableRow>
//                       <TableCell
//                         colSpan={6}
//                         className="text-center text-sm text-muted-foreground py-8"
//                       >
//                         No rejected inquiries.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                   {rejectedList.map((i) => (
//                     <TableRow key={i.id}>
//                       <TableCell className="font-mono text-xs">
//                         {i.id}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {i.full_name}
//                         <div className="text-[10px] text-muted-foreground">
//                           {i.primary_phone}
//                         </div>
//                       </TableCell>
//                       <TableCell>{i.class_name}</TableCell>
//                       <TableCell
//                         className="text-xs max-w-md cursor-pointer hover:underline"
//                         onClick={() => setViewReasonFor(i)}
//                         title="Click to view full rejection reason"
//                       >
//                         <span className="line-clamp-2">
//                           {i.rejection_reason || "—"}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-xs text-muted-foreground">
//                         {i.rejected_at
//                           ? new Date(i.rejected_at).toLocaleDateString()
//                           : "—"}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => reinstate(i)}
//                         >
//                           <RotateCcw className="h-3.5 w-3.5" />
//                           Reinstate
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ---------------- ADMISSION TEST ---------------- */}
//         <TabsContent value="test" className="mt-4 space-y-3">
//           <Card>
//             <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <ClipboardCheck className="h-4 w-4" />
//                 Admission Test Results
//               </CardTitle>
//               <Select value={testFilter} onValueChange={setTestFilter}>
//                 <SelectTrigger className="h-8 w-44 text-xs">
//                   <SelectValue placeholder="Filter" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All scores</SelectItem>
//                   <SelectItem value="85">85 – 100% (Excellent)</SelectItem>
//                   <SelectItem value="70">70 – 85% (Good)</SelectItem>
//                   <SelectItem value="50">50 – 70% (Average)</SelectItem>
//                   <SelectItem value="0">Below 50% (Weak)</SelectItem>
//                   <SelectItem value="pending">Not attempted</SelectItem>
//                 </SelectContent>
//               </Select>
//             </CardHeader>
//             <CardContent className="p-0">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Candidate</TableHead>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Score</TableHead>
//                     <TableHead>Grade</TableHead>
//                     <TableHead>Stage</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {allAdmissions
//                     .filter((i) => {
//                       // Only ACTIVE admissions are shown.
//                       if (String(i.status || "").toUpperCase() !== "ACTIVE") return false;

//                       // `test_score` is not part of the current admissions
//                       // API response — add it server-side to populate this tab.
//                       const s = i.test_score;
//                       if (testFilter === "all") return true;
//                       if (testFilter === "pending") return s == null;
//                       if (s == null) return false;
//                       const min = Number(testFilter);
//                       const max =
//                         min === 85 ? 100 : min === 70 ? 85 : min === 50 ? 70 : 50;
//                       return s >= min && s < max + (min === 85 ? 1 : 0);
//                     })
//                     .sort(byNameAsc)
//                     .map((i) => {
//                       const s = i.test_score;
//                       const grade =
//                         s == null ? "—" : s >= 85 ? "A+" : s >= 70 ? "A" : s >= 50 ? "B" : "C";
//                       const tone =
//                         s == null ? "outline" : s >= 70 ? "default" : s >= 50 ? "secondary" : "destructive";
//                       return (
//                         <TableRow key={i.id}>
//                           <TableCell className="font-mono text-xs">
//                             {i.id}
//                           </TableCell>
//                           <TableCell className="font-medium">
//                             {i.full_name}
//                           </TableCell>
//                           <TableCell>{i.class_name}</TableCell>
//                           <TableCell className="font-semibold">
//                             {s ?? "—"}
//                             {s != null && "%"}
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant={tone}>{grade}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <span className="text-xs text-muted-foreground">
//                               {i.stage_name}
//                             </span>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* ---------------- ANALYTICS ---------------- */}
//         <TabsContent value="analytics" className="mt-4">
//           <div className="grid md:grid-cols-3 gap-4 mb-4">
//             <Card>
//               <CardContent className="p-4">
//                 <div className="text-xs text-muted-foreground">
//                   Total Inquiries
//                 </div>
//                 <div className="text-3xl font-display font-semibold mt-1">
//                   {total}
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <div className="text-xs text-muted-foreground">Enrolled</div>
//                 <div className="text-3xl font-display font-semibold mt-1 text-success">
//                   {enrolled}
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <div className="text-xs text-muted-foreground flex items-center gap-1">
//                   <TrendingUp className="h-3 w-3" />
//                   Conversion Rate
//                 </div>
//                 <div className="text-3xl font-display font-semibold mt-1">
//                   {convRate}%
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//           <Card className="mb-4">
//             <CardHeader>
//               <CardTitle className="text-base">Stage Funnel</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               {counts.map((c) => (
//                 <div key={c.stage} className="flex items-center gap-3">
//                   <div className="w-32 text-xs text-muted-foreground">
//                     {c.stage}
//                   </div>
//                   <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-primary to-accent"
//                       style={{ width: `${total ? (c.n / total) * 100 : 0}%` }}
//                     />
//                   </div>
//                   <div className="w-12 text-right text-sm font-medium">
//                     {c.n}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">By Source</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
//               {bySource.map((s) => (
//                 <div key={s.source} className="p-3 border rounded-md">
//                   <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
//                     {s.source}
//                   </div>
//                   <div className="text-xl font-display font-semibold mt-1">
//                     {s.count}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Public Admission Form */}
//       <Dialog open={formOpen} onOpenChange={setFormOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Public Admission Form</DialogTitle>
//             <DialogDescription>
//               Minimum details to register an enquiry.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-2 gap-3">
//             <div className="col-span-2">
//               <Label>Full Name *</Label>
//               <Input
//                 value={publicForm.name}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, name: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label>Email</Label>
//               <Input
//                 type="email"
//                 value={publicForm.email}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, email: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label>Phone *</Label>
//               <Input
//                 value={publicForm.phone}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, phone: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label>Location</Label>
//               <Input
//                 value={publicForm.location}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, location: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label>Previous School</Label>
//               <Input
//                 value={publicForm.school}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, school: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label>Parent Name</Label>
//               <Input
//                 value={publicForm.parent}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, parent: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label>Parent Occupation</Label>
//               <Input
//                 value={publicForm.occupation}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, occupation: e.target.value })
//                 }
//               />
//             </div>
// <div className="col-span-2">
//   <Label>Class Applying For</Label>

//   <Select
//     value={publicForm.class_uuid}
//     onValueChange={(value) =>
//       setPublicForm((prev) => ({
//         ...prev,
//         class_uuid: value,
//       }))
//     }
//   >
//     <SelectTrigger disabled={classesLoading}>
//       <SelectValue
//         placeholder={
//           classesLoading
//             ? "Loading classes..."
//             : "Select class"
//         }
//       />
//     </SelectTrigger>

//     <SelectContent>
//       {classes.length === 0 ? (
//         <SelectItem value="no-class" disabled>
//           No classes available
//         </SelectItem>
//       ) : (
//         classes.map((c) => (
//           <SelectItem
//             key={c.class_uuid || c.id}
//             value={String(c.class_uuid || c.id)}
//           >
//             {c.class_name || c.name}
//           </SelectItem>
//         ))
//       )}
//     </SelectContent>
//   </Select>
// </div>
//             <div className="col-span-2">
//               <Label>Notes</Label>
//               <Textarea
//                 rows={2}
//                 value={publicForm.notes}
//                 onChange={(e) =>
//                   setPublicForm({ ...publicForm, notes: e.target.value })
//                 }
//               />
//             </div>
//             <label className="col-span-2 flex items-start gap-2 text-xs">
//               <Checkbox
//                 checked={publicForm.consent}
//                 onCheckedChange={(v) =>
//                   setPublicForm({ ...publicForm, consent: !!v })
//                 }
//               />
//               <span>
//                 I consent to the school storing this information for admission
//                 processing.
//               </span>
//             </label>
//           </div>
//           <DialogFooter>
//             <Button variant="ghost" onClick={() => setFormOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               disabled={!publicForm.consent || !publicForm.name || !publicForm.phone}
//               onClick={submitPublicForm}
//             >
//               Submit
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* View Form Details */}
//       <Dialog open={!!viewForm} onOpenChange={(o) => !o && setViewForm(null)}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               {viewForm?.full_name} — {viewForm?.id}
//             </DialogTitle>
//             <DialogDescription>Admission form details</DialogDescription>
//           </DialogHeader>
//           {viewForm && (
//             <div className="grid grid-cols-2 gap-3 text-sm">
//               <div>
//                 <Label className="text-xs">Class</Label>
//                 <div>{viewForm.class_name}</div>
//               </div>
//               <div>
//                 <Label className="text-xs">Source</Label>
//                 <div>{viewForm.source_name}</div>
//               </div>
//               <div>
//                 <Label className="text-xs">Phone</Label>
//                 <div>{viewForm.primary_phone}</div>
//               </div>
//               <div>
//                 <Label className="text-xs">Email</Label>
//                 <div>{viewForm.email}</div>
//               </div>
//               <div className="col-span-2">
//                 <Label className="text-xs">Notes</Label>
//                 <div className="whitespace-pre-wrap">
//                   {viewForm.notes || "—"}
//                 </div>
//               </div>
//               <div>
//                 <Label className="text-xs">Stage</Label>
//                 <div>
//                   <Badge>{viewForm.stage_name}</Badge>
//                 </div>
//               </div>

//               <div>
//                 <Label className="text-xs">Stage Updated</Label>
//                 <div className="text-xs text-muted-foreground">
//                   {formatStageDate(viewForm.stage_updated_at || viewForm.created_at)}
//                 </div>
//               </div>

//               <div className="col-span-2">
//                 <Label className="text-xs">Parent Confirmation</Label>
//                 <div className="mt-1 flex items-center gap-2">
//                   {viewForm.parent_submitted ? (
//                     <>
//                       <CheckCircle2 className="h-4 w-4 text-success" />
//                       <Badge variant="outline" className="border-success/40 text-success">
//                         Parent Submitted
//                       </Badge>
//                     </>
//                   ) : (
//                     <>
//                       <Clock3 className="h-4 w-4 text-warning" />
//                       <Badge variant="outline" className="border-warning/40 text-warning">
//                         Parent Pending
//                       </Badge>
//                     </>
//                   )}
//                 </div>

//                 {viewForm.parent_email_sent_at && (
//                   <div className="mt-2 text-xs text-muted-foreground">
//                     Email sent: {formatStageDate(viewForm.parent_email_sent_at)}
//                   </div>
//                 )}

//                 {viewForm.parent_submitted_at && (
//                   <div className="text-xs text-muted-foreground">
//                     Submitted: {formatStageDate(viewForm.parent_submitted_at)}
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <Label className="text-xs">Counselor</Label>
//                 <div>{viewForm.counselor_name || "—"}</div>
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 if (viewForm) {
//                   navigate(`/admin/admissions/${viewForm.admission_uuid}`);
//                   setViewForm(null);
//                 }
//               }}
//             >
//               Open full record
//             </Button>
//             <Button onClick={() => setViewForm(null)}>Close</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Reject inquiry dialog */}
//       <Dialog
//         open={!!rejectFor}
//         onOpenChange={(o) => {
//           if (!o) {
//             setRejectFor(null);
//             setRejectReason("");
//           }
//         }}
//       >
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Reason for Rejection</DialogTitle>
//             <DialogDescription>
//               {rejectFor?.full_name} · {rejectFor?.id} — this inquiry will move
//               to the Rejected list.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-2">
//             <Label className="text-xs">Reason *</Label>
//             <Textarea
//               rows={4}
//               value={rejectReason}
//               onChange={(e) => setRejectReason(e.target.value)}
//               placeholder="e.g. Seats full for the requested class, documents incomplete, applicant withdrew, etc."
//             />
//           </div>
//           <DialogFooter>
//             <Button
//               variant="ghost"
//               onClick={() => {
//                 setRejectFor(null);
//                 setRejectReason("");
//               }}
//             >
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={confirmReject}>
//               <XCircle className="h-4 w-4" />
//               Reject Inquiry
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* View rejection reason (read-only) — opened from Kanban card / Rejected table */}
//       <Dialog
//         open={!!viewReasonFor}
//         onOpenChange={(o) => !o && setViewReasonFor(null)}
//       >
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Reason for Rejection</DialogTitle>
//             <DialogDescription>
//               {viewReasonFor?.full_name} · {viewReasonFor?.id}
//               {viewReasonFor?.rejected_at &&
//                 ` — rejected ${new Date(viewReasonFor.rejected_at).toLocaleDateString()}`}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
//             {viewReasonFor?.rejection_reason || "No reason recorded."}
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setViewReasonFor(null)}>
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </PageContainer>
//   );
// }


import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAdmissionPipeline,
  getAdmissionAnalytics,
  getAdmissionSources,
  getAdmissionCounselors,
  getStages,
  getAllAdmissions,
  enrollStudent,
  createAdmission,
  importAdmissions,
  rejectAdmission,
  reinstateAdmission,
  importMpsRegistrations,
  importMpsetResults,
  createQualifiedMpsAdmissions,
  getMpsetReport,
} from "../../../api/admissions";
import { getClasses } from "../../../api/Class";
import useAuthStore from "../../../store/authStore";
import useSessionStore from "../../../store/sessionStore";

import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Plus,
  Search,
  Phone,
  Mail,
  ArrowRight,
  Trash2,
  Send,
  TrendingUp,
  FileText,
  ClipboardCheck,
  Eye,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Clock3,
  CalendarClock,
  Loader2,
  RefreshCw,
  Download,
} from "lucide-react";

import { toast } from "sonner";
import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";
import { ExcelUpload } from "../../../components/excel-upload";
import { ExcelExport } from "../../../components/excel-export";

const getApiErrorMessage = (err, fallback = "Something went wrong") => {
  const detail = err?.response?.data?.detail;
  const message = err?.response?.data?.message || err?.response?.data?.error;

  const stringify = (value) => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);

    if (Array.isArray(value)) {
      return value.map(stringify).filter(Boolean).join("\n");
    }

    if (typeof value === "object") {
      if (value.msg) {
        const loc = Array.isArray(value.loc)
          ? value.loc.filter((x) => x !== "body").join(" → ")
          : "";
        return loc ? `${loc}: ${String(value.msg)}` : String(value.msg);
      }
      if (value.message) return String(value.message);
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }

    return String(value);
  };

  return stringify(detail) || stringify(message) || err?.message || fallback;
};

const stageColor = {
  Inquiry: "border-l-muted-foreground",
  Lead: "border-l-info",
  Counseling: "border-l-chart-3",
  "Admission Test": "border-l-warning",
  "Doc Verification": "border-l-accent",
  "Fee Payment": "border-l-chart-5",
  Enrolled: "border-l-success",
  Rejected: "border-l-destructive",
};

// Stages that are dead-ends in the pipeline — no "advance to next stage"
// button should ever be shown on cards sitting in these columns, and
// "Rejected" specifically must never be computed as anyone's "next" stage
// (rejection has its own dedicated flow via the reject dialog / drag-to-Rejected).
const TERMINAL_STAGES = ["Enrolled", "Rejected"];

const formatStageDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const parentConfirmationStatus = (admission) =>
  admission?.parent_submitted
    ? { label: "Parent Submitted", submitted: true }
    : { label: "Parent Pending", submitted: false };

// Builds a small window of session-year strings ("2025-26", etc.) around
// the currently active one so the switcher always has somewhere sensible
// to go even before any "list sessions" endpoint exists. The active
// session (from the store) is always included even if it falls outside
// the generated window (e.g. an old/custom session picked previously).
const buildSessionYearOptions = (activeSession) => {
  const y = new Date().getFullYear();
  const options = [];
  for (let offset = -3; offset <= 2; offset++) {
    const start = y + offset;
    options.push(`${start}-${String(start + 1).slice(-2)}`);
  }
  if (activeSession && !options.includes(activeSession)) {
    options.unshift(activeSession);
  }
  return options;
};

export default function Admissions() {
  const navigate = useNavigate();
  const instituteUUID = useAuthStore((state) => state.instituteUUID);

  // ---- active session (drives every fetch on this page) ----
  const sessionYear = useSessionStore((state) => state.sessionYear);
  const setSessionYear = useSessionStore((state) => state.setSessionYear);
  const sessionYearOptions = useMemo(
    () => buildSessionYearOptions(sessionYear),
    [sessionYear]
  );

  // ---- server data ----
  const [pipelineData, setPipelineData] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [sources, setSources] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [stages, setStages] = useState([]);
  const [allAdmissions, setAllAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- pipeline filters / selection ----
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("all");
  const [counselor, setCounselor] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [dragItem, setDragItem] = useState(null);
  const [tab, setTab] = useState("pipeline");

  // ---- search autosuggest ----
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const searchBoxRef = useRef(null);

  // ---- forms / test tabs ----
  const [viewForm, setViewForm] = useState(null);
  const [testFilter, setTestFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [mpsReportType, setMpsReportType] = useState("website");
  const [mpsLoadedReportType, setMpsLoadedReportType] = useState("website");
  const [mpsReportRows, setMpsReportRows] = useState([]);
  const [mpsReportLoading, setMpsReportLoading] = useState(false);
  const [mpsCreatingAdmissions, setMpsCreatingAdmissions] = useState(false);

  // ---- reject dialog ----
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ---- view rejection reason dialog (read-only) ----
  const [viewReasonFor, setViewReasonFor] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  // ---- public form dialog ----
  const [formOpen, setFormOpen] = useState(false);
  const [publicForm, setPublicForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    school: "",
    parent: "",
    occupation: "",
    class_uuid: "",
    notes: "",
    consent: false,
  });

  const loadClasses = async () => {
    try {
      setClassesLoading(true);

      const res = await getClasses();

      const list = res.data?.data || res.data || res || [];

      setClasses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setClasses([]);
      toast.error("Failed to load classes");
    } finally {
      setClassesLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        pipelineRes,
        analyticsRes,
        sourceRes,
        counselorRes,
        stageRes,
        allRes,
      ] = await Promise.all([
        getAdmissionPipeline(),
        getAdmissionAnalytics(),
        getAdmissionSources(),
        getAdmissionCounselors(),
        getStages(),
        getAllAdmissions(),
      ]);

      const pipeline = Array.isArray(pipelineRes.data) ? pipelineRes.data : [];

      // The pipeline API returns the timestamp for the latest movement
      // into the current stage as `stage_updated_at`. Merge that value
      // (and the stage-scoped join date it implies) into the full
      // admission records used by the cards/tables so the UI shows the
      // current-stage / current-session date instead of always falling
      // back to the original admission creation date.
      const stageDateMap = {};
      pipeline.forEach((stage) => {
        (Array.isArray(stage.students) ? stage.students : []).forEach((item) => {
          if (!item?.admission_uuid) return;
          stageDateMap[item.admission_uuid] = {
            stage_name: item.stage_name || stage.stage_name,
            stage_id: item.stage_id,
            stage_updated_at: item.stage_updated_at || item.created_at || null,
          };
        });
      });

      const fullAdmissions = (Array.isArray(allRes.data) ? allRes.data : []).map(
        (admission) => ({
          ...admission,
          ...(stageDateMap[admission.admission_uuid] || {}),
          // join_date is scoped to whichever session_year the record
          // itself carries (each admission belongs to exactly one
          // session, set at creation/import time via session_year).
          join_date: admission.join_date || admission.created_at || null,
        })
      );

      setPipelineData(pipeline);
      setAnalytics(analyticsRes.data);
      setSources(Array.isArray(sourceRes.data) ? sourceRes.data : sourceRes.data?.data || []);
      setCounselors(
        Array.isArray(counselorRes.data) ? counselorRes.data : counselorRes.data?.data || []
      );
      setStages(stageRes.data?.data || []);
      setAllAdmissions(fullAdmissions);
    } catch (err) {
      console.error("Failed to load admissions data:", err);
      toast.error(getApiErrorMessage(err, "Failed to load admissions data"));
    } finally {
      setLoading(false);
    }
  };

  // Reload everything — pipeline, all-admissions, stages, sources,
  // counselors, classes — every time the active session year changes.
  // sessionYear lives in useSessionStore (persisted), so switching it
  // here or anywhere else in the app that shares the store will flow
  // through to this page automatically.
  useEffect(() => {
    loadData();
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionYear]);

  const stageNames = useMemo(() => stages.map((s) => s.stage_name), [stages]);

  // Shared filter predicate used by both the active pipeline cards and the
  // rejected list, so every column respects the same search/source/counselor
  // filters consistently.
  const matchesFilters = (c) => {
    if (
      q &&
      !(
        c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        c.primary_phone?.includes(q)
      )
    )
      return false;
    if (src !== "all" && c.source_name !== src) return false;
    if (counselor !== "all" && c.counselor_name !== counselor) return false;
    return true;
  };

  const byNameAsc = (a, b) =>
    (a.full_name || "").localeCompare(b.full_name || "", undefined, {
      sensitivity: "base",
    });

  // ============================================================
  // STATUS VISIBILITY RULES
  //
  // Status        Normal Pipeline   Rejected   Pipeline Count
  // ACTIVE              ✅              —             ✅
  // TRANSFERRED         ✅              —             ✅
  // REJECTED            —              ✅             ✅
  // DELETED             ❌              ❌             ❌
  //
  // i.e. DELETED is hidden everywhere and never counted.
  // Everything else (ACTIVE / TRANSFERRED / REJECTED) is counted in the
  // Pipeline Count. REJECTED is only ever *displayed* in the Rejected
  // column/tab; ACTIVE + TRANSFERRED are only ever displayed in the
  // Normal Pipeline columns.
  //
  // All of this operates on `allAdmissions`, which is already scoped to
  // the active `sessionYear` (see getAllAdmissions in api/admissions.js).
  // ============================================================

  const isDeleted = (admission) =>
    String(admission?.status || "").toUpperCase() === "DELETED";

  const isRejected = (admission) => {
    const status = String(admission?.status || "").toUpperCase();

    return (
      status === "REJECTED" ||
      Number(admission?.stage_id) === 8 ||
      admission?.stage_name === "Rejected"
    );
  };

  const cards = useMemo(() => {
    return allAdmissions
      .filter((c) => {
        if (isDeleted(c)) return false;
        if (isRejected(c)) return false;

        return matchesFilters(c);
      })
      .sort(byNameAsc);
  }, [allAdmissions, q, src, counselor]);

  const rejectedList = useMemo(() => {
    return allAdmissions
      .filter((c) => {
        if (isDeleted(c)) return false;
        return isRejected(c);
      })
      .filter(matchesFilters)
      .sort(byNameAsc);
  }, [allAdmissions, q, src, counselor]);

  const rejectedTotal = useMemo(() => {
    return allAdmissions.filter((c) => {
      if (isDeleted(c)) return false;
      return isRejected(c);
    }).length;
  }, [allAdmissions]);

  // const pipelineStageCounts = useMemo(() => {
  //   const counts = {};

  //   allAdmissions.forEach((admission) => {
  //     if (isDeleted(admission)) return;

  //     const stageName =
  //       admission.stage_name ||
  //       stages.find((s) => String(s.id) === String(admission.stage_id))?.stage_name;

  //     if (!stageName) return;

  //     counts[stageName] = (counts[stageName] || 0) + 1;
  //   });

  //   return counts;
  // }, [allAdmissions, stages]);

  const pipelineStageCounts = useMemo(() => {
  const counts = {};

  allAdmissions
    .filter(
      (admission) =>
        !isDeleted(admission) &&
        String(admission.session_year || "").trim() ===
          String(sessionYear || "").trim()
    )
    .forEach((admission) => {

      const stageName =
        admission.stage_name ||
        stages.find(
          (s) =>
            String(s.id) ===
            String(admission.stage_id)
        )?.stage_name;

      if (!stageName) return;

      counts[stageName] =
        (counts[stageName] || 0) + 1;
    });

  return counts;
}, [
  allAdmissions,
  stages,
  sessionYear,
]);
  const nameSuggestions = useMemo(() => {
    const unique = Array.from(
      new Set(allAdmissions.map((a) => a.full_name).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    if (!q.trim()) return [];
    const query = q.toLowerCase();
    return unique.filter((name) => name.toLowerCase().includes(query)).slice(0, 8);
  }, [allAdmissions, q]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestOpen(false);
        setSuggestIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const chooseSuggestion = (name) => {
    setQ(name);
    setSuggestOpen(false);
    setSuggestIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!suggestOpen || nameSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestIndex((i) => (i + 1) % nameSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestIndex((i) => (i - 1 + nameSuggestions.length) % nameSuggestions.length);
    } else if (e.key === "Enter") {
      if (suggestIndex >= 0) {
        e.preventDefault();
        chooseSuggestion(nameSuggestions[suggestIndex]);
      } else {
        setSuggestOpen(false);
      }
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      setSuggestIndex(-1);
    }
  };

  const highlightMatch = (name) => {
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return name;
    return (
      <>
        {name.slice(0, idx)}
        <span className="font-semibold text-foreground">
          {name.slice(idx, idx + q.length)}
        </span>
        {name.slice(idx + q.length)}
      </>
    );
  };

  const openStage = (stageName) => {
    setStageFilter(stageName);
    setTab(stageName === "Rejected" ? "rejected" : "forms");
  };

  const toggleSel = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const moveToStage = async (admissionUuid, stageName) => {
    const nextStage = stages.find((s) => s.stage_name === stageName);
    if (!nextStage) return;
    const res = await enrollStudent(admissionUuid, nextStage.id);
    toast.success(res.data.message || `Moved to ${stageName}`);
  };

  const onDrop = async (stageName) => {
    if (!dragItem) return;
    try {
      await moveToStage(dragItem.admission_uuid, stageName);
      setDragItem(null);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to move stage"));
    }
  };

  const bulkMove = async (stageName) => {
    try {
      const nextStage = stages.find((s) => s.stage_name === stageName);
      if (!nextStage) return;

      for (const id of selected) {
        const student = allAdmissions.find((a) => a.id === id);
        if (student) await enrollStudent(student.admission_uuid, nextStage.id);
      }

      toast.success(`${selected.size} moved successfully`);
      setSelected(new Set());
      loadData();
    } catch (err) {
      toast.error("Failed to move stage");
    }
  };

  const confirmReject = async () => {
    if (!rejectFor) return;

    if (!rejectReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    try {
      const res = await rejectAdmission(rejectFor.admission_uuid, rejectReason.trim());

      toast.success(res.data?.message || "Admission rejected successfully.");

      setRejectFor(null);
      setRejectReason("");

      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to reject admission."));
    }
  };

  const reinstate = async (admission) => {
    try {
      const res = await reinstateAdmission(admission.admission_uuid);

      toast.success(
        res.data?.message || `${admission.full_name} reinstated successfully.`
      );

      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to reinstate admission."));
    }
  };

  const submitPublicForm = async () => {
    try {
      const fullName = publicForm.name.trim();
      const phone = publicForm.phone.trim();

      if (!fullName) {
        toast.error("Full Name is required");
        return;
      }

      if (!phone) {
        toast.error("Phone is required");
        return;
      }

      if (!publicForm.class_uuid) {
        toast.error("Please select a class");
        return;
      }

      if (!publicForm.consent) {
        toast.error("Please accept the consent");
        return;
      }

      if (!instituteUUID) {
        toast.error("Institute context missing. Please re-login and try again.");
        return;
      }

      const payload = {
        institute_uuid: instituteUUID,
        full_name: fullName,
        email: publicForm.email.trim() || null,
        primary_phone: phone,
        address: publicForm.location.trim() || null,
        prev_school: publicForm.school.trim() || null,
        parent_name: publicForm.parent.trim() || null,
        class_uuid: publicForm.class_uuid,
        source_name: "Website",
        notes:
          [
            publicForm.occupation.trim()
              ? `Parent occupation: ${publicForm.occupation.trim()}`
              : "",
            publicForm.notes.trim() ? publicForm.notes.trim() : "",
          ]
            .filter(Boolean)
            .join("\n") || null,
      };

      // createAdmission stamps the currently active sessionYear onto this
      // payload itself (see api/admissions.js), so a public inquiry always
      // lands in whichever session is selected right now.
      const response = await createAdmission(payload);

      toast.success(
        response?.data?.message || "Admission enquiry submitted successfully"
      );

      setFormOpen(false);
      setPublicForm({
        name: "",
        email: "",
        phone: "",
        location: "",
        school: "",
        parent: "",
        occupation: "",
        class_uuid: "",
        notes: "",
        consent: false,
      });

      await loadData();
    } catch (err) {
      console.error("Public admission error:", err);
      toast.error(getApiErrorMessage(err, "Failed to submit admission form"));
    }
  };

  // ============================================================
  // Admissions Excel Import
  // Sends the original Excel file directly to the backend:
  // POST /admissions/import
  // importAdmissions() stamps session_year from the active session too.
  // ============================================================
  const handleAdmissionsImport = async (file) => {
    try {
      if (!file) {
        toast.error("Please select an Excel file");
        return;
      }

      if (!instituteUUID) {
        toast.error("Institute context missing. Please re-login and try again.");
        return;
      }

      const response = await importAdmissions(file);

      const result = response?.data || {};
      const imported = Number(result.imported || 0);
      const skipped = Array.isArray(result.skipped) ? result.skipped : [];

      if (imported > 0) {
        toast.success(`${imported} admissions imported successfully`);
      } else {
        toast.info("No admissions were imported");
      }

      if (skipped.length > 0) {
        console.warn("Skipped rows:", skipped);
        toast.warning(`${skipped.length} rows skipped`);
      }

      await loadData();
    } catch (err) {
      console.error("Admission Excel import failed:", err);

      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        toast.error(detail.map((item) => item?.msg || "Validation error").join(", "));
      } else {
        toast.error(
          detail || err?.response?.data?.message || err?.message || "Failed to import admissions"
        );
      }
    }
  };

  const loadMpsReport = async (reportType = mpsReportType) => {
    try {
      setMpsReportLoading(true);
      const response = await getMpsetReport(reportType);
      setMpsReportRows(
        Array.isArray(response?.data?.data) ? response.data.data : []
      );
      setMpsLoadedReportType(reportType);
    } catch (err) {
      setMpsReportRows([]);
      toast.error(getApiErrorMessage(err, "Failed to load MPSAT report"));
    } finally {
      setMpsReportLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "mpsat") {
      loadMpsReport(mpsReportType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sessionYear]);

  const handleMpsRegistrationImport = async (file) => {
    try {
      const response = await importMpsRegistrations(file);
      toast.success(
        response?.data?.message || "MPSAT registrations imported successfully"
      );
      await loadMpsReport();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to import MPSAT registrations"));
    }
  };

  const handleMpsResultImport = async (file) => {
    try {
      const response = await importMpsetResults(file);
      toast.success(
        response?.data?.message || "MPSAT results imported successfully"
      );
      await loadMpsReport();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to import MPSAT results"));
    }
  };

  const handleCreateQualifiedAdmissions = async () => {
    try {
      setMpsCreatingAdmissions(true);
      const response = await createQualifiedMpsAdmissions();
      toast.success(
        response?.data?.message || "Qualified admissions created successfully"
      );
      await Promise.all([loadData(), loadMpsReport()]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create qualified admissions"));
    } finally {
      setMpsCreatingAdmissions(false);
    }
  };

  const mpsReportStats = useMemo(() => {
    const percentages = mpsReportRows
      .map((row) => Number(row.percentage))
      .filter((value) => Number.isFinite(value));

    return {
      total: mpsReportRows.length,
      average: percentages.length
        ? (percentages.reduce((sum, value) => sum + value, 0) / percentages.length).toFixed(2)
        : "0.00",
      highest: percentages.length ? Math.max(...percentages).toFixed(2) : "0.00",
    };
  }, [mpsReportRows]);

  const mpsReportColumns = useMemo(() => {
    const columns = [
      { header: "Admission No", accessor: (row) => row.admission_no },
      { header: "Student Name", accessor: (row) => row.student_name },
      { header: "Percentage", accessor: (row) => row.percentage },
    ];

    if (mpsLoadedReportType === "website") {
      return [
        ...columns,
        { header: "Score", accessor: (row) => row.score },
        { header: "Total Marks", accessor: (row) => row.total_marks },
        { header: "Passed", accessor: (row) => (row.is_passed ? "Yes" : "No") },
      ];
    }

    columns.push(
      { header: "Phone", accessor: (row) => row.contact_details?.phone || "" },
      { header: "Email", accessor: (row) => row.contact_details?.email || "" },
      { header: "Address", accessor: (row) => row.contact_details?.address || "" }
    );

    if (mpsLoadedReportType === "internal") {
      columns.push(
        { header: "Shift 1 Total", accessor: (row) => row.marks?.shift1_total },
        { header: "Shift 2 Total", accessor: (row) => row.marks?.shift2_total },
        { header: "Obtained Marks", accessor: (row) => row.marks?.obtained_marks },
        { header: "Maximum Marks", accessor: (row) => row.marks?.maximum_marks },
        { header: "Status", accessor: (row) => row.qualification_status }
      );
    }

    return columns;
  }, [mpsLoadedReportType]);

  const mpsScoreDistribution = useMemo(() => {
    const ranges = [
      { range: "80-84%", min: 80, max: 85, students: 0 },
      { range: "85-89%", min: 85, max: 90, students: 0 },
      { range: "90-94%", min: 90, max: 95, students: 0 },
      { range: "95-100%", min: 95, max: Infinity, students: 0 },
    ];

    mpsReportRows.forEach((row) => {
      const percentage = Number(row.percentage);
      const bucket = ranges.find(
        ({ min, max }) => Number.isFinite(percentage) && percentage >= min && percentage < max
      );
      if (bucket) bucket.students += 1;
    });

    return ranges.map(({ range, students }) => ({ range, students }));
  }, [mpsReportRows]);

  const downloadMpsReportPdf = () => {
    if (!mpsReportRows.length) {
      toast.error("No MPSAT report data available to download");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const title = `MPSAT ${mpsLoadedReportType} Report`;
    doc.setFontSize(17);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(
      `Session: ${sessionYear}  |  Qualified: ${mpsReportStats.total}  |  Average: ${mpsReportStats.average}%  |  Highest: ${mpsReportStats.highest}%`,
      14,
      23
    );

    // Draw the same score-distribution graph in the downloaded PDF.
    const chartX = 14;
    const chartY = 31;
    const chartWidth = 269;
    const chartHeight = 43;
    const plotBottom = chartY + chartHeight - 9;
    const maxStudents = Math.max(
      1,
      ...mpsScoreDistribution.map((item) => item.students)
    );

    doc.setTextColor(35);
    doc.setFontSize(11);
    doc.text("Score Distribution", chartX, chartY);
    doc.setDrawColor(220);
    doc.line(chartX, plotBottom, chartX + chartWidth, plotBottom);

    const slotWidth = chartWidth / mpsScoreDistribution.length;
    mpsScoreDistribution.forEach((item, index) => {
      const barWidth = 25;
      const availableHeight = chartHeight - 17;
      const barHeight = (item.students / maxStudents) * availableHeight;
      const barX = chartX + index * slotWidth + (slotWidth - barWidth) / 2;
      const barY = plotBottom - barHeight;

      doc.setFillColor(37, 99, 235);
      if (barHeight > 0) doc.roundedRect(barX, barY, barWidth, barHeight, 1.5, 1.5, "F");
      doc.setFontSize(8);
      doc.setTextColor(45);
      doc.text(String(item.students), barX + barWidth / 2, barY - 2, { align: "center" });
      doc.setTextColor(90);
      doc.text(item.range, barX + barWidth / 2, plotBottom + 5, { align: "center" });
    });

    autoTable(doc, {
      startY: 82,
      head: [mpsReportColumns.map((column) => column.header)],
      body: mpsReportRows.map((row) =>
        mpsReportColumns.map((column) => {
          const value = column.accessor(row);
          return value == null || value === "" ? "-" : String(value);
        })
      ),
      styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
      didDrawPage: ({ pageNumber }) => {
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Page ${pageNumber}`, 278, 202, { align: "right" });
      },
    });

    doc.save(`mpsat-${mpsLoadedReportType}-${sessionYear}.pdf`);
    toast.success("MPSAT PDF downloaded");
  };

  // ---- analytics ----
  // Calculated from ACTIVE admissions within the active session only.
const activeAdmissions = useMemo(
  () =>
    allAdmissions.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "ACTIVE" &&
        String(a.session_year || "").trim() ===
          String(sessionYear || "").trim()
    ),
  [allAdmissions, sessionYear]
);

  const activeStageCounts = useMemo(() => {
    const counts = {};

    activeAdmissions.forEach((admission) => {
      const stageName =
        admission.stage_name ||
        stages.find((s) => String(s.id) === String(admission.stage_id))?.stage_name;

      if (!stageName) return;

      counts[stageName] = (counts[stageName] || 0) + 1;
    });

    return counts;
  }, [activeAdmissions, stages]);

  const counts = useMemo(
    () =>
      pipelineData.map((stage) => ({
        stage: stage.stage_name,
        n: activeStageCounts[stage.stage_name] || 0,
      })),
    [pipelineData, activeStageCounts]
  );

  const total = activeAdmissions.length;

  const enrolledStageId = stages.find((s) => s.stage_name === "Enrolled")?.id;

  const enrolled = activeAdmissions.filter(
    (a) => a.stage_name === "Enrolled" || a.stage_id === enrolledStageId
  ).length;

  const convRate = total ? Number(((enrolled / total) * 100).toFixed(2)) : 0;

  const bySource = useMemo(() => {
    const sourceMap = {};

    activeAdmissions.forEach((admission) => {
      const source = admission.source_name || "Unknown";
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    return Object.entries(sourceMap).map(([source, count]) => ({ source, count }));
  }, [activeAdmissions]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Admin · Academic · Session ${sessionYear}`}
        title="Admissions Pipeline"
        description="Drag prospects across stages. Click any card to open the full counseling, document, payment and communication record."
        actions={
          <>
            {/* Session Year switcher — every fetch on this page (pipeline,
                admissions, stages, sources, counselors, analytics) is keyed
                off this value via useSessionStore, so changing it here
                reloads the whole page for that session. */}
            <Select
              value={sessionYear}
              onValueChange={(value) => setSessionYear(value)}
            >
              <SelectTrigger className="h-9 w-32">
                <CalendarClock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {sessionYearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExcelExport
              rows={allAdmissions}
              fileName={`admissions-${sessionYear}.xlsx`}
              columns={[
                { header: "ID", accessor: (r) => r.id },
                { header: "Name", accessor: (r) => r.full_name },
                { header: "Class", accessor: (r) => r.class_name },
                { header: "Phone", accessor: (r) => r.primary_phone },
                { header: "Email", accessor: (r) => r.email },
                { header: "Source", accessor: (r) => r.source_name },
                { header: "Stage", accessor: (r) => r.stage_name },
                { header: "Counselor", accessor: (r) => r.counselor_name ?? "" },
                {
                  header: "Join Date",
                  accessor: (r) =>
                    r.join_date ? new Date(r.join_date).toLocaleDateString() : "",
                },
              ]}
            />
            <ExcelUpload
              label="Bulk Upload"
              templateName="admissions-template.xlsx"
              templateHeaders={[
                "Name",
                "Class",
                "Parent",
                "Phone",
                "Email",
                "Source",
                "Counselor",
                "Session Year",
              ]}
              onFile={handleAdmissionsImport}
            />
            <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
              <FileText className="h-4 w-4" />
              Public Form
            </Button>
            <NewInquiryDialog
              trigger={
                <Button size="sm" className="gradient-primary border-0">
                  <Plus className="h-4 w-4" />
                  New Inquiry
                </Button>
              }
              onCreate={async () => {
                await loadData();
              }}
            />
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="test">Admission Test</TabsTrigger>
          <TabsTrigger value="mpsat">MPSAT Reports</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedTotal})</TabsTrigger>
          <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
        </TabsList>

        {/* ---------------- PIPELINE ---------------- */}
        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={searchBoxRef}>
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSuggestOpen(true);
                  setSuggestIndex(-1);
                }}
                onFocus={() => setSuggestOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search name / phone…"
                className="pl-8 h-9 w-64"
                autoComplete="off"
              />
              {suggestOpen && nameSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-md border bg-popover shadow-lg overflow-hidden py-1">
                  {nameSuggestions.map((name, idx) => (
                    <button
                      type="button"
                      key={name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        chooseSuggestion(name);
                      }}
                      onMouseEnter={() => setSuggestIndex(idx)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                        idx === suggestIndex ? "bg-muted" : "hover:bg-muted/60"
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground/90">
                        {highlightMatch(name)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Select value={src} onValueChange={setSrc}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={counselor} onValueChange={setCounselor}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Counselor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All counselors</SelectItem>
                {counselors.map((c) => (
                  <SelectItem key={c.id} value={c.counselor_name}>
                    {c.counselor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
                <span className="text-xs font-medium">{selected.size} selected</span>
                <Select onValueChange={(v) => bulkMove(v)}>
                  <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue placeholder="Move to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.stage_name}>
                        {s.stage_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    toast.success(`Bulk SMS to ${selected.size}`);
                    setSelected(new Set());
                  }}
                >
                  <Send className="h-3 w-3" />
                  SMS
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive"
                  onClick={() => {
                    selected.forEach((id) => {
                      const student = allAdmissions.find((a) => a.id === id);
                      if (student) setRejectFor(student);
                    });
                    setSelected(new Set());
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {pipelineData.map((stage) => (
              <Card
                key={stage.stage_name}
                role="button"
                tabIndex={0}
                onClick={() => openStage(stage.stage_name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openStage(stage.stage_name);
                }}
                title={`Open ${stage.stage_name} table`}
                className={`cursor-pointer transition hover:shadow-sm ${
                  stage.stage_name === "Rejected"
                    ? "border-destructive/40 bg-destructive/5 hover:border-destructive"
                    : "border-border/60 hover:border-primary/50"
                }`}
              >
                <CardContent className="p-3">
                  <div
                    className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                      stage.stage_name === "Rejected" ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {stage.stage_name === "Rejected" && <XCircle className="h-3 w-3" />}
                    {stage.stage_name}
                  </div>

                  <div
                    className={`text-2xl font-display font-semibold mt-1 ${
                      stage.stage_name === "Rejected" ? "text-destructive" : ""
                    }`}
                  >
                    {pipelineStageCounts[stage.stage_name] || 0}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pipelineData.map((stage) => {
              const items =
                stage.stage_name === "Rejected"
                  ? rejectedList
                  : cards.filter((c) => c.stage_name === stage.stage_name);
              return (
                <Card key={stage.stage_name} className="border-border/60 bg-muted/20">
                  <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                      {stage.stage_name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {items.length}
                    </Badge>
                  </CardHeader>
                  <CardContent
                    className="space-y-2 max-h-[560px] overflow-y-auto p-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (stage.stage_name === "Rejected") {
                        setRejectFor(dragItem);
                        setRejectReason("");
                        return;
                      }
                      onDrop(stage.stage_name);
                    }}
                  >
                    {items.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">
                        Drop here
                      </div>
                    )}
                    {items.map((c) => {
                      const stageIdx = stages.findIndex((s) => s.stage_name === stage.stage_name);
                      const rawNext = stages[stageIdx + 1]?.stage_name;
                      const next = TERMINAL_STAGES.includes(stage.stage_name)
                        ? undefined
                        : rawNext === "Rejected"
                        ? undefined
                        : rawNext;
                      return (
                        <div
                          key={c.id}
                          draggable={stage.stage_name !== "Rejected"}
                          onDragStart={() => setDragItem(c)}
                          className={`bg-card border border-l-4 ${stageColor[stage.stage_name]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${
                            selected.has(c.id) ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={(e) => {
                            if (e.target.closest("[data-stop]")) return;
                            navigate(`/admin/admissions/${c.admission_uuid}`);
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            {stage.stage_name !== "Rejected" && (
                              <div data-stop onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selected.has(c.id)}
                                  onCheckedChange={() => toggleSel(c.id)}
                                />
                              </div>
                            )}
                            <Avatar className="h-8 w-8 shrink-0">
                              {c.passport_photo_file ? (
                                <AvatarImage
                                  src={c.passport_photo_file}
                                  alt={c.full_name}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {c.full_name?.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{c.full_name}</div>
                              <div className="text-[10px] text-muted-foreground">
                                Class {c.class_name} · {c.source_name}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                            {stage.stage_name === "Rejected" && (
                              <>
                                <div
                                  data-stop
                                  className="text-xs text-destructive cursor-pointer hover:underline truncate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewReasonFor(c);
                                  }}
                                  title="Click to view full rejection reason"
                                >
                                  Reason : {c.rejection_reason || "-"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Rejected :{" "}
                                  {c.rejected_at ? new Date(c.rejected_at).toLocaleDateString() : "-"}
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3" />
                              {c.primary_phone}
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </div>
                            {c.counselor_name && (
                              <div className="text-[10px]">👤 {c.counselor_name}</div>
                            )}
                            {stage.stage_name === "Admission Test" && (
                              <div
                                className={`flex items-center gap-1 text-[10px] ${
                                  parentConfirmationStatus(c).submitted ? "text-success" : "text-warning"
                                }`}
                              >
                                {parentConfirmationStatus(c).submitted ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <Clock3 className="h-3 w-3" />
                                )}
                                <span>{parentConfirmationStatus(c).label}</span>
                                {c.parent_submitted_at && (
                                  <span className="text-muted-foreground">
                                    · {new Date(c.parent_submitted_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between mt-2.5 pt-2 border-t gap-1"
                            data-stop
                            onClick={(e) => e.stopPropagation()}
                          >
                            {stage.stage_name === "Rejected" && (
                              <Button size="sm" variant="outline" onClick={() => reinstate(c)}>
                                <RotateCcw className="h-3 w-3" />
                                Reinstate
                              </Button>
                            )}
                            <span
                              className="text-[10px] text-muted-foreground"
                              title="Date when this admission entered the current stage"
                            >
                              {new Date(c.stage_updated_at || c.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {stage.stage_name !== "Rejected" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[10px] text-destructive"
                                  onClick={() => {
                                    setRejectFor(c);
                                    setRejectReason("");
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              )}
                              {stage.stage_name !== "Rejected" && next && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={async () => {
                                    try {
                                      await moveToStage(c.admission_uuid, next);
                                      loadData();
                                    } catch (err) {
                                      toast.error(getApiErrorMessage(err, "Failed to move stage"));
                                    }
                                  }}
                                >
                                  {next.split(" ")[0]}
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ---------------- FORMS ---------------- */}
        <TabsContent value="forms" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Admission Forms Received
              </CardTitle>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {stageNames.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAdmissions
                    .filter(
                      (i) =>
                        String(i.status || "").toUpperCase() === "ACTIVE" &&
                        Number(i.stage_id) !== 8 &&
                        (stageFilter === "all" || i.stage_name === stageFilter)
                    )
                    .sort(byNameAsc)
                    .map((i) => (
                      <TableRow key={i.id} className="cursor-pointer" onClick={() => setViewForm(i)}>
                        <TableCell className="font-mono text-xs">{i.id}</TableCell>
                        <TableCell className="font-medium">{i.full_name}</TableCell>
                        <TableCell>{i.class_name}</TableCell>
                        <TableCell className="text-xs">{i.primary_phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {i.stage_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {i.parent_submitted ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                <Badge variant="outline" className="border-success/40 text-success">
                                  consent Submitted
                                </Badge>
                              </>
                            ) : (
                              <>
                                <Clock3 className="h-3.5 w-3.5 text-warning" />
                                <Badge variant="outline" className="border-warning/40 text-warning">
                                  consent Pending
                                </Badge>
                              </>
                            )}
                          </div>
                          {i.parent_submitted_at && (
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {formatStageDate(i.parent_submitted_at)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{i.source_name}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {i.join_date ? new Date(i.join_date).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" onClick={() => setViewForm(i)}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              setRejectFor(i);
                              setRejectReason("");
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- REJECTED ---------------- */}
        <TabsContent value="rejected" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                Rejected Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Rejected On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        No rejected inquiries.
                      </TableCell>
                    </TableRow>
                  )}
                  {rejectedList.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.id}</TableCell>
                      <TableCell className="font-medium">
                        {i.full_name}
                        <div className="text-[10px] text-muted-foreground">{i.primary_phone}</div>
                      </TableCell>
                      <TableCell>{i.class_name}</TableCell>
                      <TableCell
                        className="text-xs max-w-md cursor-pointer hover:underline"
                        onClick={() => setViewReasonFor(i)}
                        title="Click to view full rejection reason"
                      >
                        <span className="line-clamp-2">{i.rejection_reason || "—"}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {i.rejected_at ? new Date(i.rejected_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => reinstate(i)}>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reinstate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- MPSAT REPORTS ---------------- */}
        <TabsContent value="mpsat" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">MPSAT Management</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Import registrations and results, create qualified admissions, and view 80%+ reports.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ExcelUpload
                    label="Registrations"
                    onFile={handleMpsRegistrationImport}
                  />
                  <ExcelUpload
                    label="MPSAT Results"
                    onFile={handleMpsResultImport}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateQualifiedAdmissions}
                    disabled={mpsCreatingAdmissions}
                  >
                    {mpsCreatingAdmissions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Create Qualified Admissions
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">MPSAT Report &mdash; 80% and above</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={mpsReportType} onValueChange={setMpsReportType}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue placeholder="Report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => loadMpsReport(mpsReportType)}
                    disabled={mpsReportLoading}
                  >
                    {mpsReportLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    View Report
                  </Button>
                  <ExcelExport
                    rows={mpsReportRows}
                    columns={mpsReportColumns}
                    fileName={`mpsat-${mpsLoadedReportType}-${sessionYear}.xlsx`}
                    label="Download Report"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Refresh report"
                    onClick={() => loadMpsReport(mpsLoadedReportType)}
                    disabled={mpsReportLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-background p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Qualified Students
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{mpsReportStats.total}</div>
                  <div className="text-xs text-muted-foreground">80% and above</div>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-info/10 to-background p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Average Percentage
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{mpsReportStats.average}%</div>
                  <div className="text-xs text-muted-foreground">Current report</div>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-success/10 to-background p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Highest Percentage
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{mpsReportStats.highest}%</div>
                  <div className="text-xs text-muted-foreground">Session {sessionYear}</div>
                </div>
              </div>
            </CardContent>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Percentage</TableHead>
                    {mpsLoadedReportType === "website" && (
                      <>
                        <TableHead>Score</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Passed</TableHead>
                      </>
                    )}
                    {mpsLoadedReportType !== "website" && (
                      <>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                      </>
                    )}
                    {mpsLoadedReportType === "internal" && (
                      <>
                        <TableHead>Shift 1</TableHead>
                        <TableHead>Shift 2</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mpsReportLoading && (
                    <TableRow>
                      <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!mpsReportLoading && mpsReportRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                        No students with 80% or above for session {sessionYear}.
                      </TableCell>
                    </TableRow>
                  )}
                  {!mpsReportLoading && mpsReportRows.map((row) => (
                    <TableRow key={`${row.admission_no}-${row.student_name}`}>
                      <TableCell className="font-mono text-xs">{row.admission_no}</TableCell>
                      <TableCell className="font-medium">{row.student_name}</TableCell>
                      <TableCell>{row.percentage ?? "-"}%</TableCell>
                      {mpsLoadedReportType === "website" && (
                        <>
                          <TableCell>{row.score ?? "-"}</TableCell>
                          <TableCell>{row.total_marks ?? "-"}</TableCell>
                          <TableCell>
                            <Badge variant={row.is_passed ? "default" : "secondary"}>
                              {row.is_passed ? "Passed" : "Not Passed"}
                            </Badge>
                          </TableCell>
                        </>
                      )}
                      {mpsLoadedReportType !== "website" && (
                        <>
                          <TableCell>{row.contact_details?.phone || "-"}</TableCell>
                          <TableCell>{row.contact_details?.email || "-"}</TableCell>
                          <TableCell className="max-w-xs whitespace-normal">
                            {row.contact_details?.address || "-"}
                          </TableCell>
                        </>
                      )}
                      {mpsLoadedReportType === "internal" && (
                        <>
                          <TableCell>{row.marks?.shift1_total ?? "-"}</TableCell>
                          <TableCell>{row.marks?.shift2_total ?? "-"}</TableCell>
                          <TableCell>
                            {row.marks?.obtained_marks ?? "-"} / {row.marks?.maximum_marks ?? "-"}
                          </TableCell>
                          <TableCell>{row.qualification_status || "-"}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- ADMISSION TEST ---------------- */}
        <TabsContent value="test" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Admission Test Results
              </CardTitle>
              <Select value={testFilter} onValueChange={setTestFilter}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All scores</SelectItem>
                  <SelectItem value="85">85 – 100% (Excellent)</SelectItem>
                  <SelectItem value="70">70 – 85% (Good)</SelectItem>
                  <SelectItem value="50">50 – 70% (Average)</SelectItem>
                  <SelectItem value="0">Below 50% (Weak)</SelectItem>
                  <SelectItem value="pending">Not attempted</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAdmissions
                    .filter((i) => {
                      if (String(i.status || "").toUpperCase() !== "ACTIVE") return false;
                      const s = i.test_score;
                      if (testFilter === "all") return true;
                      if (testFilter === "pending") return s == null;
                      if (s == null) return false;
                      const min = Number(testFilter);
                      const max = min === 85 ? 100 : min === 70 ? 85 : min === 50 ? 70 : 50;
                      return s >= min && s < max + (min === 85 ? 1 : 0);
                    })
                    .sort(byNameAsc)
                    .map((i) => {
                      const s = i.test_score;
                      const grade =
                        s == null ? "—" : s >= 85 ? "A+" : s >= 70 ? "A" : s >= 50 ? "B" : "C";
                      const tone =
                        s == null ? "outline" : s >= 70 ? "default" : s >= 50 ? "secondary" : "destructive";
                      return (
                        <TableRow key={i.id}>
                          <TableCell className="font-mono text-xs">{i.id}</TableCell>
                          <TableCell className="font-medium">{i.full_name}</TableCell>
                          <TableCell>{i.class_name}</TableCell>
                          <TableCell className="font-semibold">
                            {s ?? "—"}
                            {s != null && "%"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tone}>{grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">{i.stage_name}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- ANALYTICS ---------------- */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">
                  Total Inquiries — Session {sessionYear}
                </div>
                <div className="text-3xl font-display font-semibold mt-1">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Enrolled</div>
                <div className="text-3xl font-display font-semibold mt-1 text-success">
                  {enrolled}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Conversion Rate
                </div>
                <div className="text-3xl font-display font-semibold mt-1">{convRate}%</div>
              </CardContent>
            </Card>
          </div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Stage Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {counts.map((c) => (
                <div key={c.stage} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-muted-foreground">{c.stage}</div>
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${total ? (c.n / total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-medium">{c.n}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By Source</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {bySource.map((s) => (
                <div key={s.source} className="p-3 border rounded-md">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.source}
                  </div>
                  <div className="text-xl font-display font-semibold mt-1">{s.count}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Public Admission Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Public Admission Form</DialogTitle>
            <DialogDescription>
              Minimum details to register an enquiry for session {sessionYear}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Full Name *</Label>
              <Input
                value={publicForm.name}
                onChange={(e) => setPublicForm({ ...publicForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={publicForm.email}
                onChange={(e) => setPublicForm({ ...publicForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={publicForm.phone}
                onChange={(e) => setPublicForm({ ...publicForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={publicForm.location}
                onChange={(e) => setPublicForm({ ...publicForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label>Previous School</Label>
              <Input
                value={publicForm.school}
                onChange={(e) => setPublicForm({ ...publicForm, school: e.target.value })}
              />
            </div>
            <div>
              <Label>Parent Name</Label>
              <Input
                value={publicForm.parent}
                onChange={(e) => setPublicForm({ ...publicForm, parent: e.target.value })}
              />
            </div>
            <div>
              <Label>Parent Occupation</Label>
              <Input
                value={publicForm.occupation}
                onChange={(e) => setPublicForm({ ...publicForm, occupation: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Class Applying For</Label>
              <Select
                value={publicForm.class_uuid}
                onValueChange={(value) =>
                  setPublicForm((prev) => ({ ...prev, class_uuid: value }))
                }
              >
                <SelectTrigger disabled={classesLoading}>
                  <SelectValue
                    placeholder={classesLoading ? "Loading classes..." : "Select class"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="no-class" disabled>
                      No classes available
                    </SelectItem>
                  ) : (
                    classes.map((c) => (
                      <SelectItem key={c.class_uuid || c.id} value={String(c.class_uuid || c.id)}>
                        {c.class_name || c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={publicForm.notes}
                onChange={(e) => setPublicForm({ ...publicForm, notes: e.target.value })}
              />
            </div>
            <label className="col-span-2 flex items-start gap-2 text-xs">
              <Checkbox
                checked={publicForm.consent}
                onCheckedChange={(v) => setPublicForm({ ...publicForm, consent: !!v })}
              />
              <span>
                I consent to the school storing this information for admission processing.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!publicForm.consent || !publicForm.name || !publicForm.phone}
              onClick={submitPublicForm}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Form Details */}
      <Dialog open={!!viewForm} onOpenChange={(o) => !o && setViewForm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewForm?.full_name} — {viewForm?.id}
            </DialogTitle>
            <DialogDescription>Admission form details</DialogDescription>
          </DialogHeader>
          {viewForm && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs">Class</Label>
                <div>{viewForm.class_name}</div>
              </div>
              <div>
                <Label className="text-xs">Source</Label>
                <div>{viewForm.source_name}</div>
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <div>{viewForm.primary_phone}</div>
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <div>{viewForm.email}</div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Notes</Label>
                <div className="whitespace-pre-wrap">{viewForm.notes || "—"}</div>
              </div>
              <div>
                <Label className="text-xs">Stage</Label>
                <div>
                  <Badge>{viewForm.stage_name}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs">Stage Updated</Label>
                <div className="text-xs text-muted-foreground">
                  {formatStageDate(viewForm.stage_updated_at || viewForm.created_at)}
                </div>
              </div>
              <div>
                <Label className="text-xs">Join Date</Label>
                <div className="text-xs text-muted-foreground">
                  {formatStageDate(viewForm.join_date)}
                </div>
              </div>
              <div>
                <Label className="text-xs">Session</Label>
                <div className="text-xs text-muted-foreground">
                  {viewForm.session_year || sessionYear}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Parent Confirmation</Label>
                <div className="mt-1 flex items-center gap-2">
                  {viewForm.parent_submitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <Badge variant="outline" className="border-success/40 text-success">
                        Parent Submitted
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Clock3 className="h-4 w-4 text-warning" />
                      <Badge variant="outline" className="border-warning/40 text-warning">
                        Parent Pending
                      </Badge>
                    </>
                  )}
                </div>
                {viewForm.parent_email_sent_at && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Email sent: {formatStageDate(viewForm.parent_email_sent_at)}
                  </div>
                )}
                {viewForm.parent_submitted_at && (
                  <div className="text-xs text-muted-foreground">
                    Submitted: {formatStageDate(viewForm.parent_submitted_at)}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">Counselor</Label>
                <div>{viewForm.counselor_name || "—"}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (viewForm) {
                  navigate(`/admin/admissions/${viewForm.admission_uuid}`);
                  setViewForm(null);
                }
              }}
            >
              Open full record
            </Button>
            <Button onClick={() => setViewForm(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject inquiry dialog */}
      <Dialog
        open={!!rejectFor}
        onOpenChange={(o) => {
          if (!o) {
            setRejectFor(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
            <DialogDescription>
              {rejectFor?.full_name} · {rejectFor?.id} — this inquiry will move to the Rejected list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Reason *</Label>
            <Textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Seats full for the requested class, documents incomplete, applicant withdrew, etc."
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectFor(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              <XCircle className="h-4 w-4" />
              Reject Inquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View rejection reason (read-only) — opened from Kanban card / Rejected table */}
      <Dialog open={!!viewReasonFor} onOpenChange={(o) => !o && setViewReasonFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
            <DialogDescription>
              {viewReasonFor?.full_name} · {viewReasonFor?.id}
              {viewReasonFor?.rejected_at &&
                ` — rejected ${new Date(viewReasonFor.rejected_at).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
            {viewReasonFor?.rejection_reason || "No reason recorded."}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReasonFor(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
