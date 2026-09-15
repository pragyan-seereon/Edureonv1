import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Landmark,
  Plus,
  ReceiptText,
  RefreshCw,
  Tags,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import {
  createOtherCollection,
  createOtherCollectionRazorpayOrder,
  createOtherCollectionType,
  getOtherCollections,
  getOtherCollectionReceiptPdf,
  getOtherCollectionTypes,
  updateOtherCollectionType,
  verifyOtherCollectionRazorpayPayment,
} from "../../../api/other_collection";
import { getAllRoles } from "../../../api/role";
import { getAllStudents } from "../../../api/students";
import { getEmployees } from "../../../api/employee";

const emptyType = { name: "", description: "" };
const emptyCollection = {
  role_uuid: "",
  person_uuid: "",
  collection_type_uuid: "",
  amount: "",
  discount: "0",
  payment_mode: "CASH",
  transaction_number: "",
  collection_date: "",
  remarks: "",
};

const PAYMENT_MODES = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];

const listFrom = (response) => {
  const body = response?.data ?? response;
  return Array.isArray(body) ? body : body?.data ?? [];
};

const errorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(", ");
  }
  return fallback;
};

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = resolve;
  script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
  document.body.appendChild(script);
});

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "—";

const STATUS_STYLES = {
  PAID: { label: "Paid", className: "bg-emerald-600 hover:bg-emerald-600 text-white border-transparent" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100" },
  FAILED: { label: "Failed", className: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100" },
};

const statusStyle = (status) =>
  STATUS_STYLES[status] || {
    label: status ? status.charAt(0) + status.slice(1).toLowerCase() : "Unknown",
    className: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
  };

export default function OtherCollection() {
  const [types, setTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [people, setPeople] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typesListDialogOpen, setTypesListDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [typeForm, setTypeForm] = useState(emptyType);
  const [collectionForm, setCollectionForm] = useState(emptyCollection);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [typeResponse, collectionResponse, roleResponse] = await Promise.all([
        getOtherCollectionTypes(),
        getOtherCollections(),
        getAllRoles({ page: 1, limit: 100, activeOnly: true }),
      ]);
      setTypes(listFrom(typeResponse));
      setCollections(listFrom(collectionResponse));
      setRoles(listFrom(roleResponse));
    } catch (error) {
      toast.error(errorMessage(error, "Unable to load other collections."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const paid = collections.filter(
      (c) => String(c.payment_status || "").toUpperCase() === "PAID"
    );
    const pending = collections.filter(
      (c) => String(c.payment_status || "").toUpperCase() === "PENDING"
    );
    const totalCollected = paid.reduce(
      (sum, c) => sum + Number(c.net_amount || 0),
      0
    );
    return {
      totalCollected,
      paidCount: paid.length,
      pendingCount: pending.length,
      activeTypes: types.filter((t) => t.is_active).length,
    };
  }, [collections, types]);

  const selectRole = async (roleUUID) => {
    setCollectionForm({ ...collectionForm, role_uuid: roleUUID, person_uuid: "" });
    setPeople([]);
    const role = roles.find((item) => (item.role_uuid || item.uuid) === roleUUID);
    const roleName = String(role?.name || role?.role_name || role?.code || "").toLowerCase();
    try {
      const response = roleName.includes("student")
        ? await getAllStudents()
        : await getEmployees();
      setPeople(listFrom(response));
    } catch (error) {
      toast.error(errorMessage(error, "Unable to load people for this role."));
    }
  };

  const personUUID = (person) => person.student_uuid || person.employee_uuid || person.person_uuid || person.uuid;
  const personName = (person) => person.full_name || person.name || [person.first_name, person.last_name].filter(Boolean).join(" ") || personUUID(person);

  const submitType = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createOtherCollectionType(typeForm);
      toast.success("Collection type created.");
      setTypeForm(emptyType);
      setTypeDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to create collection type."));
    } finally {
      setSaving(false);
    }
  };

  const submitCollection = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...collectionForm,
        amount: Number(collectionForm.amount),
        discount: Number(collectionForm.discount || 0),
        collection_date: collectionForm.collection_date || null,
        transaction_number: collectionForm.transaction_number || null,
        remarks: collectionForm.remarks || null,
      };
      if (payload.payment_mode === "UPI") {
        const { data: order } = await createOtherCollectionRazorpayOrder(payload);
        await loadRazorpay();
        new window.Razorpay({
          key: order.razorpay_key_id,
          amount: order.amount,
          currency: order.currency,
          order_id: order.razorpay_order_id,
          name: "Edureon",
          description: "Other Collection",
          handler: async (payment) => {
            try {
              await verifyOtherCollectionRazorpayPayment({
                collection_uuid: order.collection_uuid,
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_signature: payment.razorpay_signature,
              });
              toast.success("Online payment completed.");
              await loadData();
            } catch (verifyError) {
              toast.error(errorMessage(verifyError, "Payment verification failed."));
            }
          },
          modal: { ondismiss: () => toast.info("Payment was not completed.") },
          theme: { color: "#173b73" },
        }).open();
      } else {
        await createOtherCollection(payload);
        toast.success("Offline collection recorded.");
      }
      setCollectionForm(emptyCollection);
      setCollectionDialogOpen(false);
      if (payload.payment_mode !== "UPI") await loadData();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to record collection."));
    } finally {
      setSaving(false);
    }
  };

  const toggleType = async (type) => {
    try {
      await updateOtherCollectionType(type.uuid, { is_active: !type.is_active });
      toast.success(`Collection type ${type.is_active ? "disabled" : "enabled"}.`);
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to update collection type."));
    }
  };

  const openReceiptPdf = async (collection, download = false) => {
    try {
      const { data } = await getOtherCollectionReceiptPdf(collection.uuid);
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${collection.receipt_number || "receipt"}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error(errorMessage(error, "Unable to open receipt PDF."));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Other Collections"
        description="Record and manage institute-specific payments outside regular fee structures."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" onClick={() => setTypeDialogOpen(true)}>
              <Tags className="mr-2 h-4 w-4" /> Add type
            </Button>
            <Button
              className="bg-[#173b73] hover:bg-[#122f5c]"
              onClick={() => setCollectionDialogOpen(true)}
              disabled={!types.some((type) => type.is_active)}
            >
              <Plus className="mr-2 h-4 w-4" /> Record collection
            </Button>
          </div>
        }
      />

      {/* Summary strip + Payment history are wrapped together with a tighter, explicit gap
          so they don't inherit the larger default spacing from PageContainer. */}
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#173b73]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total collected</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{currency(stats.totalCollected)}</p>
            </div>
            <div className="rounded-full bg-[#173b73]/10 p-2.5 text-[#173b73]">
              <BadgeIndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Paid receipts</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.paidCount}</p>
            </div>
            <div className="rounded-full bg-emerald-600/10 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.pendingCount}</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-2.5 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active types KPI — now clickable, opens the Collection types popup */}
        <Card
          className="border-l-4 border-l-slate-400 cursor-pointer transition-shadow hover:shadow-md"
          role="button"
          tabIndex={0}
          onClick={() => setTypesListDialogOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTypesListDialogOpen(true);
            }
          }}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active types</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.activeTypes}</p>
            </div>
            <div className="rounded-full bg-slate-500/10 p-2.5 text-slate-600">
              <Tags className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment history now takes the full width; Collection types panel removed from here */}
      <div className="grid items-start gap-6">
        <Card className="mt-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment history</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && collections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <ReceiptText className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No other collections recorded yet.</p>
                    </TableCell>
                  </TableRow>
                )}
                {collections.map((collection) => {
                  const paymentStatus = String(collection.payment_status || "").toUpperCase();
                  const isPaid = paymentStatus === "PAID";
                  const status = statusStyle(paymentStatus);
                  return (
                    <TableRow key={collection.uuid} className="align-middle hover:bg-muted/30">
                      <TableCell className="align-middle">
                        <p className="font-medium leading-none">{collection.receipt_number || "—"}</p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {collection.collection_date
                            ? new Date(collection.collection_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </TableCell>
                      <TableCell className="align-middle text-sm text-muted-foreground">
                        {types.find((type) => type.uuid === collection.collection_type_uuid)?.name ||
                          collection.collection_type_uuid}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173b73]/10 text-[11px] font-semibold text-[#173b73]">
                            {initials(collection.person_name || "")}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-32 truncate text-sm">
                              {collection.person_name || "Person unavailable"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-sm text-muted-foreground">
                        {collection.role_name || collection.person_type || "â€”"}
                      </TableCell>
                      <TableCell className="align-middle text-right font-medium tabular-nums">
                        {currency(collection.net_amount)}
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge variant="outline" className={`font-medium ${status.className}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-middle text-right">
                        {isPaid ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openReceiptPdf(collection)}>
                              <Eye className="mr-1 h-4 w-4" /> View
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openReceiptPdf(collection, true)}>
                              <Download className="mr-1 h-4 w-4" /> Download
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Add type dialog */}
      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-[#173b73]" /> Add collection type
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type-name">Name</Label>
              <Input
                id="type-name"
                required
                placeholder="e.g. Sports fee"
                value={typeForm.name}
                onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-description">Description</Label>
              <Textarea
                id="type-description"
                placeholder="Optional context shown alongside the type"
                value={typeForm.description}
                onChange={(event) => setTypeForm({ ...typeForm, description: event.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-[#173b73] hover:bg-[#122f5c]">
                Save type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collection types popup — opened by clicking the "Active types" KPI card */}
      <Dialog open={typesListDialogOpen} onOpenChange={setTypesListDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[#173b73]" /> Collection types
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2.5">
            {types.length === 0 && !loading && (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Create a type before recording a collection.
                </p>
              </div>
            )}
            {types.map((type) => (
              <div
                key={type.uuid}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium leading-none">{type.name}</p>
                  {type.description && (
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">{type.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={type.is_active ? "outline" : "secondary"}
                  className="shrink-0"
                  onClick={() => toggleType(type)}
                >
                  {type.is_active ? "Disable" : "Enable"}
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTypesListDialogOpen(false);
                setTypeDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record collection dialog */}
      <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-[#173b73]" /> Record other collection
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCollection} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                required
                className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#173b73]/40"
                value={collectionForm.role_uuid}
                onChange={(event) => selectRole(event.target.value)}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.role_uuid || role.uuid} value={role.role_uuid || role.uuid}>
                    {role.name || role.role_name || role.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="person">Person</Label>
              <select
                id="person"
                required
                disabled={!collectionForm.role_uuid}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#173b73]/40 disabled:opacity-50"
                value={collectionForm.person_uuid}
                onChange={(event) => setCollectionForm({ ...collectionForm, person_uuid: event.target.value })}
              >
                <option value="">Select a person</option>
                {people.map((person) => (
                  <option key={personUUID(person)} value={personUUID(person)}>
                    {personName(person)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-type">Collection type</Label>
              <select
                id="collection-type"
                required
                className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#173b73]/40"
                value={collectionForm.collection_type_uuid}
                onChange={(event) =>
                  setCollectionForm({ ...collectionForm, collection_type_uuid: event.target.value })
                }
              >
                <option value="">Select a type</option>
                {types
                  .filter((type) => type.is_active)
                  .map((type) => (
                  <option key={type.uuid} value={type.uuid}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="pl-6"
                  value={collectionForm.amount}
                  onChange={(event) => setCollectionForm({ ...collectionForm, amount: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Payment mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() =>
                      setCollectionForm({
                        ...collectionForm,
                        payment_mode: mode.value,
                        transaction_number: mode.value === "UPI" ? "" : collectionForm.transaction_number,
                        collection_date: mode.value === "UPI" ? "" : collectionForm.collection_date,
                      })
                    }
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      collectionForm.payment_mode === mode.value
                        ? "border-[#173b73] bg-[#173b73]/10 text-[#173b73]"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            {collectionForm.payment_mode === "CHEQUE" && (
              <div className="space-y-2">
                <Label htmlFor="transaction">Transaction number</Label>
                <Input
                  id="transaction"
                  required
                  value={collectionForm.transaction_number}
                  onChange={(event) =>
                    setCollectionForm({ ...collectionForm, transaction_number: event.target.value })
                  }
                />
              </div>
            )}
            {collectionForm.payment_mode !== "UPI" && (
              <div className="space-y-2">
                <Label htmlFor="collection-date">Collection date</Label>
                <Input
                  id="collection-date"
                  type="datetime-local"
                  value={collectionForm.collection_date}
                  onChange={(event) =>
                    setCollectionForm({ ...collectionForm, collection_date: event.target.value })
                  }
                />
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Optional note for this collection"
                value={collectionForm.remarks}
                onChange={(event) => setCollectionForm({ ...collectionForm, remarks: event.target.value })}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="bg-[#173b73] hover:bg-[#122f5c]">
                <ReceiptText className="mr-2 h-4 w-4" /> Save payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}