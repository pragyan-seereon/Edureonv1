import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Download,
  FileBarChart2,
  FileText,
  RefreshCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";

// Change only these paths if your project uses different service files.
import {
  getStudentFeeReport,
  getMonthlyFeeManagementReport,
} from "../../../api/feeReports";
import { getPayments } from "../../../api/payment";

const ACADEMIC_YEAR = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Academic year starts in April.
  return month >= 4
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;
})();

const inr = (value) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const describeErrorDetail = (detail) => {
  if (!detail) return "";

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.msg || item?.message || JSON.stringify(item);
      })
      .join(", ");
  }

  if (typeof detail === "object") {
    return detail.message || detail.detail || detail.msg || "";
  }

  return String(detail);
};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  const responseData = error?.response?.data;

  const message =
    responseData?.message ||
    responseData?.detail ||
    error?.message;

  return describeErrorDetail(message) || fallback;
};

const FF = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">
      {label}
    </Label>
    {children}
  </div>
);

// function ReportsPanel({ students }) {
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState([]);
//   const [totals, setTotals] = useState([]);
//   const [components, setComponents] = useState([]);
//   const [error, setError] = useState("");

//   // =====================================================
//   // REPORT TYPES
//   // =====================================================

//   const REPORT_TYPES = [
//     {
//       value: "MASTER_FEES",
//       label: "Master Student Fees Report (Paid / Unpaid)",
//       description: "Paid vs unpaid breakdown across all students",
//     },

//     {
//       value: "DAILY_COLLECTION",
//       label: "Daily Collections Report",
//       description: "Payments collected on a specific day",
//     },

//     {
//       value: "DAILY_COLLECTION_HEAD",
//       label: "Daily Collection Head Report",
//       description:
//         "Collection head-wise payment mode collection for the selected day",
//     },

//     {
//       value: "FEE_PENDING",
//       label: "Fee Pending Report",
//       description: "Students with pending / overdue fees",
//     },

//     {
//       value: "STUDENT_FEE_NEW",
//       label: "Student Fee Report (New)",
//       description: "Detailed fee report with student-wise breakdown",
//     },

//     // =====================================================
//     // NEW MONTHLY MANAGEMENT REPORT
//     // =====================================================

//     {
//       value: "MONTHLY_FEE_MANAGEMENT",
//       label: "Fee Collection — Monthly Management Report",
//       description:
//         "Monthly fees due, collection, arrears, outstanding and overdue management report",
//     },

//     {
//       value: "RETRACTED_INVOICE",
//       label: "Retracted Invoice Report",
//       description: "Invoices that were retracted / cancelled",
//     },
//   ];

//   const [reportType, setReportType] = useState("STUDENT_FEE_NEW");

//   const activeReport = useMemo(
//     () =>
//       REPORT_TYPES.find((r) => r.value === reportType) ||
//       REPORT_TYPES[0],
//     [reportType]
//   );

//   // =====================================================
//   // FILTER STATES
//   // =====================================================

//   const [academicYear, setAcademicYear] = useState(
//     ACADEMIC_YEAR
//   );

//   const [studentUuid, setStudentUuid] = useState("");
//   const [studentQuery, setStudentQuery] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [collectionDate, setCollectionDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );

//   const [classUuid, setClassUuid] = useState("all");
//   const [sectionUuid, setSectionUuid] = useState("all");

//   const [paymentStatus, setPaymentStatus] =
//     useState("all");

//   const [showFilters, setShowFilters] = useState(true);

//   // =====================================================
//   // REPORT TYPE CHECK
//   // =====================================================

//   const isMonthlyManagementReport =
//     reportType === "MONTHLY_FEE_MANAGEMENT";

//   // =====================================================
//   // PER REPORT FILTER VISIBILITY
//   // =====================================================

//   const visibleFilters = useMemo(() => {
//     switch (reportType) {
//       case "MASTER_FEES":
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: true,
//         };

//       case "DAILY_COLLECTION":
//       case "DAILY_COLLECTION_HEAD":
//         return {
//           academicYear: false,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: true,
//           paymentStatus: false,
//         };

//       case "FEE_PENDING":
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: false,
//         };

//       // =====================================================
//       // MONTHLY MANAGEMENT
//       // =====================================================

//       case "MONTHLY_FEE_MANAGEMENT":
//         return {
//           academicYear: true,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: false,
//           collectionDate: false,
//           paymentStatus: false,
//         };

//       case "RETRACTED_INVOICE":
//         return {
//           academicYear: true,
//           student: false,
//           class: true,
//           section: true,
//           dateRange: true,
//           collectionDate: false,
//           paymentStatus: false,
//         };

//       case "STUDENT_FEE_NEW":
//       default:
//         return {
//           academicYear: true,
//           student: true,
//           class: true,
//           section: true,
//           dateRange: true,
//           collectionDate: false,
//           paymentStatus: true,
//         };
//     }
//   }, [reportType]);

//   // =====================================================
//   // STATUS OPTIONS
//   // =====================================================

//   const statusOptionsForReport = useMemo(() => {
//     if (reportType === "MASTER_FEES") {
//       return [
//         { value: "all", label: "All Status" },
//         { value: "PAID", label: "Paid" },
//         { value: "PENDING", label: "Unpaid" },
//       ];
//     }

//     return [
//       { value: "all", label: "All Status" },
//       { value: "PAID", label: "Paid" },
//       { value: "PARTIAL", label: "Partial" },
//       { value: "PENDING", label: "Pending" },
//       { value: "OVERDUE", label: "Overdue" },
//       { value: "ADVANCE", label: "Advance" },
//     ];
//   }, [reportType]);

//   // =====================================================
//   // REPORT TYPE CHANGE
//   // =====================================================

//   const handleReportTypeChange = (value) => {
//     setReportType(value);
//     setError("");
//     setReportData([]);
//     setTotals([]);
//     setComponents([]);

//     if (
//       value === "DAILY_COLLECTION" ||
//       value === "DAILY_COLLECTION_HEAD"
//     ) {
//       setFromDate("");
//       setToDate("");
//       setStudentUuid("");
//       setStudentQuery("");
//       setPaymentStatus("all");
//     }

//     if (value === "FEE_PENDING") {
//       setPaymentStatus("PENDING");
//     }

//     if (value === "MASTER_FEES") {
//       setFromDate("");
//       setToDate("");
//     }

//     if (value === "MONTHLY_FEE_MANAGEMENT") {
//       setStudentUuid("");
//       setStudentQuery("");
//       setFromDate("");
//       setToDate("");
//       setCollectionDate("");
//       setPaymentStatus("all");
//     }

//     if (value === "RETRACTED_INVOICE") {
//       setStudentUuid("");
//       setStudentQuery("");
//       setPaymentStatus("all");
//     }
//   };

//   // =====================================================
//   // ACADEMIC YEARS
//   // =====================================================

//   const academicYears = useMemo(() => {
//     const years = [];
//     const currentYear = new Date().getFullYear();

//     for (let i = 0; i < 5; i++) {
//       const year = currentYear - i;

//       years.push(
//         `${year}-${String(year + 1).slice(-2)}`
//       );
//     }

//     return years;
//   }, []);

//   // =====================================================
//   // CLASSES
//   // =====================================================

//   const classes = useMemo(() => {
//     const classMap = new Map();

//     (students || []).forEach((student) => {
//       if (
//         student.class_uuid &&
//         student.class_name
//       ) {
//         classMap.set(student.class_uuid, {
//           uuid: student.class_uuid,
//           name: student.class_name,
//         });
//       }
//     });

//     return Array.from(classMap.values()).sort(
//       (a, b) => a.name.localeCompare(b.name)
//     );
//   }, [students]);

//   // =====================================================
//   // SECTIONS
//   // =====================================================

//   const sections = useMemo(() => {
//     const sectionMap = new Map();

//     (students || []).forEach((student) => {
//       if (
//         student.section_uuid &&
//         student.section_name
//       ) {
//         sectionMap.set(
//           student.section_uuid,
//           {
//             uuid: student.section_uuid,
//             name: student.section_name,
//           }
//         );
//       }
//     });

//     return Array.from(sectionMap.values()).sort(
//       (a, b) => a.name.localeCompare(b.name)
//     );
//   }, [students]);

//   // =====================================================
//   // STUDENT SEARCH
//   // =====================================================

//   const matchingStudents = useMemo(() => {
//     if (!studentQuery.trim()) {
//       return [];
//     }

//     const q = studentQuery
//       .toLowerCase()
//       .trim();

//     return (students || [])
//       .filter((student) => {
//         const name =
//           student.full_name?.toLowerCase() || "";

//         const studentNo =
//           student.student_no?.toLowerCase() || "";

//         const admissionNo =
//           student.admission_no?.toLowerCase() || "";

//         return (
//           name.includes(q) ||
//           studentNo.includes(q) ||
//           admissionNo.includes(q)
//         );
//       })
//       .slice(0, 8);
//   }, [studentQuery, students]);

//   // =====================================================
//   // PAYMENT MODE NORMALIZER
//   // =====================================================

//   const getPaymentColumn = (mode) => {
//     const value = String(mode || "")
//       .trim()
//       .toUpperCase()
//       .replace(/[\s-]+/g, "_");

//     switch (value) {
//       case "CASH":
//         return "Cash";

//       case "CHEQUE":
//       case "CHECK":
//         return "Cheque";

//       case "BANK_TRANSFER":
//       case "BANKTRANSFER":
//         return "Bank Transfer";

//       case "CARD":
//       case "SWIPE":
//         return "Swipe";

//       case "DD":
//       case "DEMAND_DRAFT":
//         return "DD";

//       case "PAYTM":
//         return "Paytm";

//       case "NEFT":
//         return "NEFT";

//       case "NSO":
//         return "NSO";

//       case "ONLINE_MANUAL":
//         return "Online Manual";

//       case "CREDIT_NOTE":
//       case "ADJUST_FROM_CREDIT_NOTE":
//         return "Adjust from Credit Note";

//       case "STUDENT_ACCOUNT":
//       case "ADJUST_FROM_STUDENT_ACCOUNT":
//         return "Adjust from Student Account balance";

//       case "UPI":
//         return "UPI";

//       case "RAZORPAY":
//       case "NETBANKING":
//       case "NET_BANKING":
//       case "ONLINE":
//         return "Online";

//       case "OTHER_SETTLEMENT":
//         return "Other Settlement";

//       case "CANCELLED":
//         return "Cancelled";

//       default:
//         return "Online";
//     }
//   };

//   // =====================================================
//   // DAILY COLLECTION HEAD PAYMENT COLUMNS
//   // =====================================================

//   const DAILY_HEAD_COLUMNS = [
//     "Online",
//     "Cheque",
//     "Cash",
//     "Bank Transfer",
//     "Other Settlement",
//     "Cancelled",
//     "Swipe",
//     "DD",
//     "Paytm",
//     "Adjust from Student Account balance",
//     "NEFT",
//     "NSO",
//     "Online Manual",
//     "Adjust from Credit Note",
//     "UPI",
//   ];

//   // =====================================================
//   // MONTHLY MANAGEMENT COLUMNS
//   // =====================================================

//   const MONTHLY_COLUMNS = [
//     "Report",
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//     "YTD",
//   ];

//   const MONTHLY_MONEY_ROWS = [
//     "Opening Outstanding",
//     "Gross Fees Due",
//     "Concessions / Waivers",
//     "Net Fees Due",
//     "Current Month Fee Collection",
//     "Arrears Collection",
//     "Total Fee Collection",
//     "Late Fee / Penalty Collected",
//     "Total Cash Received",
//     "Current Month Pending",
//     "Closing Outstanding",
//     "Variance vs Fees Due",
//     "Overdue Amount",
//   ];

//   const MONTHLY_PERCENT_ROWS = [
//     "Collection Rate",
//     "Overdue Rate",
//   ];

//   // =====================================================
//   // GET TRANSACTION DETAIL AMOUNT
//   // =====================================================

//   const getTransactionComponentDetails = (txn) => {
//     if (
//       Array.isArray(txn.details) &&
//       txn.details.length > 0
//     ) {
//       return txn.details;
//     }

//     return [];
//   };

//   // =====================================================
//   // FETCH REPORT
//   // =====================================================

//   const fetchReport = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       // =================================================
//       // DAILY COLLECTION HEAD REPORT
//       // =================================================

//       if (
//         reportType ===
//         "DAILY_COLLECTION_HEAD"
//       ) {
//         const response =
//           await getPayments({
//             limit: 500,
//           });

//         const payments =
//           response?.data?.data ??
//           response?.data ??
//           [];

//         const selectedDate =
//           collectionDate ||
//           new Date()
//             .toISOString()
//             .split("T")[0];

//         const dailyPayments =
//           payments.filter((txn) => {
//             if (
//               txn.transaction_status !==
//               "SUCCESS"
//             ) {
//               return false;
//             }

//             if (!txn.created_at) {
//               return false;
//             }

//             const paymentDate =
//               new Date(
//                 txn.created_at
//               ).toLocaleDateString(
//                 "en-CA"
//               );

//             return (
//               paymentDate ===
//               selectedDate
//             );
//           });

//         const filteredPayments =
//           dailyPayments.filter(
//             (txn) => {
//               const student =
//                 (students || []).find(
//                   (s) =>
//                     s.student_uuid ===
//                     txn.student_uuid
//                 );

//               if (!student) {
//                 return false;
//               }

//               if (
//                 classUuid !== "all" &&
//                 classUuid &&
//                 student.class_uuid !==
//                   classUuid
//               ) {
//                 return false;
//               }

//               if (
//                 sectionUuid !== "all" &&
//                 sectionUuid &&
//                 student.section_uuid !==
//                   sectionUuid
//               ) {
//                 return false;
//               }

//               return true;
//             }
//           );

//         const collectionMap =
//           new Map();

//         const ensureRow =
//           (collectionHead) => {
//             if (
//               !collectionMap.has(
//                 collectionHead
//               )
//             ) {
//               const row = {
//                 "Collection Head":
//                   collectionHead,
//                 Date: selectedDate,
//               };

//               DAILY_HEAD_COLUMNS.forEach(
//                 (column) => {
//                   row[column] = 0;
//                 }
//               );

//               collectionMap.set(
//                 collectionHead,
//                 row
//               );
//             }

//             return collectionMap.get(
//               collectionHead
//             );
//           };

//         filteredPayments.forEach(
//           (txn) => {
//             const paymentColumn =
//               getPaymentColumn(
//                 txn.payment_mode
//               );

//             const details =
//               getTransactionComponentDetails(
//                 txn
//               );

//             if (details.length > 0) {
//               details.forEach(
//                 (detail) => {
//                   const collectionHead =
//                     detail.component_name ||
//                     detail.name ||
//                     "Other Income";

//                   const amount =
//                     Number(
//                       detail.amount ??
//                         detail.paid_amount ??
//                         0
//                     );

//                   if (
//                     !Number.isFinite(
//                       amount
//                     ) ||
//                     amount <= 0
//                   ) {
//                     return;
//                   }

//                   const row =
//                     ensureRow(
//                       collectionHead
//                     );

//                   row[paymentColumn] =
//                     Number(
//                       row[
//                         paymentColumn
//                       ] || 0
//                     ) + amount;
//                 }
//               );
//             }

//             const lateFee = Number(
//               txn.late_fee || 0
//             );

//             if (lateFee > 0) {
//               const hasLateFeeDetail =
//                 details.some(
//                   (detail) =>
//                     String(
//                       detail.component_name ||
//                         detail.name ||
//                         ""
//                     )
//                       .toLowerCase()
//                       .includes("late")
//                 );

//               if (!hasLateFeeDetail) {
//                 const row =
//                   ensureRow(
//                     "Late Fee"
//                   );

//                 row[paymentColumn] =
//                   Number(
//                     row[
//                       paymentColumn
//                     ] || 0
//                   ) + lateFee;
//               }
//             }

