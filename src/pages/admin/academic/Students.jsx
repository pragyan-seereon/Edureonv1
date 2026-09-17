

import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  GraduationCap,
  AlertCircle,
  Pencil,
  Trash2,
  Eye,
  Send,
  RotateCcw,
} from "lucide-react";

import { KpiCard } from "../../../components/kpi-card";

import {
  getAllStudents,
  deleteStudent,
  archiveStudent,
  restoreStudent,
  getStudentDashboard,
  importStudentsExcel,
} from "../../../api/students";

import { StudentDialog } from "../../../components/student-dialog";
import { toast } from "sonner";
import useSessionStore from "../../../store/sessionStore";   
/* =========================================================
   Student Status Colors
========================================================= */

const statusColor = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  INACTIVE: "bg-warning/15 text-warning border-warning/30",
  PASSED_OUT: "bg-muted text-muted-foreground border-border",
  TRANSFERRED: "bg-muted text-muted-foreground border-border",
  LEFT: "bg-destructive/10 text-destructive border-destructive/20",
};

/* =========================================================
   Archived Statuses
========================================================= */

const ARCHIVED_LIKE_STATUSES = [
  "INACTIVE",
  "PASSED_OUT",
  "TRANSFERRED",
  "LEFT",
];

/* =========================================================
   Archive Status Options
========================================================= */

const ARCHIVE_STATUS_OPTIONS = [
  {
    value: "PASSED_OUT",
    label: "Passed Out",
  },
  {
    value: "TRANSFERRED",
    label: "Transferred",
  },
  {
    value: "LEFT",
    label: "Left",
  },
];

/* =========================================================
   Search Suggestions
========================================================= */

const MAX_SUGGESTIONS = 8;

const STUDENT_IMPORT_HEADERS = [
  "Student Registration/Admission number", "Student Unigue Id", "RFID Card Number",
  "GPS Bus tracker ID", "Student Name", "Class", "Section", "Roll Number", "Stream",
  "Date of Birth", "Gender", "Blood Group", "Present Address", "Father's Name",
  "Father's Profession", "Father's DOB", "Father's Adhaar Number", "Mother's Name",
  "Mother's Profession", "Mother's DOB", "Mother's Adhaar Number", "Anniversary date",
  "Guardian Name", "Guardian's Profession", "Guardian DOB", "Primary Email ID",
  "Alternate Contact Email id", "Parents Contact Number", "Alternate contact number",
  "Parmanent Address", "Admission date", "Count total number of subjects both (O+C)",
  "Count Compulsory subjects(C)", "Count Optional Subjects(O)",
  "Subject list comma separated list (C)", "Subject list comma separated list (O)",
  "Aadhar Card Number", "Religion", "Category", "Mode Of Conveyance", "Siblings",
  "Joining Date", "Guardian Mobile Number",
];

/* =========================================================
   Students Component
========================================================= */

