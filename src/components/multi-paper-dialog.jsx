import { useState } from "react";
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

function newRow() {
  return {
    _id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subject: "",
    paper: "Paper 1",
    date: "",
    time: "09:30",
    duration: 180,
    maxMarks: 80,
    room: "",
  };
}

function newClassBlock(defaultClass) {
  return {
    _id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    className: defaultClass,
    rows: [newRow()],
  };
}

export function MultiPaperDialog({
  open,
  onOpenChange,
  categories,
  classOptions,
  onSubmit,
}) {
  const [category, setCategory] = useState(categories?.[0] || "Term 1");
  const [blocks, setBlocks] = useState([newClassBlock(classOptions?.[0] || "X")]);

  const reset = () => {
    setCategory(categories?.[0] || "Term 1");
    setBlocks([newClassBlock(classOptions?.[0] || "X")]);
  };

  const updateBlock = (blockId, patch) =>
    setBlocks((p) => p.map((b) => (b._id === blockId ? { ...b, ...patch } : b)));

  const updateRow = (blockId, rowId, patch) =>
    setBlocks((p) =>
      p.map((b) =>
        b._id !== blockId
          ? b
          : { ...b, rows: b.rows.map((r) => (r._id === rowId ? { ...r, ...patch } : r)) },
      ),
    );

  const addRow = (blockId) =>
    setBlocks((p) =>
      p.map((b) => (b._id === blockId ? { ...b, rows: [...b.rows, newRow()] } : b)),
    );

  const removeRow = (blockId, rowId) =>
    setBlocks((p) =>
      p.map((b) =>
        b._id !== blockId ? b : { ...b, rows: b.rows.filter((r) => r._id !== rowId) },
      ),
    );

  const addBlock = () => setBlocks((p) => [...p, newClassBlock(classOptions?.[0] || "X")]);

  const removeBlock = (blockId) => setBlocks((p) => p.filter((b) => b._id !== blockId));

  const totalRows = blocks.reduce((a, b) => a + b.rows.length, 0);

  const handleSubmit = () => {
    const papers = [];
    blocks.forEach((b) => {
      b.rows.forEach((r) => {
        if (!r.subject) return;
        papers.push({
          id: `xp-${Date.now()}-${papers.length}`,
          category,
          className: b.className,
          subject: r.subject,
          paper: r.paper || "Paper 1",
          date: r.date || "",
          time: r.time || "09:30",
          duration: Number(r.duration) || 180,
          maxMarks: Number(r.maxMarks) || 80,
          room: r.room || "",
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Subjects / Papers</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 max-w-xs">
          <Label className="text-xs">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-5">
          {blocks.map((b) => (
            <div key={b._id} className="rounded-lg border border-border/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1 w-40">
                  <Label className="text-xs">Class</Label>
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
                {b.rows.map((r) => (
                  <div key={r._id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <Label className="text-[10px]">Subject</Label>
                      <Input
                        className="h-8 text-xs"
                        value={r.subject}
                        onChange={(e) => updateRow(b._id, r._id, { subject: e.target.value })}
                        placeholder="Mathematics"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Paper</Label>
                      <Input
                        className="h-8 text-xs"
                        value={r.paper}
                        onChange={(e) => updateRow(b._id, r._id, { paper: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Date</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={r.date}
                        onChange={(e) => updateRow(b._id, r._id, { date: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[10px]">Time</Label>
                      <Input
                        className="h-8 text-xs"
                        value={r.time}
                        onChange={(e) => updateRow(b._id, r._id, { time: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[10px]">Dur.</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={r.duration}
                        onChange={(e) => updateRow(b._id, r._id, { duration: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[10px]">Max</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={r.maxMarks}
                        onChange={(e) => updateRow(b._id, r._id, { maxMarks: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[10px]">Room</Label>
                      <Input
                        className="h-8 text-xs"
                        value={r.room}
                        onChange={(e) => updateRow(b._id, r._id, { room: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
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
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => addRow(b._id)}>
                <Plus className="h-3.5 w-3.5" /> Add Subject
              </Button>
            </div>
          ))}
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