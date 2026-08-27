// import { useMemo, useState } from "react";
// import { PageContainer, PageHeader } from "../../components/page-shell";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { Badge } from "../../components/ui/badge";
// import { Progress } from "../../components/ui/progress";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
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
//   Download,
//   IndianRupee,
//   ShieldCheck,
//   Receipt,
//   CreditCard,
// } from "lucide-react";
// import { KpiCard } from "../../components/kpi-card";
// import { toast } from "sonner";

// // --- Static demo data (swap for real API/store data as needed) ---

// const feeStructure = {
//   name: "Standard Fee Structure — 2025-26",
//   dueDay: 10,
//   graceDays: 5,
//   components: [
//     { label: "Tuition Fee", frequency: "Monthly", amount: 4000 },
//     { label: "Transport Fee", frequency: "Monthly", amount: 1000 },
//     { label: "Activity Fee", frequency: "Annual", amount: 8000 },
//   ],
// };

// const monthlyTotal = feeStructure.components
//   .filter((c) => c.frequency === "Monthly")
//   .reduce((s, c) => s + c.amount, 0);

// const annualExtras = feeStructure.components
//   .filter((c) => c.frequency === "Annual")
//   .reduce((s, c) => s + c.amount, 0);

// const annualTotal = monthlyTotal * 12 + annualExtras;

// const monthLines = [
//   { ym: "2025-04", label: "April 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
//   { ym: "2025-05", label: "May 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
//   { ym: "2025-06", label: "June 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
//   { ym: "2025-07", label: "July 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
//   { ym: "2025-08", label: "August 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
//   { ym: "2025-09", label: "September 2025", monthly: monthlyTotal, lateFee: 0, paid: true },
//   { ym: "2025-10", label: "October 2025", monthly: monthlyTotal, lateFee: 200, paid: false },
//   { ym: "2025-11", label: "November 2025", monthly: monthlyTotal, lateFee: 0, paid: false },
// ];

// const history = [
//   {
//     id: "RCP-1042",
//     date: "28 Sep 2025",
//     amount: 5000,
//     mode: "UPI",
//     txn: "ICICI/UPI/28092025/871",
//     note: "Tuition, Transport",
//   },
//   {
//     id: "RCP-0921",
//     date: "12 Apr 2025",
//     amount: 5000,
//     mode: "NetBanking",
//     txn: "HDFC/NB/12042025/004",
//     note: "Tuition, Transport",
//   },
// ];

// const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// export default function Fees() {
//   const [payOpen, setPayOpen] = useState(false);
//   const [payTarget, setPayTarget] = useState(null);

//   const totalDue = useMemo(
//     () =>
//       monthLines
//         .filter((l) => !l.paid)
//         .reduce((s, l) => s + l.monthly + l.lateFee, 0),
//     []
//   );
//   const totalLate = useMemo(
//     () => monthLines.reduce((s, l) => s + l.lateFee, 0),
//     []
//   );
//   const paidAmt = useMemo(
//     () =>
//       monthLines
//         .filter((l) => l.paid)
//         .reduce((s, l) => s + l.monthly, 0) + annualExtras,
//     []
//   );
//   const pct = annualTotal
//     ? Math.min(100, Math.round((paidAmt / annualTotal) * 100))
//     : 0;

//   const openPay = (amount, label, ym) => {
//     setPayTarget({ amount, label, ym });
//     setPayOpen(true);
//   };

//   const handlePay = () => {
//     toast.success("Redirecting to UPI…", {
//       description: `${inr(payTarget?.amount ?? 0)} · Razorpay`,
//     });
//     setPayOpen(false);
//   };

//   return (
//     <PageContainer>
//       <PageHeader
//         eyebrow="Student Portal · Fees"
//         title="My Fees"
//         description={`Fee structure assigned: ${feeStructure.name}`}
//       />

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <KpiCard
//           label="Annual Fee"
//           value={inr(annualTotal)}
//           icon={<IndianRupee className="h-5 w-5" />}
//           tone="primary"
//         />
//         <KpiCard
//           label="Fees Paid"
//           value={inr(paidAmt)}
//           icon={<IndianRupee className="h-5 w-5" />}
//           tone="success"
//         />
//         <KpiCard
//           label="Fees Due"
//           value={inr(totalDue)}
//           icon={<IndianRupee className="h-5 w-5" />}
//           tone="warning"
//         />
//         <KpiCard
//           label="Late Fee"
//           value={inr(totalLate)}
//           icon={<IndianRupee className="h-5 w-5" />}
//           tone="info"
//         />
//       </div>

//       <Card className="border-border/60 mb-6">
//         <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
//           <div className="flex-1">
//             <div className="flex justify-between text-xs mb-1">
//               <span className="text-muted-foreground">
//                 Payment progress — 2025-26
//               </span>
//               <span className="font-semibold">
//                 {inr(paidAmt)} / {inr(annualTotal)}
//               </span>
//             </div>
//             <Progress value={pct} className="h-2" />
//             <div className="mt-2 text-xs text-muted-foreground">
//               {totalDue > 0
//                 ? `${inr(totalDue)} outstanding including ${inr(
//                     totalLate
//                   )} late fee.`
//                 : "All dues cleared. Thank you!"}
//             </div>
//           </div>
//           <Button
//             className="gradient-primary border-0 shrink-0"
//             disabled={totalDue <= 0}
//             onClick={() => openPay(totalDue, "All outstanding dues")}
//           >
//             <CreditCard className="h-5 w-5" />
//             Pay Now {totalDue > 0 && `· ${inr(totalDue)}`}
//           </Button>
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="status">
//         <TabsList className="flex-wrap h-auto">
//           <TabsTrigger value="status">Fee Status</TabsTrigger>
//           <TabsTrigger value="structure">Fee Structure</TabsTrigger>
//           <TabsTrigger value="history">Payment History</TabsTrigger>
//         </TabsList>

