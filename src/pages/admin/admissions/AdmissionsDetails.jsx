


import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Progress } from "../../../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  ChevronLeft,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileCheck2,
  Trash2,
  Archive,
  IndianRupee,
  CheckCircle2,
  Circle,
  Clock,
  Save,
  FileUp,
  ShieldCheck,
  RefreshCw,
  Briefcase,
} from "lucide-react";

import {
  getAdmissionByUuid,
  updateAdmission,
  enrollStudent,
  getAdmissionStageHistory,
  getStages,
  deleteAdmission,
  archiveAdmission,
  restoreAdmission,
  getAdmissionCounselors,
  getAdmissionActivityLogs,
  createFollowup,
  getFollowups,
  completeFollowup,
  deleteFollowup,
  getSections,
  reinstateAdmission,
} from "../../../api/admissions";
import { getClasses } from "../../../api/class";


import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const stageColor = {
  Inquiry: "bg-muted text-muted-foreground",
  Lead: "bg-info/15 text-info",
  Counseling: "bg-chart-3/15 text-chart-3",
  "Admission Test": "bg-warning/15 text-warning",
  "Doc Verification": "bg-accent/15 text-accent-foreground",
  "Fee Payment": "bg-chart-5/15 text-chart-5",
  Enrolled: "bg-success/15 text-success",
  Rejected: "bg-destructive/15 text-destructive",
};

// Mirrors the backend's AdmissionUpdate validators exactly (see admissions schema).
// Only checks whichever keys are present in `d`, so each tab can call this with
// just its own slice of fields.
function validateAdmissionUpdate(d) {
  const errs = {};

  // full_name — Update requires 3+ chars (Create only requires 2+)
  if (d.full_name !== undefined && d.full_name !== null && d.full_name !== "") {
    if (d.full_name.trim().length < 3) {
      errs.full_name = "Full name must be at least 3 characters";
    }
  }

  // gender
  if (d.gender && !["Male", "Female", "Other"].includes(d.gender)) {
    errs.gender = "Invalid gender";
  }

  // dates cannot be in the future
  ["dob", "father_dob", "mother_dob", "guardian_dob", "admission_date", "joining_date"].forEach((k) => {
    if (d[k]) {
      const dt = new Date(d[k]);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dt > today) {
        errs[k] = "Future date is not allowed";
      }
    }
  });

  // blood group
  if (d.blood_group && !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(d.blood_group)) {
    errs.blood_group = "Invalid blood group";
  }

  // aadhaar — 12 digits
  ["aadhaar_no", "father_aadhaar_no", "mother_aadhaar_no"].forEach((k) => {
    if (d[k] && !/^\d{12}$/.test(d[k])) {
      errs[k] = "Aadhaar number must be 12 digits";
    }
  });

  // email
  ["email", "alternate_email"].forEach((k) => {
    if (d[k] && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(d[k])) {
      errs[k] = "Invalid email address";
    }
  });

  // mobile — 10 digits, starts 6-9
  ["primary_phone", "alternate_mobile_no", "guardian_mobile_no"].forEach((k) => {
    if (d[k] && !/^[6-9]\d{9}$/.test(d[k])) {
      errs[k] = "Mobile number must be 10 digits";
    }
  });

  // category
  if (d.category && !["General", "OBC", "SC", "ST", "EWS"].includes(d.category)) {
    errs.category = "Invalid category";
  }

  // session_year — must look like 2026-27
  if (d.session_year && !/^\d{4}-\d{2}$/.test(d.session_year)) {
    errs.session_year = "Session year must be like 2026-27";
  }

  // percentages — 0-100
  ["attendance_percentage", "last_aggregate_percentage"].forEach((k) => {
    if (d[k] !== "" && d[k] !== null && d[k] !== undefined) {
      const v = Number(d[k]);
      if (Number.isNaN(v) || v < 0 || v > 100) {
        errs[k] = "Percentage must be between 0 and 100";
      }
    }
  });

  // pin_code — 6 digits
  if (d.pin_code && !/^\d{6}$/.test(d.pin_code)) {
    errs.pin_code = "PIN code must be 6 digits";
  }

  // siblings — >= 0
  // if (d.siblings !== "" && d.siblings !== null && d.siblings !== undefined) {
  //   const s = Number(d.siblings);
  //   if (Number.isNaN(s) || s < 0) {
  //     errs.siblings = "Siblings cannot be negative";
  //   }
  // }

  // fee_status
  if (d.fee_status && !["PAID", "PARTIAL", "PENDING"].includes(d.fee_status)) {
    errs.fee_status = "Invalid fee status";
  }

  return errs;
}

