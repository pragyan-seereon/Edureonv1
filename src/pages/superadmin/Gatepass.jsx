/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, DoorOpen, Eye, Loader2, Pencil, Plus, Printer, ShieldCheck, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { KpiCard } from "../../components/kpi-card";
import { createGatePass, deleteGatePass, getGatePassByUUID, getGatePasses, searchGatePassStudents, searchGatePassEmployees,returnGatePass } from "../../api/gatepass";
import { getClasses } from "../../api/Class";
import { getSections } from "../../api/section";
import { getDepartments } from "../../api/department";

const PAGE_SIZES = [10, 25, 50, 100];
const EMPTY_FORM = { passType: "STUDENT", name: "", studentUuid: "", employeeUuid: "", classUuid: "", sectionUuid: "", departmentUuid: "", rollNo: "", outTime: "", inTime: "", contact: "", purpose: "", authority: "", accompaniedBy: "", vehicle: "" };
function timeToIso(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const mapPass = (row) => ({
  id: row.gate_pass_uuid ?? row.uuid ?? row.id,
  number: row.gate_pass_number ?? row.gate_pass_uuid ?? "—",
  type: String(row.pass_type ?? "STUDENT").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
  name: row.person_name ?? row.full_name ?? "—",
  className: row.class_name ?? row.class?.class_name ?? "",
  sectionName: row.section_name ?? row.section?.section_name ?? "",
  department: row.department_name ?? "",
  studentUuid: row.student_uuid ?? "",
  employeeUuid: row.employee_uuid ?? "",
  classUuid: row.class_uuid ?? "",
  sectionUuid: row.section_uuid ?? "",
  departmentUuid: row.department_uuid ?? "",
  outTime: row.out_time,
  inTime: row.in_time,
  purpose: row.purpose ?? "—",
  vehicle: row.vehicle_number ?? "—",
  authority: row.permission_authority ?? "—",
  contact: row.contact_number ?? "—",
  accompaniedBy: row.accompanied_by ?? "—",
  rollNo: row.roll_no ?? row.roll_number ?? "—",
  status: String(row.status ?? "OUT").toUpperCase() === "OUT" ? "Out" : "Returned",
});

const passTime = (value) => value
  ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  : "—";

const passClassOrDepartment = (pass) => pass.type === "Student"
  ? [pass.className, pass.sectionName && `Sec ${pass.sectionName}`, pass.rollNo !== "—" && `Roll ${pass.rollNo}`].filter(Boolean).join(" · ") || "—"
  : pass.department || "—";

function downloadPassPdf(pass) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const rows = [
    ["Name", pass.name, "Class / Department", passClassOrDepartment(pass)],
    ["Contact", pass.contact, "Vehicle No.", pass.vehicle],
    ["Out Time", passTime(pass.outTime), "In Time", passTime(pass.inTime)],
    ["Permission Authority", pass.authority, "Accompanied By", pass.accompaniedBy],
    ["Purpose", pass.purpose, "Status", pass.status],
  ];

  pdf.setFillColor(26, 101, 165);
  pdf.rect(15, 15, 180, 27, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text("Edureon School", 21, 27);
  pdf.setFontSize(10);
  pdf.text(`GATE PASS · ${pass.type.toUpperCase()}`, 21, 35);
  pdf.text(pass.number, 188, 31, { align: "right" });
  let y = 56;
  rows.forEach(([leftLabel, leftValue, rightLabel, rightValue]) => {
    pdf.setFontSize(9);
    pdf.setTextColor(93, 109, 126);
    pdf.text(leftLabel.toUpperCase(), 21, y);
    pdf.text(rightLabel.toUpperCase(), 108, y);
    pdf.setFontSize(11);
    pdf.setTextColor(20, 32, 48);
    pdf.text(String(leftValue), 21, y + 7, { maxWidth: 76 });
    pdf.text(String(rightValue), 108, y + 7, { maxWidth: 76 });
    y += 20;
  });
  pdf.setDrawColor(220, 228, 235);
  pdf.line(15, y, 195, y);
  pdf.setFontSize(9);
  pdf.setTextColor(93, 109, 126);
  pdf.text("Holder Signature", 21, y + 15);
  pdf.text("Authority Signature", 105, y + 15, { align: "center" });
  pdf.text("Security Gate", 189, y + 15, { align: "right" });
  pdf.save(`gate-pass-${pass.number}.pdf`);
}

export default function GatePassPage() {
  const [passes, setPasses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [employeeResults, setEmployeeResults] = useState([]);
  const [showEmployeeResults, setShowEmployeeResults] = useState(false);
  const [searchingEmployees, setSearchingEmployees] = useState(false);
  const [previewPass, setPreviewPass] = useState(null);
  const [editingPassUuid, setEditingPassUuid] = useState(null);
const [originalInTime, setOriginalInTime] = useState("");
  const [actionPassUuid, setActionPassUuid] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const selectedStudentRef = useRef(false);

  const loadPasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
const response = await getGatePasses(page, pageSize);
      setPasses((response?.data ?? []).map(mapPass));
      setTotal(Number(response?.total ?? 0));
    } catch {
      setPasses([]);
      setTotal(0);
      setError("Couldn't load gate passes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadPasses(); }, [loadPasses]);
  useEffect(() => {
    if (!createOpen) return;
    Promise.all([getClasses(), getDepartments()])
      .then(([classResponse, departmentResponse]) => {
        setClasses(classResponse?.data ?? classResponse ?? []);
        setDepartments(departmentResponse?.data ?? departmentResponse ?? []);
      })
      .catch(() => toast.error("Failed to load form options"));
  }, [createOpen]);
  useEffect(() => {
    if (!form.classUuid) { setSections([]); return; }
    getSections().then((response) => setSections((response?.data ?? response ?? []).filter((section) => section.class_uuid === form.classUuid))).catch(() => toast.error("Failed to load sections"));
  }, [form.classUuid]);
  useEffect(() => {
    if (form.passType !== "STUDENT" || selectedStudentRef.current || !form.name.trim()) {
      setStudentResults([]);
      setShowStudentResults(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const response = await searchGatePassStudents(form.name.trim());
        setStudentResults(response?.data ?? []);
        setShowStudentResults(true);
      } catch {
        setStudentResults([]);
      } finally {
        setSearchingStudents(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.name, form.passType]);

  useEffect(() => {
    if (form.passType !== "EMPLOYEE" || selectedStudentRef.current || !form.name.trim()) {
      setEmployeeResults([]);
      setShowEmployeeResults(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSearchingEmployees(true);
      try {
        const response = await searchGatePassEmployees(form.name.trim());
        setEmployeeResults(response?.data ?? []);
        setShowEmployeeResults(true);
      } catch {
        setEmployeeResults([]);
      } finally {
        setSearchingEmployees(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.name, form.passType]);
  const selectStudent = (student) => {
    selectedStudentRef.current = true;
    setForm((current) => ({
      ...current,
      name: student.full_name ?? "",
      studentUuid: student.student_uuid ?? "",
      classUuid: student.class_uuid ?? "",
      sectionUuid: student.section_uuid ?? "",
      contact: student.primary_phone ?? current.contact,
    }));
    setShowStudentResults(false);
  };

  
 const selectEmployee = (employee) => {
    selectedStudentRef.current = true;
    setForm((current) => ({
      ...current,
      name: employee.full_name ?? "",
      employeeUuid: employee.employee_uuid ?? "",
      departmentUuid: employee.department_uuid ?? "",
      contact: employee.phone ?? current.contact,
    }));
    setShowEmployeeResults(false);
  };

  const changePassType = (passType) => {
    selectedStudentRef.current = false;
    setShowStudentResults(false);
    setShowEmployeeResults(false);
    setForm((current) => ({
      ...current,
      passType,
      name: "",
      studentUuid: "",
      employeeUuid: "",
      classUuid: "",
      sectionUuid: "",
      departmentUuid: "",
    }));
  };

  const fetchPassById = async (pass) => {
    const response = await getGatePassByUUID(pass.id);
    return mapPass(response?.data ?? response);
  };

  const viewPass = async (pass) => {
    setActionPassUuid(pass.id);
    try {
      setPreviewPass(await fetchPassById(pass));
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message ?? "Failed to load gate pass.");
    } finally {
      setActionPassUuid(null);
    }
  };

  const editPass = async (pass) => {
    setActionPassUuid(pass.id);
    try {
       const current = await fetchPassById(pass);
      selectedStudentRef.current = true;
      setEditingPassUuid(current.id);
      setOriginalInTime(current.inTime?.slice(11, 16) ?? "");
      setForm({
        passType: current.type.toUpperCase(),
        name: current.name === "—" ? "" : current.name,
        studentUuid: current.studentUuid,
        employeeUuid: current.employeeUuid,
        classUuid: current.classUuid,
        sectionUuid: current.sectionUuid,
        departmentUuid: current.departmentUuid,
        rollNo: current.rollNo === "—" ? "" : current.rollNo,
        outTime: current.outTime?.slice(11, 16) ?? "",
        inTime: current.inTime?.slice(11, 16) ?? "",
        contact: current.contact === "—" ? "" : current.contact,
        purpose: current.purpose === "—" ? "" : current.purpose,
        authority: current.authority === "—" ? "" : current.authority,
        accompaniedBy: current.accompaniedBy === "—" ? "" : current.accompaniedBy,
        vehicle: current.vehicle === "—" ? "" : current.vehicle,
      });
      setCreateOpen(true);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message ?? "Failed to load gate pass.");
    } finally {
      setActionPassUuid(null);
    }
  };

 
  const removePass = async (pass) => {
    setDeleteTarget(pass);
  };

  const confirmDeletePass = async () => {
    if (!deleteTarget) return;
    const pass = deleteTarget;
    setActionPassUuid(pass.id);
    try {
      await deleteGatePass(pass.id);
      toast.success("Gate pass deleted.");
      setDeleteTarget(null);
      if (passes.length === 1 && page > 1) setPage((current) => current - 1);
      else loadPasses();
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message ?? "Failed to delete gate pass.");
    } finally {
      setActionPassUuid(null);
    }
  };

  const createPass = async () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.outTime) errors.outTime = "Out time is required.";
    if (!form.purpose.trim()) errors.purpose = "Purpose is required.";
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.error("Please complete the required fields.");
      return;
    }
    setSaving(true);
    try {
     // eslint-disable-next-line no-unused-vars
     const payload = {
        pass_type: form.passType,
        person_name: form.name.trim(),
        ...(form.studentUuid ? { student_uuid: form.studentUuid } : {}),
        ...(form.employeeUuid ? { employee_uuid: form.employeeUuid } : {}),
        out_time: timeToIso(form.outTime),
        ...(form.inTime ? { in_time: timeToIso(form.inTime) } : {}),
        ...(form.classUuid ? { class_uuid: form.classUuid } : {}),
        ...(form.sectionUuid ? { section_uuid: form.sectionUuid } : {}),
        ...(form.departmentUuid ? { department_uuid: form.departmentUuid } : {}),
        contact_number: form.contact,
        purpose: form.purpose.trim(),
        permission_authority: form.authority,
        vehicle_number: form.vehicle,
        accompanied_by: form.accompaniedBy,
      };
                 if (editingPassUuid) {
        if (form.inTime && !originalInTime) {
          await returnGatePass(editingPassUuid);
        }
      } else {
        const payload = {
          pass_type: form.passType,
          person_name: form.name.trim(),
          ...(form.studentUuid ? { student_uuid: form.studentUuid } : {}),
          ...(form.employeeUuid ? { employee_uuid: form.employeeUuid } : {}),
          out_time: timeToIso(form.outTime),
          ...(form.inTime ? { in_time: timeToIso(form.inTime) } : {}),
          ...(form.classUuid ? { class_uuid: form.classUuid } : {}),
          ...(form.sectionUuid ? { section_uuid: form.sectionUuid } : {}),
          ...(form.departmentUuid ? { department_uuid: form.departmentUuid } : {}),
          contact_number: form.contact,
          purpose: form.purpose.trim(),
          permission_authority: form.authority,
          vehicle_number: form.vehicle,
          accompanied_by: form.accompaniedBy,
        };
        await createGatePass(payload);
      }
      toast.success(editingPassUuid ? "Gate pass updated." : "Gate pass generated.");
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      setEditingPassUuid(null);
      if (page === 1) loadPasses(); else setPage(1);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message ?? "Failed to generate gate pass.");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const returned = passes.filter((pass) => pass.status === "Returned").length;
  const out = passes.filter((pass) => pass.status === "Out").length;

  return (
    <PageContainer>
      <PageHeader eyebrow="Admin · Documents" title="Gate Pass Register"  actions={<Button size="sm" className="gradient-primary border-0" onClick={() => { setEditingPassUuid(null); setOriginalInTime(""); setFormErrors({}); setForm(EMPTY_FORM); setCreateOpen(true); }}><Plus className="h-4 w-4" />New Gate Pass</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Passes" value={total} icon={<DoorOpen className="h-5 w-5" />} tone="primary" />
        <KpiCard label="Currently Out (page)" value={out} icon={<DoorOpen className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Returned (page)" value={returned} icon={<ShieldCheck className="h-5 w-5" />} tone="success" />
      </div>

      <Card className="border-border/60">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-display text-base">Issued Gate Passes</CardTitle>
          </div>
          <div className="w-[180px]">
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAGE_SIZES.map((size) => <SelectItem key={size} value={String(size)}>{size} per page</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Pass No.</TableHead><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Class / Dept.</TableHead><TableHead>Out</TableHead><TableHead>In</TableHead><TableHead>Purpose</TableHead><TableHead>Vehicle</TableHead><TableHead>Authority</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={11} className="py-8 text-center text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading gate passes…</TableCell></TableRow>}
              {!loading && error && <TableRow><TableCell colSpan={11} className="py-8 text-center text-destructive">{error}</TableCell></TableRow>}
              {!loading && !error && passes.map((pass) => <TableRow key={pass.id}>
                <TableCell className="font-mono text-xs">{pass.number}</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">{pass.type}</Badge></TableCell>
                <TableCell className="font-medium">{pass.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{pass.type === "Student" ? [pass.className, pass.sectionName].filter(Boolean).join(" · ") || "—" : pass.department || "—"}</TableCell>
                <TableCell className="text-xs">{pass.outTime ? new Date(pass.outTime).toLocaleString() : "—"}</TableCell>
                <TableCell className="text-xs">{pass.inTime ? new Date(pass.inTime).toLocaleString() : "—"}</TableCell>
                <TableCell className="max-w-[180px] truncate text-xs">{pass.purpose}</TableCell>
                <TableCell className="text-xs">{pass.vehicle}</TableCell>
                <TableCell className="text-xs">{pass.authority}</TableCell>
                <TableCell><Badge variant="outline" className={pass.status === "Out" ? "bg-warning/15 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}>{pass.status}</Badge></TableCell>
                <TableCell><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" title="View gate pass" disabled={actionPassUuid === pass.id} onClick={() => viewPass(pass)}>{actionPassUuid === pass.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}</Button><Button variant="ghost" size="icon" className="h-7 w-7" title="Edit gate pass" disabled={actionPassUuid === pass.id} onClick={() => editPass(pass)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Delete gate pass" disabled={actionPassUuid === pass.id} onClick={() => removePass(pass)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
              </TableRow>)}
              {!loading && !error && passes.length === 0 && <TableRow><TableCell colSpan={11} className="py-8 text-center text-muted-foreground">No gate passes found.</TableCell></TableRow>}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-xs text-muted-foreground">Showing {passes.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + passes.length} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingPassUuid ? "Edit Gate Pass" : "New Gate Pass"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><Label>Pass type <span className="text-destructive">*</span></Label><Select value={form.passType} onValueChange={changePassType}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="STUDENT">Student</SelectItem><SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem><SelectItem value="VISITOR">Visitor</SelectItem></SelectContent></Select></div>
<div className="relative">
  <Label>Name <span className="text-destructive">*</span></Label>
  <Input
    className={formErrors.name ? "mt-1 border-destructive" : "mt-1"}
    value={form.name}
   onChange={(event) => {
      selectedStudentRef.current = false;
      setForm((current) => ({ ...current, name: event.target.value, studentUuid: "", employeeUuid: "", classUuid: "", sectionUuid: "", departmentUuid: "" }));
      setFormErrors((current) => ({ ...current, name: "" }));
    }}
    onFocus={() => {
      if (form.passType === "STUDENT" && studentResults.length > 0) setShowStudentResults(true);
      if (form.passType === "EMPLOYEE" && employeeResults.length > 0) setShowEmployeeResults(true);
    }}
placeholder={form.passType === "STUDENT" ? "Type a student name" : form.passType === "EMPLOYEE" ? "Type an employee name" : "Enter name"}  />
  {form.passType === "STUDENT" && (showStudentResults || searchingStudents) && (
    <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
      {searchingStudents && <div className="px-3 py-2 text-xs text-muted-foreground">Searching students…</div>}
      {!searchingStudents && studentResults.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No students found.</div>}
      {studentResults.map((student) => (
        <button key={student.student_uuid} type="button" onClick={() => selectStudent(student)} className="w-full border-b border-border/60 px-3 py-2 text-left last:border-0 hover:bg-muted">
          <div className="text-sm font-medium">{student.full_name}</div>
          <div className="text-xs text-muted-foreground">{[student.class_name, student.section_name].filter(Boolean).join(" · ") || "No class assigned"}</div>
        </button>
      ))}
    </div>
  )}
  {form.passType === "EMPLOYEE" && (showEmployeeResults || searchingEmployees) && (
    <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
      {searchingEmployees && <div className="px-3 py-2 text-xs text-muted-foreground">Searching employees…</div>}
      {!searchingEmployees && employeeResults.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No employees found.</div>}
      {employeeResults.map((employee) => (
        <button key={employee.employee_uuid} type="button" onClick={() => selectEmployee(employee)} className="w-full border-b border-border/60 px-3 py-2 text-left last:border-0 hover:bg-muted">
          <div className="text-sm font-medium">{employee.full_name}</div>
          <div className="text-xs text-muted-foreground">{[employee.designation, employee.department_name].filter(Boolean).join(" · ") || "No department assigned"}</div>
        </button>
      ))}
    </div>
  )}
{formErrors.name && <FieldError message={formErrors.name} />}</div>{form.passType === "STUDENT" && <><div><Label>Class</Label><Select value={form.classUuid} onValueChange={(classUuid) => setForm({ ...form, classUuid, sectionUuid: "" })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classes.map((item) => <SelectItem key={item.class_uuid} value={item.class_uuid}>{item.class_name}</SelectItem>)}</SelectContent></Select></div><div><Label>Section</Label><Select value={form.sectionUuid} onValueChange={(sectionUuid) => setForm({ ...form, sectionUuid })} disabled={!form.classUuid}><SelectTrigger className="mt-1"><SelectValue placeholder="Select section" /></SelectTrigger><SelectContent>{sections.map((item) => <SelectItem key={item.section_uuid} value={item.section_uuid}>{item.section_name}</SelectItem>)}</SelectContent></Select></div><div><Label>Roll No.</Label><Input className="mt-1" value={form.rollNo} onChange={(event) => setForm({ ...form, rollNo: event.target.value })} placeholder="14" /></div></>}
            {form.passType === "EMPLOYEE" && <div><Label>Department</Label><Select value={form.departmentUuid} onValueChange={(departmentUuid) => setForm((current) => ({ ...current, departmentUuid }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((item) => <SelectItem key={item.department_uuid} value={item.department_uuid}>{item.department_name}</SelectItem>)}</SelectContent></Select></div>}
            <div><Label>Contact No.</Label><Input className="mt-1" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} placeholder="+91 …" /></div>
            <div><Label>Out Time <span className="text-destructive">*</span></Label><Input className={formErrors.outTime ? "mt-1 border-destructive" : "mt-1"} type="time" value={form.outTime} onChange={(event) => { setForm({ ...form, outTime: event.target.value }); setFormErrors((current) => ({ ...current, outTime: "" })); }} />{formErrors.outTime && <FieldError message={formErrors.outTime} />}</div>
<div><Label>In Time</Label><Input className="mt-1" type="time" value={form.inTime} onChange={(event) => setForm({ ...form, inTime: event.target.value })} /></div>           <div><Label>Vehicle No.</Label><Input className="mt-1" value={form.vehicle} onChange={(event) => setForm({ ...form, vehicle: event.target.value })} /></div>
            <div><Label>Permission Authority</Label><Input className="mt-1" value={form.authority} onChange={(event) => setForm({ ...form, authority: event.target.value })} /></div>
            <div><Label>Accompanied By</Label><Input className="mt-1" value={form.accompaniedBy} onChange={(event) => setForm({ ...form, accompaniedBy: event.target.value })} placeholder="Parent / Guardian / Staff" /></div>
            <div className="md:col-span-2"><Label>Purpose <span className="text-destructive">*</span></Label><Textarea className={formErrors.purpose ? "mt-1 border-destructive" : "mt-1"} rows={2} value={form.purpose} onChange={(event) => { setForm({ ...form, purpose: event.target.value }); setFormErrors((current) => ({ ...current, purpose: "" })); }} />{formErrors.purpose && <FieldError message={formErrors.purpose} />}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setCreateOpen(false); setEditingPassUuid(null); }}>Cancel</Button><Button className="gradient-primary border-0" disabled={saving} onClick={createPass}>{saving ? "Saving…" : editingPassUuid ? "Update Pass" : "Generate Pass"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(previewPass)} onOpenChange={(open) => !open && setPreviewPass(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Gate Pass · {previewPass?.number}</DialogTitle></DialogHeader>
          {previewPass && <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="gradient-primary flex items-center justify-between px-5 py-4 text-primary-foreground">
              <div><div className="font-display text-lg font-semibold">Edureon School</div><div className="text-[11px] font-medium uppercase tracking-wide opacity-85">Gate Pass · {previewPass.type}</div></div>
              <div className="font-mono text-sm font-semibold">{previewPass.number}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-5 text-sm">
              <PassDetail label="Name" value={previewPass.name} />
              <PassDetail label="Class / Dept." value={passClassOrDepartment(previewPass)} />
              <PassDetail label="Contact" value={previewPass.contact} />
              <PassDetail label="Vehicle No." value={previewPass.vehicle} />
              <PassDetail label="Out Time" value={passTime(previewPass.outTime)} />
              <PassDetail label="In Time" value={passTime(previewPass.inTime)} />
              <PassDetail label="Permission Authority" value={previewPass.authority} />
              <PassDetail label="Accompanied By" value={previewPass.accompaniedBy} />
              <PassDetail label="Purpose" value={previewPass.purpose} className="col-span-2" />
            </div>
            <div className="flex justify-between border-t border-border/60 px-5 py-4 text-xs text-muted-foreground"><span>Holder Signature</span><span>Authority Signature</span><span>Security Gate</span></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewPass(null)}>Close</Button><Button className="gradient-primary border-0" onClick={() => downloadPassPdf(previewPass)}><Printer className="h-4 w-4" />Print</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !actionPassUuid && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gate pass?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {deleteTarget?.number || "this gate pass"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(actionPassUuid)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={Boolean(actionPassUuid)} onClick={(event) => { event.preventDefault(); confirmDeletePass(); }}>
              {actionPassUuid ? "Deleting..." : "Delete gate pass"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function PassDetail({ label, value, className = "" }) {
  return <div className={className}><div className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div><div className="font-medium text-foreground">{value || "—"}</div></div>;
}

function FieldError({ message }) {
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}