//             if (
//               details.length === 0 &&
//               lateFee <= 0
//             ) {
//               const amount = Number(
//                 txn.total_amount || 0
//               );

//               if (amount > 0) {
//                 const row =
//                   ensureRow(
//                     "Other Income"
//                   );

//                 row[paymentColumn] =
//                   Number(
//                     row[
//                       paymentColumn
//                     ] || 0
//                   ) + amount;
//               }
//             }
//           }
//         );

//         const displayDate =
//           new Date(
//             `${selectedDate}T00:00:00`
//           ).toLocaleDateString(
//             "en-GB"
//           );

//         const collectionRows =
//           Array.from(
//             collectionMap.values()
//           ).map((row, index) => {
//             const formattedRow = {
//               "Sr No": index + 1,
//               "Collection Head":
//                 row[
//                   "Collection Head"
//                 ],
//               Date: displayDate,
//             };

//             let total = 0;

//             DAILY_HEAD_COLUMNS.forEach(
//               (column) => {
//                 const amount = Number(
//                   row[column] || 0
//                 );

//                 formattedRow[column] =
//                   amount;

//                 total += amount;
//               }
//             );

//             formattedRow[
//               "Total (₹)"
//             ] = total;

//             return formattedRow;
//           });

//         if (
//           collectionRows.length > 0
//         ) {
//           const totalRow = {
//             "Sr No": "",
//             "Collection Head":
//               "Total",
//             Date: "",
//           };

//           let grandTotal = 0;

//           DAILY_HEAD_COLUMNS.forEach(
//             (column) => {
//               const total =
//                 collectionRows.reduce(
//                   (sum, row) =>
//                     sum +
//                     Number(
//                       row[column] || 0
//                     ),
//                   0
//                 );

//               totalRow[column] =
//                 total;

//               grandTotal += total;
//             }
//           );

//           totalRow[
//             "Total (₹)"
//           ] = grandTotal;

//           collectionRows.push(
//             totalRow
//           );
//         }

//         setComponents([]);
//         setReportData(
//           collectionRows
//         );

//         const grandCollection =
//           collectionRows.length > 0
//             ? Number(
//                 collectionRows[
//                   collectionRows.length -
//                     1
//                 ]["Total (₹)"] || 0
//               )
//             : 0;

//         setTotals([
//           {
//             label:
//               "Successful Payments",
//             value:
//               filteredPayments.length,
//           },
//           {
//             label:
//               "Collection Heads",
//             value:
//               collectionRows.length >
//               0
//                 ? collectionRows.length -
//                   1
//                 : 0,
//           },
//           {
//             label:
//               "Total Collection",
//             value:
//               inr(
//                 grandCollection
//               ),
//           },
//         ]);

//         return;
//       }

//       // =================================================
//       // DAILY COLLECTION REPORT
//       // =================================================

//       if (
//         reportType ===
//         "DAILY_COLLECTION"
//       ) {
//         const response =
//           await getPayments({
//             limit: 500,
//           });

//         const payments =
//           response?.data?.data ??
//           response?.data ??
//           [];

//         const selectedDate =
//           collectionDate ||
//           new Date()
//             .toISOString()
//             .split("T")[0];

//         const dailyPayments =
//           payments.filter((txn) => {
//             if (
//               txn.transaction_status !==
//               "SUCCESS"
//             ) {
//               return false;
//             }

//             if (!txn.created_at) {
//               return false;
//             }

//             const paymentDate =
//               new Date(
//                 txn.created_at
//               ).toLocaleDateString(
//                 "en-CA"
//               );

//             return (
//               paymentDate ===
//               selectedDate
//             );
//           });

//         const filteredPayments =
//           dailyPayments.filter(
//             (txn) => {
//               const student =
//                 (students || []).find(
//                   (s) =>
//                     s.student_uuid ===
//                     txn.student_uuid
//                 );

//               if (!student) {
//                 return false;
//               }

//               if (
//                 classUuid !== "all" &&
//                 classUuid &&
//                 student.class_uuid !==
//                   classUuid
//               ) {
//                 return false;
//               }

//               if (
//                 sectionUuid !== "all" &&
//                 sectionUuid &&
//                 student.section_uuid !==
//                   sectionUuid
//               ) {
//                 return false;
//               }

//               return true;
//             }
//           );

//         const formattedRows =
//           filteredPayments.map(
//             (txn, index) => {
//               const student =
//                 (students || []).find(
//                   (s) =>
//                     s.student_uuid ===
//                     txn.student_uuid
//                 ) || {};

//               const grossAmount =
//                 Number(
//                   txn.details?.reduce(
//                     (
//                       sum,
//                       detail
//                     ) =>
//                       sum +
//                       Number(
//                         detail.amount ||
//                           0
//                       ),
//                     0
//                   ) ||
//                     txn.total_amount ||
//                     0
//                 );

//               const discountAmount =
//                 Number(
//                   txn.discount_amount ||
//                     0
//                 );

//               const lateFee = Number(
//                 txn.late_fee || 0
//               );

//               const paidAmount =
//                 Number(
//                   txn.total_amount || 0
//                 );

//               return {
//                 "Sr No": index + 1,

//                 Student:
//                   txn.student_name ||
//                   student.full_name ||
//                   "—",

//                 Class:
//                   student.class_name ||
//                   "—",

//                 Section:
//                   student.section_name ||
//                   "—",

//                 "Admission No":
//                   student.admission_no ||
//                   txn.admission_number ||
//                   "—",

//                 Invoice:
//                   txn.invoice_number ||
//                   txn.invoice_no ||
//                   "—",

//                 Receipt:
//                   txn.receipt_no ||
//                   "—",

//                 "Gross (₹)":
//                   grossAmount,

//                 "Discount (₹)":
//                   discountAmount,

//                 "Late Fee (₹)":
//                   lateFee,

//                 "Net (₹)":
//                   paidAmount,

//                 "Paid (₹)":
//                   paidAmount,

//                 "Pending (₹)": 0,

//                 "Payment Mode":
//                   txn.payment_mode ||
//                   "—",

//                 Reference:
//                   txn.reference_number ||
//                   txn.razorpay_payment_id ||
//                   "—",

//                 "Payment Date":
//                   txn.created_at
//                     ? new Date(
//                         txn.created_at
//                       ).toLocaleString()
//                     : "—",
//               };
//             }
//           );

//         setComponents([]);
//         setReportData(
//           formattedRows
//         );

//         const totalGross =
//           filteredPayments.reduce(
//             (sum, txn) =>
//               sum +
//               Number(
//                 txn.details?.reduce(
//                   (
//                     detailSum,
//                     detail
//                   ) =>
//                     detailSum +
//                     Number(
//                       detail.amount ||
//                         0
//                     ),
//                   0
//                 ) ||
//                   txn.total_amount ||
//                   0
//               ),
//             0
//           );

//         const totalDiscount =
//           filteredPayments.reduce(
//             (sum, txn) =>
//               sum +
//               Number(
//                 txn.discount_amount ||
//                   0
//               ),
//             0
//           );

//         const totalLateFee =
//           filteredPayments.reduce(
//             (sum, txn) =>
//               sum +
//               Number(
//                 txn.late_fee || 0
//               ),
//             0
//           );

//         const totalPaid =
//           filteredPayments.reduce(
//             (sum, txn) =>
//               sum +
//               Number(
//                 txn.total_amount ||
//                   0
//               ),
//             0
//           );

//         setTotals([
//           {
//             label: "Payments",
//             value:
//               filteredPayments.length,
//           },
//           {
//             label: "Total Gross",
//             value:
//               inr(totalGross),
//           },
//           {
//             label:
//               "Total Discount",
//             value:
//               inr(totalDiscount),
//           },
//           {
//             label:
//               "Total Late Fee",
//             value:
//               inr(totalLateFee),
//           },
//           {
//             label:
//               "Total Collection",
//             value:
//               inr(totalPaid),
//           },
//         ]);

//         return;
//       }

//       // =================================================
//       // MONTHLY FEE MANAGEMENT REPORT
//       // =================================================

//       if (
//         reportType ===
//         "MONTHLY_FEE_MANAGEMENT"
//       ) {
//         const response =
//           await getMonthlyFeeManagementReport(
//             {
//               academic_year:
//                 academicYear ||
//                 undefined,

//               class_uuid:
//                 classUuid === "all"
//                   ? undefined
//                   : classUuid,

//               section_uuid:
//                 sectionUuid === "all"
//                   ? undefined
//                   : sectionUuid,
//             }
//           );

//         const body =
//           response?.data ??
//           response ??
//           {};

//         if (!body.success) {
//           throw new Error(
//             typeof body.message ===
//               "string"
//               ? body.message
//               : describeErrorDetail(
//                   body.message
//                 ) ||
//                   "Failed to fetch monthly management report"
//           );
//         }

//         const managementData =
//           body.data || {};

//         const ytd =
//           body.ytd || {};

//         const reportRows = [
//           "Opening Outstanding",
//           "Gross Fees Due",
//           "Concessions / Waivers",
//           "Net Fees Due",
//           "Current Month Fee Collection",
//           "Arrears Collection",
//           "Total Fee Collection",
//           "Late Fee / Penalty Collected",
//           "Total Cash Received",
//           "Current Month Pending",
//           "Closing Outstanding",
//           "Collection Rate",
//           "Variance vs Fees Due",
//           "Overdue Amount",
//           "Overdue Rate",
//         ];

//         const formattedRows =
//           reportRows.map(
//             (reportName) => {
//               const source =
//                 managementData[
//                   reportName
//                 ] || {};

//               const row = {
//                 Report: reportName,
//               };

//               MONTHLY_COLUMNS
//                 .filter(
//                   (column) =>
//                     column !==
//                     "Report"
//                 )
//                 .forEach(
//                   (month) => {
//                     row[month] =
//                       source[month] ??
//                       0;
//                   }
//                 );

//               return row;
//             }
//           );

//         setComponents([]);
//         setReportData(
//           formattedRows
//         );

//         // =================================================
//         // KPI CARDS
//         // =================================================

//         const getYtdValue = (
//           reportName,
//           ytdKey
//         ) => {
//           return Number(
//             managementData[
//               reportName
//             ]?.YTD ??
//               ytd[ytdKey] ??
//               0
//           );
//         };

//         setTotals([
//           {
//             label:
//               "Net Fees Due",
//             value: inr(
//               getYtdValue(
//                 "Net Fees Due",
//                 "net_fees_due"
//               )
//             ),
//           },

//           {
//             label:
//               "Current Collection",
//             value: inr(
//               getYtdValue(
//                 "Current Month Fee Collection",
//                 "current_month_collection"
//               )
//             ),
//           },

//           {
//             label:
//               "Arrears Collection",
//             value: inr(
//               getYtdValue(
//                 "Arrears Collection",
//                 "arrears_collection"
//               )
//             ),
//           },

//           {
//             label:
//               "Total Collection",
//             value: inr(
//               getYtdValue(
//                 "Total Fee Collection",
//                 "total_fee_collection"
//               )
//             ),
//           },

//           {
//             label:
//               "Closing Outstanding",
//             value: inr(
//               getYtdValue(
//                 "Closing Outstanding",
//                 "closing_outstanding"
//               )
//             ),
//           },

//           {
//             label:
//               "Overdue Amount",
//             value: inr(
//               getYtdValue(
//                 "Overdue Amount",
//                 "overdue_amount"
//               )
//             ),
//           },

//           {
//             label:
//               "Collection Rate",
//             value:
//               getYtdValue(
//                 "Collection Rate",
//                 "collection_rate"
//               ).toFixed(1) +
//               "%",
//           },
//         ]);

//         return;
//       }

//       // =================================================
//       // ALL OTHER REPORTS
//       // =================================================

//       const params = {
//         report_type: reportType,

//         academic_year:
//           visibleFilters.academicYear
//             ? academicYear ||
//               undefined
//             : undefined,

//         student_uuid:
//           visibleFilters.student
//             ? studentUuid ||
//               undefined
//             : undefined,

//         from_date:
//           visibleFilters.dateRange
//             ? fromDate ||
//               undefined
//             : undefined,

//         to_date:
//           visibleFilters.dateRange
//             ? toDate ||
//               undefined
//             : undefined,

//         collection_date:
//           visibleFilters.collectionDate
//             ? collectionDate ||
//               undefined
//             : undefined,

//         class_uuid:
//           classUuid === "all"
//             ? undefined
//             : classUuid,

//         section_uuid:
//           sectionUuid === "all"
//             ? undefined
//             : sectionUuid,

//         payment_status:
//           paymentStatus === "all"
//             ? undefined
//             : paymentStatus,
//       };

//       const response =
//         await getStudentFeeReport(
//           params
//         );

//       const body =
//         response?.data ??
//         response ??
//         {};

//       if (!body.success) {
//         throw new Error(
//           typeof body.message ===
//             "string"
//             ? body.message
//             : describeErrorDetail(
//                 body.message
//               ) ||
//                 "Failed to fetch report"
//         );
//       }

//       const data =
//         Array.isArray(body.data)
//           ? body.data
//           : [];

//       const componentsList =
//         Array.isArray(
//           body.components
//         )
//           ? body.components
//           : [];

//       setComponents(
//         componentsList
//       );

//       const formattedRows =
//         data.map((row) => {
//           const formattedRow = {
//             "Sr No": row.sr_no,

//             Student:
//               row.student_name ||
//               "—",

//             Class:
//               row.class_name ||
//               "—",

//             Section:
//               row.section_name ||
//               "—",

//             "Admission No":
//               row.admission_number ||
//               "—",

//             Invoice:
//               row.invoice_number ||
//               "—",

//             Receipt:
//               row.receipt_number ||
//               "—",
//           };

//           componentsList.forEach(
//             (component) => {
//               const value =
//                 row.components?.[
//                   component
//                 ];

//               formattedRow[
//                 component
//               ] =
//                 value === null ||
//                 value ===
//                   undefined
//                   ? null
//                   : Number(value);
//             }
//           );

//           formattedRow[
//             "Gross (₹)"
//           ] = Number(
//             row.gross_amount || 0
//           );

//           formattedRow[
//             "Discount (₹)"
//           ] = Number(
//             row.concession_amount ||
//               0
//           );

//           formattedRow[
//             "Late Fee (₹)"
//           ] = Number(
//             row.late_fee || 0
//           );

//           formattedRow[
//             "Net (₹)"
//           ] = Number(
//             row.net_amount || 0
//           );

//           formattedRow[
//             "Paid (₹)"
//           ] = Number(
//             row.paid_amount || 0
//           );

//           formattedRow[
//             "Pending (₹)"
//           ] = Number(
//             row.pending_amount || 0
//           );

//           formattedRow[
//             "Payment Mode"
//           ] =
//             row.payment_mode ||
//             "—";

//           formattedRow[
//             "Reference"
//           ] =
//             row.reference_number ||
//             "—";

//           formattedRow[
//             "Payment Date"
//           ] = row.payment_date
//             ? new Date(
//                 row.payment_date
//               ).toLocaleDateString()
//             : "—";

//           formattedRow[
//             "Due Date"
//           ] = row.due_date
//             ? new Date(
//                 row.due_date
//               ).toLocaleDateString()
//             : "—";

//           formattedRow[
//             "Invoice Date"
//           ] = row.invoice_date
//             ? new Date(
//                 row.invoice_date
//               ).toLocaleDateString()
//             : "—";

//           if (
//             reportType ===
//             "RETRACTED_INVOICE"
//           ) {
//             formattedRow[
//               "Retracted On"
//             ] =
//               row.retracted_at
//                 ? new Date(
//                     row.retracted_at
//                   ).toLocaleDateString()
//                 : "—";

//             formattedRow[
//               "Retracted By"
//             ] =
//               row.retracted_by ||
//               "—";

//             formattedRow[
//               "Reason"
//             ] =
//               row.retraction_reason ||
//               "—";
//           }

//           return formattedRow;
//         });

//       setReportData(
//         formattedRows
//       );