export default function AdmissionsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inq, setInq] = useState(null);
  const [history, setHistory] = useState([]);
  const [stages, setStages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [commOpen, setCommOpen] = useState(false);
  const [comm, setComm] = useState({ channel: "Email", subject: "", body: "" });
  const [fu, setFu] = useState({ due: "", note: "" });
  const [followups, setFollowups] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showRejectionReason, setShowRejectionReason] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const admissionRes = await getAdmissionByUuid(id);
      const historyRes = await getAdmissionStageHistory(id);
      const counselorRes = await getAdmissionCounselors();
      const stagesRes = await getStages();
      const activityRes = await getAdmissionActivityLogs(id);
      const followupRes = await getFollowups(id);

      setInq(admissionRes.data);
      setHistory(historyRes.data.data || []);
      setCounselors(counselorRes.data);
      setStages(stagesRes.data.data);
      setActivity(activityRes.data);
      setFollowups(followupRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!inq) {
    return (
      <PageContainer>
        <PageHeader
          title="Inquiry not found"
          description="It may have been deleted."
        />
        <Link to="/admin/admissions">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
            Back to pipeline
          </Button>
        </Link>
      </PageContainer>
    );
  }

  // Filter out Rejected stage from visible stages
  const visibleStages = stages.filter(
    (s) => s.stage_name !== "Rejected"
  );

  // Find index in visible stages (not including Rejected)
  const stageIdx = visibleStages.findIndex(
    (s) => s.stage_name === inq?.stage?.stage_name
  );

  // Calculate progress based on visible stages
  const progress = stageIdx >= 0 
    ? Math.round(((stageIdx + 1) / visibleStages.length) * 100)
    : 0;

  const nextStage = stages[stageIdx + 1];
  const isRejected = inq.stage?.stage_name === "Rejected";

  // Admission is linked to a staff member's Father record — highlight this record
  const isStaffChild = Boolean(inq.employee_uuid);
  const staffChildName = inq.employee_name || inq.employee?.full_name || null;

  const docs = [
    inq.birth_certificate_file,
    inq.student_aadhaar_file,
    inq.transfer_certificate_file,
    inq.previous_marksheet_file,
    inq.parent_id_file,
    inq.address_proof_file,
    inq.passport_photo_file,
    inq.caste_certificate_file
  ];

  const docsOk = docs.filter(Boolean).length;
  const docsTotal = docs.length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={
          <Link
            to="/admin/admissions"
            className="hover:text-primary inline-flex items-center"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Admissions Pipeline
          </Link>
        }
        title={inq.full_name}
        description={`
          ${inq.admission_no || "-"} ·
          Class ${inq.class_name || "-"} ·
          Source: ${inq.source?.name || "-"} ·
          Counselor: ${inq.counselor_name || "-"}
        `}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  if (inq.is_archived) {
                    await restoreAdmission(inq.admission_uuid);
                    toast.success("Restored");
                  } else {
                    await archiveAdmission(inq.admission_uuid);
                    toast.success("Archived");
                  }
                  await loadData();
                } catch (err) {
                  toast.error(err.response?.data?.detail || "Operation failed");
                }
              }}
            >
              <Archive className="h-4 w-4" />
              {inq.is_archived ? "Restore" : "Archive"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={async () => {
                try {
                  await deleteAdmission(id);
                  toast.success("Admission deleted successfully");
                  navigate("/admissions");
                } catch (err) {
                  toast.error(err.response?.data?.detail || "Delete failed");
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            {isRejected ? (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white border-0"
                onClick={async () => {
                  try {
                    await reinstateAdmission(inq.admission_uuid);
                    await loadData();
                    toast.success("Admission reinstated successfully");
                  } catch (err) {
                    toast.error(err.response?.data?.detail || "Failed to reinstate");
                  }
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reinstate
              </Button>
            ) : nextStage && inq.stage?.stage_name !== "Enrolled" ? (
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={async () => {
                  try {
                    await enrollStudent(id, nextStage.id);
                    await loadData();
                    toast.success(`Moved to ${nextStage.stage_name}`);
                  } catch (err) {
                    toast.error(err.response?.data?.detail || "Failed to update stage");
                  }
                }}
              >
                Move to {nextStage.stage_name}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        }
      />

      {isStaffChild && (
        <div className="mb-5 flex items-center gap-2.5 rounded-md border border-chart-3/30 bg-chart-3/10 px-4 py-2.5">
          <Briefcase className="h-4 w-4 text-chart-3 shrink-0" />
          <p className="text-sm text-chart-3">
            <span className="font-semibold">Staff child</span>
            {staffChildName ? ` — Father's details linked to staff record for ${staffChildName}.` : " — Father's details are linked to a staff record."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className={`lg:col-span-2 ${isStaffChild ? "border-chart-3/40" : "border-border/60"}`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <Avatar className="h-20 w-20">
                {inq.passport_photo_file ? (
                  <img
                    src={inq.passport_photo_file}
                    alt={inq.full_name}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {inq.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`${stageColor[inq.stage?.stage_name]} ${
                      isRejected ? "cursor-pointer hover:opacity-80" : ""
                    }`}
                    onClick={() => isRejected && setShowRejectionReason(true)}
                    title={isRejected ? "Click to view rejection reason" : undefined}
                  >
                    {inq.stage?.stage_name}
                  </Badge>
                  {isStaffChild && (
                    <Badge
                      className="bg-chart-3/15 text-chart-3 border-chart-3/20 gap-1"
                      title={staffChildName ? `Linked to staff: ${staffChildName}` : "Linked to a staff record"}
                    >
                      <Briefcase className="h-3 w-3" />
                      Staff Child
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Created {new Date(inq.created_at).toLocaleDateString()}
                  Updated {new Date(inq.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pipeline progress</span>
                <span className="font-semibold">
                  {isRejected ? "Rejected" : `${progress}%`}
                </span>
              </div>
              <Progress 
                value={isRejected ? 0 : progress} 
                className="h-2" 
              />
              <div className="grid grid-cols-7 gap-1 mt-3">
                {visibleStages.map((stage, i) => {
                  const isActive = i <= stageIdx && !isRejected;
                  
                  return (
                    <button
                      key={stage.id}
                      onClick={async () => {
                        if (isRejected) {
                          toast.warning("Please use the Reinstate button above to restore this admission");
                          return;
                        }
                        
                        try {
                          await enrollStudent(id, stage.id);
                          await loadData();
                          toast.success(`Moved to ${stage.stage_name}`);
                        } catch (err) {
                          toast.error(err.response?.data?.detail || "Failed to update stage");
                        }
                      }}
                      className={`text-[9px] py-1.5 rounded border transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : isRejected
                          ? "border-border/60 text-muted-foreground/50 cursor-not-allowed opacity-50"
                          : "border-border/60 hover:bg-muted"
                      }`}
                      disabled={isRejected}
                      title={isRejected ? "Please reinstate the admission first" : ""}
                    >
                      {stage.stage_name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
              {isRejected && (
                <div className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <span>⚠️ This admission is rejected. Click the "Reinstate" button above to restore it to its previous stage.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => { setComm({ channel: "Email", subject: "", body: "" }); setCommOpen(true); }}>
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setComm({ channel: "SMS", subject: "Update", body: "" }); setCommOpen(true); }}>
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${inq.primary_phone}…`)}>
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setComm({ channel: "WhatsApp", subject: "Update", body: "" }); setCommOpen(true); }}>
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </Button>
            </div>
            <div className="pt-2 border-t">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Assign Counselor</div>
              <Select
                value={inq?.counselor_name || ""}
                onValueChange={async (value) => {
                  try {
                    await updateAdmission(id, { counselor_name: value });
                    setInq({ ...inq, counselor_name: value });
                    toast.success(`Assigned to ${value}`);
                  } catch (err) {
                    toast.error("Failed to assign counselor");
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {(counselors || []).map((c) => (
                    <SelectItem key={c.id} value={c.counselor_name}>
                      {c.counselor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents ({docsOk}/{docsTotal})</TabsTrigger>
          {/* <TabsTrigger value="payment">Payment</TabsTrigger> */}
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <PersonalTab inq={inq} id={id} loadData={loadData} />
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          <AcademicTab inq={inq} id={id} loadData={loadData} />
        </TabsContent>

        <TabsContent value="guardian" className="mt-4">
          <GuardianTab inq={inq} id={id} loadData={loadData} />
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <ServicesTab inq={inq} id={id} loadData={loadData} />
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <MedicalTab inq={inq} id={id} loadData={loadData} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsTab inq={inq} id={id} loadData={loadData} />
        </TabsContent>

        {/* <TabsContent value="payment" className="mt-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <Stat icon={<IndianRupee className="h-4 w-4" />} label="Fee total" value={`₹${(inq.fee_total || 0).toLocaleString("en-IN")}`} />
                <Stat icon={<IndianRupee className="h-4 w-4" />} label="Paid" value={`₹${(inq.fee_paid || 0).toLocaleString("en-IN")}`} />
                <Stat icon={<IndianRupee className="h-4 w-4" />} label="Balance" value={`₹${((inq.fee_total || 0) - (inq.fee_paid || 0)).toLocaleString("en-IN")}`} />
              </div>
              <Progress value={Math.round(((inq.fee_paid || 0) / (inq.fee_total || 1)) * 100)} />
              <div className="flex gap-2">
                <Input type="number" placeholder="Amount" id="payamt" />
                <Button onClick={() => {
                  const el = document.getElementById("payamt");
                  const v = Number(el?.value || 0);
                }}>
                  <IndianRupee className="h-4 w-4" /> Collect
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="progress" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Stage Timeline</CardTitle></CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="relative">
                  {stages.map((stage, i) => {
                    const completedStages = Array.isArray(history)
                      ? history.map(h => h.to_stage)
                      : [];

                    const isPast = completedStages.includes(stage.stage_name) &&
                      stage.stage_name !== inq.stage?.stage_name;
                    const isCurrent = stage.stage_name === inq.stage?.stage_name;
                    const isFuture = !completedStages.includes(stage.stage_name);
                    
                    const stageHistory = Array.isArray(history)
                      ? history
                          .filter(h => h.to_stage === stage.stage_name)
                          .sort((a, b) => new Date(b.moved_at) - new Date(a.moved_at))[0]
                      : null;
                    
                    return (
                      <div key={stage.id} className="flex gap-3 relative">
                        {i < stages.length - 1 && (
                          <div className={`absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)] ${isPast || isCurrent ? "bg-primary" : "bg-border/60"}`} />
                        )}
                        <div className="shrink-0 z-10 mt-0.5">
                          {isPast ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          ) : isCurrent ? (
                            <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          ) : (
                            <Circle className="h-6 w-6 text-border" />
                          )}
                        </div>
                        <div className="pb-5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${isFuture ? "text-muted-foreground" : "text-foreground"}`}>
                              {stage.stage_name}
                            </span>
                            {isCurrent && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 h-4 px-1.5">Current</Badge>}
                            {isPast && <Badge variant="outline" className="text-[10px] text-success border-success/30 h-4 px-1.5">Done</Badge>}
                          </div>
                          {stageHistory ? (
                            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {new Date(stageHistory.moved_at).toLocaleString()}
                            </div>
                          ) : isFuture ? (
                            <div className="text-[11px] text-muted-foreground/50 mt-0.5">Not reached yet</div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Follow-ups</CardTitle></CardHeader>
                <CardContent className="p-5 pt-2 space-y-3">
                  <div className="grid md:grid-cols-3 gap-2">
                    <Input type="date" value={fu.due} onChange={(e) => setFu({ ...fu, due: e.target.value })} />
                    <Input className="md:col-span-2" placeholder="Note (e.g. discuss scholarship)" value={fu.note} onChange={(e) => setFu({ ...fu, note: e.target.value })} />
                  </div>
                  <Button
                    size="sm"
                    disabled={!fu.due || !fu.note}
                    onClick={async () => {
                      try {
                        const formData = new FormData();
                        formData.append("followup_date", fu.due);
                        formData.append("notes", fu.note);
                        await createFollowup(id, formData);
                        const response = await getFollowups(id);
                        setFollowups(response.data);
                        setFu({ due: "", note: "" });
                        toast.success("Follow-up added");
                      } catch (err) {
                        toast.error(err.response?.data?.detail || "Failed to add follow-up");
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                  <div className="divide-y border rounded-md mt-1">
                    {followups.length === 0 && (
                      <div className="p-4 text-xs text-muted-foreground text-center">
                        No follow-ups yet.
                      </div>
                    )}
                    {followups.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-4">
                        <Checkbox
                          checked={f.is_completed}
                          onCheckedChange={async () => {
                            try {
                              await completeFollowup(f.id);
                              const res = await getFollowups(id);
                              setFollowups(res.data);
                              toast.success("Follow-up completed");
                            } catch (err) {
                              toast.error("Failed");
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className={`text-sm ${f.is_completed ? "line-through text-muted-foreground" : ""}`}>
                            {f.notes}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Due {f.followup_date}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={async () => {
                            try {
                              await deleteFollowup(f.id);
                              const res = await getFollowups(id);
                              setFollowups(res.data);
                              toast.success("Deleted");
                            } catch (err) {
                              toast.error("Delete failed");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activity.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <div className="text-2sm font-medium">{a.activity}</div>
                        <div className="text-sm text-muted-foreground">
                          You · {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* View rejection reason (read-only) */}
      <Dialog open={showRejectionReason} onOpenChange={setShowRejectionReason}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Rejection</DialogTitle>
            <DialogDescription>
              {inq.full_name} · {inq.admission_no || "-"}
              {inq.rejected_at &&
                ` — rejected ${new Date(inq.rejected_at).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap min-h-[80px]">
            {inq.rejection_reason || "No reason recorded."}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRejectionReason(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

/* ── PERSONAL TAB ── */
function PersonalTab({ inq, id, loadData }) {
  const [d, setD] = useState({
    full_name: inq.full_name || "",
    admission_no: inq.admission_no || "",
    dob: inq.dob || "",
    gender: inq.gender || "",
    blood_group: inq.blood_group || "",
    aadhaar_no: inq.aadhaar_no || "",
    nationality: inq.nationality || "",
    category: inq.category || "",
    admission_date: inq.admission_date || "",
    joining_date: inq.joining_date || "",
    religion: inq.religion || "",
    // siblings: inq.siblings || "",
    rfid_card_no: inq.rfid_card_no || "",
    gps_tracker_id: inq.gps_tracker_id || "",
  });

  useEffect(() => {
    setD({
      full_name: inq.full_name || "",
      admission_no: inq.admission_no || "",
      dob: inq.dob || "",
      gender: inq.gender || "",
      blood_group: inq.blood_group || "",
      aadhaar_no: inq.aadhaar_no || "",
      nationality: inq.nationality || "",
      category: inq.category || "",
      admission_date: inq.admission_date || "",
      joining_date: inq.joining_date || "",
      religion: inq.religion || "",
      // siblings: inq.siblings || "",
      rfid_card_no: inq.rfid_card_no || "",
      gps_tracker_id: inq.gps_tracker_id || "",
    });
  }, [inq]);

  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => {
    setD((p) => ({ ...p, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const saveAll = async () => {
    const errs = validateAdmissionUpdate(d);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error(Object.values(errs)[0]);
      return;
    }
    setFieldErrors({});

    try {
      await updateAdmission(id, d);
      await loadData();
      toast.success("Personal details saved");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Full name" error={fieldErrors.full_name}>
            <Input value={d.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Riya Mehra" />
          </F>
          <F label="Admission No">
            <Input value={d.admission_no} onChange={(e) => set("admission_no", e.target.value)} className="font-mono" />
          </F>
          <F label="Date of birth" error={fieldErrors.dob}>
            <Input type="date" value={d.dob} onChange={(e) => set("dob", e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </F>
          <F label="Gender" error={fieldErrors.gender}>
            <Select value={d.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Blood group" error={fieldErrors.blood_group}>
            <Select value={d.blood_group} onValueChange={(v) => set("blood_group", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label="Student Aadhaar" error={fieldErrors.aadhaar_no}>
            <Input value={d.aadhaar_no} onChange={(e) => set("aadhaar_no", e.target.value)} placeholder="123456789012" maxLength={12} inputMode="numeric" />
          </F>
          <F label="Nationality">
            <Input value={d.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="Indian" />
          </F>
          <F label="Category" error={fieldErrors.category}>
            <Select value={d.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {["General", "OBC", "SC", "ST", "EWS"].map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label="Admission Date" error={fieldErrors.admission_date}>
            <Input type="date" value={d.admission_date} onChange={(e) => set("admission_date", e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </F>
          <F label="Joining Date" error={fieldErrors.joining_date}>
            <Input type="date" value={d.joining_date} onChange={(e) => set("joining_date", e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </F>
          <F label="Religion">
            <Input value={d.religion} onChange={(e) => set("religion", e.target.value)} placeholder="Hindu / Muslim / Sikh" />
          </F>
          {/* <F label="Siblings" error={fieldErrors.siblings}>
            <Input type="number" min={0} value={d.siblings} onChange={(e) => set("siblings", e.target.value)} placeholder="0" />
          </F> */}
          <F label="RFID Card No">
            <Input value={d.rfid_card_no} onChange={(e) => set("rfid_card_no", e.target.value)} placeholder="RFID-123456" />
          </F>
          <F label="GPS Tracker ID">
            <Input value={d.gps_tracker_id} onChange={(e) => set("gps_tracker_id", e.target.value)} placeholder="GPS-123456" />
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5">
            <Save className="h-4 w-4" />Save Personal Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── ACADEMIC TAB ── */
function AcademicTab({ inq, id, loadData }) {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const CLASS_NAMES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class I",
  "Class II",
  "Class III",
  "Class IV",
  "Class V",
  "Class VI",
  "Class VII",
  "Class VIII",
  "Class IX",
  "Class X",
  "Class XI",
  "Class XII",
];

  const [d, setD] = useState({
    class_uuid: inq.class_uuid || "",
    section_uuid: inq.section_uuid || "",
    roll_no: inq.roll_no || "",
    previous_school: inq.previous_school || "",
    previous_class: inq.previous_class || "",
    board: inq.board || "",
    last_aggregate_percentage: inq.last_aggregate_percentage || "",
    attendance_percentage: inq.attendance_percentage || "",
    stream: inq.stream || "",
    session_year: inq.session_year || "",
  });

  useEffect(() => {
    setD({
      class_uuid: inq.class_uuid || "",
      section_uuid: inq.section_uuid || "",
      roll_no: inq.roll_no || "",
      previous_school: inq.previous_school || "",
      previous_class: inq.previous_class || "",
      board: inq.board || "",
      last_aggregate_percentage: inq.last_aggregate_percentage || "",
      attendance_percentage: inq.attendance_percentage || "",
      stream: inq.stream || "",
      session_year: inq.session_year || "",
    });
  }, [inq]);

  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => {
    setD((p) => ({ ...p, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const loadSections = async (classUuid) => {
    try {
      const res = await getSections(classUuid);
      const list = res.data?.data || res.data || [];
      setSections(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log(err);
      setSections([]);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      const list = res.data?.data || res.data || res;
      setClasses(Array.isArray(list) ? list : []);
      if (inq.class_uuid) {
        loadSections(inq.class_uuid);
      }
    } catch (err) {
      console.log(err);
      setClasses([]);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (inq.class_uuid) {
      loadSections(inq.class_uuid);
    }
  }, [inq]);

  const saveAll = async () => {
    const errs = validateAdmissionUpdate(d);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error(Object.values(errs)[0]);
      return;
    }
    setFieldErrors({});

    try {
      await updateAdmission(id, d);
      await loadData();
      toast.success("Academic details saved");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    }
  };

  const selectedClass = classes.find((c) => c.class_uuid === d.class_uuid);
  const className = (selectedClass?.class_name || "").toUpperCase();
  const showStream = className === "XI" || className === "XII" || 
                      className === "CLASS 11" || className === "CLASS 12";

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Class">
            <Select
              value={d.class_uuid}
              onValueChange={(v) => {
                set("class_uuid", v);
                set("section_uuid", "");
                const selected = classes.find((c) => c.class_uuid === v);
                const name = (selected?.class_name || "").toUpperCase();
                const show = name === "XI" || name === "XII" || 
                             name === "CLASS 11" || name === "CLASS 12";
                if (!show) set("stream", "");
                loadSections(v);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.class_uuid || c.id} value={c.class_uuid || c.id}>
                    {c.class_name || c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Section">
            <Select value={d.section_uuid} onValueChange={(v) => set("section_uuid", v)}>
              <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.section_uuid || s.id} value={s.section_uuid || s.id}>
                    {s.section_name || s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          {showStream && (
            <F label="Stream">
              <Select value={d.stream} onValueChange={(v) => set("stream", v)}>
                <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </F>
          )}

          <F label="Session Year" error={fieldErrors.session_year}>
            <Select value={d.session_year} onValueChange={(v) => set("session_year", v)}>
              <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-26">2025-26</SelectItem>
                <SelectItem value="2026-27">2026-27</SelectItem>
                <SelectItem value="2027-28">2027-28</SelectItem>
                <SelectItem value="2028-29">2028-29</SelectItem>
              </SelectContent>
            </Select>
          </F>

          <F label="Roll No">
            <Input value={d.roll_no} onChange={(e) => set("roll_no", e.target.value)} placeholder="1" />
          </F>

          <F label="Board">
            <Select value={d.board} onValueChange={(v) => set("board", v)}>
              <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
              <SelectContent>
                {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>

          <F label="Previous School">
            <Input value={d.previous_school} onChange={(e) => set("previous_school", e.target.value)} placeholder="DAV Public School" />
          </F>

          <F label="Previous Class">
        <select
          value={d.previous_class || ""}
          onChange={(e) => set("previous_class", e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select Previous Class</option>

          {CLASS_NAMES.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </F>

          <F label="Last Aggregate %" error={fieldErrors.last_aggregate_percentage}>
            <Input type="number" min={0} max={100} value={d.last_aggregate_percentage} 
                   onChange={(e) => set("last_aggregate_percentage", e.target.value)} placeholder="87" />
          </F>

          <F label="Attendance %" error={fieldErrors.attendance_percentage}>
            <Input type="number" min={0} max={100} value={d.attendance_percentage} 
                   onChange={(e) => set("attendance_percentage", e.target.value)} placeholder="95" />
          </F>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5">
            <Save className="h-4 w-4" />Save Academic Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── GUARDIAN TAB ── */
function GuardianTab({ inq, id, loadData }) {
  const [d, setD] = useState({
    father_name: inq.father_name || "",
    father_profession: inq.father_profession || "",
    father_dob: inq.father_dob || "",
    father_aadhaar_no: inq.father_aadhaar_no || "",
    mother_name: inq.mother_name || "",
    mother_profession: inq.mother_profession || "",
    mother_dob: inq.mother_dob || "",
    mother_aadhaar_no: inq.mother_aadhaar_no || "",
    guardian_name: inq.guardian_name || "",
    guardian_profession: inq.guardian_profession || "",
    guardian_dob: inq.guardian_dob || "",
    guardian_mobile_no: inq.guardian_mobile_no || "",
    primary_phone: inq.primary_phone || "",
    alternate_mobile_no: inq.alternate_mobile_no || "",
    email: inq.email || "",
    alternate_email: inq.alternate_email || "",
    residential_address: inq.residential_address || "",
    permanent_address: inq.permanent_address || "",
    city: inq.city || "",
    state: inq.state || "",
    pin_code: inq.pin_code || "",
    birth_certificate_no: inq.birth_certificate_no || "",
  });

  useEffect(() => {
    setD({
      father_name: inq.father_name || "",
      father_profession: inq.father_profession || "",
      father_dob: inq.father_dob || "",
      father_aadhaar_no: inq.father_aadhaar_no || "",
      mother_name: inq.mother_name || "",
      mother_profession: inq.mother_profession || "",
      mother_dob: inq.mother_dob || "",
      mother_aadhaar_no: inq.mother_aadhaar_no || "",
      guardian_name: inq.guardian_name || "",
      guardian_profession: inq.guardian_profession || "",
      guardian_dob: inq.guardian_dob || "",
      guardian_mobile_no: inq.guardian_mobile_no || "",
      primary_phone: inq.primary_phone || "",
      alternate_mobile_no: inq.alternate_mobile_no || "",
      email: inq.email || "",
      alternate_email: inq.alternate_email || "",
      residential_address: inq.residential_address || "",
      permanent_address: inq.permanent_address || "",
      city: inq.city || "",
      state: inq.state || "",
      pin_code: inq.pin_code || "",
      birth_certificate_no: inq.birth_certificate_no || "",
    });
  }, [inq]);

  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => {
    setD((p) => ({ ...p, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const isStaffChild = Boolean(inq.employee_uuid);
  const staffChildName = inq.employee_name || inq.employee?.full_name || null;

  const saveAll = async () => {
    const errs = validateAdmissionUpdate(d);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error(Object.values(errs)[0]);
      return;
    }
    setFieldErrors({});

    try {
      await updateAdmission(id, d);
      await loadData();
      toast.success("Guardian details saved");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {isStaffChild && (
          <div className="flex items-center gap-2.5 rounded-md border border-chart-3/30 bg-chart-3/10 px-3 py-2.5">
            <Briefcase className="h-4 w-4 text-chart-3 shrink-0" />
            <p className="text-xs text-chart-3">
              <span className="font-semibold">Staff Child</span>
              {staffChildName ? ` — Father's details below were linked from ${staffChildName}'s staff record.` : " — Father's details below were linked from a staff record."}
            </p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Father's Name">
            <Input value={d.father_name} onChange={(e) => set("father_name", e.target.value)} placeholder="Anil Mehra" />
          </F>
          <F label="Father's Profession">
            <Input value={d.father_profession} onChange={(e) => set("father_profession", e.target.value)} placeholder="Business / Service" />
          </F>
          <F label="Father's DOB" error={fieldErrors.father_dob}>
            <Input type="date" value={d.father_dob} onChange={(e) => set("father_dob", e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </F>
          <F label="Father's Aadhaar" error={fieldErrors.father_aadhaar_no}>
            <Input value={d.father_aadhaar_no} onChange={(e) => set("father_aadhaar_no", e.target.value)} placeholder="123456789012" maxLength={12} inputMode="numeric" />
          </F>

          <F label="Mother's Name">
            <Input value={d.mother_name} onChange={(e) => set("mother_name", e.target.value)} placeholder="Sunita Mehra" />
          </F>
          <F label="Mother's Profession">
            <Input value={d.mother_profession} onChange={(e) => set("mother_profession", e.target.value)} placeholder="Homemaker / Teacher" />
          </F>
          <F label="Mother's DOB" error={fieldErrors.mother_dob}>
            <Input type="date" value={d.mother_dob} onChange={(e) => set("mother_dob", e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </F>
          <F label="Mother's Aadhaar" error={fieldErrors.mother_aadhaar_no}>
            <Input value={d.mother_aadhaar_no} onChange={(e) => set("mother_aadhaar_no", e.target.value)} placeholder="123456789012" maxLength={12} inputMode="numeric" />
          </F>

          <F label="Guardian Name">
            <Input value={d.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} placeholder="Emergency contact" />
          </F>
          <F label="Guardian Profession">
            <Input value={d.guardian_profession} onChange={(e) => set("guardian_profession", e.target.value)} placeholder="Service / Business" />
          </F>
          <F label="Guardian DOB" error={fieldErrors.guardian_dob}>
            <Input type="date" value={d.guardian_dob} onChange={(e) => set("guardian_dob", e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </F>
          <F label="Guardian Mobile" error={fieldErrors.guardian_mobile_no}>
            <Input value={d.guardian_mobile_no} onChange={(e) => set("guardian_mobile_no", e.target.value)} placeholder="9876543210" maxLength={10} inputMode="numeric" />
          </F>

          <F label="Primary Phone" error={fieldErrors.primary_phone}>
            <Input value={d.primary_phone} onChange={(e) => set("primary_phone", e.target.value)} placeholder="9876543210" maxLength={10} inputMode="numeric" />
          </F>
          <F label="Alternate Phone" error={fieldErrors.alternate_mobile_no}>
            <Input value={d.alternate_mobile_no} onChange={(e) => set("alternate_mobile_no", e.target.value)} placeholder="9876543210" maxLength={10} inputMode="numeric" />
          </F>
          <F label="Email" error={fieldErrors.email}>
            <Input type="email" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="parent@mail.com" />
          </F>
          <F label="Alternate Email" error={fieldErrors.alternate_email}>
            <Input type="email" value={d.alternate_email} onChange={(e) => set("alternate_email", e.target.value)} placeholder="alt@mail.com" />
          </F>

          <F label="Residential Address" wide>
            <Textarea rows={2} value={d.residential_address} onChange={(e) => set("residential_address", e.target.value)} placeholder="House no, street, locality" />
          </F>
          <F label="Permanent Address" wide>
            <Textarea rows={2} value={d.permanent_address} onChange={(e) => set("permanent_address", e.target.value)} placeholder="House no, street, locality" />
          </F>
          <F label="City">
            <Input value={d.city} onChange={(e) => set("city", e.target.value)} placeholder="Delhi" />
          </F>
          <F label="State">
            <Input value={d.state} onChange={(e) => set("state", e.target.value)} placeholder="Delhi" />
          </F>
          <F label="PIN" error={fieldErrors.pin_code}>
            <Input value={d.pin_code} onChange={(e) => set("pin_code", e.target.value)} placeholder="110001" maxLength={6} inputMode="numeric" />
          </F>
          <F label="Birth Certificate No">
            <Input value={d.birth_certificate_no} onChange={(e) => set("birth_certificate_no", e.target.value)} placeholder="BC-12345" />
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5">
            <Save className="h-4 w-4" />Save Guardian Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── SERVICES TAB ── */
function ServicesTab({ inq, id, loadData }) {
  const [d, setD] = useState({
    fee_status: inq.fee_status || "",
    transport_required: inq.transport_required ? "Yes" : "No",
    mode_of_conveyance: inq.mode_of_conveyance || "",
    hostel_required: inq.hostel_required ? "Yes" : "No",
  });

  useEffect(() => {
    setD({
      fee_status: inq.fee_status || "",
      transport_required: inq.transport_required ? "Yes" : "No",
      mode_of_conveyance: inq.mode_of_conveyance || "",
      hostel_required: inq.hostel_required ? "Yes" : "No",
    });
  }, [inq]);

  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => {
    setD((p) => ({ ...p, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const saveAll = async () => {
    const errs = validateAdmissionUpdate({ fee_status: d.fee_status });
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error(Object.values(errs)[0]);
      return;
    }
    setFieldErrors({});

    try {
      await updateAdmission(id, {
        fee_status: d.fee_status,
        transport_required: d.transport_required === "Yes",
        mode_of_conveyance: d.mode_of_conveyance,
        hostel_required: d.hostel_required === "Yes",
      });
      await loadData();
      toast.success("Services saved");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Fee Status" error={fieldErrors.fee_status}>
            <Select value={d.fee_status} onValueChange={(v) => set("fee_status", v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Transport Required">
            <Select value={d.transport_required} onValueChange={(v) => set("transport_required", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Mode of Conveyance">
            <Select value={d.mode_of_conveyance} onValueChange={(v) => set("mode_of_conveyance", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="School Bus">School Bus</SelectItem>
                <SelectItem value="Personal Vehicle">Personal Vehicle</SelectItem>
                <SelectItem value="Public Transport">Public Transport</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Hostel Required">
            <Select value={d.hostel_required} onValueChange={(v) => set("hostel_required", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </div>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5">
            <Save className="h-4 w-4" />Save Services
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── MEDICAL TAB ── */
function MedicalTab({ inq, id, loadData }) {
  const [d, setD] = useState({
    medical_notes: inq.medical_notes || "",
  });

  useEffect(() => {
    setD({ medical_notes: inq.medical_notes || "" });
  }, [inq]);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const saveAll = async () => {
    try {
      await updateAdmission(id, d);
      await loadData();
      toast.success("Medical notes saved");
    } catch (err) {
      toast.error("Save failed");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <F label="Medical notes / allergies / special care" wide>
          <Textarea
            rows={6}
            value={d.medical_notes}
            onChange={(e) => set("medical_notes", e.target.value)}
            placeholder="Allergies, medication, special care instructions"
          />
        </F>
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={saveAll} className="gap-1.5">
            <Save className="h-4 w-4" />Save Medical Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── DOCUMENTS TAB ── */
function DocumentsTab({ inq, id, loadData }) {
  const docs = [
    { name: "Birth Certificate", field: "birth_certificate_file", url: inq.birth_certificate_file, ok: !!inq.birth_certificate_file },
    { name: "Student Aadhaar", field: "student_aadhaar_file", url: inq.student_aadhaar_file, ok: !!inq.student_aadhaar_file },
    { name: "Transfer Certificate", field: "transfer_certificate_file", url: inq.transfer_certificate_file, ok: !!inq.transfer_certificate_file },
    { name: "Previous Marksheet", field: "previous_marksheet_file", url: inq.previous_marksheet_file, ok: !!inq.previous_marksheet_file },
    { name: "Parent ID Proof", field: "parent_id_file", url: inq.parent_id_file, ok: !!inq.parent_id_file },
    { name: "Address Proof", field: "address_proof_file", url: inq.address_proof_file, ok: !!inq.address_proof_file },
    { name: "Passport Photo", field: "passport_photo_file", url: inq.passport_photo_file, ok: !!inq.passport_photo_file },
    { name: "Caste Certificate", field: "caste_certificate_file", url: inq.caste_certificate_file, ok: !!inq.caste_certificate_file }
  ];

  const [localFiles, setLocalFiles] = useState(() =>
    Object.fromEntries(docs.filter((d) => !d.ok).map((d) => [d.name, null]))
  );
  const [previewTarget, setPreviewTarget] = useState(null);
  const inputRefs = useRef({});

  const handleFile = (name, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5 MB`); return; }
    setLocalFiles((f) => ({ ...f, [name]: file }));
  };

  const removeLocal = (name) => setLocalFiles((f) => ({ ...f, [name]: null }));

  const saveLocal = async (name) => {
    const file = localFiles[name];
    if (!file) return;
    try {
      const doc = docs.find(d => d.name === name);
      const formData = new FormData();
      formData.append(doc.field, file);
      await updateAdmission(id, formData);
      await loadData();
      toast.success(`${name} uploaded successfully`);
      setLocalFiles((f) => ({ ...f, [name]: null }));
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const openPreviewFromUrl = (doc) => {
    if (!doc.url) return;
    window.open(doc.url, "_blank");
  };

  const openPreviewFromFile = (name, file) => {
    setPreviewTarget({
      name,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/"),
      isPdf: file.type === "application/pdf",
      size: file.size,
      fileName: file.name,
    });
  };

  const submittedCount = docs.filter((d) => d.ok).length;

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">
              Documents submitted at inquiry are shown below. Upload any missing ones.
            </p>
            <Badge variant="outline" className="text-xs shrink-0">
              {submittedCount} / {docs.length} submitted
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {docs.map((doc) => {
              const submitted = doc.ok;
              const localFile = localFiles[doc.name];
              const inputId = `doc-${doc.name.replace(/\s+/g, "-")}`;

              if (submitted) {
                return (
                  <div key={doc.name} className="rounded-md border border-success/30 bg-success/5 overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Submitted at inquiry</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="bg-success/15 text-success border-success/20 text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" /> Submitted
                        </Badge>
                        {doc.url && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => openPreviewFromUrl(doc)}>
                            <FileCheck2 className="h-3.5 w-3.5" /> View
                          </Button>
                        )}
                      </div>
                    </div>
                    {doc.url && (
                      <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-md border border-success/20 bg-background px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => openPreviewFromUrl(doc)}>
                        <div className="h-9 w-9 rounded bg-success/10 flex items-center justify-center shrink-0">
                          <FileCheck2 className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{doc.name}</div>
                          <div className="text-[10px] text-muted-foreground">Click to preview</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={doc.name} className={`rounded-md border overflow-hidden transition-colors ${localFile ? "border-primary/40 bg-primary/5" : "border-border/60"}`}>
                  <div className="flex items-center gap-3 p-3">
                    <FileUp className={`h-4 w-4 shrink-0 ${localFile ? "text-primary" : "text-muted-foreground/50"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{doc.name}</div>
                      {localFile ? (
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">{localFile.name} · {formatBytes(localFile.size)}</div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground/60 mt-0.5">Not provided at inquiry</div>
                      )}
                    </div>
                    {localFile ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => openPreviewFromFile(doc.name, localFile)}>
                          <FileCheck2 className="h-3.5 w-3.5" /> View
                        </Button>
                        <Button size="sm" className="h-7 gap-1 text-[11px] gradient-primary border-0" onClick={() => saveLocal(doc.name)}>
                          <Save className="h-3.5 w-3.5" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground" onClick={() => removeLocal(doc.name)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px] shrink-0" onClick={() => inputRefs.current[doc.name]?.click()}>
                        <FileUp className="h-3.5 w-3.5" /> Upload
                      </Button>
                    )}
                    <input ref={(el) => (inputRefs.current[doc.name] = el)} id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { handleFile(doc.name, e.target.files); e.target.value = ""; }} />
                  </div>
                  {!localFile && (
                    <div className="mx-3 mb-3 border-2 border-dashed rounded-md p-3 text-center text-xs text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary/70 transition-colors" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFile(doc.name, e.dataTransfer.files); }} onClick={() => inputRefs.current[doc.name]?.click()}>
                      <FileUp className="h-4 w-4 mx-auto mb-1 opacity-40" />
                      Drag & drop or click · PDF / JPG / PNG · max 5 MB
                    </div>
                  )}
                  {localFile && localFile.type.startsWith("image/") && (
                    <div className="mx-3 mb-3 rounded-md overflow-hidden border cursor-pointer" onClick={() => openPreviewFromFile(doc.name, localFile)}>
                      <img src={URL.createObjectURL(localFile)} alt={doc.name} className="w-full max-h-36 object-contain bg-white" />
                    </div>
                  )}
                  {localFile && localFile.type === "application/pdf" && (
                    <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-md border bg-background px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => openPreviewFromFile(doc.name, localFile)}>
                      <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center shrink-0">
                        <FileCheck2 className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{localFile.name}</div>
                        <div className="text-[10px] text-muted-foreground">{formatBytes(localFile.size)} · click to preview</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {previewTarget && (
        <DocLightbox doc={previewTarget} onClose={() => setPreviewTarget(null)} />
      )}
    </>
  );
}

/* ── DOC LIGHTBOX ── */
function DocLightbox({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="text-[10px] text-muted-foreground">{doc.fileName} · {formatBytes(doc.size)}</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>✕</Button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-muted/20">
          {doc.isImage ? (
            <div className="flex items-center justify-center min-h-full">
              <img src={doc.url} alt={doc.name} className="max-w-full max-h-[70vh] object-contain rounded-md border shadow-sm bg-white" />
            </div>
          ) : doc.isPdf ? (
            <iframe src={doc.url} title={doc.name} className="w-full rounded-md border" style={{ height: "70vh" }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <FileCheck2 className="h-8 w-8" />
              <p className="text-sm">Preview not available for this file type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── HELPERS ── */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function F({ label, children, wide, error }) {
  return (
    <div className={`space-y-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="font-display text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}