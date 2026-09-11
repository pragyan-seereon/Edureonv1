/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { getClassSubjects } from "../api/exam";
import { toast } from "sonner";

function newRow() {
  return {
    _id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subject: "",
    subjectUuid: "",
    paper: "Paper 1",
    date: "",
    time: "09:30",
    duration: 180,
    maxMarks: 80,
    room: "",
    roomUuid: "",
  };
}

function newClassBlock(defaultClass) {
  return {
    _id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    className: defaultClass,
    rows: [newRow()],
  };
}

// Small label helper so every required field shows the same red asterisk
// treatment used elsewhere in the app (e.g. "Exam Name *").
function RequiredLabel({ children, className = "text-[10px]" }) {
  return (
    <Label className={className}>
      {children} <span className="text-destructive">*</span>
    </Label>
  );
}

// Fields that must be filled in on every row before the form can submit.
const REQUIRED_ROW_FIELDS = [
  "subjectUuid",
  "paper",
  "date",
  "time",
  "duration",
  "maxMarks",
  "roomUuid",
];

const FIELD_ERROR_MESSAGES = {
  subjectUuid: "Subject is required.",
  paper: "Paper name is required.",
  date: "Date is required.",
  time: "Time is required.",
  duration: "Duration is required.",
  maxMarks: "Max marks is required.",
  roomUuid: "Room is required.",
};

// Returns { [fieldName]: errorMessage } for whichever required fields on
// this row are missing/invalid. Empty object means the row is valid.
function validateRow(row) {
  const errs = {};
  REQUIRED_ROW_FIELDS.forEach((field) => {
    const value = row[field];
    if (field === "duration" || field === "maxMarks") {
      if (value === "" || value === null || value === undefined || Number(value) <= 0) {
        errs[field] = FIELD_ERROR_MESSAGES[field];
      }
      return;
    }
    if (!String(value ?? "").trim()) {
      errs[field] = FIELD_ERROR_MESSAGES[field];
    }
  });
  return errs;
}