//       const totalGross =
//         data.reduce(
//           (sum, row) =>
//             sum +
//             Number(
//               row.gross_amount ||
//                 0
//             ),
//           0
//         );

//       const totalDiscount =
//         data.reduce(
//           (sum, row) =>
//             sum +
//             Number(
//               row.concession_amount ||
//                 0
//             ),
//           0
//         );

//       const totalLateFee =
//         data.reduce(
//           (sum, row) =>
//             sum +
//             Number(
//               row.late_fee || 0
//             ),
//           0
//         );

//       const totalNet =
//         data.reduce(
//           (sum, row) =>
//             sum +
//             Number(
//               row.net_amount || 0
//             ),
//           0
//         );

//       const totalPaid =
//         data.reduce(
//           (sum, row) =>
//             sum +
//             Number(
//               row.paid_amount ||
//                 0
//             ),
//           0
//         );

//       const totalPending =
//         data.reduce(
//           (sum, row) =>
//             sum +
//             Number(
//               row.pending_amount ||
//                 0
//             ),
//           0
//         );

//       const componentTotals =
//         {};

//       componentsList.forEach(
//         (component) => {
//           componentTotals[
//             component
//           ] = data.reduce(
//             (sum, row) =>
//               sum +
//               Number(
//                 row.components?.[
//                   component
//                 ] || 0
//               ),
//             0
//           );
//         }
//       );

//       const totalCards = [
//         {
//           label: "Students",
//           value: data.length,
//         },
//         {
//           label: "Total Gross",
//           value:
//             inr(totalGross),
//         },
//         {
//           label:
//             "Total Discount",
//           value:
//             inr(totalDiscount),
//         },
//         {
//           label:
//             "Total Late Fee",
//           value:
//             inr(totalLateFee),
//         },
//         {
//           label: "Total Net",
//           value: inr(totalNet),
//         },
//         {
//           label: "Total Paid",
//           value:
//             inr(totalPaid),
//         },
//         {
//           label:
//             "Total Pending",
//           value:
//             inr(totalPending),
//         },
//       ];

//       componentsList.forEach(
//         (component) => {
//           totalCards.push({
//             label: component,
//             value: inr(
//               componentTotals[
//                 component
//               ] || 0
//             ),
//           });
//         }
//       );

//       setTotals(
//         totalCards
//       );
//     } catch (err) {
//       console.error(
//         "Report Error:",
//         err
//       );

//       setError(
//         getErrorMessage(
//           err,
//           "Failed to load report"
//         )
//       );

//       setReportData([]);
//       setTotals([]);
//       setComponents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // INITIAL / REPORT TYPE LOAD
//   // =====================================================

//   useEffect(() => {
//     fetchReport();

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     fetchReport();

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reportType]);

//   useEffect(() => {
//     if (
//       reportType ===
//         "DAILY_COLLECTION" ||
//       reportType ===
//         "DAILY_COLLECTION_HEAD"
//     ) {
//       fetchReport();
//     }

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [collectionDate]);

//   // =====================================================
//   // STUDENT SELECT
//   // =====================================================

//   const handleStudentSelect =
//     (student) => {
//       setStudentUuid(
//         student.student_uuid
//       );

//       setStudentQuery(
//         student.full_name
//       );

//       if (student.class_uuid) {
//         setClassUuid(
//           student.class_uuid
//         );
//       }

//       if (student.section_uuid) {
//         setSectionUuid(
//           student.section_uuid
//         );
//       }
//     };

//   // =====================================================
//   // CLEAR FILTERS
//   // =====================================================

//   const clearFilters = () => {
//     setStudentUuid("");
//     setStudentQuery("");
//     setFromDate("");
//     setToDate("");

//     setClassUuid("all");
//     setSectionUuid("all");

//     setPaymentStatus(
//       reportType === "FEE_PENDING"
//         ? "PENDING"
//         : "all"
//     );

//     setCollectionDate(
//       new Date()
//         .toISOString()
//         .split("T")[0]
//     );

//     setReportData([]);
//     setTotals([]);
//     setComponents([]);
//     setError("");

//     setTimeout(() => {
//       fetchReport();
//     }, 0);
//   };

//   // =====================================================
//   // TABLE COLUMNS
//   // =====================================================

//   const columns = useMemo(() => {
//     if (
//       isMonthlyManagementReport
//     ) {
//       return MONTHLY_COLUMNS;
//     }

//     if (!reportData.length) {
//       return [];
//     }

//     return Object.keys(
//       reportData[0]
//     );
//   }, [
//     reportData,
//     isMonthlyManagementReport,
//   ]);

//   // =====================================================
//   // EXCEL EXPORT
//   // =====================================================

//   const exportExcel = () => {
//     if (!reportData.length) {
//       toast.error(
//         "No data to export"
//       );

//       return;
//     }

//     let exportRows =
//       reportData.map(
//         (row) => {
//           const exportRow = {
//             ...row,
//           };

//           components.forEach(
//             (component) => {
//               if (
//                 exportRow[
//                   component
//                 ] !== null &&
//                 exportRow[
//                   component
//                 ] !== undefined
//               ) {
//                 exportRow[
//                   component
//                 ] = Number(
//                   exportRow[
//                     component
//                   ]
//                 );
//               }
//             }
//           );

//           return exportRow;
//         }
//       );

//     // =====================================================
//     // MONTHLY REPORT EXPORT
//     // =====================================================

//     if (
//       isMonthlyManagementReport
//     ) {
//       exportRows =
//         reportData.map(
//           (row) => {
//             const exportRow = {};

//             MONTHLY_COLUMNS.forEach(
//               (column) => {
//                 exportRow[
//                   column
//                 ] =
//                   row[column] ??
//                   0;
//               }
//             );

//             return exportRow;
//           }
//         );
//     }

//     const worksheet =
//       XLSX.utils.json_to_sheet(
//         exportRows
//       );

//     const workbook =
//       XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(
//       workbook,
//       worksheet,
//       isMonthlyManagementReport
//         ? "Monthly Management"
//         : activeReport.label.slice(
//             0,
//             31
//           )
//     );

//     XLSX.writeFile(
//       workbook,
//       `${reportType.toLowerCase()}-${
//         new Date()
//           .toISOString()
//           .split("T")[0]
//       }.xlsx`
//     );

//     toast.success(
//       "Report exported successfully"
//     );
//   };

//   // =====================================================
//   // PDF EXPORT
//   // =====================================================

//   const exportPDF = () => {
//     if (!reportData.length) {
//       toast.error("No data to export");
//       return;
//     }

//     /*
//       PDF design intentionally follows the management-report
//       style from the supplied examples:

//       - A4 landscape
//       - dark navy top banner
//       - report title + generated information
//       - KPI summary cards
//       - report/filter information block
//       - teal section bars
//       - compact professional data table
//       - footer with academic year / generated date / page
//     */

//     const NAVY = [10, 55, 72];
//     const NAVY_2 = [15, 64, 82];
//     const TEAL = [8, 108, 111];
//     const LIGHT_BLUE = [232, 243, 247];
//     const LIGHT_TEAL = [224, 244, 240];
//     const LIGHT_YELLOW = [255, 246, 214];
//     const LIGHT_RED = [252, 232, 234];
//     const GRID = [205, 216, 220];
//     const TEXT = [25, 39, 47];
//     const MUTED = [92, 108, 116];
//     const WHITE = [255, 255, 255];

//     const doc = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: "a4",
//       compress: true,
//     });

//     const pageWidth =
//       doc.internal.pageSize.getWidth();

//     const pageHeight =
//       doc.internal.pageSize.getHeight();

//     const left = 9;
//     const right = 9;
//     const contentWidth =
//       pageWidth - left - right;

//     const generatedAt =
//       new Date().toLocaleString("en-IN", {
//         dateStyle: "medium",
//         timeStyle: "short",
//       });

//     const reportTitle =
//       isMonthlyManagementReport
//         ? "Fee Collection — Monthly Management Report"
//         : activeReport.label;

//     const reportSubtitle =
//       isMonthlyManagementReport
//         ? `Academic Year: ${
//             academicYear || "—"
//           }  •  Amounts in Rs.`
//         : activeReport.description;

//   const shortNumber = (value) => {
//     const n = Number(value || 0);

//     if (!Number.isFinite(n)) {
//       return "Rs. 0";
//     }

//     const abs = Math.abs(n);

//     if (abs >= 10000000) {
//       return `Rs. ${(n / 10000000).toFixed(2)} Cr`;
//     }

//     if (abs >= 100000) {
//       return `Rs. ${(n / 100000).toFixed(2)} L`;
//     }

//     if (abs >= 1000) {
//       return `Rs. ${(n / 1000).toFixed(1)} K`;
//     }

//     return `Rs. ${Math.round(n).toLocaleString("en-IN")}`;
//   };

//       const numberValue = (value) => {
//         const n = Number(value);

//         return Number.isFinite(n) ? n : 0;
//       };

//       const getNumericTotal = (predicate) => {
//         return reportData.reduce(
//           (sum, row) => {
//             return (
//               sum +
//               numberValue(
//                 predicate(row)
//               )
//             );
//           },
//           0
//         );
//       };

//     // -----------------------------------------------------
//     // DATA-DRIVEN SUMMARY VALUES
//     // -----------------------------------------------------

//     let summaryCards = [];

//     if (isMonthlyManagementReport) {
//       const getYtd = (name) => {
//         const row =
//           reportData.find(
//             (item) =>
//               item.Report === name
//           );

//         return numberValue(
//           row?.YTD
//         );
//       };

//       summaryCards = [
//         {
//           label: "Net Fees Due",
//           value: shortNumber(
//             getYtd("Net Fees Due")
//           ),
//           fill: LIGHT_BLUE,
//         },
//         {
//           label: "Total Collection",
//           value: shortNumber(
//             getYtd(
//               "Total Fee Collection"
//             )
//           ),
//           fill: LIGHT_TEAL,
//         },
//         {
//           label: "Current Pending",
//           value: shortNumber(
//             getYtd(
//               "Current Month Pending"
//             )
//           ),
//           fill: LIGHT_YELLOW,
//         },
//         {
//           label: "Overdue Amount",
//           value: shortNumber(
//             getYtd("Overdue Amount")
//           ),
//           fill: LIGHT_RED,
//         },
//       ];
//     } else {
//       const labels =
//         reportData.length
//           ? Object.keys(
//               reportData[0]
//             )
//           : [];

//       const findColumn = (
//         names
//       ) =>
//         names.find(
//           (name) =>
//             labels.includes(name)
//         );

//       const paidColumn =
//         findColumn([
//           "Paid",
//           "Paid Amount",
//           "paid_amount",
//           "Total Paid",
//           "Paid (₹)",
//         ]);

//       const pendingColumn =
//         findColumn([
//           "Pending",
//           "Pending Amount",
//           "pending_amount",
//           "Total Pending",
//           "Pending (₹)",
//         ]);

//       const netColumn =
//         findColumn([
//           "Net",
//           "Net Amount",
//           "net_amount",
//           "Total Net",
//           "Net Fee Value",
//         ]);

//       const amountColumn =
//         findColumn([
//           "Amount",
//           "Total (₹)",
//           "Total",
//           "Collection",
//           "Total Collection",
//         ]);

//       const totalAmount =
//         amountColumn
//           ? getNumericTotal(
//               (row) =>
//                 row[amountColumn]
//             )
//           : netColumn
//           ? getNumericTotal(
//               (row) =>
//                 row[netColumn]
//             )
//           : reportData.length;

//       const totalPaid =
//         paidColumn
//           ? getNumericTotal(
//               (row) =>
//                 row[paidColumn]
//             )
//           : 0;

//       const totalPending =
//         pendingColumn
//           ? getNumericTotal(
//               (row) =>
//                 row[pendingColumn]
//             )
//           : 0;

//       summaryCards = [
//         {
//           label: "Report Rows",
//           value:
//             reportData.length.toLocaleString(
//               "en-IN"
//             ),
//           fill: LIGHT_BLUE,
//         },
//         {
//           label:
//             amountColumn ||
//             netColumn ||
//             "Net Value",
//           value:
//             amountColumn ||
//             netColumn
//               ? shortNumber(
//                   totalAmount
//                 )
//               : "—",
//           fill: LIGHT_TEAL,
//         },
//         {
//           label: "Paid",
//           value: paidColumn
//             ? shortNumber(
//                 totalPaid
//               )
//             : "—",
//           fill: LIGHT_YELLOW,
//         },
//         {
//           label: "Pending",
//           value: pendingColumn
//             ? shortNumber(
//                 totalPending
//               )
//             : "—",
//           fill: LIGHT_RED,
//         },
//       ];
//     }

//     // -----------------------------------------------------
//     // FORMAT TABLE VALUES
//     // -----------------------------------------------------

//     const MONEY_COLUMN_NAMES =
//       new Set([
//         "Online",
//         "Cheque",
//         "Cash",
//         "Bank Transfer",
//         "Other Settlement",
//         "Cancelled",
//         "Swipe",
//         "DD",
//         "Paytm",
//         "Adjust from Student Account balance",
//         "NEFT",
//         "NSO",
//         "Online Manual",
//         "Adjust from Credit Note",
//         "UPI",
//         "Total (₹)",
//         "Amount",
//         "Gross",
//         "Discount",
//         "Concession",
//         "Net",
//         "Paid",
//         "Pending",
//         "Late Fee",
//         "Late Fee / Penalty",
//         "Current Month Fee Collection",
//         "Arrears Collection",
//         "Total Fee Collection",
//         "Total Cash Received",
//         "Current Month Pending",
//         "Closing Outstanding",
//         "Overdue Amount",
//         "Variance vs Fees Due",
//       ]);

//     const isMoneyColumn = (
//       column,
//       row
//     ) => {
//       if (
//         isMonthlyManagementReport &&
//         MONTHLY_MONEY_ROWS.includes(
//           row.Report
//         ) &&
//         column !== "Report"
//       ) {
//         return true;
//       }

//       if (
//         components.includes(
//           column
//         )
//       ) {
//         return true;
//       }

//       if (
//         MONEY_COLUMN_NAMES.has(
//           column
//         )
//       ) {
//         return true;
//       }

//       const lower =
//         String(column || "")
//           .toLowerCase();

//       return (
//         lower.includes(
//           "amount"
//         ) ||
//         lower.includes(
//           "fee"
//         ) ||
//         lower.includes(
//           "paid"
//         ) ||
//         lower.includes(
//           "pending"
//         ) ||
//         lower.includes(
//           "discount"
//         ) ||
//         lower.includes(
//           "concession"
//         ) ||
//         lower.includes(
//           "collection"
//         ) ||
//         lower.includes(
//           "outstanding"
//         ) ||
//         lower.includes(
//           "penalty"
//         ) ||
//         lower.includes(
//           "late"
//         ) ||
//         lower.includes(
//           "variance"
//         )
//       );
//     };

//     const formatPdfValue = (
//       value,
//       column,
//       row
//     ) => {
//       if (
//         value === null ||
//         value === undefined ||
//         value === ""
//       ) {
//         return "—";
//       }

//       if (
//         isMonthlyManagementReport &&
//         MONTHLY_PERCENT_ROWS.includes(
//           row.Report
//         ) &&
//         typeof value ===
//           "number"
//       ) {
//         return `${value.toFixed(
//           1
//         )}%`;
//       }

//       if (
//         typeof value ===
//           "number" &&
//         isMoneyColumn(
//           column,
//           row
//         )
//       ) {
//         return Number(
//           value
//         ).toLocaleString(
//           "en-IN",
//           {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           }
//         );
//       }

//       if (
//         typeof value ===
//         "boolean"
//       ) {
//         return value
//           ? "Yes"
//           : "No";
//       }

//       return String(value);
//     };

//     // -----------------------------------------------------
//     // FILTER TEXT
//     // -----------------------------------------------------

//     const filterItems = [];