//         <TabsContent value="status" className="mt-4">
//           <Card className="border-border/60">
//             <CardHeader className="pb-2">
//               <CardTitle className="font-display text-base">
//                 Month-wise Status
//               </CardTitle>
//               <CardDescription>
//                 Late fee applies after day {feeStructure.dueDay} +{" "}
//                 {feeStructure.graceDays} grace days.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="p-0 overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Month</TableHead>
//                     <TableHead className="text-right">Monthly Fee</TableHead>
//                     <TableHead className="text-right">Late Fee</TableHead>
//                     <TableHead className="text-right">Payable</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {monthLines.map((l) => (
//                     <TableRow key={l.ym}>
//                       <TableCell className="font-medium">{l.label}</TableCell>
//                       <TableCell className="text-right">
//                         {inr(l.monthly)}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {l.lateFee ? (
//                           <span className="text-destructive">
//                             {inr(l.lateFee)}
//                           </span>
//                         ) : (
//                           "—"
//                         )}
//                       </TableCell>
//                       <TableCell className="text-right font-semibold">
//                         {l.paid ? "—" : inr(l.monthly + l.lateFee)}
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={
//                             l.paid
//                               ? "bg-success/10 text-success border-success/20"
//                               : l.lateFee
//                               ? "bg-destructive/10 text-destructive border-destructive/20"
//                               : "bg-warning/15 text-warning border-warning/20"
//                           }
//                         >
//                           {l.paid ? "Paid" : l.lateFee ? "Overdue" : "Due"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {!l.paid && (
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() =>
//                               openPay(l.monthly + l.lateFee, l.label, l.ym)
//                             }
//                           >
//                             Pay
//                           </Button>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="structure" className="mt-4">
//           <Card className="border-border/60">
//             <CardHeader className="pb-2">
//               <CardTitle className="font-display text-base">
//                 {feeStructure.name}
//               </CardTitle>
//               <CardDescription>
//                 Monthly {inr(monthlyTotal)} · Annual {inr(annualTotal)}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="p-0 overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Component</TableHead>
//                     <TableHead>Frequency</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {feeStructure.components.map((c, i) => (
//                     <TableRow key={i}>
//                       <TableCell className="font-medium">{c.label}</TableCell>
//                       <TableCell>
//                         <Badge variant="outline" className="text-[10px]">
//                           {c.frequency}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {inr(c.amount)}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="history" className="mt-4">
//           <Card className="border-border/60">
//             <CardHeader className="pb-2">
//               <CardTitle className="font-display text-base flex items-center gap-2">
//                 <Receipt className="h-4 w-4" />
//                 Payment History
//               </CardTitle>
//               <CardDescription>
//                 Receipts from the school fee counter and online payments
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="p-0 overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Receipt</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Mode</TableHead>
//                     <TableHead className="text-right">Amount</TableHead>
//                     <TableHead className="text-right">Slip</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {history.map((h) => (
//                     <TableRow key={h.id}>
//                       <TableCell className="font-mono text-xs">
//                         {h.id}
//                       </TableCell>
//                       <TableCell>{h.date}</TableCell>
//                       <TableCell>{h.mode}</TableCell>
//                       <TableCell className="text-right font-semibold">
//                         {inr(h.amount)}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           onClick={() =>
//                             toast.success("Receipt " + h.id + " downloaded")
//                           }
//                         >
//                           <Download className="h-4 w-4" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {history.length === 0 && (
//                     <TableRow>
//                       <TableCell
//                         colSpan={5}
//                         className="text-center text-sm text-muted-foreground py-8"
//                       >
//                         No payments recorded.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       <div className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1.5">
//         <ShieldCheck className="h-3.5 w-3.5" />
//         Payments are processed on a secure gateway. Receipts are available
//         instantly.
//       </div>

//       {/* Simple pay confirmation, since no Razorpay dialog component is wired up here.
//           Swap this block for <RazorpayDialog /> if that component exists in your project. */}
//       {payOpen && payTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <Card className="w-full max-w-sm border-border/60">
//             <CardHeader>
//               <CardTitle className="font-display text-base">
//                 Confirm Payment
//               </CardTitle>
//               <CardDescription>{payTarget.label}</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4">
//               <div className="text-3xl font-display font-semibold">
//                 {inr(payTarget.amount)}
//               </div>
//               <div className="flex gap-2 justify-end">
//                 <Button variant="outline" onClick={() => setPayOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button className="gradient-primary border-0" onClick={handlePay}>
//                   <CreditCard className="h-4 w-4" />
//                   Pay {inr(payTarget.amount)}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </PageContainer>
//   );
// }

import { useEffect, useMemo, useState } from "react";

import {
  PageContainer,
  PageHeader,
} from "../../components/page-shell";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Progress } from "../../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
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
  Download,
  IndianRupee,
  ShieldCheck,
  Receipt,
  CreditCard,
  Loader2,
  RefreshCw,
  Printer,
  Eye,
} from "lucide-react";

import { KpiCard } from "../../components/kpi-card";

import { toast } from "sonner";

import studentModel from "../../api/studentModel";
import { getStudentDiscounts } from "../../api/feeAssignment";
import { getFeeDiscounts } from "../../api/feeDiscount";

import useSessionStore from "../../store/sessionStore";


// ============================================================
// Helpers
// ============================================================

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};


const inr = (value) => {
  return (
    "₹" +
    Math.round(toNumber(value)).toLocaleString("en-IN")
  );
};


const formatMonth = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};


const getStatus = (due) => {
  const status = String(
    due?.status ||
      due?.payment_status ||
      ""
  ).toUpperCase();

  if (
    status === "PAID" ||
    status === "COMPLETED"
  ) {
    return "PAID";
  }

  if (
    status === "ADVANCE_RECEIVED" ||
    status === "ADVANCE_PAID" ||
    status === "ADVANCE"
  ) {
    return "ADVANCE_RECEIVED";
  }

  if (
    status === "OVERDUE" ||
    status === "LATE"
  ) {
    return "OVERDUE";
  }

  return "DUE";
};

const toErrorMessage = (value, fallback = "Something went wrong.") => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object") {
    const nestedMessage =
      value.message ||
      value.detail ||
      value.error ||
      value.error_code;

    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage;
    }

    if (value.required_permission) {
      return `No permission (${value.required_permission}).`;
    }
  }

  return fallback;
};

const getPaymentKind = (payment) => {
  const kind = String(
    payment?.payment_type || payment?.kind || payment?.transaction_type || ""
  ).toUpperCase();

  return kind.includes("ADVANCE") ? "Advance" : "Payment";
};


// ============================================================
// Razorpay Loader
// ============================================================