export function MultiPaperDialog({
  open,
  onOpenChange,
  categories,
  classOptions,
  classesData = [], // [{ id: class_uuid, name, stream }]
  rooms = [], // [{ uuid, name, number, capacity }]
  roomsLoading = false,
  onSubmit,
}) {
  const [category, setCategory] = useState(categories?.[0] || "");
  const [blocks, setBlocks] = useState([newClassBlock(classOptions?.[0] || "X")]);

  // subjectsByBlock[blockId] = { classUuid, options: [{ uuid, name }] }
  const [subjectsByBlock, setSubjectsByBlock] = useState({});
  const [loadingByBlock, setLoadingByBlock] = useState({});

  // rowErrors[rowId] = { subjectUuid: "message", date: "message", ... }
  const [rowErrors, setRowErrors] = useState({});

   useEffect(() => {
    if (categories?.length && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps
  // ADD THIS BLOCK ↑

  const reset = () => {
    setCategory(categories?.[0] || "");
    setBlocks([newClassBlock(classOptions?.[0] || "X")]);
    setSubjectsByBlock({});
    setLoadingByBlock({});
    setRowErrors({});
  };

  const fetchSubjectsForBlock = useCallback(async (blockId, classUuid) => {
    setLoadingByBlock((p) => ({ ...p, [blockId]: true }));
    try {
      const data = await getClassSubjects(classUuid);
      const list = (data ?? []).map((s) => ({
        uuid: s.subject_uuid,
        name: s.subject_name,
      }));
      // dedupe — API returns one row per faculty assigned to the subject
      const unique = Array.from(new Map(list.map((s) => [s.uuid, s])).values());
      setSubjectsByBlock((p) => ({ ...p, [blockId]: { classUuid, options: unique } }));
    } catch (err) {
      toast.error("Could not load subjects for this class");
      setSubjectsByBlock((p) => ({ ...p, [blockId]: { classUuid, options: [] } }));
    } finally {
      setLoadingByBlock((p) => ({ ...p, [blockId]: false }));
    }
  }, []);

  // Keep each block's subject options in sync with its currently selected class.
  useEffect(() => {
    if (!classesData?.length) return;
    blocks.forEach((b) => {
      const matchedClass = classesData.find((c) => c.name === b.className);
      if (!matchedClass) return;
      if (subjectsByBlock[b._id]?.classUuid === matchedClass.id) return; // already fetched
      fetchSubjectsForBlock(b._id, matchedClass.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.map((b) => `${b._id}:${b.className}`).join(","), classesData]);

  const updateBlock = (blockId, patch) =>
    setBlocks((p) =>
      p.map((b) =>
        b._id !== blockId
          ? b
          : {
              ...b,
              ...patch,
              // Changing the class invalidates any subject already picked in this block
              rows:
                "className" in patch
                  ? b.rows.map((r) => ({ ...r, subject: "", subjectUuid: "" }))
                  : b.rows,
            },
      ),
    );

  const updateRow = (blockId, rowId, patch) => {
    setBlocks((p) =>
      p.map((b) =>
        b._id !== blockId
          ? b
          : { ...b, rows: b.rows.map((r) => (r._id === rowId ? { ...r, ...patch } : r)) },
      ),
    );
    // Clear errors on fields the user just edited so feedback disappears as they fix it.
    setRowErrors((p) => {
      const rowErr = p[rowId];
      if (!rowErr) return p;
      const nextRowErr = { ...rowErr };
      let changed = false;
      Object.keys(patch).forEach((field) => {
        if (nextRowErr[field]) {
          delete nextRowErr[field];
          changed = true;
        }
      });
      if (!changed) return p;
      return { ...p, [rowId]: nextRowErr };
    });
  };

  const addRow = (blockId) =>
    setBlocks((p) =>
      p.map((b) => (b._id === blockId ? { ...b, rows: [...b.rows, newRow()] } : b)),
    );

  const removeRow = (blockId, rowId) => {
    setBlocks((p) =>
      p.map((b) =>
        b._id !== blockId ? b : { ...b, rows: b.rows.filter((r) => r._id !== rowId) },
      ),
    );
    setRowErrors((p) => {
      if (!p[rowId]) return p;
      const next = { ...p };
      delete next[rowId];
      return next;
    });
  };

  const addBlock = () => setBlocks((p) => [...p, newClassBlock(classOptions?.[0] || "X")]);

  const removeBlock = (blockId) => {
    const block = blocks.find((b) => b._id === blockId);
    setBlocks((p) => p.filter((b) => b._id !== blockId));
    setSubjectsByBlock((p) => {
      const next = { ...p };
      delete next[blockId];
      return next;
    });
    setLoadingByBlock((p) => {
      const next = { ...p };
      delete next[blockId];
      return next;
    });
    if (block) {
      setRowErrors((p) => {
        const next = { ...p };
        block.rows.forEach((r) => delete next[r._id]);
        return next;
      });
    }
  };

  const totalRows = blocks.reduce((a, b) => a + b.rows.length, 0);

  const handleSubmit = () => {
    const nextRowErrors = {};
    let firstInvalidRowId = null;

    blocks.forEach((b) => {
      b.rows.forEach((r) => {
        const errs = validateRow(r);
        if (Object.keys(errs).length) {
          nextRowErrors[r._id] = errs;
          if (!firstInvalidRowId) firstInvalidRowId = r._id;
        }
      });
    });

    if (Object.keys(nextRowErrors).length) {
      setRowErrors(nextRowErrors);
      toast.error("Please fill in all required fields before adding papers.");
      return;
    }

    setRowErrors({});

    const papers = [];
    blocks.forEach((b) => {
      b.rows.forEach((r) => {
        papers.push({
          id: `xp-${Date.now()}-${papers.length}`,
          category,
          className: b.className,
          subject: r.subject,
          subjectUuid: r.subjectUuid || "",
          paper: r.paper || "Paper 1",
          date: r.date || "",
          time: r.time || "09:30",
          duration: Number(r.duration) || 180,
          maxMarks: Number(r.maxMarks) || 80,
          room: r.room || "",
          roomUuid: r.roomUuid || "",
        });
      });
    });
    if (!papers.length) return;
    onSubmit(papers);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Subjects / Papers</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 max-w-xs">
          <RequiredLabel className="text-xs">Category</RequiredLabel>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-5">
          {blocks.map((b) => {
            const subjectEntry = subjectsByBlock[b._id];
            const subjectOptions = subjectEntry?.options ?? [];
            const subjectsLoading = !!loadingByBlock[b._id];

            return (
              <div key={b._id} className="rounded-lg border border-border/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 w-40">
                    <RequiredLabel className="text-xs">Class</RequiredLabel>
                    <Select
                      value={b.className}
                      onValueChange={(v) => updateBlock(b._id, { className: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {classOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {blocks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeBlock(b._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {b.rows.map((r) => {
                    const errs = rowErrors[r._id] || {};
                    return (
                    <div key={r._id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <RequiredLabel>Subject</RequiredLabel>
                        <Select
                          value={r.subjectUuid || ""}
                          onValueChange={(uuid) => {
                            const subj = subjectOptions.find((s) => s.uuid === uuid);
                            updateRow(b._id, r._id, {
                              subjectUuid: uuid,
                              subject: subj?.name || "",
                            });
                          }}
                          disabled={subjectsLoading || !subjectOptions.length}
                        >
                          <SelectTrigger
                            className={`h-8 text-xs ${errs.subjectUuid ? "border-destructive focus:ring-destructive" : ""}`}
                          >
                            <SelectValue
                              placeholder={
                                subjectsLoading
                                  ? "Loading…"
                                  : subjectOptions.length
                                    ? "Select subject"
                                    : "No subjects for this class"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectOptions.map((s) => (
                              <SelectItem key={s.uuid} value={s.uuid}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errs.subjectUuid && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.subjectUuid}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <RequiredLabel>Paper</RequiredLabel>
                        <Input
                          className={`h-8 text-xs ${errs.paper ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          value={r.paper}
                          onChange={(e) => updateRow(b._id, r._id, { paper: e.target.value })}
                        />
                        {errs.paper && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.paper}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <RequiredLabel>Date</RequiredLabel>
                        <Input
                          type="date"
                          className={`h-8 text-xs ${errs.date ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          value={r.date}
                          onChange={(e) => updateRow(b._id, r._id, { date: e.target.value })}
                        />
                        {errs.date && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.date}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <RequiredLabel>Time</RequiredLabel>
                        <Input
                          className={`h-8 text-xs ${errs.time ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          value={r.time}
                          onChange={(e) => updateRow(b._id, r._id, { time: e.target.value })}
                        />
                        {errs.time && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.time}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <RequiredLabel>Dur.</RequiredLabel>
                        <Input
                          type="number"
                          className={`h-8 text-xs ${errs.duration ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          value={r.duration}
                          onChange={(e) => updateRow(b._id, r._id, { duration: e.target.value })}
                        />
                        {errs.duration && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.duration}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <RequiredLabel>Max</RequiredLabel>
                        <Input
                          type="number"
                          className={`h-8 text-xs ${errs.maxMarks ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          value={r.maxMarks}
                          onChange={(e) => updateRow(b._id, r._id, { maxMarks: e.target.value })}
                        />
                        {errs.maxMarks && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.maxMarks}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <RequiredLabel>Room</RequiredLabel>
                        <Select
                          value={r.roomUuid || ""}
                          onValueChange={(uuid) => {
                            const rm = rooms.find((x) => x.uuid === uuid);
                            updateRow(b._id, r._id, {
                              roomUuid: uuid,
                              room: rm ? `${rm.name} (${rm.number})` : "",
                            });
                          }}
                          disabled={roomsLoading || !rooms.length}
                        >
                          <SelectTrigger
                            className={`h-8 text-xs ${errs.roomUuid ? "border-destructive focus:ring-destructive" : ""}`}
                          >
                            <SelectValue
                              placeholder={roomsLoading ? "Loading…" : "Select room"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((rm) => (
                              <SelectItem key={rm.uuid} value={rm.uuid}>
                                {rm.name} · {rm.number}
                                {rm.capacity ? ` · Cap ${rm.capacity}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errs.roomUuid && (
                          <p className="text-[10px] text-destructive mt-0.5">{errs.roomUuid}</p>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-end pt-5">
                        {b.rows.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeRow(b._id, r._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );})}
                </div>

                <Button variant="outline" size="sm" onClick={() => addRow(b._id)}>
                  <Plus className="h-3.5 w-3.5" /> Add Subject
                </Button>
              </div>
            );
          })}
        </div>

        <Button variant="outline" size="sm" onClick={addBlock}>
          <Plus className="h-3.5 w-3.5" /> Add Another Class
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gradient-primary border-0" onClick={handleSubmit}>
            Add {totalRows} Paper{totalRows !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}