//     if (
//       visibleFilters.academicYear &&
//       academicYear
//     ) {
//       filterItems.push(
//         `Academic Year: ${academicYear}`
//       );
//     }

//     if (
//       visibleFilters.collectionDate &&
//       collectionDate
//     ) {
//       filterItems.push(
//         `Collection Date: ${collectionDate}`
//       );
//     }

//     if (
//       visibleFilters.student &&
//       studentQuery
//     ) {
//       filterItems.push(
//         `Student: ${studentQuery}`
//       );
//     }

//     if (
//       visibleFilters.class &&
//       classUuid &&
//       classUuid !== "all"
//     ) {
//       const selectedClass =
//         classes.find(
//           (item) =>
//             item.uuid ===
//             classUuid
//         );

//       filterItems.push(
//         `Class: ${
//           selectedClass?.name ||
//           classUuid
//         }`
//       );
//     }

//     if (
//       visibleFilters.section &&
//       sectionUuid &&
//       sectionUuid !== "all"
//     ) {
//       const selectedSection =
//         sections.find(
//           (item) =>
//             item.uuid ===
//             sectionUuid
//         );

//       filterItems.push(
//         `Section: ${
//           selectedSection?.name ||
//           sectionUuid
//         }`
//       );
//     }

//     if (
//       visibleFilters.paymentStatus &&
//       paymentStatus &&
//       paymentStatus !== "all"
//     ) {
//       filterItems.push(
//         `Status: ${paymentStatus}`
//       );
//     }

//     if (
//       visibleFilters.dateRange &&
//       (fromDate || toDate)
//     ) {
//       filterItems.push(
//         `Date: ${
//           fromDate || "—"
//         } → ${
//           toDate || "—"
//         }`
//       );
//     }

//     // -----------------------------------------------------
//     // DRAW COMMON PAGE HEADER
//     // -----------------------------------------------------

//     const drawPageHeader = (
//       pageNumber
//     ) => {
//       // top navy banner
//       doc.setFillColor(
//         ...NAVY
//       );

//       doc.rect(
//         0,
//         0,
//         pageWidth,
//         8,
//         "F"
//       );

//       doc.setFont(
//         "helvetica",
//         "bold"
//       );

//       doc.setFontSize(5.5);

//       doc.setTextColor(
//         ...WHITE
//       );

//       doc.text(
//         "SCHOOL FINANCE • MANAGEMENT REPORTING",
//         left,
//         5.2
//       );

//       doc.text(
//         reportType ===
//           "MASTER_FEES"
//           ? "MASTER STUDENT FEES REPORT"
//           : reportTitle
//               .toUpperCase()
//               .slice(0, 70),
//         pageWidth -
//           right,
//         5.2,
//         {
//           align: "right",
//         }
//       );

//       // footer
//       doc.setDrawColor(
//         ...GRID
//       );

//       doc.setLineWidth(
//         0.2
//       );

//       doc.line(
//         left,
//         pageHeight - 9,
//         pageWidth -
//           right,
//         pageHeight - 9
//       );

//       doc.setFont(
//         "helvetica",
//         "normal"
//       );

//       doc.setFontSize(5.5);

//       doc.setTextColor(
//         ...MUTED
//       );

//       const footerLeft =
//         academicYear
//           ? `Academic Year ${academicYear} • Generated ${generatedAt}`
//           : `Generated ${generatedAt}`;

//       doc.text(
//         footerLeft,
//         left,
//         pageHeight - 5
//       );

//       doc.text(
//         `Page ${pageNumber}`,
//         pageWidth -
//           right,
//         pageHeight - 5,
//         {
//           align: "right",
//         }
//       );
//     };

//     // -----------------------------------------------------
//     // TITLE + SUMMARY + FILTERS
//     // -----------------------------------------------------

//     drawPageHeader(1);

//     let y = 17;

//     doc.setFont(
//       "helvetica",
//       "bold"
//     );

//     doc.setFontSize(13);

//     doc.setTextColor(
//       ...NAVY
//     );

//     doc.text(
//       reportTitle,
//       left,
//       y
//     );

//     y += 5;

//     doc.setFont(
//       "helvetica",
//       "normal"
//     );

//     doc.setFontSize(6.5);

//     doc.setTextColor(
//       ...MUTED
//     );

//     const subtitleLines =
//       doc.splitTextToSize(
//         reportSubtitle,
//         contentWidth
//       );

//     doc.text(
//       subtitleLines,
//       left,
//       y
//     );

//     y +=
//       subtitleLines.length *
//         3.2 +
//       3;

//     // -----------------------------------------------------
//     // KPI CARDS
//     // -----------------------------------------------------

//     const cardGap = 3;
//     const cardWidth =
//       (contentWidth -
//         cardGap * 3) /
//       4;

//     const cardHeight = 15;

//     summaryCards
//       .slice(0, 4)
//       .forEach(
//         (card, index) => {
//           const x =
//             left +
//             index *
//               (cardWidth +
//                 cardGap);

//           doc.setFillColor(
//             ...card.fill
//           );

//           doc.setDrawColor(
//             ...GRID
//           );

//           doc.roundedRect(
//             x,
//             y,
//             cardWidth,
//             cardHeight,
//             1,
//             1,
//             "FD"
//           );

//           doc.setFont(
//             "helvetica",
//             "bold"
//           );

//           doc.setFontSize(5.5);

//           doc.setTextColor(
//             ...MUTED
//           );

//           doc.text(
//             String(
//               card.label
//             ).slice(0, 30),
//             x + 3,
//             y + 4
//           );

//           doc.setFontSize(9);

//           doc.setTextColor(
//             ...NAVY
//           );

//           doc.text(
//             String(
//               card.value
//             ).slice(0, 25),
//             x + 3,
//             y + 11
//           );
//         }
//       );

//     y +=
//       cardHeight + 5;

//     // -----------------------------------------------------
//     // FILTER / REPORT SUMMARY SECTION
//     // -----------------------------------------------------

//     doc.setFillColor(
//       ...NAVY_2
//     );

//     doc.rect(
//       left,
//       y,
//       contentWidth,
//       6,
//       "F"
//     );

//     doc.setFont(
//       "helvetica",
//       "bold"
//     );

//     doc.setFontSize(6.5);

//     doc.setTextColor(
//       ...WHITE
//     );

//     doc.text(
//       "1. REPORT FILTERS & SUMMARY",
//       left + 3,
//       y + 4
//     );

//     y += 8;

//     const summaryRows = [];

//     if (filterItems.length) {
//       summaryRows.push([
//         "Filters Applied",
//         filterItems.join(
//           "   •   "
//         ),
//       ]);
//     } else {
//       summaryRows.push([
//         "Filters Applied",
//         "All applicable records",
//       ]);
//     }

//     summaryRows.push([
//       "Report Type",
//       reportTitle,
//     ]);

//     summaryRows.push([
//       "Generated",
//       generatedAt,
//     ]);

//     autoTable(doc, {
//       startY: y,
//       head: [
//         [
//           "Field",
//           "Value",
//         ],
//       ],
//       body: summaryRows,
//       theme: "grid",
//       margin: {
//         left,
//         right,
//       },
//       styles: {
//         font:
//           "helvetica",
//         fontSize: 5.7,
//         cellPadding: 1.6,
//         textColor: TEXT,
//         lineColor: GRID,
//         lineWidth: 0.15,
//       },
//       headStyles: {
//         fillColor: TEAL,
//         textColor: WHITE,
//         fontStyle: "bold",
//         fontSize: 5.8,
//       },
//       columnStyles: {
//         0: {
//           cellWidth: 35,
//           fontStyle:
//             "bold",
//         },
//         1: {
//           cellWidth:
//             contentWidth - 35,
//         },
//       },
//     });

//     y =
//       (doc.lastAutoTable?.finalY ||
//         y) + 5;

//     // -----------------------------------------------------
//     // DATA SECTION TITLE
//     // -----------------------------------------------------

//     const dataSectionTitle =
//       isMonthlyManagementReport
//         ? "2. MONTHLY MANAGEMENT REPORT"
//         : reportType ===
//           "MASTER_FEES"
//         ? "2. FEE POSITION & MASTER FEE LEDGER"
//         : reportType ===
//           "DAILY_COLLECTION_HEAD"
//         ? "2. COLLECTION HEAD SUMMARY"
//         : reportType ===
//           "DAILY_COLLECTION"
//         ? "2. DAILY COLLECTION DETAILS"
//         : reportType ===
//           "FEE_PENDING"
//         ? "2. PENDING FEE DETAILS"
//         : reportType ===
//           "RETRACTED_INVOICE"
//         ? "2. RETRACTED INVOICE DETAILS"
//         : "2. COMPLETE REPORT DETAILS";

//     doc.setFillColor(
//       ...NAVY_2
//     );

//     doc.rect(
//       left,
//       y,
//       contentWidth,
//       6,
//       "F"
//     );

//     doc.setFont(
//       "helvetica",
//       "bold"
//     );

//     doc.setFontSize(6.5);

//     doc.setTextColor(
//       ...WHITE
//     );

//     doc.text(
//       dataSectionTitle,
//       left + 3,
//       y + 4
//     );

//     y += 8;

//     // -----------------------------------------------------
//     // TABLE DATA
//     // -----------------------------------------------------

//     const pdfColumns =
//       columns.length
//         ? columns
//         : Object.keys(
//             reportData[0] ||
//               {}
//           );

//     const pdfData =
//       reportData.map(
//         (row) =>
//           pdfColumns.map(
//             (column) =>
//               formatPdfValue(
//                 row[column],
//                 column,
//                 row
//               )
//           )
//       );

//     // Keep wide management/ledger reports on one landscape page
//     // where possible, matching the supplied reference PDFs.
//     const tableFontSize =
//       isMonthlyManagementReport
//         ? 5.1
//         : pdfColumns.length >= 18
//         ? 4.0
//         : pdfColumns.length >= 13
//         ? 4.5
//         : 5.2;

//     const cellPadding =
//       pdfColumns.length >= 18
//         ? 0.65
//         : 0.9;

//     autoTable(doc, {
//       startY: y,
//       head: [
//         pdfColumns.map(
//           (column) =>
//             String(
//               column
//             )
//         ),
//       ],
//       body: pdfData,
//       theme: "grid",

//       margin: {
//         top: 13,
//         left,
//         right,
//         bottom: 13,
//       },

//       styles: {
//         font:
//           "helvetica",
//         fontSize:
//           tableFontSize,
//         cellPadding,
//         lineColor: GRID,
//         lineWidth: 0.12,
//         textColor: TEXT,
//         overflow:
//           "linebreak",
//         valign:
//           "middle",
//       },

//       headStyles: {
//         fillColor: TEAL,
//         textColor: WHITE,
//         fontStyle: "bold",
//         fontSize:
//           tableFontSize,
//         halign: "center",
//         valign: "middle",
//         cellPadding:
//           cellPadding + 0.3,
//       },

//       alternateRowStyles: {
//         fillColor: [
//           248,
//           250,
//           251,
//         ],
//       },

//       didParseCell:
//         (data) => {
//           if (
//             data.section ===
//             "body"
//           ) {
//             const row =
//               reportData[
//                 data.row.index
//               ];

//             if (
//               isMonthlyManagementReport &&
//               row
//             ) {
//               if (
//                 [
//                   "Net Fees Due",
//                   "Total Fee Collection",
//                   "Total Cash Received",
//                   "Closing Outstanding",
//                 ].includes(
//                   row.Report
//                 )
//               ) {
//                 data.cell.styles.fontStyle =
//                   "bold";
//                 data.cell.styles.fillColor =
//                   [
//                     232,
//                     243,
//                     247,
//                   ];
//               }

//               if (
//                 row.Report ===
//                 "Overdue Rate"
//               ) {
//                 data.cell.styles.fontStyle =
//                   "bold";
//                 data.cell.styles.fillColor =
//                   [
//                     232,
//                     243,
//                     247,
//                   ];
//               }

//               if (
//                 row.Report ===
//                 "Variance vs Fees Due"
//               ) {
//                 data.cell.styles.fillColor =
//                   [
//                     241,
//                     247,
//                     226,
//                   ];
//               }
//             }
//           }
//         },

//       didDrawPage:
//         (data) => {
//           drawPageHeader(
//             doc.internal.getNumberOfPages()
//           );
//         },

//       horizontalPageBreak:
//         false,

//       tableWidth:
//         "auto",

//       showHead:
//         "everyPage",
//     });

//     // -----------------------------------------------------
//     // OPTIONAL NOTES
//     // -----------------------------------------------------

//     let finalY =
//       doc.lastAutoTable?.finalY ||
//       y;

//     if (
//       isMonthlyManagementReport &&
//       finalY <
//         pageHeight - 28
//     ) {
//       finalY += 4;

//       doc.setFont(
//         "helvetica",
//         "italic"
//       );

//       doc.setFontSize(5.3);

//       doc.setTextColor(
//         ...MUTED
//       );

//       doc.text(
//         "Management view: current-month collection is separated from arrears collection; overdue amounts are based on unpaid dues past their due date.",
//         left,
//         finalY
//       );
//     }

//     // -----------------------------------------------------
//     // SAVE
//     // -----------------------------------------------------

//     const safeName =
//       reportType
//         .toLowerCase()
//         .replace(
//           /[^a-z0-9]+/g,
//           "_"
//         )
//         .replace(
//           /^_+|_+$/g,
//           ""
//         );

//     doc.save(
//       `${safeName}_report_${
//         new Date()
//           .toISOString()
//           .split("T")[0]
//       }.pdf`
//     );

//     toast.success(
//       "PDF exported successfully"
//     );
//   };

//   // =====================================================
//   // RENDER
//   // =====================================================

//   return (
//     <div className="space-y-4">

//       {/* =================================================
//           REPORT FILTER CARD
//       ================================================= */}

//       <Card className="border-border/60">

//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">

//           <div>

//             <CardTitle className="font-display text-base flex items-center gap-2">

//               <FileBarChart2 className="h-4 w-4 text-primary" />

//               {activeReport.label}

//             </CardTitle>

//             <CardDescription>

//               {activeReport.description}

//               {components.length >
//                 0 && (
//                 <span className="ml-2 text-xs text-muted-foreground">
//                   ·{" "}
//                   {
//                     components.length
//                   }{" "}
//                   fee components
//                 </span>
//               )}

//             </CardDescription>

//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() =>
//               setShowFilters(
//                 !showFilters
//               )
//             }
//           >
//             {showFilters
//               ? "Hide Filters"
//               : "Show Filters"}
//           </Button>

//         </CardHeader>

//         {showFilters && (
//           <CardContent className="pt-0 space-y-3">

//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">

//               {/* REPORT TYPE */}

//               <FF label="Report Type">

//                 <Select
//                   value={reportType}
//                   onValueChange={
//                     handleReportTypeChange
//                   }
//                 >

//                   <SelectTrigger className="h-9">

//                     <SelectValue placeholder="Select report" />

//                   </SelectTrigger>

//                   <SelectContent>

//                     {REPORT_TYPES.map(
//                       (rt) => (
//                         <SelectItem
//                           key={
//                             rt.value
//                           }
//                           value={
//                             rt.value
//                           }
//                         >
//                           {rt.label}
//                         </SelectItem>
//                       )
//                     )}

//                   </SelectContent>

//                 </Select>

//               </FF>

//               {/* ACADEMIC YEAR */}

//               {visibleFilters.academicYear && (
//                 <FF label="Academic Year">

//                   <Select
//                     value={
//                       academicYear
//                     }
//                     onValueChange={
//                       setAcademicYear
//                     }
//                   >

//                     <SelectTrigger className="h-9">

//                       <SelectValue placeholder="Select year" />

//                     </SelectTrigger>

//                     <SelectContent>

//                       {academicYears.map(
//                         (year) => (
//                           <SelectItem
//                             key={year}
//                             value={year}
//                           >
//                             {year}
//                           </SelectItem>
//                         )
//                       )}