const loadRazorpayScript = () => {
  return new Promise((resolve) => {

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

    if (existingScript) {

      existingScript.addEventListener(
        "load",
        () => resolve(true)
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false)
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(
      script
    );
  });
};


// ============================================================
// Component
// ============================================================

export default function Fees() {

  // ==========================================================
  // Session
  // ==========================================================

  const sessionYear =
    useSessionStore(
      (state) => state.sessionYear
    );


  // ==========================================================
  // State
  // ==========================================================

  const [dues, setDues] = useState([]);

  const [paymentHistory, setPaymentHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [payOpen, setPayOpen] =
    useState(false);

  const [payTarget, setPayTarget] =
    useState(null);

  const [payLoading, setPayLoading] =
    useState(false);

  const [selectedDueIds, setSelectedDueIds] = useState([]);

  const [discountMetadata, setDiscountMetadata] = useState([]);

  const [discountTemplates, setDiscountTemplates] = useState([]);

  const [historyView, setHistoryView] = useState("timeline");

  const [financialHistoryOpen, setFinancialHistoryOpen] = useState(false);

  const paymentHistoryTotal = useMemo(
    () => paymentHistory.reduce(
      (total, payment) =>
        total + toNumber(
          payment?.amount ?? payment?.paid_amount ?? payment?.total_amount
        ),
      0
    ),
    [paymentHistory]
  );


  // ==========================================================
  // Load Student Dues
  // ==========================================================

  const loadDues = async () => {

    try {

      setError("");

      setLoading(true);

      const response =
        await studentModel.getMyDues({
          academicYear: sessionYear,
        });


      const responseData =
        response?.data;


      const rows =
        Array.isArray(responseData)
          ? responseData
          : [];


      setDues(rows);

      const studentUuid = rows.find((row) => row?.student_uuid)?.student_uuid;

      if (studentUuid) {
        try {
          const [discountResult, templateResult] = await Promise.allSettled([
            getStudentDiscounts(studentUuid),
            getFeeDiscounts({ is_active: true }),
          ]);
          const discountResponse =
            discountResult.status === "fulfilled" ? discountResult.value : null;
          const discountBody = discountResponse?.data?.data ?? discountResponse?.data ?? [];
          const discountRows = Array.isArray(discountBody)
            ? discountBody
            : Array.isArray(discountBody?.discounts)
            ? discountBody.discounts
            : discountBody?.discount_uuid ? [discountBody] : [];
          setDiscountMetadata(
            discountRows.flatMap((row) =>
              Array.isArray(row?.discounts) ? row.discounts : [row]
            )
          );

          const templateResponse =
            templateResult.status === "fulfilled" ? templateResult.value : null;
          const templateBody =
            templateResponse?.data?.data ?? templateResponse?.data ?? [];
          setDiscountTemplates(
            Array.isArray(templateBody)
              ? templateBody
              : Array.isArray(templateBody?.items)
              ? templateBody.items
              : Array.isArray(templateBody?.results)
              ? templateBody.results
              : []
          );
        } catch (discountError) {
          console.error("Failed to load assigned discount details:", discountError);
          setDiscountMetadata([]);
          setDiscountTemplates([]);
        }
      } else {
        setDiscountMetadata([]);
        setDiscountTemplates([]);
      }

    } catch (err) {

      console.error(
        "Failed to load student dues:",
        err
      );

      const message = toErrorMessage(
        err?.response?.data?.detail || err?.response?.data,
        "Failed to load your fee details."
      );

      setError(message);

      setDues([]);
      setDiscountMetadata([]);
      setDiscountTemplates([]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // Load Payment History
  // ==========================================================

  const loadPaymentHistory = async () => {

    try {

      setHistoryLoading(true);

      const response =
        await studentModel.getPaymentHistory({
          academicYear: sessionYear,
        });


      const responseData =
        response?.data;


      let rows = [];

      if (Array.isArray(responseData)) {

        rows = responseData;

      } else if (
        Array.isArray(
          responseData?.data
        )
      ) {

        rows =
          responseData.data;

      }


      setPaymentHistory(rows);

    } catch (err) {

      console.error(
        "Failed to load payment history:",
        err
      );

      setPaymentHistory([]);

    } finally {

      setHistoryLoading(false);

    }
  };


  // ==========================================================
  // Initial Load
  // ==========================================================

  useEffect(() => {

    if (!sessionYear) {

      setLoading(false);

      return;
    }

    loadDues();

    loadPaymentHistory();

  }, [sessionYear]);


  // ==========================================================
  // Refresh
  // ==========================================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await Promise.all([
        loadDues(),
        loadPaymentHistory(),
      ]);

      toast.success(
        "Fee details refreshed."
      );

    } catch (err) {

      console.error(
        "Refresh failed:",
        err
      );

    } finally {

      setRefreshing(false);

    }
  };


  // ==========================================================
  // Summary
  // ==========================================================

  const summary = useMemo(() => {

    let amount = 0;

    let discount = 0;

    let lateFee = 0;

    let paid = 0;

    let remaining = 0;


    dues.forEach((due) => {

      amount += toNumber(
        due?.amount
      );

      discount += toNumber(
        due?.discount
      );

      lateFee += toNumber(
        due?.late_fee
      );

      paid += toNumber(
        due?.paid_amount
      );

      remaining += Math.max(
        0,
        toNumber(
          due?.balance_amount
        )
      );

    });


    const payable =
      Math.max(
        0,
        amount -
          discount +
          lateFee
      );


    const collectionPercentage =
      payable > 0
        ? Math.min(
            100,
            Math.round(
              (paid / payable) *
                100
            )
          )
        : 0;


    return {
      amount,
      discount,
      lateFee,
      paid,
      remaining,
      payable,
      collectionPercentage,
    };

  }, [dues]);


  // ==========================================================
  // Group dues month-wise
  // ==========================================================

  const monthLines = useMemo(() => {

    const map = new Map();


    dues.forEach((due) => {

      const key =
        due?.fee_month ||
        due?.due_uuid;


      if (!key) {
        return;
      }


      if (!map.has(key)) {

        map.set(key, {

          key,

          fee_month:
            due?.fee_month,

          amount: 0,

          discount: 0,

          late_fee: 0,

          paid_amount: 0,

          balance_amount: 0,

          statuses: [],

        });

      }


      const row =
        map.get(key);


      row.amount +=
        toNumber(
          due?.amount
        );


      row.discount +=
        toNumber(
          due?.discount
        );


      row.late_fee +=
        toNumber(
          due?.late_fee
        );


      row.paid_amount +=
        toNumber(
          due?.paid_amount
        );


      row.balance_amount +=
        Math.max(
          0,
          toNumber(
            due?.balance_amount
          )
        );


      row.statuses.push(
        getStatus(due)
      );

    });


    return Array.from(
      map.values()
    ).sort(
      (a, b) =>
        new Date(
          a.fee_month || 0
        ) -
        new Date(
          b.fee_month || 0
        )
    );

  }, [dues]);


  // ==========================================================
  // Fee Structure Components
  // ==========================================================

  const components = useMemo(() => {

    const map = new Map();


    dues.forEach((due) => {

      const uuid =
        due?.component_uuid ||
        due?.component_name ||
        due?.due_uuid;


      if (!uuid) {
        return;
      }


      if (!map.has(uuid)) {

        map.set(uuid, {

          uuid,

          name:
            due?.component_name ||
            "Fee Component",

          amount: 0,

          count: 0,

        });

      }


      const component =
        map.get(uuid);


      component.amount +=
        toNumber(
          due?.amount
        );


      component.count += 1;

    });


    return Array.from(
      map.values()
    );

  }, [dues]);


  // ==========================================================
  // Open Payment
  // ==========================================================

  const payableDues = useMemo(
    () => dues.filter(
      (due) =>
        due?.due_uuid &&
        getStatus(due) !== "ADVANCE_RECEIVED" &&
        toNumber(due?.balance_amount) > 0
    ),
    [dues]
  );

  const discountedDues = useMemo(
    () => dues.filter((due) => toNumber(due?.discount) > 0),
    [dues]
  );

  const assignedDiscounts = useMemo(() => {
    const grouped = new Map();

    discountedDues.forEach((due, index) => {
      const name =
        due?.discount_name || due?.discount?.name || "Assigned fee discount";
      const rawType = String(
        due?.discount_type || due?.discount?.type ||
        (toNumber(due?.discount_percentage) > 0 ? "PERCENT" : "FIXED")
      ).toUpperCase();
      const type = rawType.startsWith("PERC") ? "Percentage" : "Fixed amount";
      const configuredValue = toNumber(
        due?.discount_value ?? due?.discount?.value ?? due?.discount_percentage
      );
      const key =
        due?.discount_uuid ||
        due?.assignment_student_discount_uuid ||
        `${name}-${rawType}-${configuredValue || "applied"}-${due?.component_uuid || index}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          name,
          type,
          configuredValue,
          components: new Set(),
          months: new Map(),
          appliedAmount: 0,
          originalAmount: 0,
          occurrences: 0,
          inferredPercentages: [],
        });
      }

      const row = grouped.get(key);
      row.components.add(due?.component_name || "Fee Component");
      if (due?.fee_month) {
        const monthDate = new Date(due.fee_month);
        if (!Number.isNaN(monthDate.getTime())) {
          row.months.set(monthDate.getTime(), formatMonth(due.fee_month));
        }
      }
      row.appliedAmount += toNumber(due?.discount);
      row.originalAmount += toNumber(due?.amount);
      row.occurrences += 1;

      if (toNumber(due?.amount) > 0) {
        row.inferredPercentages.push(
          (toNumber(due?.discount) / toNumber(due?.amount)) * 100
        );
      }
    });

    const assignedDiscountUuids = new Set(
      discountMetadata.map((item) => item?.discount_uuid).filter(Boolean).map(String)
    );
    const assignedTemplates = discountTemplates.filter((template) =>
      assignedDiscountUuids.has(String(template?.discount_uuid))
    );

    return Array.from(grouped.values()).map((discount) => {
      const sortedMonths = Array.from(discount.months.entries())
        .sort(([a], [b]) => a - b)
        .map(([, label]) => label);
      const inferredPercentage = discount.inferredPercentages.length
        ? discount.inferredPercentages.reduce((sum, value) => sum + value, 0) /
          discount.inferredPercentages.length
        : 0;
      const inferredFixedValue = discount.occurrences
        ? discount.appliedAmount / discount.occurrences
        : 0;

      const componentNames = Array.from(discount.components);
      const assignmentMetadata =
        discountMetadata.find((item) =>
          item?.discount_uuid && String(item.discount_uuid) === String(discount.key)
        ) ||
        discountMetadata.find((item) => {
          const metadataComponents = Array.isArray(item?.components)
            ? item.components.map((component) =>
                component?.component_name || component?.name || component
              )
            : [];
          return metadataComponents.some((component) =>
            componentNames.includes(component)
          );
        }) ||
        (discountMetadata.length === 1 ? discountMetadata[0] : null);

      const assignedDiscountUuid =
        assignmentMetadata?.discount_uuid ||
        (assignedTemplates.some((item) =>
          String(item?.discount_uuid) === String(discount.key)
        ) ? discount.key : null);
      const templateMetadata =
        assignedTemplates.find((item) =>
          assignedDiscountUuid &&
          String(item?.discount_uuid) === String(assignedDiscountUuid)
        ) ||
        assignedTemplates.find((item) => {
          const templateComponents = Array.isArray(item?.components)
            ? item.components.map((component) =>
                component?.component_name || component?.name || component
              )
            : [];
          return templateComponents.some((component) =>
            componentNames.includes(component)
          );
        }) ||
        null;
      const matchingMetadata = templateMetadata || assignmentMetadata;

      const metadataName =
        matchingMetadata?.discount_name || matchingMetadata?.name;
      const metadataType = String(
        matchingMetadata?.discount_type || matchingMetadata?.type || ""
      ).toUpperCase();
      const resolvedType = metadataType
        ? metadataType.startsWith("PERC") ? "Percentage" : "Fixed amount"
        : discount.type;
      const metadataValue = toNumber(
        matchingMetadata?.discount_value ?? matchingMetadata?.value
      );
      const resolvedValue = metadataValue || discount.configuredValue;

      return {
        ...discount,
        isAssigned: Boolean(
          assignmentMetadata ||
          templateMetadata ||
          discount.name !== "Assigned fee discount"
        ),
        name: metadataName || discount.name,
        rule:
          matchingMetadata?.discount_scope ||
          matchingMetadata?.rule ||
          "—",
        type: resolvedType,
        configuredValue: resolvedValue,
        components: Array.from(discount.components),
        monthRange:
          sortedMonths.length > 1
            ? `${sortedMonths[0]} – ${sortedMonths[sortedMonths.length - 1]}`
            : sortedMonths[0] || "—",
        displayValue:
          resolvedValue > 0
            ? resolvedType === "Percentage"
              ? `${resolvedValue}%`
              : inr(resolvedValue)
            : resolvedType === "Percentage"
            ? `${Number(inferredPercentage.toFixed(2))}%`
            : inr(inferredFixedValue),
      };
    }).filter((discount) => discount.isAssigned);
  }, [discountedDues, discountMetadata, discountTemplates]);

  const selectedDues = useMemo(
    () => payableDues.filter((due) => selectedDueIds.includes(due.due_uuid)),
    [payableDues, selectedDueIds]
  );

  const selectedAmount = useMemo(
    () => selectedDues.reduce(
      (total, due) => total + Math.max(0, toNumber(due?.balance_amount)),
      0
    ),
    [selectedDues]
  );

  const allPayableSelected =
    payableDues.length > 0 && selectedDues.length === payableDues.length;

  const toggleDue = (dueUuid, checked) => {
    setSelectedDueIds((current) =>
      checked
        ? [...new Set([...current, dueUuid])]
        : current.filter((id) => id !== dueUuid)
    );
  };

  const toggleAllDues = (checked) => {
    setSelectedDueIds(checked ? payableDues.map((due) => due.due_uuid) : []);
  };

  const openPay = (
    amount,
    label,
    duesForPayment = []
  ) => {

    if (
      !amount ||
      amount <= 0
    ) {
      return;
    }


    const validDues =
      Array.isArray(
        duesForPayment
      )
        ? duesForPayment.filter(
            (due) =>
              due?.due_uuid &&
              toNumber(
                due?.balance_amount
              ) > 0
          )
        : [];


    if (
      validDues.length === 0
    ) {

      toast.error(
        "No outstanding dues found."
      );

      return;
    }


    setPayTarget({

      amount,

      label,

      dues:
        validDues,

    });


    setPayOpen(true);

  };

  const openPaySelected = () => {
    if (selectedDues.length === 0) {
      toast.info("Select at least one fee item to pay.");
      return;
    }

    openPay(
      selectedAmount,
      `${selectedDues.length} selected fee item${selectedDues.length === 1 ? "" : "s"}`,
      selectedDues
    );
  };


  // ==========================================================
  // Pay All
  // ==========================================================

  const openPayAll = () => {

    const payableDues =
      dues.filter(
        (due) =>
          toNumber(
            due?.balance_amount
          ) > 0
      );


    if (
      payableDues.length === 0
    ) {

      toast.info(
        "You have no outstanding dues."
      );

      return;
    }


    const amount =
      payableDues.reduce(
        (total, due) =>
          total +
          Math.max(
            0,
            toNumber(
              due?.balance_amount
            )
          ),
        0
      );


    openPay(
      amount,
      "All outstanding dues",
      payableDues
    );

  };


  // ==========================================================
  // Pay Month
  // ==========================================================

  const openPayMonth = (
    month
  ) => {

    const monthDues =
      dues.filter(
        (due) =>
          due?.fee_month ===
          month.fee_month &&
          toNumber(
            due?.balance_amount
          ) > 0
      );


    const amount =
      monthDues.reduce(
        (total, due) =>
          total +
          Math.max(
            0,
            toNumber(
              due?.balance_amount
            )
          ),
        0
      );


    if (
      amount <= 0 ||
      monthDues.length === 0
    ) {

      toast.info(
        "This month has no outstanding balance."
      );

      return;
    }


    openPay(
      amount,
      formatMonth(
        month.fee_month
      ),
      monthDues
    );

  };


  // ==========================================================
  // Create Razorpay Payment
  // ==========================================================

  const handlePay = async () => {

    let checkoutOpened = false;

    if (
      !payTarget ||
      !Array.isArray(
        payTarget.dues
      ) ||
      payTarget.dues.length === 0
    ) {

      toast.error(
        "No fee dues selected."
      );

      return;
    }


    // ========================================================
    // Only outstanding dues
    // ========================================================

    const selectedDues =
      payTarget.dues.filter(
        (due) =>
          due?.due_uuid &&
          toNumber(
            due?.balance_amount
          ) > 0
      );


    if (
      selectedDues.length === 0
    ) {

      toast.error(
        "No outstanding dues selected."
      );

      return;
    }


    // ========================================================
    // Student UUID
    // ========================================================

    const studentUuid =
      selectedDues[0]?.student_uuid;


    if (!studentUuid) {

      toast.error(
        "Student information is missing."
      );

      return;
    }


    // ========================================================
    // Make sure all dues belong to same student
    // ========================================================

    const differentStudent =
      selectedDues.some(
        (due) =>
          String(
            due?.student_uuid
          ) !==
          String(
            studentUuid
          )
      );


    if (differentStudent) {

      toast.error(
        "Invalid fee selection."
      );

      return;
    }


    // ========================================================
    // Assignment UUID
    // ========================================================

    const assignmentUuid =
      selectedDues[0]?.assignment_uuid ||
      null;


    // ========================================================
    // Make sure all dues belong to same assignment
    //
    // Your backend payment service expects this.
    // ========================================================

    const differentAssignment =
      selectedDues.some(
        (due) =>
          String(
            due?.assignment_uuid
          ) !==
          String(
            assignmentUuid
          )
      );


    if (differentAssignment) {

      toast.error(
        "Selected dues belong to different assignments."
      );

      return;
    }


    // ========================================================
    // Due UUIDs
    // ========================================================

    const dueUuids =
      selectedDues
        .map(
          (due) =>
            due?.due_uuid
        )
        .filter(Boolean);


    if (
      dueUuids.length === 0
    ) {

      toast.error(
        "No payable fee dues found."
      );

      return;
    }


    try {

      setPayLoading(true);


      // ======================================================
      // 1. Load Razorpay SDK
      // ======================================================

      const loaded =
        await loadRazorpayScript();


      if (!loaded) {

        toast.error(
          "Unable to load Razorpay. Please check your internet connection."
        );

        return;
      }


      // ======================================================
      // 2. CREATE RAZORPAY ORDER
      // ======================================================

      const orderResponse =
        await studentModel.createRazorpayOrder({

          studentUuid,

          assignmentUuid,

          dueUuids,

        });


      console.log(
        "Razorpay create-order response:",
        orderResponse
      );


      // ======================================================
      // Backend response can be:
      //
      // {
      //   success: true,
      //   data: {...}
      // }
      //
      // OR
      //
      // {
      //   order_id: ...
      // }
      //
      // Handle both.
      // ======================================================

      const orderData =
        orderResponse?.data &&
        typeof orderResponse.data ===
          "object"
          ? orderResponse.data
          : orderResponse;


      const orderId =
        orderData?.order_id ||
        orderData?.id;


      const amountPaise =
        toNumber(
          orderData?.amount_paise
        ) ||
        toNumber(
          orderData?.amount
        );


      const currency =
        orderData?.currency ||
        "INR";


      const razorpayKeyId =
        orderData?.razorpay_key_id ||
        orderData?.key_id ||
        orderData?.key;


      if (!orderId) {

        console.error(
          "Invalid create-order response:",
          orderResponse
        );

        throw new Error(
          "Razorpay order ID was not returned by the server."
        );
      }


      if (!razorpayKeyId) {

        console.error(
          "Razorpay key missing:",
          orderResponse
        );

        throw new Error(
          "Razorpay key was not returned by the server."
        );
      }


      if (
        amountPaise <= 0
      ) {

        throw new Error(
          "Invalid Razorpay order amount."
        );
      }


      // ======================================================
      // 3. OPEN RAZORPAY CHECKOUT
      // ======================================================

      const options = {

        key:
          razorpayKeyId,

        amount:
          amountPaise,

        currency:
          currency,

        name:
          "Edureon",

        description:
          payTarget.label ||
          "Student Fee Payment",

        order_id:
          orderId,


        // ====================================================
        // Prefill
        // ====================================================

        prefill: {
          name:
            "Student",
        },


        // ====================================================
        // Theme
        // ====================================================

        theme: {
          color:
            "#0f3b73",
        },


        // ====================================================
        // Success
        // ====================================================

        handler:
          async (
            razorpayResponse
          ) => {

            try {

              setPayLoading(true);


              console.log(
                "Razorpay success:",
                razorpayResponse
              );


              // ==============================================
              // 4. VERIFY PAYMENT ON BACKEND
              // ==============================================

              const verifyResponse =
                await studentModel.verifyRazorpayPayment({

                  studentUuid,

                  assignmentUuid,

                  dueUuids,

                  razorpayOrderId:
                    razorpayResponse
                      ?.razorpay_order_id,

                  razorpayPaymentId:
                    razorpayResponse
                      ?.razorpay_payment_id,

                  razorpaySignature:
                    razorpayResponse
                      ?.razorpay_signature,

                  remarks:
                    payTarget.label ||
                    null,

                });


              console.log(
                "Razorpay verify response:",
                verifyResponse
              );


              if (
                verifyResponse?.success ===
                false
              ) {

                throw new Error(
                  verifyResponse?.message ||
                    "Payment verification failed."
                );
              }


              // ==============================================
              // 5. PAYMENT SUCCESS
              // ==============================================

              toast.success(
                verifyResponse?.message ||
                  "Payment completed successfully."
              );


              // ==============================================
              // Close modal
              // ==============================================

              setPayOpen(false);

              setPayTarget(null);

              setSelectedDueIds([]);


              // ==============================================
              // Refresh dues and history
              // ==============================================

              await Promise.all([
                loadDues(),
                loadPaymentHistory(),
              ]);

            } catch (err) {

              console.error(
                "Payment verification failed:",
                err
              );


              const message = toErrorMessage(
                err?.response?.data?.detail ||
                  err?.response?.data ||
                  err?.message,
                "Payment verification failed."
              );


              toast.error(
                typeof message ===
                  "string"
                  ? message
                  : "Payment verification failed."
              );

            } finally {

              setPayLoading(false);

            }
          },


        // ====================================================
        // Checkout closed
        // ====================================================

        modal: {

          ondismiss: () => {

            setPayLoading(false);

            toast.info(
              "Payment cancelled."
            );

          },

        },

      };


      // ======================================================
      // Create Razorpay instance
      // ======================================================

      const razorpay =
        new window.Razorpay(
          options
        );


      // ======================================================
      // Payment failed
      // ======================================================

      razorpay.on(
        "payment.failed",
        (response) => {

          console.error(
            "Razorpay payment failed:",
            response
          );


          const description =
            response?.error
              ?.description ||
            "Payment failed.";


          toast.error(
            description
          );


          setPayLoading(false);

        }
      );


      // ======================================================
      // Open Razorpay
      // ======================================================

      razorpay.open();
      checkoutOpened = true;

    } catch (err) {

      console.error(
        "Payment initiation failed:",
        err
      );


      const status = err?.response?.status;

      const message = status === 403
        ? "No permission to make this payment. Fee details have been refreshed."
        : toErrorMessage(
            err?.response?.data?.detail ||
              err?.response?.data ||
              err?.message,
            "Unable to initiate payment."
          );


      toast.error(
        typeof message ===
          "string"
          ? message
          : "Unable to initiate payment."
      );

      if (status === 403) {
        setPayOpen(false);
        setPayTarget(null);
        setSelectedDueIds([]);

        await Promise.allSettled([
          loadDues(),
          loadPaymentHistory(),
        ]);
      }

    } finally {

      if (!checkoutOpened) {
        setPayLoading(false);
      }

    }
  };


  // ==========================================================
  // Download Receipt
  // ==========================================================

  const viewReceipt = async (payment) => {
    const transactionUuid = payment?.transaction_uuid;

    if (!transactionUuid) {
      toast.error("Receipt is not available.");
      return;
    }

    const receiptWindow = window.open("", "_blank");

    try {
      const response = await studentModel.getReceipt(transactionUuid);
      const url = window.URL.createObjectURL(response.data);

      if (receiptWindow) {
        receiptWindow.location.href = url;
      } else {
        window.open(url, "_blank");
      }

      window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      receiptWindow?.close();
      console.error("Receipt preview failed:", err);
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to open receipt."
      );
    }
  };

  const downloadReceipt = async (
    payment
  ) => {

    const transactionUuid =
      payment?.transaction_uuid;


    if (!transactionUuid) {

      toast.error(
        "Receipt is not available."
      );

      return;
    }


    try {

      const response =
        await studentModel.getReceipt(
          transactionUuid
        );


      const blob =
        response.data;


      const url =
        window.URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href = url;


      link.download =
        `${
          payment?.receipt_no ||
          transactionUuid ||
          "fee-receipt"
        }.pdf`;


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      window.URL.revokeObjectURL(
        url
      );

    } catch (err) {

      console.error(
        "Receipt download failed:",
        err
      );


      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to download receipt."
      );

    }
  };


  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {

    return (
      <PageContainer>

        <PageHeader
          eyebrow="Student Portal · Fees"
          title="My Fees"
          description="Loading your fee details..."
        />

        <div className="flex items-center justify-center py-20">

          <Loader2 className="h-8 w-8 animate-spin" />

        </div>

      </PageContainer>
    );

  }


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <PageContainer>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        eyebrow="Student Portal · Fees"
        title="My Fees"
        description={
          sessionYear
            ? `Your fee details for ${sessionYear}`
            : "Your fee details"
        }
      />


      <div className="flex justify-end mb-4">

        <Button
          variant="outline"
          size="sm"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing
          }
        >

          {refreshing ? (

            <Loader2
              className="h-4 w-4 animate-spin"
            />

          ) : (

            <RefreshCw
              className="h-4 w-4"
            />

          )}

          Refresh

        </Button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <Card
          className="mb-6 border-destructive/30"
        >

          <CardContent className="py-6">

            <p className="text-sm text-destructive">

              {toErrorMessage(error, "Unable to load fee details.")}

            </p>

          </CardContent>

        </Card>

      )}


      {/* =====================================================
          KPI
      ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <KpiCard
          label="Total Fee"
          value={
            inr(
              summary.payable
            )
          }
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          tone="primary"
        />


        <KpiCard
          label="Fees Paid"
          value={
            inr(
              summary.paid
            )
          }
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          tone="success"
        />


        <KpiCard
          label="Fees Due"
          value={
            inr(
              summary.remaining
            )
          }
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          tone="warning"
        />


        <KpiCard
          label="Late Fee"
          value={
            inr(
              summary.lateFee
            )
          }
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          tone="info"
        />

      </div>


      {/* =====================================================
          PAYMENT PROGRESS
      ===================================================== */}

      <Card
        className="hidden"
      >

        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">

          <div className="flex-1">

            <div className="flex justify-between text-xs mb-1">

              <span className="text-muted-foreground">

                Payment progress
                {sessionYear
                  ? ` — ${sessionYear}`
                  : ""}

              </span>


              <span className="font-semibold">

                {inr(
                  summary.paid
                )}

                {" / "}

                {inr(
                  summary.payable
                )}

              </span>

            </div>


            <Progress
              value={
                summary.collectionPercentage
              }
              className="h-2"
            />


            <div className="mt-2 text-xs text-muted-foreground">

              {summary.remaining > 0

                ? `${inr(
                    summary.remaining
                  )} outstanding including ${inr(
                    summary.lateFee
                  )} late fee.`

                : "All dues cleared. Thank you!"}

            </div>

          </div>


          <Button
            className="gradient-primary border-0 shrink-0"
            disabled={
              summary.remaining <= 0 ||
              payLoading
            }
            onClick={
              openPayAll
            }
          >

            <CreditCard className="h-5 w-5" />

            Pay Now{" "}

            {summary.remaining > 0 &&
              `· ${inr(
                summary.remaining
              )}`}

          </Button>

        </CardContent>

      </Card>


      {/* =====================================================
          TABS
      ===================================================== */}

      <Tabs
        defaultValue="status"
      >

        <TabsList className="flex-wrap h-auto">

          <TabsTrigger value="status">

            Fee Status

          </TabsTrigger>


          <TabsTrigger value="structure">

            Fee Structure

          </TabsTrigger>


          <TabsTrigger value="discounts">

            Discounts

          </TabsTrigger>


          <TabsTrigger value="history">

            Payment History

          </TabsTrigger>

        </TabsList>


        {/* ===================================================
            STATUS
        =================================================== */}

        <TabsContent
          value="status"
          className="mt-4"
        >

          <Card
            className="border-border/60"
          >

            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">

              <div>

              <CardTitle className="font-display text-base">

                Month-wise Status

              </CardTitle>


              <CardDescription>

                Your assigned fee dues and payment status.

              </CardDescription>

              </div>

              <Button
                className="gradient-primary border-0 shrink-0"
                disabled={selectedDues.length === 0 || payLoading}
                onClick={openPaySelected}
              >
                <CreditCard className="h-4 w-4" />
                Pay selected{selectedAmount > 0 ? ` · ${inr(selectedAmount)}` : ""}
              </Button>

            </CardHeader>


            <CardContent className="p-0 overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all unpaid fees"
                        checked={allPayableSelected}
                        onCheckedChange={(checked) => toggleAllDues(checked === true)}
                      />
                    </TableHead>

                    <TableHead>
                      Month
                    </TableHead>

                    <TableHead>
                      Component
                    </TableHead>


                    <TableHead className="text-right">
                      Fee
                    </TableHead>


                    <TableHead className="text-right">
                      Discount
                    </TableHead>


                    <TableHead className="text-right">
                      Late Fee
                    </TableHead>


                    <TableHead className="text-right">
                      Payable
                    </TableHead>


                    <TableHead>
                      Status
                    </TableHead>


                  </TableRow>

                </TableHeader>


                <TableBody>

                  {dues.map(
                    (due, index) => {

                      const status = getStatus(due);
                      const isAdvanceReceived = status === "ADVANCE_RECEIVED";
                      const isPayable =
                        !isAdvanceReceived && toNumber(due?.balance_amount) > 0;
                      const dueId = due?.due_uuid || `due-${index}`;


                      return (

                        <TableRow
                          key={
                            dueId
                          }
                          className={
                            status === "PAID"
                              ? "opacity-60"
                              : isAdvanceReceived
                              ? "bg-blue-50/60 dark:bg-blue-950/20"
                              : ""
                          }
                        >

                          <TableCell>
                            <Checkbox
                              aria-label={`Select ${due?.component_name || "fee item"}`}
                              disabled={!isPayable}
                              checked={selectedDueIds.includes(due?.due_uuid)}
                              onCheckedChange={(checked) =>
                                toggleDue(due.due_uuid, checked === true)
                              }
                            />
                          </TableCell>

                          <TableCell className="font-medium">

                            {formatMonth(
                              due?.fee_month
                            )}

                            {isAdvanceReceived && (
                              <Badge className="ml-1.5 h-4 bg-blue-600 px-1 py-0 text-[10px] text-white hover:bg-blue-600">
                                Advance Paid
                              </Badge>
                            )}

                          </TableCell>

                          <TableCell className="font-medium">
                            {due?.component_name || "Fee Component"}
                          </TableCell>


                          <TableCell className="text-right">

                            {inr(
                              due?.amount
                            )}

                          </TableCell>


                          <TableCell className="text-right">

                            {toNumber(due?.discount)

                              ? <span className="text-orange-500">- {inr(due?.discount)}</span>

                              : "—"}

                          </TableCell>


                          <TableCell className="text-right">

                            {toNumber(due?.late_fee) ? (

                              <span className="text-destructive">

                                {inr(
                                    due?.late_fee
                                )}

                              </span>

                            ) : (

                              "—"

                            )}

                          </TableCell>


                          <TableCell className="text-right font-semibold">

                            {inr(
                              Math.max(
                                0,
                                toNumber(due?.amount) - toNumber(due?.discount)
                              )
                            )}

                          </TableCell>


                          <TableCell>

                            <Badge
                              variant="outline"
                              className={
                                status === "PAID"

                                  ? "bg-success/10 text-success border-success/20"

                                  : isAdvanceReceived

                                  ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"

                                  : status ===
                                    "OVERDUE"

                                  ? "bg-destructive/10 text-destructive border-destructive/20"

                                  : "bg-warning/15 text-warning border-warning/20"
                              }
                            >

                              {status === "PAID"

                                ? "Paid"

                                : isAdvanceReceived

                                ? "Advance received"

                                : status ===
                                  "OVERDUE"

                                ? "Overdue"

                                : "Due"}

                            </Badge>

                          </TableCell>

                        </TableRow>

                      );

                    }
                  )}


                  {dues.length ===
                    0 && (

                    <TableRow>

                      <TableCell
                        colSpan={8}
                        className="text-center text-sm text-muted-foreground py-8"
                      >

                        No fee dues found.

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </CardContent>

          </Card>

        </TabsContent>


        {/* ===================================================
            STRUCTURE
        =================================================== */}

        <TabsContent
          value="structure"
          className="mt-4"
        >

          <Card
            className="border-border/60"
          >

            <CardHeader className="pb-2">

              <CardTitle className="font-display text-base">

                Assigned Fee Structure

              </CardTitle>


              <CardDescription>

                Fee components assigned to your account.

              </CardDescription>

            </CardHeader>


            <CardContent className="p-0 overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Component
                    </TableHead>


                    <TableHead>
                      Frequency
                    </TableHead>


                    <TableHead className="text-right">
                      Amount
                    </TableHead>

                  </TableRow>

                </TableHeader>


                <TableBody>

                  {components.map(
                    (component) => (

                      <TableRow
                        key={
                          component.uuid
                        }
                      >

                        <TableCell className="font-medium">

                          {component.name}

                        </TableCell>


                        <TableCell>

                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >

                            Fee

                          </Badge>

                        </TableCell>


                        <TableCell className="text-right">

                          {inr(
                            component.amount
                          )}

                        </TableCell>

                      </TableRow>

                    )
                  )}


                  {components.length ===
                    0 && (

                    <TableRow>

                      <TableCell
                        colSpan={3}
                        className="text-center text-sm text-muted-foreground py-8"
                      >

                        No fee structure data found.

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </CardContent>

          </Card>

        </TabsContent>


        {/* ===================================================
            DISCOUNTS
        =================================================== */}

        <TabsContent value="discounts" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Assigned Discounts
              </CardTitle>
              <CardDescription>
                Discounts applied to your assigned fee components.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Discount Name</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Applies to Components</TableHead>
                    <TableHead>Months</TableHead>
                    <TableHead className="text-right">Total Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedDiscounts.map((discount) => (
                    <TableRow key={discount.key}>
                      <TableCell className="font-medium">{discount.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {discount.rule}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{discount.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{discount.displayValue}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-md flex-wrap gap-1">
                          {discount.components.map((component) => (
                            <Badge key={component} variant="secondary" className="font-normal">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-56 text-xs text-muted-foreground">
                        {discount.monthRange}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-500">
                        - {inr(discount.appliedAmount)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {assignedDiscounts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No discounts are assigned to your fees.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


        {/* ===================================================
            PAYMENT HISTORY
        =================================================== */}

        <TabsContent
          value="history"
          className="mt-4"
        >

          <Card
            className="border-border/60"
          >

            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3 flex-wrap">

              <div>

              <CardTitle className="font-display text-base flex items-center gap-2">

                <Receipt className="h-4 w-4" />

                Payment History

              </CardTitle>


              <CardDescription>

                {historyLoading
                  ? "Loading transactions..."
                  : `${paymentHistory.length} transactions · Total Paid: ${inr(paymentHistoryTotal)}`}

              </CardDescription>

              </div>

              <div className="flex items-center gap-2">

                <div className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setHistoryView("students")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      historyView === "students"
                        ? "bg-background text-foreground shadow-sm"
                        : "hover:text-foreground"
                    }`}
                  >
                    By Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryView("timeline")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      historyView === "timeline"
                        ? "bg-background text-foreground shadow-sm"
                        : "hover:text-foreground"
                    }`}
                  >
                    Timeline
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadPaymentHistory}
                  disabled={historyLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${historyLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

              </div>

            </CardHeader>


            {historyView === "students" && (
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Late Fee</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setFinancialHistoryOpen(true)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setFinancialHistoryOpen(true);
                        }
                      }}
                    >
                      <TableCell className="font-medium">My payments</TableCell>
                      <TableCell className="text-right font-semibold text-success">
                        {inr(paymentHistoryTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {inr(paymentHistory.reduce(
                          (total, payment) => total + toNumber(payment?.discount || payment?.discount_amount),
                          0
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        {inr(paymentHistory.reduce(
                          (total, payment) => total + toNumber(payment?.late_fee || payment?.late_fee_amount),
                          0
                        ))}
                      </TableCell>
                      <TableCell className="text-right">{paymentHistory.length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            )}

            <CardContent className={`${historyView === "timeline" ? "" : "hidden"} p-0 overflow-x-auto`}>

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Receipt
                    </TableHead>


                    <TableHead>
                      Kind
                    </TableHead>


                    <TableHead>
                      Mode
                    </TableHead>


                    <TableHead className="text-right">
                      Amount
                    </TableHead>

                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Late Fee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">
                      Action
                    </TableHead>

                  </TableRow>

                </TableHeader>


                <TableBody>

                  {historyLoading && (

                    <TableRow>

                      <TableCell
                        colSpan={9}
                        className="text-center py-8"
                      >

                        <Loader2
                          className="h-5 w-5 animate-spin mx-auto"
                        />

                      </TableCell>

                    </TableRow>

                  )}


                  {!historyLoading &&
                    paymentHistory.map(
                      (
                        payment,
                        index
                      ) => {

                        const receipt =
                          payment?.receipt_no ||
                          payment?.receipt_uuid ||
                          payment?.transaction_uuid ||
                          `PAY-${index + 1}`;


                        const paymentDate =
                          payment?.payment_date ||
                          payment?.created_at;


                        const amount =
                          payment?.amount ??
                          payment?.paid_amount ??
                          payment?.total_amount ??
                          0;


                        const mode =
                          payment?.payment_method ||
                          payment?.payment_mode ||
                          payment?.mode ||
                          "—";

                        const kind = getPaymentKind(payment);
                        const discount = toNumber(payment?.discount || payment?.discount_amount);
                        const lateFee = toNumber(payment?.late_fee || payment?.late_fee_amount);


                        return (

                          <TableRow
                            key={
                              payment?.transaction_uuid ||
                              payment?.receipt_uuid ||
                              index
                            }
                          >

                            <TableCell className="font-mono text-xs">

                              {receipt}

                            </TableCell>


                            <TableCell>
                              <Badge variant="outline" className="bg-muted/50 font-normal">
                                {kind}
                              </Badge>
                            </TableCell>


                            <TableCell>

                              {mode}

                            </TableCell>


                            <TableCell className="text-right font-semibold">

                              {inr(
                                amount
                              )}

                            </TableCell>

                            <TableCell className="text-right text-orange-500">
                              {discount ? `−${inr(discount)}` : "—"}
                            </TableCell>

                            <TableCell className="text-right text-orange-500">
                              {lateFee ? inr(lateFee) : "—"}
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                              {paymentDate
                                ? new Date(paymentDate).toLocaleDateString("en-IN")
                                : "—"}
                            </TableCell>

                            <TableCell>
                              <Badge className="border-0 bg-primary text-primary-foreground hover:bg-primary">
                                Success
                              </Badge>
                            </TableCell>


                            <TableCell className="text-right">

                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="View receipt"
                                  aria-label={`View receipt ${receipt}`}
                                  onClick={() => viewReceipt(payment)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Download receipt"
                                  aria-label={`Download receipt ${receipt}`}
                                  onClick={() => downloadReceipt(payment)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>

                            </TableCell>

                          </TableRow>

                        );

                      }
                    )}


                  {!historyLoading &&
                    paymentHistory.length ===
                      0 && (

                    <TableRow>

                      <TableCell
                        colSpan={9}
                        className="text-center text-sm text-muted-foreground py-8"
                      >

                        No payments recorded.

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </CardContent>

          </Card>

        </TabsContent>

      </Tabs>

      <Sheet open={financialHistoryOpen} onOpenChange={setFinancialHistoryOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>My Financial History</SheetTitle>
            <SheetDescription>
              {sessionYear ? `${sessionYear} · ` : ""}
              {paymentHistory.length} transactions · Paid: {inr(paymentHistoryTotal)}
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-2 py-4 md:grid-cols-4">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Total Fee</div>
              <div className="truncate text-sm font-medium">{inr(summary.payable)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Outstanding</div>
              <div className="text-lg font-semibold text-warning">{inr(summary.remaining)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Total Paid</div>
              <div className="text-lg font-semibold text-success">{inr(paymentHistoryTotal)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Advance Payments</div>
              <div className="text-lg font-semibold text-primary">
                {paymentHistory.filter((payment) =>
                  getPaymentKind(payment) === "Advance"
                ).length}
              </div>
            </div>
          </div>

          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Month-wise ledger
          </div>
          <div className="max-h-[42vh] overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dues.map((due, index) => {
                  const status = getStatus(due);
                  const advance = status === "ADVANCE_RECEIVED";
                  return (
                    <TableRow key={due?.due_uuid || index}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatMonth(due?.fee_month)}
                        {advance && (
                          <span className="block text-[10px] text-primary">Advance payment</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {due?.component_name || "Fee Component"}
                        {advance && <span className="ml-1 text-xs text-primary">[Advance]</span>}
                        {toNumber(due?.discount) > 0 && (
                          <span className="ml-1 text-xs text-orange-500">
                            (-{inr(due.discount)})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{inr(due?.amount)}</TableCell>
                      <TableCell className="text-right font-medium text-success">
                        {inr(toNumber(due?.paid_amount) || Math.max(0, toNumber(due?.amount) - toNumber(due?.discount)))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={advance ? "bg-muted text-xs" : "bg-success/10 text-xs text-success"}
                        >
                          {advance ? "ADVANCE" : status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mb-2 mt-5 text-xs font-semibold uppercase text-muted-foreground">
            Transaction history
          </div>
          <div className="max-h-[35vh] overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead>Months Covered</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment, index) => {
                  const receipt = payment?.receipt_no || payment?.receipt_uuid || payment?.transaction_uuid || `PAY-${index + 1}`;
                  const kind = getPaymentKind(payment);
                  const paymentDate = payment?.payment_date || payment?.created_at;
                  const discount = toNumber(payment?.discount || payment?.discount_amount);
                  const monthsCovered = [...new Set(
                    (Array.isArray(payment?.details) ? payment.details : [])
                      .map((detail) => detail?.fee_month)
                      .filter(Boolean)
                      .map((month) => new Date(month).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      }))
                  )].join(", ");
                  return (
                    <TableRow key={payment?.transaction_uuid || payment?.receipt_uuid || index}>
                      <TableCell className="font-mono text-xs">{receipt}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{kind}</Badge></TableCell>
                      <TableCell className="text-xs">{payment?.payment_method || payment?.payment_mode || payment?.mode || "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{inr(payment?.amount ?? payment?.paid_amount ?? payment?.total_amount)}</TableCell>
                      <TableCell className="text-right text-orange-500">
                        {discount ? `−${inr(discount)}` : "—"}
                      </TableCell>
                      <TableCell className="max-w-48 text-xs text-muted-foreground">
                        {monthsCovered || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {paymentDate
                          ? new Date(paymentDate).toLocaleDateString("en-CA")
                          : "—"}
                      </TableCell>
                      <TableCell><Badge className="text-xs">Success</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={loadPaymentHistory}
              disabled={historyLoading}
            >
              <RefreshCw className={`h-4 w-4 ${historyLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setFinancialHistoryOpen(false)}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>


      {/* =====================================================
          SECURITY MESSAGE
      ===================================================== */}

      <div className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1.5">

        <ShieldCheck
          className="h-3.5 w-3.5"
        />

        Payments are processed on a secure gateway.
        Receipts are available after successful payment.

      </div>


      {/* =====================================================
          PAYMENT CONFIRMATION
      ===================================================== */}

      {payOpen &&
        payTarget && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <Card className="w-full max-w-sm border-border/60">

            <CardHeader>

              <CardTitle className="font-display text-base">

                Confirm Payment

              </CardTitle>


              <CardDescription>

                {payTarget.label}

              </CardDescription>

            </CardHeader>


            <CardContent className="flex flex-col gap-4">

              <div className="text-3xl font-display font-semibold">

                {inr(
                  payTarget.amount
                )}

              </div>


              <div className="text-xs text-muted-foreground">

                {payTarget.dues?.length || 0} fee item
                {payTarget.dues?.length === 1
                  ? ""
                  : "s"} selected.

              </div>


              <div className="flex gap-2 justify-end">

                <Button
                  variant="outline"
                  onClick={() =>
                    setPayOpen(false)
                  }
                  disabled={
                    payLoading
                  }
                >

                  Cancel

                </Button>


                <Button
                  className="gradient-primary border-0"
                  onClick={
                    handlePay
                  }
                  disabled={
                    payLoading
                  }
                >

                  {payLoading ? (

                    <Loader2
                      className="h-4 w-4 animate-spin"
                    />

                  ) : (

                    <CreditCard
                      className="h-4 w-4"
                    />

                  )}


                  {payLoading

                    ? "Processing..."

                    : `Pay ${inr(
                        payTarget.amount
                      )}`}

                </Button>

              </div>

            </CardContent>

          </Card>

        </div>

      )}

    </PageContainer>
  );
}