export default function Students() {
  const navigate = useNavigate();
const { sessionYear } = useSessionStore();
  /* =======================================================
     Main State
  ======================================================= */

  const [students, setStudents] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [classFilter, setClassFilter] = useState(null);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [feeComponentFilter, setFeeComponentFilter] = useState("all");
  const [feePaymentFilter, setFeePaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /* =======================================================
     Import State
  ======================================================= */

  const [importing, setImporting] = useState(false);

  const importInputRef = useRef(null);

  /* =======================================================
     Pagination
  ======================================================= */

  const [page, setPage] = useState(1);

const PAGE = 12;

  const classOrder = (className) => {
    const normalized = String(className || "").trim().toUpperCase();
    const order = {
      NURSERY: -3,
      LKG: -2,
      UKG: -1,
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      VI: 6,
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };
    const grade = normalized.replace(/^CLASS\s+/, "").split(/\s|-/)[0];
    return order[grade] ?? Number.MAX_SAFE_INTEGER;
  };

  const compareClasses = (left, right) => {
    const orderDifference = classOrder(left) - classOrder(right);
    return orderDifference || String(left || "").localeCompare(String(right || ""));
  };

  /* =======================================================
     Search Suggestions
  ======================================================= */

  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchWrapperRef = useRef(null);

  /* =======================================================
     Archive Dialog
  ======================================================= */

  const [archiveOpen, setArchiveOpen] = useState(false);

  const [archiveTarget, setArchiveTarget] = useState(null);

  const [archiveStatus, setArchiveStatus] = useState("");

  const [archiveRemarks, setArchiveRemarks] = useState("");

  const [archiving, setArchiving] = useState(false);

  /* =======================================================
     Initial Load
  ======================================================= */

  /* =======================================================
     Load Students
  ======================================================= */

  const loadStudents = async () => {
  try {
    const res = await getAllStudents(sessionYear);

    const data = res?.data?.data;

    if (Array.isArray(data)) {
      setStudents(data);
    } else if (Array.isArray(res?.data)) {
      setStudents(res.data);
    } else {
      setStudents([]);
    }
  } catch (err) {
    console.error("Failed to load students:", err);
    toast.error("Failed to load students");
  }
};

const loadDashboard = async () => {
  try {
    const res = await getStudentDashboard(sessionYear);
    setDashboard(res?.data?.data ?? null);
  } catch (error) {
    console.error("Dashboard error:", error);
  }
};

  useEffect(() => {
    loadStudents();
    loadDashboard();
  }, [sessionYear]);

  /* =======================================================
     Click Outside Search Suggestions
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =======================================================
     Filter Students
  ======================================================= */

  const feeComponentsByStudent = useMemo(
    () => new Map(
      students.map((student) => [
        student.student_uuid,
        Array.isArray(student.fee_components)
          ? student.fee_components
          : [],
      ])
    ),
    [students]
  );

  const feeComponents = useMemo(() => {
    const uniqueComponents = new Map();

    students.forEach((student) => {
      (student?.fee_components ?? []).forEach((component) => {
        if (component?.component_uuid && component?.component_name) {
          uniqueComponents.set(component.component_uuid, component);
        }
      });
    });

    return [...uniqueComponents.values()].sort((a, b) =>
      String(a.component_name).localeCompare(String(b.component_name))
    );
  }, [students]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return students.filter((s) => {
      /* -----------------------------------------------
         Always hide draft students
      ------------------------------------------------ */

      if (s?.isDraft) {
        return false;
      }

      /* -----------------------------------------------
         Search
      ------------------------------------------------ */

      if (query) {
        const name = String(
          s?.full_name ?? ""
        ).toLowerCase();

        const admissionNo = String(
          s?.admission_no ?? ""
        ).toLowerCase();

        const email = String(
          s?.email ?? ""
        ).toLowerCase();

        if (
          !name.includes(query) &&
          !admissionNo.includes(query) &&
          !email.includes(query)
        ) {
          return false;
        }
      }

      /* -----------------------------------------------
         Class Filter
      ------------------------------------------------ */

      if (
        classFilter &&
        s?.class_name !== classFilter
      ) {
        return false;
      }

      if (
        sectionFilter !== "all" &&
        String(s?.section_name ?? s?.section ?? "") !== sectionFilter
      ) {
        return false;
      }

      const selectedFeeComponent = feeComponentsByStudent
        .get(s?.student_uuid)
        ?.find(
          (component) => component.component_uuid === feeComponentFilter
        );

      if (feeComponentFilter !== "all" && !selectedFeeComponent) {
        return false;
      }

      const feeStatus = String(
        selectedFeeComponent?.fee_status ?? s?.fee_status ?? ""
      ).toLowerCase();

      if (feePaymentFilter === "paid" && feeStatus !== "paid") {
        return false;
      }

      if (feePaymentFilter === "unpaid" && feeStatus === "paid") {
        return false;
      }

      if (
        statusFilter !== "all" &&
        String(s?.status ?? "").toLowerCase() !== statusFilter
      ) {
        return false;
      }

      /* -----------------------------------------------
         Defaulters
      ------------------------------------------------ */

      if (tab === "defaulters") {
        if (
          s?.fee_status === "Paid" &&
          s?.status !== "INACTIVE"
        ) {
          return false;
        }
      }

      /* -----------------------------------------------
         New Students
      ------------------------------------------------ */

      if (tab === "new") {
        const uuid = String(
          s?.student_uuid ?? ""
        );

        const number = parseInt(
          uuid.replace("STU", ""),
          10
        );

        if (!Number.isNaN(number)) {
          if (number < 1040) {
            return false;
          }
        }
      }

      return true;
    }).sort((left, right) => {
      const classDifference = compareClasses(left?.class_name, right?.class_name);
      if (classDifference) return classDifference;

      const sectionDifference = String(left?.section_name ?? left?.section ?? "").localeCompare(
        String(right?.section_name ?? right?.section ?? "")
      );
      if (sectionDifference) return sectionDifference;

      return String(left?.full_name ?? "").localeCompare(String(right?.full_name ?? ""));
    });
  }, [
    students,
    q,
    classFilter,
    sectionFilter,
    feeComponentFilter,
    feeComponentsByStudent,
    feePaymentFilter,
    statusFilter,
    tab,
  ]);

  /* =======================================================
     Search Suggestions
  ======================================================= */

  const nameSuggestions = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return students
      .filter((s) => {
        if (s?.isDraft) {
          return false;
        }

        const name = String(
          s?.full_name ?? ""
        ).toLowerCase();

        const admissionNo = String(
          s?.admission_no ?? ""
        ).toLowerCase();

        const email = String(
          s?.email ?? ""
        ).toLowerCase();

        return (
          name.includes(query) ||
          admissionNo.includes(query) ||
          email.includes(query)
        );
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [students, q]);

  /* =======================================================
     Pagination
  ======================================================= */

  const pageItems = filtered.slice(
    (page - 1) * PAGE,
    page * PAGE
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE)
  );

  /* =======================================================
     Class List
  ======================================================= */

  const classes = Array.from(
    new Set(
      students
        .map((s) => s?.class_name)
        .filter(Boolean)
    )
  ).sort(compareClasses);

  const sections = Array.from(
    new Set(
      students
        .filter(
          (s) => !classFilter || s?.class_name === classFilter
        )
        .map((s) => s?.section_name ?? s?.section)
        .filter(Boolean)
    )
  ).sort();

  const displayedFeeStatus = (student) => {
    if (feeComponentFilter !== "all") {
      const component = (student?.fee_components ?? []).find(
        (item) => item.component_uuid === feeComponentFilter
      );
      if (component?.fee_status) return component.fee_status;
    }
    return student?.fee_status;
  };

  /* =======================================================
     Select Search Suggestion
  ======================================================= */

  const selectSuggestion = (s) => {
    setQ(s?.full_name ?? "");

    setPage(1);

    setShowSuggestions(false);
  };

  /* =======================================================
     Archive Dialog
  ======================================================= */

  const openArchiveDialog = (s) => {
    setArchiveTarget(s);

    setArchiveStatus("");

    setArchiveRemarks("");

    setArchiveOpen(true);
  };

  /* =======================================================
     Confirm Archive
  ======================================================= */

  const handleArchiveConfirm = async () => {
    if (!archiveStatus) {
      toast.error("Please select a status");
      return;
    }

    if (!archiveTarget) {
      return;
    }

    setArchiving(true);

    try {
      await archiveStudent(
        archiveTarget.student_uuid,
        {
          status: archiveStatus,
          remarks: archiveRemarks,
        }
      );

      toast.success(
        `${archiveTarget.full_name} archived successfully`
      );

      setArchiveOpen(false);

      setArchiveTarget(null);

      await loadStudents();

      await loadDashboard();
    } catch (err) {
      console.error(
        "Archive error:",
        err
      );

      const detail =
        err?.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : detail?.message ||
              "Failed to archive student"
      );
    } finally {
      setArchiving(false);
    }
  };

  /* =======================================================
     Delete Student
  ======================================================= */

  const handleDelete = async (s) => {
    if (!s?.student_uuid) {
      return;
    }

    try {
      await deleteStudent(
        s.student_uuid
      );

      toast.success(
        `${s.full_name} moved to recycle bin`
      );

      await loadStudents();

      await loadDashboard();
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      toast.error(
        err?.response?.data?.detail ||
          "Failed to delete student"
      );
    }
  };

  /* =======================================================
     Restore Student
  ======================================================= */

  const restore = async (s) => {
    if (!s?.student_uuid) {
      return;
    }

    try {
      await restoreStudent(
        s.student_uuid
      );

      toast.success(
        `${s.full_name} restored successfully`
      );

      await loadStudents();

      await loadDashboard();
    } catch (err) {
      console.error(
        "Restore error:",
        err
      );

      toast.error(
        err?.response?.data?.detail ||
          "Failed to restore student"
      );
    }
  };
  /* =======================================================
     Export CSV
  ======================================================= */

  const exportCsv = () => {
    if (!filtered.length) {
      toast.error(
        "No students available to export"
      );

      return;
    }

    const headers = [
      "ID",
      "Name",
      "Admission No",
      "Class",
      "Section",
      "Roll",
      "Parent",
      "Phone",
      "Attendance",
      "Fee Status",
      "Status",
      "Email",
    ];

    const rows = filtered.map((s) => [
      s?.student_uuid ?? "",
      s?.full_name ?? "",
      s?.admission_no ?? "",
      s?.class_name ?? "",
      s?.section ?? "",
      s?.roll_no ?? "",
      s?.father_name ?? "",
      s?.primary_phone ?? "",
      s?.attendance_percentage ?? "",
      s?.fee_status ?? "",
      s?.status ?? "",
      s?.email ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const url =
      URL.createObjectURL(
        new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        })
      );

    const a =
      document.createElement("a");

    a.href = url;

    a.download = `students-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    toast.success(
      `${rows.length} students exported`
    );
  };

  /* =======================================================
     IMPORT STUDENTS EXCEL
  ======================================================= */

  const handleImportExcel = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    /* -----------------------------------------------
       Reset input
    ------------------------------------------------ */

    event.target.value = "";

    if (!file) {
      return;
    }

    /* -----------------------------------------------
       Validate Excel file
    ------------------------------------------------ */

    const allowedExtensions = [
      ".xlsx",
      ".xls",
    ];

    const fileName =
      file.name.toLowerCase();

    const isExcelFile =
      allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

    if (!isExcelFile) {
      toast.error(
        "Please select an Excel file (.xlsx or .xls)"
      );

      return;
    }

    try {
      setImporting(true);

      const response =
        await importStudentsExcel(file, sessionYear);

      const data = response?.data ?? response;

      if (data?.success) {
        const imported =
          data?.imported ?? 0;

        const skipped =
          data?.skipped ?? 0;

        toast.success(
          `${imported} students imported successfully.${
            skipped > 0
              ? ` ${skipped} rows skipped.`
              : ""
          }`
        );

        await Promise.all([
          loadStudents(),
          loadDashboard(),
        ]);

        if (
          skipped > 0 &&
          Array.isArray(data?.errors)
        ) {
          const firstError = data.errors[0];

          if (firstError?.reason) {
            toast.error(
              `Row ${firstError.row ?? "?"}: ${firstError.reason}`
            );
          }

          console.warn(
            "Skipped Excel rows:",
            data.errors
          );
        }
      } else {
        const firstError = Array.isArray(data?.errors)
          ? data.errors[0]
          : null;

        toast.error(
          firstError?.reason
            ? `Row ${firstError.row ?? "?"}: ${firstError.reason}`
            : data?.message || "Failed to import students."
        );
      }
    } catch (error) {
      console.error(
        "Student Excel import error:",
        error
      );

      const detail =
        error?.response?.data?.detail;

      if (typeof detail === "string") {
        toast.error(detail);
      } else if (detail?.message) {
        toast.error(detail.message);
      } else {
        toast.error(
          "Failed to import students."
        );
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadImportTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([STUDENT_IMPORT_HEADERS]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    worksheet["!cols"] = STUDENT_IMPORT_HEADERS.map((header) => ({
      wch: Math.min(Math.max(header.length + 2, 14), 45),
    }));

    XLSX.writeFile(workbook, "student-registration-import-template.xlsx");
  };

  /* =======================================================
     EXPORT STUDENTS TO EXCEL
  ======================================================= */

  const exportExcel = () => {
    if (!filtered.length) {
      toast.error(
        "No students available to export"
      );

      return;
    }

    const exportData = filtered.map(
      (s, index) => ({
        "Sr No": index + 1,

        "Student ID":
          s?.student_uuid ?? "",

        "Student Name":
          s?.full_name ?? "",

        "Admission No":
          s?.admission_no ?? "",

        Class:
          s?.class_name ?? "",

        Section:
          s?.section ?? "",

        "Roll No":
          s?.roll_no ?? "",

        "Father Name":
          s?.father_name ?? "",

        Phone:
          s?.primary_phone ?? "",

        Gender:
          s?.gender ?? "",

        "Attendance %":
          s?.attendance_percentage ?? "",

        "Fee Status":
          s?.fee_status ?? "",

        Status:
          s?.status ?? "",

        Email:
          s?.email ?? "",
      })
    );

    /* -----------------------------------------------
       Create worksheet
    ------------------------------------------------ */

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    /* -----------------------------------------------
       Create workbook
    ------------------------------------------------ */

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Students"
    );

    /* -----------------------------------------------
       Auto column width
    ------------------------------------------------ */

    const columnWidths =
      Object.keys(
        exportData[0]
      ).map((key) => {
        const maxLength =
          Math.max(
            key.length,
            ...exportData.map(
              (row) =>
                String(
                  row[key] ?? ""
                ).length
            )
          );

        return {
          wch: Math.min(
            maxLength + 2,
            35
          ),
        };
      });

    worksheet["!cols"] =
      columnWidths;

    /* -----------------------------------------------
       Download Excel
    ------------------------------------------------ */

    XLSX.writeFile(
      workbook,
      `students-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

    toast.success(
      `${exportData.length} students exported to Excel`
    );
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <PageContainer>
      {/* =================================================
          HEADER
      ================================================= */}

      <PageHeader
        title="Student Management"
        actions={
          <>
            {/* -----------------------------------------
                Hidden Excel Import Input
            ----------------------------------------- */}

            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={
                handleImportExcel
              }
            />

            {/* -----------------------------------------
                IMPORT EXCEL
            ----------------------------------------- */}

            <Button
              variant="outline"
              size="sm"
              disabled={importing}
              onClick={() =>
                importInputRef.current?.click()
              }
            >
              <Upload className="h-4 w-4" />

              {importing
                ? "Importing..."
                : "Import"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadImportTemplate}
            >
              <Download className="h-4 w-4" />
              Import Template
            </Button>

            {/* -----------------------------------------
                EXPORT EXCEL
            ----------------------------------------- */}

            <Button
              variant="outline"
              size="sm"
              onClick={exportExcel}
            >
              <Download className="h-4 w-4" />

              Export Excel
            </Button>

            {/* -----------------------------------------
                NEW ADMISSION
            ----------------------------------------- */}

            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />

              New Admission
            </Button>
          </>
        }
      />

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <KpiCard
          label="Total Students"
          value={
            dashboard?.total_students ?? 0
          }
          delta={
            dashboard?.total_students_growth ??
            0
          }
          icon={
            <GraduationCap className="h-5 w-5" />
          }
          tone="primary"
        />

        <KpiCard
          label="Fee Defaulters"
          value={
            dashboard?.fee_defaulters ?? 0
          }
          delta={
            dashboard?.fee_defaulters_growth ??
            0
          }
          icon={
            <AlertCircle className="h-5 w-5" />
          }
          tone="warning"
        />

      </div>

      {/* =================================================
          STUDENT TABLE CARD
      ================================================= */}

      <Card className="border-border/60">
        <CardContent className="p-0">
          {/* =================================================
              FILTER BAR
          ================================================= */}

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-4 border-b">
            {/* ---------------------------------------------
                TABS
            --------------------------------------------- */}

            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value);
                setPage(1);
              }}
            >
              <TabsList className="bg-muted/60">
                <TabsTrigger value="all">
                  All
                </TabsTrigger>

                <TabsTrigger value="new">
                  New
                </TabsTrigger>

                <TabsTrigger value="defaulters">
                  Defaulters
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-1 flex flex-wrap gap-2 lg:ml-auto">
              {/* -----------------------------------------
                  SEARCH
              ----------------------------------------- */}

              <div
                className="relative flex-1 lg:max-w-sm min-w-[200px]"
                ref={
                  searchWrapperRef
                }
              >
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={q}
                  onChange={(e) => {
                    setQ(
                      e.target.value
                    );

                    setPage(1);

                    setShowSuggestions(
                      true
                    );
                  }}
                  onFocus={() => {
                    if (q.trim()) {
                      setShowSuggestions(
                        true
                      );
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Escape"
                    ) {
                      setShowSuggestions(
                        false
                      );
                    }

                    if (
                      e.key === "Enter"
                    ) {
                      setShowSuggestions(
                        false
                      );
                    }
                  }}
                  placeholder="Search by name, admission no or email…"
                  className="pl-9 h-9"
                  autoComplete="off"
                />

                {/* ---------------------------------------
                    SEARCH SUGGESTIONS
                --------------------------------------- */}

                {showSuggestions &&
                  nameSuggestions.length >
                    0 && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-full rounded-md border bg-popover shadow-md max-h-64 overflow-y-auto">
                      {nameSuggestions.map(
                        (s) => (
                          <button
                            key={
                              s.student_uuid
                            }
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                            onMouseDown={(
                              e
                            ) =>
                              e.preventDefault()
                            }
                            onClick={() =>
                              selectSuggestion(
                                s
                              )
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {s.full_name}
                              </span>
                              <span className="ml-auto text-xs text-muted-foreground font-mono shrink-0">
                                {s.admission_no}
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground truncate">
                              Father: {s.father_name || "-"} · Class: {s.class_name || "-"} · Section: {s.section_name || s.section || "-"}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
              </div>

              {/* -----------------------------------------
                  CLASS FILTER
              ----------------------------------------- */}

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                >
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Filter className="h-4 w-4" />

                    Class
                    {classFilter
                      ? ` · ${classFilter}`
                      : ""}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      {
                        setClassFilter(null);
                        setSectionFilter("all");
                        setPage(1);
                      }
                    }
                  >
                    All classes
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {classes.map(
                    (c) => (
                      <DropdownMenuItem
                        key={c}
                        onClick={() =>
                          {
                            setClassFilter(c);
                            setSectionFilter("all");
                            setPage(1);
                          }
                        }
                      >
                        Class {c}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={sectionFilter}
                onValueChange={(value) => {
                  setSectionFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={feeComponentFilter}
                onValueChange={(value) => {
                  setFeeComponentFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[145px] text-xs">
                  <SelectValue placeholder="Fee Component" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fee components</SelectItem>
                  {feeComponents.map((component) => (
                    <SelectItem
                      key={component.component_uuid}
                      value={component.component_uuid}
                    >
                      {component.component_name}
                      {component.category
                        ? ` · ${String(component.category).replace(/_/g, " ")}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={feePaymentFilter}
                onValueChange={(value) => {
                  setFeePaymentFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[125px] text-xs">
                  <SelectValue placeholder="Fee Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fee statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[115px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead>
                    Admission No.
                  </TableHead>

                  <TableHead>
                    Student ID
                  </TableHead>

                  <TableHead>
                    Student Name
                  </TableHead>

                  <TableHead>
                    Class
                  </TableHead>

                  <TableHead>
                    Section
                  </TableHead>

                  <TableHead>
                    Roll No.
                  </TableHead>

                  <TableHead>
                    Parent Name
                  </TableHead>

                  <TableHead>
                    Fee Status
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead className="w-10">
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* -----------------------------------------
                    EMPTY
                ----------------------------------------- */}

                {pageItems.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-sm text-muted-foreground py-10"
                    >
                      No students match your
                      filters.
                    </TableCell>
                  </TableRow>
                )}

                {/* -----------------------------------------
                    STUDENT ROWS
                ----------------------------------------- */}

                {pageItems.map(
                  (s) => (
                    <TableRow
                      key={
                        s.student_uuid
                      }
                      className="hover:bg-muted/40 border-border/60 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/students/${s.student_uuid}`
                        )
                      }
                    >
                      {/* ---------------------------------
                          ADMISSION
                      --------------------------------- */}

                      <TableCell className="font-mono text-xs">
                        {
                          s.admission_no
                        }
                      </TableCell>

                      {/* ---------------------------------
                          STUDENT ID / NAME
                      --------------------------------- */}

                      <TableCell className="font-mono text-xs">
                        {s.student_no || s.student_uuid}
                      </TableCell>

                      <TableCell className="text-sm font-medium">
                        {s.full_name}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {s.class_name || "—"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {s.section_name || s.section || "—"}
                        </Badge>
                      </TableCell>

                      {/* ---------------------------------
                          ROLL
                      --------------------------------- */}

                      <TableCell className="text-sm">
                        {s.roll_no}
                      </TableCell>

                      {/* ---------------------------------
                          PARENT
                      --------------------------------- */}

                      <TableCell className="text-sm">
                        {
                          s.father_name
                        }
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            String(displayedFeeStatus(s) ?? "").toLowerCase() === "paid"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/15 text-warning border-warning/30"
                          }
                        >
                          {String(displayedFeeStatus(s) ?? "").toLowerCase() === "paid"
                            ? "PAID"
                            : "UNPAID"}
                        </Badge>
                      </TableCell>

                      {/* ---------------------------------
                          STATUS
                      --------------------------------- */}

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            statusColor[
                              s.status
                            ] ||
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {
                            s.status
                          }
                        </Badge>

                        {tab ===
                          "defaulters" &&
                          s.status ===
                            "INACTIVE" && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Inactive since{" "}
                              {s.deleted_at
                                ? new Date(
                                    s.deleted_at
                                  ).toLocaleDateString()
                                : "—"}
                            </div>
                          )}
                      </TableCell>

                      {/* ---------------------------------
                          ACTIONS
                      --------------------------------- */}

                      <TableCell
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {/* ---------------------------------
                                OPEN PROFILE
                            --------------------------------- */}

                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/students/${s.student_uuid}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />

                              Open profile
                            </DropdownMenuItem>

                            {/* ---------------------------------
                                EDIT
                            --------------------------------- */}

                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(
                                  s
                                );

                                setDialogOpen(
                                  true
                                );
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />

                              Edit
                            </DropdownMenuItem>

                            {/* ---------------------------------
                                REMINDER
                            --------------------------------- */}

                            <DropdownMenuItem
                              onClick={() =>
                                toast.success(
                                  "Reminder sent"
                                )
                              }
                            >
                              <Send className="h-4 w-4 mr-2" />

                              Send reminder
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* ---------------------------------
                                RESTORE / ARCHIVE
                            --------------------------------- */}

                            {ARCHIVED_LIKE_STATUSES.includes(
                              s.status
                            ) ? (
                              <DropdownMenuItem
                                onClick={async () => {
                                  await restore(
                                    s
                                  );
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />

                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <>
                                {/* -----------------------------
                                    ARCHIVE
                                ----------------------------- */}

                                <DropdownMenuItem
                                  onSelect={(
                                    e
                                  ) =>
                                    e.preventDefault()
                                  }
                                  onClick={() =>
                                    openArchiveDialog(
                                      s
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />

                                  Archive Student
                                </DropdownMenuItem>

                                {/* -----------------------------
                                    RECYCLE BIN
                                ----------------------------- */}

                                <DropdownMenuItem
                                  onClick={async () => {
                                    await handleDelete(
                                      s
                                    );
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />

                                  Move to Recycle Bin
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="flex items-center justify-between p-4 border-t text-xs text-muted-foreground">
            <span>
              Showing{" "}
              {pageItems.length
                ? (page - 1) * PAGE +
                  1
                : 0}
              –
              {(page - 1) * PAGE +
                pageItems.length}{" "}
              of {filtered.length}
            </span>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() =>
                  setPage((p) =>
                    Math.max(
                      1,
                      p - 1
                    )
                  )
                }
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          STUDENT DIALOG
      ===================================================== */}

      <StudentDialog
        open={dialogOpen}
        onOpenChange={
          setDialogOpen
        }
        student={editing}
      />

      {/* =====================================================
          ARCHIVE STUDENT DIALOG
      ===================================================== */}

      <Dialog
        open={archiveOpen}
        onOpenChange={(open) => {
          if (!archiving) {
            setArchiveOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Archive Student
            </DialogTitle>

            <DialogDescription>
              This will archive{" "}
              {archiveTarget?.full_name}{" "}
              (
              {
                archiveTarget?.admission_no
              }
              ). Choose a status and
              add remarks before
              confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* ---------------------------------------------
                ARCHIVE STATUS
            --------------------------------------------- */}

            <div className="space-y-2">
              <Label>
                Status
              </Label>

              <Select
                value={
                  archiveStatus
                }
                onValueChange={
                  setArchiveStatus
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>

                <SelectContent>
                  {ARCHIVE_STATUS_OPTIONS.map(
                    (opt) => (
                      <SelectItem
                        key={
                          opt.value
                        }
                        value={
                          opt.value
                        }
                      >
                        {
                          opt.label
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ---------------------------------------------
                REMARKS
            --------------------------------------------- */}

            <div className="space-y-2">
              <Label>
                Remarks
              </Label>

              <Textarea
                value={
                  archiveRemarks
                }
                onChange={(e) =>
                  setArchiveRemarks(
                    e.target.value
                  )
                }
                placeholder="e.g. Student completed Class XII"
                rows={4}
              />
            </div>
          </div>

          {/* ---------------------------------------------
              FOOTER
          --------------------------------------------- */}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setArchiveOpen(
                  false
                )
              }
              disabled={
                archiving
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleArchiveConfirm
              }
              disabled={
                archiving ||
                !archiveStatus
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiving
                ? "Archiving…"
                : "Archive Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