//                     </SelectContent>

//                   </Select>

//                 </FF>
//               )}

//               {/* STUDENT */}

//               {visibleFilters.student && (
//                 <div className="space-y-1.5 relative">

//                   <Label className="text-xs text-muted-foreground">
//                     Student
//                   </Label>

//                   <Input
//                     placeholder="Search by name, student no or admission no..."
//                     value={
//                       studentQuery
//                     }
//                     onChange={(e) => {
//                       const value =
//                         e.target
//                           .value;

//                       setStudentQuery(
//                         value
//                       );

//                       if (!value) {
//                         setStudentUuid(
//                           ""
//                         );
//                       }
//                     }}
//                     className="h-9"
//                   />

//                   {studentQuery &&
//                     !studentUuid &&
//                     matchingStudents.length >
//                       0 && (
//                       <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden max-h-52 overflow-y-auto">

//                         {matchingStudents.map(
//                           (student) => (
//                             <button
//                               key={
//                                 student.student_uuid
//                               }
//                               type="button"
//                               className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
//                               onClick={() =>
//                                 handleStudentSelect(
//                                   student
//                                 )
//                               }
//                             >

//                               <span>
//                                 {
//                                   student.full_name
//                                 }
//                               </span>

//                               <span className="text-xs text-muted-foreground">

//                                 {
//                                   student.class_name
//                                 }

//                                 {student.section_name
//                                   ? `-${student.section_name}`
//                                   : ""}

//                               </span>

//                             </button>
//                           )
//                         )}

//                       </div>
//                     )}

//                   {studentUuid && (
//                     <div className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 rounded-md px-2 py-1 w-fit">

//                       <Check className="h-3 w-3" />

//                       <span className="font-medium">
//                         {studentQuery}
//                       </span>

//                       <button
//                         type="button"
//                         className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
//                         onClick={() => {
//                           setStudentUuid(
//                             ""
//                           );

//                           setStudentQuery(
//                             ""
//                           );

//                           setClassUuid(
//                             "all"
//                           );

//                           setSectionUuid(
//                             "all"
//                           );
//                         }}
//                       >

//                         <X className="h-3 w-3" />

//                       </button>

//                     </div>
//                   )}

//                 </div>
//               )}

//               {/* CLASS */}

//               {visibleFilters.class && (
//                 <FF label="Class">

//                   <Select
//                     value={classUuid}
//                     onValueChange={(
//                       value
//                     ) => {
//                       setClassUuid(
//                         value
//                       );

//                       setSectionUuid(
//                         "all"
//                       );
//                     }}
//                   >

//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Classes" />
//                     </SelectTrigger>

//                     <SelectContent>

//                       <SelectItem value="all">
//                         All Classes
//                       </SelectItem>

//                       {classes.map(
//                         (item) => (
//                           <SelectItem
//                             key={
//                               item.uuid
//                             }
//                             value={
//                               item.uuid
//                             }
//                           >
//                             {item.name}
//                           </SelectItem>
//                         )
//                       )}

//                     </SelectContent>

//                   </Select>

//                 </FF>
//               )}

//               {/* SECTION */}

//               {visibleFilters.section && (
//                 <FF label="Section">

//                   <Select
//                     value={
//                       sectionUuid
//                     }
//                     onValueChange={
//                       setSectionUuid
//                     }
//                   >

//                     <SelectTrigger className="h-9">
//                       <SelectValue placeholder="All Sections" />
//                     </SelectTrigger>

//                     <SelectContent>

//                       <SelectItem value="all">
//                         All Sections
//                       </SelectItem>

//                       {sections.map(
//                         (item) => (
//                           <SelectItem
//                             key={
//                               item.uuid
//                             }
//                             value={
//                               item.uuid
//                             }
//                           >
//                             {item.name}
//                           </SelectItem>
//                         )
//                       )}

//                     </SelectContent>

//                   </Select>

//                 </FF>
//               )}

//               {/* FROM / TO */}

//               {visibleFilters.dateRange && (
//                 <>
//                   <FF label="From Date">

//                     <Input
//                       type="date"
//                       value={fromDate}
//                       onChange={(e) =>
//                         setFromDate(
//                           e.target
//                             .value
//                         )
//                       }
//                       className="h-9"
//                     />

//                   </FF>

//                   <FF label="To Date">

//                     <Input
//                       type="date"
//                       value={toDate}
//                       onChange={(e) =>
//                         setToDate(
//                           e.target
//                             .value
//                         )
//                       }
//                       className="h-9"
//                     />

//                   </FF>
//                 </>
//               )}

//               {/* COLLECTION DATE */}

//               {visibleFilters.collectionDate && (
//                 <FF label="Collection Date">

//                   <Input
//                     type="date"
//                     value={
//                       collectionDate
//                     }
//                     onChange={(e) =>
//                       setCollectionDate(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="h-9"
//                   />

//                 </FF>
//               )}

//               {/* PAYMENT STATUS */}

//               {visibleFilters.paymentStatus && (
//                 <FF label="Payment Status">

//                   <Select
//                     value={
//                       paymentStatus
//                     }
//                     onValueChange={
//                       setPaymentStatus
//                     }
//                   >

//                     <SelectTrigger className="h-9">

//                       <SelectValue placeholder="All Status" />

//                     </SelectTrigger>

//                     <SelectContent>

//                       {statusOptionsForReport.map(
//                         (status) => (
//                           <SelectItem
//                             key={
//                               status.value
//                             }
//                             value={
//                               status.value
//                             }
//                           >
//                             {
//                               status.label
//                             }
//                           </SelectItem>
//                         )
//                       )}

//                     </SelectContent>

//                   </Select>

//                 </FF>
//               )}

//               {/* BUTTONS */}

//               <div className="flex items-end gap-2">

//                 <Button
//                   size="sm"
//                   className="gradient-primary border-0 flex-1"
//                   onClick={
//                     fetchReport
//                   }
//                   disabled={
//                     loading
//                   }
//                 >

//                   <RefreshCcw
//                     className={`h-4 w-4 ${
//                       loading
//                         ? "animate-spin"
//                         : ""
//                     }`}
//                   />

//                   {loading
//                     ? "Loading..."
//                     : "Generate"}

//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={
//                     clearFilters
//                   }
//                   disabled={
//                     loading
//                   }
//                 >
//                   Clear
//                 </Button>

//               </div>

//             </div>

//           </CardContent>
//         )}

//       </Card>

//       {/* =================================================
//           TOTAL CARDS
//       ================================================= */}

//       {totals.length > 0 && (
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">

//           {totals
//             .slice(0, 7)
//             .map((total) => (
//               <div
//                 key={
//                   total.label
//                 }
//                 className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center"
//               >

//                 <div className="text-xs text-muted-foreground">
//                   {total.label}
//                 </div>

//                 <div className="text-sm font-semibold">
//                   {total.value}
//                 </div>

//               </div>
//             ))}

//         </div>
//       )}

//       {/* =================================================
//           ERROR
//       ================================================= */}

//       {error && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">

//           <AlertCircle className="h-4 w-4 inline mr-2" />

//           {error}

//         </div>
//       )}

//       {/* =================================================
//           REPORT TABLE
//       ================================================= */}

//       <Card className="border-border/60">

//         <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">

//           <div>

//             <CardTitle className="font-display text-base">

//               {isMonthlyManagementReport
//                 ? "Fee Collection — Monthly Management Report"
//                 : "Report Data"}

//               <span className="ml-2 text-sm font-normal text-muted-foreground">
//                 {isMonthlyManagementReport
//                   ? "15 metrics"
//                   : `${reportData.length} records`}
//               </span>

//             </CardTitle>

//           </div>

