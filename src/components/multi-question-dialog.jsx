/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RichTextEditor } from "./rich-text-editor";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";

const blankDraft = () => ({
  key: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  chapter: "",
  question: "",
  answer: "",
  diff: "Medium",
  marks: 1,
});

export function MultiQuestionDialog({
  open, onOpenChange, classes, subjectsForClass, examTypes, onSubmit,
}) {
  const [meta, setMeta] = useState({
    className: classes[0] ?? "X",
    subject: "",
    examType: examTypes[0] ?? "Term 1",
  });

  const subjects = subjectsForClass ? subjectsForClass(meta.className) : [];
  const [drafts, setDrafts] = useState([blankDraft()]);

  // ---- Validation state ----
  const [metaErrors, setMetaErrors] = useState({});
  const [draftErrors, setDraftErrors] = useState({});

  const reset = () => {
    setMeta({ className: classes[0] ?? "X", subject: subjects[0] ?? "Math", examType: examTypes[0] ?? "Term 1" });
    setDrafts([blankDraft()]);
    setMetaErrors({});
    setDraftErrors({});
  };

  const update = (key, patch) =>
    setDrafts((p) => p.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const setMetaField = (field, value) => {
    setMeta((p) => ({ ...p, [field]: value }));
    if (metaErrors[field]) setMetaErrors((p) => ({ ...p, [field]: undefined }));
  };

  const updateAndClearError = (key, patch) => {
    update(key, patch);
    if (patch.question !== undefined && draftErrors[key]) {
      setDraftErrors((p) => ({ ...p, [key]: undefined }));
    }
  };

  const totalMarks = drafts.reduce((s, d) => s + (Number(d.marks) || 0), 0);

  const validate = () => {
    const nextMetaErrors = {};
    if (!meta.className) nextMetaErrors.className = "Class is required.";
    if (!meta.subject) nextMetaErrors.subject = "Subject is required.";
    if (!meta.examType) nextMetaErrors.examType = "Examination Type is required.";

    const nextDraftErrors = {};
    drafts.forEach((d) => {
      const text = d.question.replace(/<[^>]*>/g, "").trim();
      if (!text) nextDraftErrors[d.key] = "Question text is required.";
      if (!d.marks || Number(d.marks) < 1) {
        nextDraftErrors[d.key + "-marks"] = "Marks is required.";
      }
      if (!d.chapter || !d.chapter.trim()) {
        nextDraftErrors[d.key + "-chapter"] = "Chapter / Topic is required.";
      }
    });

    setMetaErrors(nextMetaErrors);
    setDraftErrors(nextDraftErrors);

    return Object.keys(nextMetaErrors).length === 0 && Object.keys(nextDraftErrors).length === 0;
  };

  const save = () => {
    const isValid = validate();
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    const valid = drafts.filter((d) => d.question.replace(/<[^>]*>/g, "").trim().length > 0);
    onSubmit(meta, valid);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> Add Questions to Bank
          </DialogTitle>
          {/* <DialogDescription>
            Choose the class, subject and examination type, then add one or more questions in a single form.
          </DialogDescription> */}
        </DialogHeader>

        {/* Batch context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Class <span className="text-destructive">*</span>
            </Label>
            <Select
              value={meta.className}
              onValueChange={(v) => setMetaField("className", v)}
            >
              <SelectTrigger className={metaErrors.className ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {metaErrors.className && (
              <p className="text-xs text-destructive">{metaErrors.className}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select
              value={meta.subject}
              onValueChange={(v) => setMetaField("subject", v)}
            >
              <SelectTrigger className={metaErrors.subject ? "border-destructive" : ""}>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>{subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {metaErrors.subject && (
              <p className="text-xs text-destructive">{metaErrors.subject}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Examination Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={meta.examType}
              onValueChange={(v) => setMetaField("examType", v)}
            >
              <SelectTrigger className={metaErrors.examType ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{examTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
            {metaErrors.examType && (
              <p className="text-xs text-destructive">{metaErrors.examType}</p>
            )}
          </div>
        </div>

        {/* Question rows */}
        <div className="space-y-4 py-1">
          {drafts.map((d, i) => (
            <div key={d.key} className="rounded-lg border border-border/60 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[11px]">Question {i + 1}</Badge>
                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrafts((p) => p.filter((x) => x.key !== d.key));
                      setDraftErrors((p) => {
                        const next = { ...p };
                        delete next[d.key];
                        delete next[d.key + "-marks"];
                        delete next[d.key + "-chapter"];
                        return next;
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground">
                    Chapter / Topic <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={d.chapter}
                    className={draftErrors[d.key + "-chapter"] ? "border-destructive" : ""}
                    onChange={(e) => {
                      update(d.key, { chapter: e.target.value });
                      if (draftErrors[d.key + "-chapter"]) {
                        setDraftErrors((p) => ({ ...p, [d.key + "-chapter"]: undefined }));
                      }
                    }}
                    placeholder="e.g. Trigonometry"
                  />
                  {draftErrors[d.key + "-chapter"] && (
                    <p className="text-xs text-destructive">{draftErrors[d.key + "-chapter"]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Difficulty</Label>
                  <Select value={d.diff} onValueChange={(v) => update(d.key, { diff: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Easy", "Medium", "Hard"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Marks <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={d.marks}
                    className={draftErrors[d.key + "-marks"] ? "border-destructive" : ""}
                    onChange={(e) => {
                      update(d.key, { marks: Number(e.target.value) });
                      if (draftErrors[d.key + "-marks"]) {
                        setDraftErrors((p) => ({ ...p, [d.key + "-marks"]: undefined }));
                      }
                    }}
                  />
                  {draftErrors[d.key + "-marks"] && (
                    <p className="text-xs text-destructive">{draftErrors[d.key + "-marks"]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Question <span className="text-destructive">*</span>
                </Label>
                <RichTextEditor
                  value={d.question}
                  onChange={(html) => updateAndClearError(d.key, { question: html })}
                  placeholder="Type the full question. Use the toolbar for bold, lists, super/subscript…"
                  className={draftErrors[d.key] ? "border-destructive" : ""}
                />
                {draftErrors[d.key] && (
                  <p className="text-xs text-destructive">{draftErrors[d.key]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Answer Key / Evaluation Notes</Label>
                <RichTextEditor
                  value={d.answer}
                  onChange={(html) => update(d.key, { answer: html })}
                  placeholder="Model answer or marking scheme (optional)"
                  minHeight={64}
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setDrafts((p) => [...p, blankDraft()])}>
            <Plus className="h-4 w-4" /> Add another question
          </Button>
        </div>

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <span className="text-xs text-muted-foreground">{drafts.length} question{drafts.length > 1 ? "s" : ""} · {totalMarks} marks</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
            <Button className="gradient-primary border-0" onClick={save}>Save to Bank</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}