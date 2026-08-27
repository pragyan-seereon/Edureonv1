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
import { Progress } from "../../components/ui/progress";

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
} from "lucide-react";

import { KpiCard } from "../../components/kpi-card";

import { toast } from "sonner";

import studentModel from "../../api/studentModel";

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
    status === "OVERDUE" ||
    status === "LATE"
  ) {
    return "OVERDUE";
  }

  return "DUE";
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

    } catch (err) {

      console.error(
        "Failed to load student dues:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load your fee details.";

      setError(message);

      setDues([]);

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


              const message =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Payment verification failed.";


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

    } catch (err) {

      console.error(
        "Payment initiation failed:",
        err
      );


      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to initiate payment.";


      toast.error(
        typeof message ===
          "string"
          ? message
          : "Unable to initiate payment."
      );

    } finally {

      /*
       * Do NOT close payLoading here while Razorpay is open.
       *
       * The Razorpay callback controls the loading state.
       */

    }
  };


  // ==========================================================
  // Download Receipt
  // ==========================================================

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

              {error}

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
        className="border-border/60 mb-6"
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

            <CardHeader className="pb-2">

              <CardTitle className="font-display text-base">

                Month-wise Status

              </CardTitle>


              <CardDescription>

                Your assigned fee dues and payment status.

              </CardDescription>

            </CardHeader>


            <CardContent className="p-0 overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Month
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


                    <TableHead className="text-right">
                      Action
                    </TableHead>

                  </TableRow>

                </TableHeader>


                <TableBody>

                  {monthLines.map(
                    (month) => {

                      const status =
                        month.statuses.includes(
                          "OVERDUE"
                        )
                          ? "OVERDUE"
                          : month.balance_amount <= 0
                          ? "PAID"
                          : "DUE";


                      const payable =
                        Math.max(
                          0,
                          month.amount -
                            month.discount +
                            month.late_fee
                        );


                      return (

                        <TableRow
                          key={
                            month.key
                          }
                        >

                          <TableCell className="font-medium">

                            {formatMonth(
                              month.fee_month
                            )}

                          </TableCell>


                          <TableCell className="text-right">

                            {inr(
                              month.amount
                            )}

                          </TableCell>


                          <TableCell className="text-right">

                            {month.discount

                              ? inr(
                                  month.discount
                                )

                              : "—"}

                          </TableCell>


                          <TableCell className="text-right">

                            {month.late_fee ? (

                              <span className="text-destructive">

                                {inr(
                                  month.late_fee
                                )}

                              </span>

                            ) : (

                              "—"

                            )}

                          </TableCell>


                          <TableCell className="text-right font-semibold">

                            {status ===
                            "PAID"

                              ? "—"

                              : inr(
                                  Math.max(
                                    0,
                                    month.balance_amount
                                  )
                                )}

                          </TableCell>


                          <TableCell>

                            <Badge
                              variant="outline"
                              className={
                                status ===
                                "PAID"

                                  ? "bg-success/10 text-success border-success/20"

                                  : status ===
                                    "OVERDUE"

                                  ? "bg-destructive/10 text-destructive border-destructive/20"

                                  : "bg-warning/15 text-warning border-warning/20"
                              }
                            >

                              {status ===
                              "PAID"

                                ? "Paid"

                                : status ===
                                  "OVERDUE"

                                ? "Overdue"

                                : "Due"}

                            </Badge>

                          </TableCell>


                          <TableCell className="text-right">

                            {month.balance_amount >
                              0 && (

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openPayMonth(
                                    month
                                  )
                                }
                                disabled={
                                  payLoading
                                }
                              >

                                Pay

                              </Button>

                            )}

                          </TableCell>

                        </TableRow>

                      );

                    }
                  )}


                  {monthLines.length ===
                    0 && (

                    <TableRow>

                      <TableCell
                        colSpan={7}
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
            PAYMENT HISTORY
        =================================================== */}

        <TabsContent
          value="history"
          className="mt-4"
        >

          <Card
            className="border-border/60"
          >

            <CardHeader className="pb-2">

              <CardTitle className="font-display text-base flex items-center gap-2">

                <Receipt className="h-4 w-4" />

                Payment History

              </CardTitle>


              <CardDescription>

                Your completed fee payments.

              </CardDescription>

            </CardHeader>


            <CardContent className="p-0 overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow>

                    <TableHead>
                      Receipt
                    </TableHead>


                    <TableHead>
                      Date
                    </TableHead>


                    <TableHead>
                      Mode
                    </TableHead>


                    <TableHead className="text-right">
                      Amount
                    </TableHead>


                    <TableHead className="text-right">
                      Slip
                    </TableHead>

                  </TableRow>

                </TableHeader>


                <TableBody>

                  {historyLoading && (

                    <TableRow>

                      <TableCell
                        colSpan={5}
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

                              {paymentDate

                                ? new Date(
                                    paymentDate
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )

                                : "—"}

                            </TableCell>


                            <TableCell>

                              {mode}

                            </TableCell>


                            <TableCell className="text-right font-semibold">

                              {inr(
                                amount
                              )}

                            </TableCell>


                            <TableCell className="text-right">

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  downloadReceipt(
                                    payment
                                  )
                                }
                              >

                                <Download
                                  className="h-4 w-4"
                                />

                              </Button>

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
                        colSpan={5}
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