//           <div className="flex gap-2">

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={
//                 exportExcel
//               }
//               disabled={
//                 !reportData.length ||
//                 loading
//               }
//             >

//               <Download className="h-4 w-4" />

//               Excel

//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={
//                 exportPDF
//               }
//               disabled={
//                 !reportData.length ||
//                 loading
//               }
//             >

//               <FileText className="h-4 w-4" />

//               PDF

//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={
//                 fetchReport
//               }
//               disabled={
//                 loading
//               }
//             >

//               <RefreshCcw
//                 className={`h-4 w-4 ${
//                   loading
//                     ? "animate-spin"
//                     : ""
//                 }`}
//               />

//             </Button>

//           </div>

//         </CardHeader>

//         <CardContent className="p-0 overflow-x-auto">

//           <div className="max-h-[600px] overflow-y-auto">

//             <Table>

//               <TableHeader>

//                 <TableRow className="sticky top-0 bg-background z-10">

//                   {columns.map(
//                     (column) => (
//                       <TableHead
//                         key={
//                           column
//                         }
//                         className={`whitespace-nowrap text-xs font-semibold ${
//                           isMonthlyManagementReport &&
//                           column ===
//                             "Report"
//                             ? "sticky left-0 bg-background z-20 min-w-[240px]"
//                             : "text-right"
//                         }`}
//                       >
//                         {column}
//                       </TableHead>
//                     )
//                   )}

//                 </TableRow>

//               </TableHeader>

//               <TableBody>

//                 {loading ? (
//                   <TableRow>

//                     <TableCell
//                       colSpan={
//                         columns.length ||
//                         1
//                       }
//                       className="text-center py-8"
//                     >

//                       <div className="flex items-center justify-center gap-2 text-muted-foreground">

//                         <RefreshCcw className="h-4 w-4 animate-spin" />

//                         Loading report...

//                       </div>

//                     </TableCell>

//                   </TableRow>
//                 ) : reportData.length ===
//                   0 ? (
//                   <TableRow>

//                     <TableCell
//                       colSpan={
//                         columns.length ||
//                         1
//                       }
//                       className="text-center py-8 text-muted-foreground"
//                     >
//                       No data found. Adjust your filters and click "Generate".
//                     </TableCell>

//                   </TableRow>
//                 ) : (
//                   reportData.map(
//                     (
//                       row,
//                       index
//                     ) => {

//                       const isManagementTotal =
//                         isMonthlyManagementReport &&
//                         [
//                           "Net Fees Due",
//                           "Total Fee Collection",
//                           "Total Cash Received",
//                           "Closing Outstanding",
//                         ].includes(
//                           row.Report
//                         );

//                       const isManagementRate =
//                         isMonthlyManagementReport &&
//                         [
//                           "Collection Rate",
//                           "Overdue Rate",
//                         ].includes(
//                           row.Report
//                         );

//                       return (
//                         <TableRow
//                           key={
//                             index
//                           }
//                           className={`
//                             hover:bg-muted/30
//                             ${
//                               isManagementTotal
//                                 ? "font-semibold bg-muted/40"
//                                 : ""
//                             }
//                           `}
//                         >

//                           {columns.map(
//                             (
//                               column
//                             ) => {

//                               const value =
//                                 row[
//                                   column
//                                 ];

//                               const isComponent =
//                                 components.includes(
//                                   column
//                                 );

//                               const isMonthlyMoney =
//                                 isMonthlyManagementReport &&
//                                 column !==
//                                   "Report" &&
//                                 MONTHLY_MONEY_ROWS.includes(
//                                   row.Report
//                                 );

//                               const isMonthlyPercent =
//                                 isMonthlyManagementReport &&
//                                 column !==
//                                   "Report" &&
//                                 MONTHLY_PERCENT_ROWS.includes(
//                                   row.Report
//                                 );

//                               const isMoney =
//                                 isComponent ||
//                                 column.includes(
//                                   "₹"
//                                 ) ||
//                                 column.includes(
//                                   "Gross"
//                                 ) ||
//                                 column.includes(
//                                   "Discount"
//                                 ) ||
//                                 column.includes(
//                                   "Late"
//                                 ) ||
//                                 column.includes(
//                                   "Net"
//                                 ) ||
//                                 column.includes(
//                                   "Paid"
//                                 ) ||
//                                 column.includes(
//                                   "Pending"
//                                 ) ||
//                                 column ===
//                                   "Online" ||
//                                 column ===
//                                   "Cheque" ||
//                                 column ===
//                                   "Cash" ||
//                                 column ===
//                                   "Bank Transfer" ||
//                                 column ===
//                                   "Other Settlement" ||
//                                 column ===
//                                   "Cancelled" ||
//                                 column ===
//                                   "Swipe" ||
//                                 column ===
//                                   "DD" ||
//                                 column ===
//                                   "Paytm" ||
//                                 column ===
//                                   "Adjust from Student Account balance" ||
//                                 column ===
//                                   "NEFT" ||
//                                 column ===
//                                   "NSO" ||
//                                 column ===
//                                   "Online Manual" ||
//                                 column ===
//                                   "Adjust from Credit Note" ||
//                                 column ===
//                                   "UPI" ||
//                                 column ===
//                                   "Total (₹)" ||
//                                 isMonthlyMoney;

//                               const isPending =
//                                 column ===
//                                 "Pending (₹)";

//                               return (
//                                 <TableCell
//                                   key={
//                                     column
//                                   }
//                                   className={`
//                                     whitespace-nowrap text-sm
//                                     ${
//                                       isMoney &&
//                                       typeof value ===
//                                         "number"
//                                         ? "font-mono"
//                                         : ""
//                                     }
//                                     ${
//                                       isPending &&
//                                       typeof value ===
//                                         "number" &&
//                                       value >
//                                         0
//                                         ? "text-warning font-semibold"
//                                         : ""
//                                     }
//                                     ${
//                                       isManagementRate
//                                         ? "text-right"
//                                         : ""
//                                     }
//                                     ${
//                                       isMonthlyManagementReport &&
//                                       column ===
//                                         "Report"
//                                         ? "sticky left-0 bg-background z-10 font-medium min-w-[240px]"
//                                         : ""
//                                     }
//                                   `}
//                                 >

//                                   {value ===
//                                     null ||
//                                   value ===
//                                     undefined ||
//                                   value ===
//                                     ""
//                                     ? "—"
//                                     : isMonthlyPercent &&
//                                       typeof value ===
//                                         "number"
//                                     ? `${value.toFixed(
//                                         1
//                                       )}%`
//                                     : typeof value ===
//                                         "number" &&
//                                       isMoney
//                                     ? inr(
//                                         value
//                                       )
//                                     : value}

//                                 </TableCell>
//                               );
//                             }
//                           )}

//                         </TableRow>
//                       );
//                     }
//                   )
//                 )}

//               </TableBody>

//             </Table>

//           </div>

//         </CardContent>

//       </Card>

//       {/* =================================================
//           FEE COMPONENTS
//       ================================================= */}

//       {components.length >
//         0 &&
//         reportData.length >
//           0 && (
//           <Card className="border-border/60">

//             <CardHeader className="pb-3">

//               <CardTitle className="font-display text-base">
//                 Fee Components
//               </CardTitle>

//               <CardDescription>
//                 Components tracked in this report
//               </CardDescription>

//             </CardHeader>

//             <CardContent>

//               <div className="flex flex-wrap gap-2">

//                 {components.map(
//                   (component) => (
//                     <Badge
//                       key={
//                         component
//                       }
//                       variant="secondary"
//                       className="text-xs"
//                     >
//                       {
//                         component
//                       }
//                     </Badge>
//                   )
//                 )}

//               </div>

//             </CardContent>

//           </Card>
//         )}

//     </div>
//   );
// }

function ReportsPanel({ students }) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState([]);
  const [components, setComponents] = useState([]);
  const [error, setError] = useState("");

  // =====================================================
  // REPORT TYPES
  // =====================================================

  const REPORT_TYPES = [
    {
      value: "MASTER_FEES",
      label: "Master Student Fees Report (Paid / Unpaid)",
      description: "Paid vs unpaid breakdown across all students",
    },

    {
      value: "DAILY_COLLECTION",
      label: "Daily Collections Report",
      description: "Payments collected on a specific day",
    },

    {
      value: "DAILY_COLLECTION_HEAD",
      label: "Daily Collection Head Report",
      description:
        "Collection head-wise payment mode collection for the selected day",
    },

    {
      value: "FEE_PENDING",
      label: "Fee Pending Report",
      description: "Students with pending / overdue fees",
    },

    // =====================================================
    // NEW MONTHLY MANAGEMENT REPORT
    // =====================================================

    {
      value: "YEAR_TO_DATE",
      label: "Fee Collection — Year-to-Date Report",
      description:
        "Monthly fees due, collection, arrears, outstanding and overdue management report",
    },

    {
      value: "RETRACTED_INVOICE",
      label: "Retracted Invoice Report",
      description: "Invoices that were retracted / cancelled",
    },
  ];

  const [reportType, setReportType] = useState("MONTHLY_FEE_MANAGEMENT");

  const activeReport = useMemo(
    () =>
      REPORT_TYPES.find((r) => r.value === reportType) ||
      REPORT_TYPES[0],
    [reportType]
  );

  // =====================================================
  // FILTER STATES
  // =====================================================

  const [academicYear, setAcademicYear] = useState(
    ACADEMIC_YEAR
  );

  const [studentUuid, setStudentUuid] = useState("");
  const [studentQuery, setStudentQuery] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [classUuid, setClassUuid] = useState("all");
  const [sectionUuid, setSectionUuid] = useState("all");

  const [paymentStatus, setPaymentStatus] =
    useState("all");

  const [showFilters, setShowFilters] = useState(true);

  // =====================================================
  // REPORT TYPE CHECK
  // =====================================================

  const isMonthlyManagementReport =
    reportType === "MONTHLY_FEE_MANAGEMENT";

  // =====================================================
  // PER REPORT FILTER VISIBILITY
  // =====================================================

  const visibleFilters = useMemo(() => {
    switch (reportType) {
      case "MASTER_FEES":
        return {
          academicYear: true,
          student: true,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: false,
          paymentStatus: true,
        };

      case "DAILY_COLLECTION":
      case "DAILY_COLLECTION_HEAD":
        return {
          academicYear: false,
          student: false,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: true,
          paymentStatus: false,
        };

      case "FEE_PENDING":
        return {
          academicYear: true,
          student: true,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: false,
          paymentStatus: false,
        };

      // =====================================================
      // MONTHLY MANAGEMENT
      // =====================================================

      case "MONTHLY_FEE_MANAGEMENT":
        return {
          academicYear: true,
          student: false,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: false,
          paymentStatus: false,
        };

      case "RETRACTED_INVOICE":
        return {
          academicYear: true,
          student: false,
          class: true,
          section: true,
          dateRange: true,
          collectionDate: false,
          paymentStatus: false,
        };

      default:
        return {
          academicYear: true,
          student: true,
          class: true,
          section: true,
          dateRange: false,
          collectionDate: false,
          paymentStatus: true,
        };
    }
  }, [reportType]);

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const statusOptionsForReport = useMemo(() => {
    if (reportType === "MASTER_FEES") {
      return [
        { value: "all", label: "All Status" },
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Unpaid" },
      ];
    }

    return [
      { value: "all", label: "All Status" },
      { value: "PAID", label: "Paid" },
      { value: "PARTIAL", label: "Partial" },
      { value: "PENDING", label: "Pending" },
      { value: "OVERDUE", label: "Overdue" },
      { value: "ADVANCE", label: "Advance" },
    ];
  }, [reportType]);

  // =====================================================
  // REPORT TYPE CHANGE
  // =====================================================

  const handleReportTypeChange = (value) => {
    setReportType(value);
    setError("");
    setReportData([]);
    setTotals([]);
    setComponents([]);

    if (
      value === "DAILY_COLLECTION" ||
      value === "DAILY_COLLECTION_HEAD"
    ) {
      setFromDate("");
      setToDate("");
      setStudentUuid("");
      setStudentQuery("");
      setPaymentStatus("all");
    }

    if (value === "FEE_PENDING") {
      setPaymentStatus("PENDING");
    }

    if (value === "MASTER_FEES") {
      setFromDate("");
      setToDate("");
    }

    if (value === "MONTHLY_FEE_MANAGEMENT") {
      setStudentUuid("");
      setStudentQuery("");
      setFromDate("");
      setToDate("");
      setCollectionDate("");
      setPaymentStatus("all");
    }

    if (value === "RETRACTED_INVOICE") {
      setStudentUuid("");
      setStudentQuery("");
      setPaymentStatus("all");
    }
  };

  // =====================================================
  // ACADEMIC YEARS
  // =====================================================

  const academicYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;

      years.push(
        `${year}-${String(year + 1).slice(-2)}`
      );
    }

    return years;
  }, []);

  // =====================================================
  // CLASSES
  // =====================================================

  const classes = useMemo(() => {
    const classMap = new Map();

    (students || []).forEach((student) => {
      if (
        student.class_uuid &&
        student.class_name
      ) {
        classMap.set(student.class_uuid, {
          uuid: student.class_uuid,
          name: student.class_name,
        });
      }
    });

    return Array.from(classMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [students]);

  // =====================================================
  // SECTIONS
  // =====================================================

  const sections = useMemo(() => {
    const sectionMap = new Map();

    (students || []).forEach((student) => {
      if (
        student.section_uuid &&
        student.section_name
      ) {
        sectionMap.set(
          student.section_uuid,
          {
            uuid: student.section_uuid,
            name: student.section_name,
          }
        );
      }
    });

    return Array.from(sectionMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [students]);

  // =====================================================
  // STUDENT SEARCH
  // =====================================================

  const matchingStudents = useMemo(() => {
    if (!studentQuery.trim()) {
      return [];
    }

    const q = studentQuery
      .toLowerCase()
      .trim();

    return (students || [])
      .filter((student) => {
        const name =
          student.full_name?.toLowerCase() || "";

        const studentNo =
          student.student_no?.toLowerCase() || "";

        const admissionNo =
          student.admission_no?.toLowerCase() || "";

        return (
          name.includes(q) ||
          studentNo.includes(q) ||
          admissionNo.includes(q)
        );
      })
      .slice(0, 8);
  }, [studentQuery, students]);

  // =====================================================
  // PAYMENT MODE NORMALIZER
  // =====================================================

  const getPaymentColumn = (mode) => {
    const value = String(mode || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    switch (value) {
      case "CASH":
        return "Cash";

      case "CHEQUE":
      case "CHECK":
        return "Cheque";

      case "BANK_TRANSFER":
      case "BANKTRANSFER":
        return "Bank Transfer";

      case "CARD":
      case "SWIPE":
        return "Swipe";

      case "DD":
      case "DEMAND_DRAFT":
        return "DD";

      case "PAYTM":
        return "Paytm";

      case "NEFT":
        return "NEFT";

      case "NSO":
        return "NSO";

      case "ONLINE_MANUAL":
        return "Online Manual";

      case "CREDIT_NOTE":
      case "ADJUST_FROM_CREDIT_NOTE":
        return "Adjust from Credit Note";

      case "STUDENT_ACCOUNT":
      case "ADJUST_FROM_STUDENT_ACCOUNT":
        return "Adjust from Student Account balance";

      case "UPI":
        return "UPI";

      case "RAZORPAY":
      case "NETBANKING":
      case "NET_BANKING":
      case "ONLINE":
        return "Online";

      case "OTHER_SETTLEMENT":
        return "Other Settlement";

      case "CANCELLED":
        return "Cancelled";

      default:
        return "Online";
    }
  };

  // =====================================================
  // DAILY COLLECTION HEAD PAYMENT COLUMNS
  // =====================================================

  const DAILY_HEAD_COLUMNS = [
    "Online",
    "Cheque",
    "Cash",
    "Bank Transfer",
    "Other Settlement",
    "Cancelled",
    "Swipe",
    "DD",
    "Paytm",
    "Adjust from Student Account balance",
    "NEFT",
    "NSO",
    "Online Manual",
    "Adjust from Credit Note",
    "UPI",
  ];

  // =====================================================
  // MONTHLY MANAGEMENT COLUMNS
  // =====================================================

  const MONTHLY_COLUMNS = [
    "Report",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "YTD",
  ];

  const MONTHLY_MONEY_ROWS = [
    "Opening Outstanding",
    "Gross Fees Due",
    "Concessions / Waivers",
    "Net Fees Due",
    "Current Month Fee Collection",
    "Arrears Collection",
    "Total Fee Collection",
    "Late Fee / Penalty Collected",
    "Total Cash Received",
    "Current Month Pending",
    "Closing Outstanding",
    "Variance vs Fees Due",
    "Overdue Amount",
  ];

  const MONTHLY_PERCENT_ROWS = [
    "Collection Rate",
    "Overdue Rate",
  ];

  // =====================================================
  // GET TRANSACTION DETAIL AMOUNT
  // =====================================================

  const getTransactionComponentDetails = (txn) => {
    if (
      Array.isArray(txn.details) &&
      txn.details.length > 0
    ) {
      return txn.details;
    }

    return [];
  };

  // =====================================================
  // FETCH REPORT
  // =====================================================

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      // =================================================
      // DAILY COLLECTION HEAD REPORT
      // =================================================

      if (
        reportType ===
        "DAILY_COLLECTION_HEAD"
      ) {
        const response =
          await getPayments({
            limit: 500,
          });

        const payments =
          response?.data?.data ??
          response?.data ??
          [];

        const selectedDate =
          collectionDate ||
          new Date()
            .toISOString()
            .split("T")[0];

        const dailyPayments =
          payments.filter((txn) => {
            if (
              txn.transaction_status !==
              "SUCCESS"
            ) {
              return false;
            }

            if (!txn.created_at) {
              return false;
            }

            const paymentDate =
              new Date(
                txn.created_at
              ).toLocaleDateString(
                "en-CA"
              );

            return (
              paymentDate ===
              selectedDate
            );
          });

        const filteredPayments =
          dailyPayments.filter(
            (txn) => {
              const student =
                (students || []).find(
                  (s) =>
                    s.student_uuid ===
                    txn.student_uuid
                );

              if (!student) {
                return false;
              }

              if (
                classUuid !== "all" &&
                classUuid &&
                student.class_uuid !==
                  classUuid
              ) {
                return false;
              }

              if (
                sectionUuid !== "all" &&
                sectionUuid &&
                student.section_uuid !==
                  sectionUuid
              ) {
                return false;
              }

              return true;
            }
          );

        const collectionMap =
          new Map();

        const ensureRow =
          (collectionHead) => {
            if (
              !collectionMap.has(
                collectionHead
              )
            ) {
              const row = {
                "Collection Head":
                  collectionHead,
                Date: selectedDate,
              };

              DAILY_HEAD_COLUMNS.forEach(
                (column) => {
                  row[column] = 0;
                }
              );

              collectionMap.set(
                collectionHead,
                row
              );
            }

            return collectionMap.get(
              collectionHead
            );
          };

        filteredPayments.forEach(
          (txn) => {
            const paymentColumn =
              getPaymentColumn(
                txn.payment_mode
              );

            const details =
              getTransactionComponentDetails(
                txn
              );

            if (details.length > 0) {
              details.forEach(
                (detail) => {
                  const collectionHead =
                    detail.component_name ||
                    detail.name ||
                    "Other Income";

                  const amount =
                    Number(
                      detail.amount ??
                        detail.paid_amount ??
                        0
                    );

                  if (
                    !Number.isFinite(
                      amount
                    ) ||
                    amount <= 0
                  ) {
                    return;
                  }

                  const row =
                    ensureRow(
                      collectionHead
                    );

                  row[paymentColumn] =
                    Number(
                      row[
                        paymentColumn
                      ] || 0
                    ) + amount;
                }
              );
            }

            const lateFee = Number(
              txn.late_fee || 0
            );

            if (lateFee > 0) {
              const hasLateFeeDetail =
                details.some(
                  (detail) =>
                    String(
                      detail.component_name ||
                        detail.name ||
                        ""
                    )
                      .toLowerCase()
                      .includes("late")
                );

              if (!hasLateFeeDetail) {
                const row =
                  ensureRow(
                    "Late Fee"
                  );

                row[paymentColumn] =
                  Number(
                    row[
                      paymentColumn
                    ] || 0
                  ) + lateFee;
              }
            }

            if (
              details.length === 0 &&
              lateFee <= 0
            ) {
              const amount = Number(
                txn.total_amount || 0
              );

              if (amount > 0) {
                const row =
                  ensureRow(
                    "Other Income"
                  );

                row[paymentColumn] =
                  Number(
                    row[
                      paymentColumn
                    ] || 0
                  ) + amount;
              }
            }
          }
        );

        const displayDate =
          new Date(
            `${selectedDate}T00:00:00`
          ).toLocaleDateString(
            "en-GB"
          );

        const collectionRows =
          Array.from(
            collectionMap.values()
          ).map((row, index) => {
            const formattedRow = {
              "Sr No": index + 1,
              "Collection Head":
                row[
                  "Collection Head"
                ],
              Date: displayDate,
            };

            let total = 0;

            DAILY_HEAD_COLUMNS.forEach(
              (column) => {
                const amount = Number(
                  row[column] || 0
                );

                formattedRow[column] =
                  amount;

                total += amount;
              }
            );

            formattedRow[
              "Total (₹)"
            ] = total;

            return formattedRow;
          });

        if (
          collectionRows.length > 0
        ) {
          const totalRow = {
            "Sr No": "",
            "Collection Head":
              "Total",
            Date: "",
          };

          let grandTotal = 0;

          DAILY_HEAD_COLUMNS.forEach(
            (column) => {
              const total =
                collectionRows.reduce(
                  (sum, row) =>
                    sum +
                    Number(
                      row[column] || 0
                    ),
                  0
                );

              totalRow[column] =
                total;

              grandTotal += total;
            }
          );

          totalRow[
            "Total (₹)"
          ] = grandTotal;

          collectionRows.push(
            totalRow
          );
        }

        setComponents([]);
        setReportData(
          collectionRows
        );

        const grandCollection =
          collectionRows.length > 0
            ? Number(
                collectionRows[
                  collectionRows.length -
                    1
                ]["Total (₹)"] || 0
              )
            : 0;

        setTotals([
          {
            label:
              "Successful Payments",
            value:
              filteredPayments.length,
          },
          {
            label:
              "Collection Heads",
            value:
              collectionRows.length >
              0
                ? collectionRows.length -
                  1
                : 0,
          },
          {
            label:
              "Total Collection",
            value:
              inr(
                grandCollection
              ),
          },
        ]);

        return;
      }

      // =================================================
      // DAILY COLLECTION REPORT
      // =================================================

      if (
        reportType ===
        "DAILY_COLLECTION"
      ) {
        const response =
          await getPayments({
            limit: 500,
          });

        const payments =
          response?.data?.data ??
          response?.data ??
          [];

        const selectedDate =
          collectionDate ||
          new Date()
            .toISOString()
            .split("T")[0];

        const dailyPayments =
          payments.filter((txn) => {
            if (
              txn.transaction_status !==
              "SUCCESS"
            ) {
              return false;
            }

            if (!txn.created_at) {
              return false;
            }

            const paymentDate =
              new Date(
                txn.created_at
              ).toLocaleDateString(
                "en-CA"
              );

            return (
              paymentDate ===
              selectedDate
            );
          });

        const filteredPayments =
          dailyPayments.filter(
            (txn) => {
              const student =
                (students || []).find(
                  (s) =>
                    s.student_uuid ===
                    txn.student_uuid
                );

              if (!student) {
                return false;
              }

              if (
                classUuid !== "all" &&
                classUuid &&
                student.class_uuid !==
                  classUuid
              ) {
                return false;
              }

              if (
                sectionUuid !== "all" &&
                sectionUuid &&
                student.section_uuid !==
                  sectionUuid
              ) {
                return false;
              }

              return true;
            }
          );

        const formattedRows =
          filteredPayments.map(
            (txn, index) => {
              const student =
                (students || []).find(
                  (s) =>
                    s.student_uuid ===
                    txn.student_uuid
                ) || {};

              const grossAmount =
                Number(
                  txn.details?.reduce(
                    (
                      sum,
                      detail
                    ) =>
                      sum +
                      Number(
                        detail.amount ||
                          0
                      ),
                    0
                  ) ||
                    txn.total_amount ||
                    0
                );

              const discountAmount =
                Number(
                  txn.discount_amount ||
                    0
                );

              const lateFee = Number(
                txn.late_fee || 0
              );

              const paidAmount =
                Number(
                  txn.total_amount || 0
                );

              return {
                "Sr No": index + 1,

                Student:
                  txn.student_name ||
                  student.full_name ||
                  "—",

                Class:
                  student.class_name ||
                  "—",

                Section:
                  student.section_name ||
                  "—",

                "Admission No":
                  student.admission_no ||
                  txn.admission_number ||
                  "—",

                Invoice:
                  txn.invoice_number ||
                  txn.invoice_no ||
                  "—",

                Receipt:
                  txn.receipt_no ||
                  "—",

                "Gross (₹)":
                  grossAmount,

                "Discount (₹)":
                  discountAmount,

                "Late Fee (₹)":
                  lateFee,

                "Net (₹)":
                  paidAmount,

                "Paid (₹)":
                  paidAmount,

                "Pending (₹)": 0,

                "Payment Mode":
                  txn.payment_mode ||
                  "—",

                Reference:
                  txn.reference_number ||
                  txn.razorpay_payment_id ||
                  "—",

                "Payment Date":
                  txn.created_at
                    ? new Date(
                        txn.created_at
                      ).toLocaleString()
                    : "—",
              };
            }
          );

        setComponents([]);
        setReportData(
          formattedRows
        );

        const totalGross =
          filteredPayments.reduce(
            (sum, txn) =>
              sum +
              Number(
                txn.details?.reduce(
                  (
                    detailSum,
                    detail
                  ) =>
                    detailSum +
                    Number(
                      detail.amount ||
                        0
                    ),
                  0
                ) ||
                  txn.total_amount ||
                  0
              ),
            0
          );

        const totalDiscount =
          filteredPayments.reduce(
            (sum, txn) =>
              sum +
              Number(
                txn.discount_amount ||
                  0
              ),
            0
          );

        const totalLateFee =
          filteredPayments.reduce(
            (sum, txn) =>
              sum +
              Number(
                txn.late_fee || 0
              ),
            0
          );

        const totalPaid =
          filteredPayments.reduce(
            (sum, txn) =>
              sum +
              Number(
                txn.total_amount ||
                  0
              ),
            0
          );

        setTotals([
          {
            label: "Payments",
            value:
              filteredPayments.length,
          },
          {
            label: "Total Gross",
            value:
              inr(totalGross),
          },
          {
            label:
              "Total Discount",
            value:
              inr(totalDiscount),
          },
          {
            label:
              "Total Late Fee",
            value:
              inr(totalLateFee),
          },
          {
            label:
              "Total Collection",
            value:
              inr(totalPaid),
          },
        ]);

        return;
      }

      // =================================================
      // MONTHLY FEE MANAGEMENT REPORT
      // =================================================

      if (
        reportType ===
        "MONTHLY_FEE_MANAGEMENT"
      ) {
        const response =
          await getMonthlyFeeManagementReport(
            {
              academic_year:
                academicYear ||
                undefined,

              class_uuid:
                classUuid === "all"
                  ? undefined
                  : classUuid,

              section_uuid:
                sectionUuid === "all"
                  ? undefined
                  : sectionUuid,
            }
          );

        const body =
          response?.data ??
          response ??
          {};

        if (!body.success) {
          throw new Error(
            typeof body.message ===
              "string"
              ? body.message
              : describeErrorDetail(
                  body.message
                ) ||
                  "Failed to fetch monthly management report"
          );
        }

        const managementData =
          body.data || {};

        const ytd =
          body.ytd || {};

        const reportRows = [
          "Opening Outstanding",
          "Gross Fees Due",
          "Concessions / Waivers",
          "Net Fees Due",
          "Current Month Fee Collection",
          "Arrears Collection",
          "Total Fee Collection",
          "Late Fee / Penalty Collected",
          "Total Cash Received",
          "Current Month Pending",
          "Closing Outstanding",
          "Collection Rate",
          "Variance vs Fees Due",
          "Overdue Amount",
          "Overdue Rate",
        ];

        const formattedRows =
          reportRows.map(
            (reportName) => {
              const source =
                managementData[
                  reportName
                ] || {};

              const row = {
                Report: reportName,
              };

              MONTHLY_COLUMNS
                .filter(
                  (column) =>
                    column !==
                    "Report"
                )
                .forEach(
                  (month) => {
                    row[month] =
                      source[month] ??
                      0;
                  }
                );

              return row;
            }
          );

        setComponents([]);
        setReportData(
          formattedRows
        );

        // =================================================
        // KPI CARDS
        // =================================================

        const getYtdValue = (
          reportName,
          ytdKey
        ) => {
          return Number(
            managementData[
              reportName
            ]?.YTD ??
              ytd[ytdKey] ??
              0
          );
        };

        setTotals([
          {
            label:
              "Net Fees Due",
            value: inr(
              getYtdValue(
                "Net Fees Due",
                "net_fees_due"
              )
            ),
          },

          {
            label:
              "Current Collection",
            value: inr(
              getYtdValue(
                "Current Month Fee Collection",
                "current_month_collection"
              )
            ),
          },

          {
            label:
              "Arrears Collection",
            value: inr(
              getYtdValue(
                "Arrears Collection",
                "arrears_collection"
              )
            ),
          },

          {
            label:
              "Total Collection",
            value: inr(
              getYtdValue(
                "Total Fee Collection",
                "total_fee_collection"
              )
            ),
          },

          {
            label:
              "Closing Outstanding",
            value: inr(
              getYtdValue(
                "Closing Outstanding",
                "closing_outstanding"
              )
            ),
          },

          {
            label:
              "Overdue Amount",
            value: inr(
              getYtdValue(
                "Overdue Amount",
                "overdue_amount"
              )
            ),
          },

          {
            label:
              "Collection Rate",
            value:
              getYtdValue(
                "Collection Rate",
                "collection_rate"
              ).toFixed(1) +
              "%",
          },
        ]);

        return;
      }

      // =================================================
      // ALL OTHER REPORTS
      // =================================================

      const params = {
        report_type: reportType,

        academic_year:
          visibleFilters.academicYear
            ? academicYear ||
              undefined
            : undefined,

        student_uuid:
          visibleFilters.student
            ? studentUuid ||
              undefined
            : undefined,

        from_date:
          visibleFilters.dateRange
            ? fromDate ||
              undefined
            : undefined,

        to_date:
          visibleFilters.dateRange
            ? toDate ||
              undefined
            : undefined,

        collection_date:
          visibleFilters.collectionDate
            ? collectionDate ||
              undefined
            : undefined,

        class_uuid:
          classUuid === "all"
            ? undefined
            : classUuid,

        section_uuid:
          sectionUuid === "all"
            ? undefined
            : sectionUuid,

        payment_status:
          paymentStatus === "all"
            ? undefined
            : paymentStatus,
      };

      const response =
        await getStudentFeeReport(
          params
        );

      const body =
        response?.data ??
        response ??
        {};

      if (!body.success) {
        throw new Error(
          typeof body.message ===
            "string"
            ? body.message
            : describeErrorDetail(
                body.message
              ) ||
                "Failed to fetch report"
        );
      }

      const data =
        Array.isArray(body.data)
          ? body.data
          : [];

      const componentsList =
        Array.isArray(
          body.components
        )
          ? body.components
          : [];

      setComponents(
        componentsList
      );

      const formattedRows =
        data.map((row) => {
          const formattedRow = {
            "Sr No": row.sr_no,

            Student:
              row.student_name ||
              "—",

            Class:
              row.class_name ||
              "—",

            Section:
              row.section_name ||
              "—",

            "Admission No":
              row.admission_number ||
              "—",

            Invoice:
              row.invoice_number ||
              "—",

            Receipt:
              row.receipt_number ||
              "—",
          };

          componentsList.forEach(
            (component) => {
              const value =
                row.components?.[
                  component
                ];

              formattedRow[
                component
              ] =
                value === null ||
                value ===
                  undefined
                  ? null
                  : Number(value);
            }
          );

          formattedRow[
            "Gross (₹)"
          ] = Number(
            row.gross_amount || 0
          );

          formattedRow[
            "Discount (₹)"
          ] = Number(
            row.concession_amount ||
              0
          );

          formattedRow[
            "Late Fee (₹)"
          ] = Number(
            row.late_fee || 0
          );

          formattedRow[
            "Net (₹)"
          ] = Number(
            row.net_amount || 0
          );

          formattedRow[
            "Paid (₹)"
          ] = Number(
            row.paid_amount || 0
          );

          formattedRow[
            "Pending (₹)"
          ] = Number(
            row.pending_amount || 0
          );

          formattedRow[
            "Payment Mode"
          ] =
            row.payment_mode ||
            "—";

          formattedRow[
            "Reference"
          ] =
            row.reference_number ||
            "—";

          formattedRow[
            "Payment Date"
          ] = row.payment_date
            ? new Date(
                row.payment_date
              ).toLocaleDateString()
            : "—";

          formattedRow[
            "Due Date"
          ] = row.due_date
            ? new Date(
                row.due_date
              ).toLocaleDateString()
            : "—";

          formattedRow[
            "Invoice Date"
          ] = row.invoice_date
            ? new Date(
                row.invoice_date
              ).toLocaleDateString()
            : "—";

          if (
            reportType ===
            "RETRACTED_INVOICE"
          ) {
            formattedRow[
              "Retracted On"
            ] =
              row.retracted_at
                ? new Date(
                    row.retracted_at
                  ).toLocaleDateString()
                : "—";

            formattedRow[
              "Retracted By"
            ] =
              row.retracted_by ||
              "—";

            formattedRow[
              "Reason"
            ] =
              row.retraction_reason ||
              "—";
          }

          return formattedRow;
        });

      setReportData(
        formattedRows
      );

      const totalGross =
        data.reduce(
          (sum, row) =>
            sum +
            Number(
              row.gross_amount ||
                0
            ),
          0
        );

      const totalDiscount =
        data.reduce(
          (sum, row) =>
            sum +
            Number(
              row.concession_amount ||
                0
            ),
          0
        );

      const totalLateFee =
        data.reduce(
          (sum, row) =>
            sum +
            Number(
              row.late_fee || 0
            ),
          0
        );

      const totalNet =
        data.reduce(
          (sum, row) =>
            sum +
            Number(
              row.net_amount || 0
            ),
          0
        );

      const totalPaid =
        data.reduce(
          (sum, row) =>
            sum +
            Number(
              row.paid_amount ||
                0
            ),
          0
        );

      const totalPending =
        data.reduce(
          (sum, row) =>
            sum +
            Number(
              row.pending_amount ||
                0
            ),
          0
        );

      const componentTotals =
        {};

      componentsList.forEach(
        (component) => {
          componentTotals[
            component
          ] = data.reduce(
            (sum, row) =>
              sum +
              Number(
                row.components?.[
                  component
                ] || 0
              ),
            0
          );
        }
      );

      const totalCards = [
        {
          label: "Students",
          value: data.length,
        },
        {
          label: "Total Gross",
          value:
            inr(totalGross),
        },
        {
          label:
            "Total Discount",
          value:
            inr(totalDiscount),
        },
        {
          label:
            "Total Late Fee",
          value:
            inr(totalLateFee),
        },
        {
          label: "Total Net",
          value: inr(totalNet),
        },
        {
          label: "Total Paid",
          value:
            inr(totalPaid),
        },
        {
          label:
            "Total Pending",
          value:
            inr(totalPending),
        },
      ];

      componentsList.forEach(
        (component) => {
          totalCards.push({
            label: component,
            value: inr(
              componentTotals[
                component
              ] || 0
            ),
          });
        }
      );

      setTotals(
        totalCards
      );
    } catch (err) {
      console.error(
        "Report Error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load report"
        )
      );

      setReportData([]);
      setTotals([]);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL / REPORT TYPE LOAD
  // =====================================================

  useEffect(() => {
    fetchReport();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReport();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  useEffect(() => {
    if (
      reportType ===
        "DAILY_COLLECTION" ||
      reportType ===
        "DAILY_COLLECTION_HEAD"
    ) {
      fetchReport();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionDate]);

  // =====================================================
  // STUDENT SELECT
  // =====================================================

  const handleStudentSelect =
    (student) => {
      setStudentUuid(
        student.student_uuid
      );

      setStudentQuery(
        student.full_name
      );

      if (student.class_uuid) {
        setClassUuid(
          student.class_uuid
        );
      }

      if (student.section_uuid) {
        setSectionUuid(
          student.section_uuid
        );
      }
    };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setStudentUuid("");
    setStudentQuery("");
    setFromDate("");
    setToDate("");

    setClassUuid("all");
    setSectionUuid("all");

    setPaymentStatus(
      reportType === "FEE_PENDING"
        ? "PENDING"
        : "all"
    );

    setCollectionDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setReportData([]);
    setTotals([]);
    setComponents([]);
    setError("");

    setTimeout(() => {
      fetchReport();
    }, 0);
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = useMemo(() => {
    if (
      isMonthlyManagementReport
    ) {
      return MONTHLY_COLUMNS;
    }

    if (!reportData.length) {
      return [];
    }

    return Object.keys(
      reportData[0]
    );
  }, [
    reportData,
    isMonthlyManagementReport,
  ]);

  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const exportExcel = () => {
    if (!reportData.length) {
      toast.error(
        "No data to export"
      );

      return;
    }

    let exportRows =
      reportData.map(
        (row) => {
          const exportRow = {
            ...row,
          };

          components.forEach(
            (component) => {
              if (
                exportRow[
                  component
                ] !== null &&
                exportRow[
                  component
                ] !== undefined
              ) {
                exportRow[
                  component
                ] = Number(
                  exportRow[
                    component
                  ]
                );
              }
            }
          );

          return exportRow;
        }
      );

    // =====================================================
    // MONTHLY REPORT EXPORT
    // =====================================================

    if (
      isMonthlyManagementReport
    ) {
      exportRows =
        reportData.map(
          (row) => {
            const exportRow = {};

            MONTHLY_COLUMNS.forEach(
              (column) => {
                exportRow[
                  column
                ] =
                  row[column] ??
                  0;
              }
            );

            return exportRow;
          }
        );
    }

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportRows
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isMonthlyManagementReport
        ? "Monthly Management"
        : activeReport.label.slice(
            0,
            31
          )
    );

    XLSX.writeFile(
      workbook,
      `${reportType.toLowerCase()}-${
        new Date()
          .toISOString()
          .split("T")[0]
      }.xlsx`
    );

    toast.success(
      "Report exported successfully"
    );
  };

  // =====================================================
  // PDF EXPORT
  // =====================================================

  const exportPDF = () => {
    if (!reportData.length) {
      toast.error(
        "No data to export"
      );

      return;
    }

    const doc = new jsPDF({
      orientation:
        "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);

    doc.text(
      activeReport.label,
      14,
      15
    );

    doc.setFontSize(9);

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      22
    );

    if (
      visibleFilters.academicYear
    ) {
      doc.text(
        `Academic Year: ${academicYear}`,
        14,
        28
      );
    }

    const pdfColumns =
      columns;

    const MONEY_COLUMN_NAMES =
      new Set([
        "Online",
        "Cheque",
        "Cash",
        "Bank Transfer",
        "Other Settlement",
        "Cancelled",
        "Swipe",
        "DD",
        "Paytm",
        "Adjust from Student Account balance",
        "NEFT",
        "NSO",
        "Online Manual",
        "Adjust from Credit Note",
        "UPI",
        "Total (₹)",
      ]);

    const pdfData =
      reportData.map(
        (row) =>
          pdfColumns.map(
            (column) => {
              const value =
                row[column];

              const monthlyMoney =
                isMonthlyManagementReport &&
                MONTHLY_MONEY_ROWS.includes(
                  row.Report
                );

              const monthlyPercent =
                isMonthlyManagementReport &&
                MONTHLY_PERCENT_ROWS.includes(
                  row.Report
                );

              const isMoney =
                components.includes(
                  column
                ) ||
                column.includes(
                  "₹"
                ) ||
                MONEY_COLUMN_NAMES.has(
                  column
                ) ||
                monthlyMoney;

              if (
                value === null ||
                value === undefined
              ) {
                return "—";
              }

              if (
                monthlyPercent &&
                typeof value ===
                  "number"
              ) {
                return `${value.toFixed(
                  1
                )}%`;
              }

              return isMoney &&
                typeof value ===
                  "number"
                ? Number(
                    value
                  ).toFixed(2)
                : value;
            }
          )
      );

    autoTable(doc, {
      head: [
        pdfColumns,
      ],

      body: pdfData,

      startY:
        visibleFilters.academicYear
          ? 32
          : 28,

      styles: {
        fontSize:
          isMonthlyManagementReport
            ? 6
            : 6,

        cellPadding: 1.2,
      },

      headStyles: {
        fontSize: 6,
      },

      margin: {
        left: 5,
        right: 5,
      },

      horizontalPageBreak:
        true,

      horizontalPageBreakRepeat: 1,
    });

    doc.save(
      `${reportType.toLowerCase()}-${
        new Date()
          .toISOString()
          .split("T")[0]
      }.pdf`
    );

    toast.success(
      "PDF exported successfully"
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-4">

      {/* =================================================
          REPORT FILTER CARD
      ================================================= */}

      <Card className="border-border/60">

        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">

          <div>

            <CardTitle className="font-display text-base flex items-center gap-2">

              <FileBarChart2 className="h-4 w-4 text-primary" />

              {activeReport.label}

            </CardTitle>

            <CardDescription>

              {activeReport.description}

              {components.length >
                0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ·{" "}
                  {
                    components.length
                  }{" "}
                  fee components
                </span>
              )}

            </CardDescription>

          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
          >
            {showFilters
              ? "Hide Filters"
              : "Show Filters"}
          </Button>

        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0 space-y-3">

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">

              {/* REPORT TYPE */}

              <FF label="Report Type">

                <Select
                  value={reportType}
                  onValueChange={
                    handleReportTypeChange
                  }
                >

                  <SelectTrigger className="h-9">

                    <SelectValue placeholder="Select report" />

                  </SelectTrigger>

                  <SelectContent>

                    {REPORT_TYPES.map(
                      (rt) => (
                        <SelectItem
                          key={
                            rt.value
                          }
                          value={
                            rt.value
                          }
                        >
                          {rt.label}
                        </SelectItem>
                      )
                    )}

                  </SelectContent>

                </Select>

              </FF>

              {/* ACADEMIC YEAR */}

              {visibleFilters.academicYear && (
                <FF label="Academic Year">

                  <Select
                    value={
                      academicYear
                    }
                    onValueChange={
                      setAcademicYear
                    }
                  >

                    <SelectTrigger className="h-9">

                      <SelectValue placeholder="Select year" />

                    </SelectTrigger>

                    <SelectContent>

                      {academicYears.map(
                        (year) => (
                          <SelectItem
                            key={year}
                            value={year}
                          >
                            {year}
                          </SelectItem>
                        )
                      )}

                    </SelectContent>

                  </Select>

                </FF>
              )}

              {/* STUDENT */}

              {visibleFilters.student && (
                <div className="space-y-1.5 relative">

                  <Label className="text-xs text-muted-foreground">
                    Student
                  </Label>

                  <Input
                    placeholder="Search by name, student no or admission no..."
                    value={
                      studentQuery
                    }
                    onChange={(e) => {
                      const value =
                        e.target
                          .value;

                      setStudentQuery(
                        value
                      );

                      if (!value) {
                        setStudentUuid(
                          ""
                        );
                      }
                    }}
                    className="h-9"
                  />

                  {studentQuery &&
                    !studentUuid &&
                    matchingStudents.length >
                      0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden max-h-52 overflow-y-auto">

                        {matchingStudents.map(
                          (student) => (
                            <button
                              key={
                                student.student_uuid
                              }
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex items-center justify-between"
                              onClick={() =>
                                handleStudentSelect(
                                  student
                                )
                              }
                            >

                              <span>
                                {
                                  student.full_name
                                }
                              </span>

                              <span className="text-xs text-muted-foreground">

                                {
                                  student.class_name
                                }

                                {student.section_name
                                  ? `-${student.section_name}`
                                  : ""}

                              </span>

                            </button>
                          )
                        )}

                      </div>
                    )}

                  {studentUuid && (
                    <div className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 rounded-md px-2 py-1 w-fit">

                      <Check className="h-3 w-3" />

                      <span className="font-medium">
                        {studentQuery}
                      </span>

                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                        onClick={() => {
                          setStudentUuid(
                            ""
                          );

                          setStudentQuery(
                            ""
                          );

                          setClassUuid(
                            "all"
                          );

                          setSectionUuid(
                            "all"
                          );
                        }}
                      >

                        <X className="h-3 w-3" />

                      </button>

                    </div>
                  )}

                </div>
              )}

              {/* CLASS */}

              {visibleFilters.class && (
                <FF label="Class">

                  <Select
                    value={classUuid}
                    onValueChange={(
                      value
                    ) => {
                      setClassUuid(
                        value
                      );

                      setSectionUuid(
                        "all"
                      );
                    }}
                  >

                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="all">
                        All Classes
                      </SelectItem>

                      {classes.map(
                        (item) => (
                          <SelectItem
                            key={
                              item.uuid
                            }
                            value={
                              item.uuid
                            }
                          >
                            {item.name}
                          </SelectItem>
                        )
                      )}

                    </SelectContent>

                  </Select>

                </FF>
              )}

              {/* SECTION */}

              {visibleFilters.section && (
                <FF label="Section">

                  <Select
                    value={
                      sectionUuid
                    }
                    onValueChange={
                      setSectionUuid
                    }
                  >

                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="all">
                        All Sections
                      </SelectItem>

                      {sections.map(
                        (item) => (
                          <SelectItem
                            key={
                              item.uuid
                            }
                            value={
                              item.uuid
                            }
                          >
                            {item.name}
                          </SelectItem>
                        )
                      )}

                    </SelectContent>

                  </Select>

                </FF>
              )}

              {/* FROM / TO */}

              {visibleFilters.dateRange && (
                <>
                  <FF label="From Date">

                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) =>
                        setFromDate(
                          e.target
                            .value
                        )
                      }
                      className="h-9"
                    />

                  </FF>

                  <FF label="To Date">

                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) =>
                        setToDate(
                          e.target
                            .value
                        )
                      }
                      className="h-9"
                    />

                  </FF>
                </>
              )}

              {/* COLLECTION DATE */}

              {visibleFilters.collectionDate && (
                <FF label="Collection Date">

                  <Input
                    type="date"
                    value={
                      collectionDate
                    }
                    onChange={(e) =>
                      setCollectionDate(
                        e.target
                          .value
                      )
                    }
                    className="h-9"
                  />

                </FF>
              )}

              {/* PAYMENT STATUS */}

              {visibleFilters.paymentStatus && (
                <FF label="Payment Status">

                  <Select
                    value={
                      paymentStatus
                    }
                    onValueChange={
                      setPaymentStatus
                    }
                  >

                    <SelectTrigger className="h-9">

                      <SelectValue placeholder="All Status" />

                    </SelectTrigger>

                    <SelectContent>

                      {statusOptionsForReport.map(
                        (status) => (
                          <SelectItem
                            key={
                              status.value
                            }
                            value={
                              status.value
                            }
                          >
                            {
                              status.label
                            }
                          </SelectItem>
                        )
                      )}

                    </SelectContent>

                  </Select>

                </FF>
              )}

              {/* BUTTONS */}

              <div className="flex items-end gap-2">

                <Button
                  size="sm"
                  className="gradient-primary border-0 flex-1"
                  onClick={
                    fetchReport
                  }
                  disabled={
                    loading
                  }
                >

                  <RefreshCcw
                    className={`h-4 w-4 ${
                      loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  {loading
                    ? "Loading..."
                    : "Generate"}

                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={
                    clearFilters
                  }
                  disabled={
                    loading
                  }
                >
                  Clear
                </Button>

              </div>

            </div>

          </CardContent>
        )}

      </Card>

      {/* =================================================
          TOTAL CARDS
      ================================================= */}

      {totals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">

          {totals
            .slice(0, 7)
            .map((total) => (
              <div
                key={
                  total.label
                }
                className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center"
              >

                <div className="text-xs text-muted-foreground">
                  {total.label}
                </div>

                <div className="text-sm font-semibold">
                  {total.value}
                </div>

              </div>
            ))}

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">

          <AlertCircle className="h-4 w-4 inline mr-2" />

          {error}

        </div>
      )}

      {/* =================================================
          REPORT TABLE
      ================================================= */}

      <Card className="border-border/60">

        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">

          <div>

            <CardTitle className="font-display text-base">

              {isMonthlyManagementReport
                ? "Fee Collection — Year-to-Date Report"
                : "Report Data"}

              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {isMonthlyManagementReport
                  ? "15 metrics"
                  : `${reportData.length} records`}
              </span>

            </CardTitle>

          </div>

          <div className="flex gap-2">

            <Button
              size="sm"
              variant="outline"
              onClick={
                exportExcel
              }
              disabled={
                !reportData.length ||
                loading
              }
            >

              <Download className="h-4 w-4" />

              Excel

            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={
                exportPDF
              }
              disabled={
                !reportData.length ||
                loading
              }
            >

              <FileText className="h-4 w-4" />

              PDF

            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={
                fetchReport
              }
              disabled={
                loading
              }
            >

              <RefreshCcw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

            </Button>

          </div>

        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">

          <div className="max-h-[600px] overflow-y-auto">

            <Table>

              <TableHeader>

                <TableRow className="sticky top-0 bg-background z-10">

                  {columns.map(
                    (column) => (
                      <TableHead
                        key={
                          column
                        }
                        className={`whitespace-nowrap text-xs font-semibold ${
                          isMonthlyManagementReport &&
                          column ===
                            "Report"
                            ? "sticky left-0 bg-background z-20 min-w-[240px]"
                            : "text-right"
                        }`}
                      >
                        {column}
                      </TableHead>
                    )
                  )}

                </TableRow>

              </TableHeader>

              <TableBody>

                {loading ? (
                  <TableRow>

                    <TableCell
                      colSpan={
                        columns.length ||
                        1
                      }
                      className="text-center py-8"
                    >

                      <div className="flex items-center justify-center gap-2 text-muted-foreground">

                        <RefreshCcw className="h-4 w-4 animate-spin" />

                        Loading report...

                      </div>

                    </TableCell>

                  </TableRow>
                ) : reportData.length ===
                  0 ? (
                  <TableRow>

                    <TableCell
                      colSpan={
                        columns.length ||
                        1
                      }
                      className="text-center py-8 text-muted-foreground"
                    >
                      No data found. Adjust your filters and click "Generate".
                    </TableCell>

                  </TableRow>
                ) : (
                  reportData.map(
                    (
                      row,
                      index
                    ) => {

                      const isManagementTotal =
                        isMonthlyManagementReport &&
                        [
                          "Net Fees Due",
                          "Total Fee Collection",
                          "Total Cash Received",
                          "Closing Outstanding",
                        ].includes(
                          row.Report
                        );

                      const isManagementRate =
                        isMonthlyManagementReport &&
                        [
                          "Collection Rate",
                          "Overdue Rate",
                        ].includes(
                          row.Report
                        );

                      return (
                        <TableRow
                          key={
                            index
                          }
                          className={`
                            hover:bg-muted/30
                            ${
                              isManagementTotal
                                ? "font-semibold bg-muted/40"
                                : ""
                            }
                          `}
                        >

                          {columns.map(
                            (
                              column
                            ) => {

                              const value =
                                row[
                                  column
                                ];

                              const isComponent =
                                components.includes(
                                  column
                                );

                              const isMonthlyMoney =
                                isMonthlyManagementReport &&
                                column !==
                                  "Report" &&
                                MONTHLY_MONEY_ROWS.includes(
                                  row.Report
                                );

                              const isMonthlyPercent =
                                isMonthlyManagementReport &&
                                column !==
                                  "Report" &&
                                MONTHLY_PERCENT_ROWS.includes(
                                  row.Report
                                );

                              const isMoney =
                                isComponent ||
                                column.includes(
                                  "₹"
                                ) ||
                                column.includes(
                                  "Gross"
                                ) ||
                                column.includes(
                                  "Discount"
                                ) ||
                                column.includes(
                                  "Late"
                                ) ||
                                column.includes(
                                  "Net"
                                ) ||
                                column.includes(
                                  "Paid"
                                ) ||
                                column.includes(
                                  "Pending"
                                ) ||
                                column ===
                                  "Online" ||
                                column ===
                                  "Cheque" ||
                                column ===
                                  "Cash" ||
                                column ===
                                  "Bank Transfer" ||
                                column ===
                                  "Other Settlement" ||
                                column ===
                                  "Cancelled" ||
                                column ===
                                  "Swipe" ||
                                column ===
                                  "DD" ||
                                column ===
                                  "Paytm" ||
                                column ===
                                  "Adjust from Student Account balance" ||
                                column ===
                                  "NEFT" ||
                                column ===
                                  "NSO" ||
                                column ===
                                  "Online Manual" ||
                                column ===
                                  "Adjust from Credit Note" ||
                                column ===
                                  "UPI" ||
                                column ===
                                  "Total (₹)" ||
                                isMonthlyMoney;

                              const isPending =
                                column ===
                                "Pending (₹)";

                              return (
                                <TableCell
                                  key={
                                    column
                                  }
                                  className={`
                                    whitespace-nowrap text-sm
                                    ${
                                      isMoney &&
                                      typeof value ===
                                        "number"
                                        ? "font-mono"
                                        : ""
                                    }
                                    ${
                                      isPending &&
                                      typeof value ===
                                        "number" &&
                                      value >
                                        0
                                        ? "text-warning font-semibold"
                                        : ""
                                    }
                                    ${
                                      isManagementRate
                                        ? "text-right"
                                        : ""
                                    }
                                    ${
                                      isMonthlyManagementReport &&
                                      column ===
                                        "Report"
                                        ? "sticky left-0 bg-background z-10 font-medium min-w-[240px]"
                                        : ""
                                    }
                                  `}
                                >

                                  {value ===
                                    null ||
                                  value ===
                                    undefined ||
                                  value ===
                                    ""
                                    ? "—"
                                    : isMonthlyPercent &&
                                      typeof value ===
                                        "number"
                                    ? `${value.toFixed(
                                        1
                                      )}%`
                                    : typeof value ===
                                        "number" &&
                                      isMoney
                                    ? inr(
                                        value
                                      )
                                    : value}

                                </TableCell>
                              );
                            }
                          )}

                        </TableRow>
                      );
                    }
                  )
                )}

              </TableBody>

            </Table>

          </div>

        </CardContent>

      </Card>

      {/* =================================================
          FEE COMPONENTS
      ================================================= */}

      {components.length >
        0 &&
        reportData.length >
          0 && (
          <Card className="border-border/60">

            <CardHeader className="pb-3">

              <CardTitle className="font-display text-base">
                Fee Components
              </CardTitle>

              <CardDescription>
                Components tracked in this report
              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="flex flex-wrap gap-2">

                {components.map(
                  (component) => (
                    <Badge
                      key={
                        component
                      }
                      variant="secondary"
                      className="text-xs"
                    >
                      {
                        component
                      }
                    </Badge>
                  )
                )}

              </div>

            </CardContent>

          </Card>
        )}

    </div>
  );
}

export default ReportsPanel;
