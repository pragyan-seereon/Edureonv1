import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { FileUp, Download, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTeacherCtx } from "../../lib/teacher-ctx";
import { openPrintable, esc } from "../../lib/print";

const seed = [
  { id: "DOC-901", name: "Appointment Letter.pdf", category: "Joining", uploadedAt: "2023-06-12", status: "Verified" },
  { id: "DOC-902", name: "B.Ed Degree Certificate.pdf", category: "Qualification", uploadedAt: "2023-06-12", status: "Verified" },
  { id: "DOC-903", name: "Aadhaar.pdf", category: "Identity", uploadedAt: "2023-06-12", status: "Verified" },
  { id: "DOC-904", name: "CBSE Training Certificate 2025.pdf", category: "Training", uploadedAt: "2025-08-02", status: "Pending" },
];

const CATEGORIES = ["Joining", "Identity", "Qualification", "Training", "Medical", "Other"];

export default function TeacherDocuments() {
  const { teacherName, employee } = useTeacherCtx();
  const [docs, setDocs] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Other" });

  const upload = () => {
    if (!form.name.trim()) return toast.error("Select or name a file");
    setDocs((d) => [{ id: "DOC-" + (905 + d.length), name: form.name, category: form.category, uploadedAt: new Date().toISOString().slice(0, 10), status: "Pending" }, ...d]);
    setOpen(false); setForm({ name: "", category: "Other" });
    toast.success("Document uploaded — pending HR verification");
  };

  const download = (d) =>
    openPrintable(d.name, `<h1>${esc(d.name)}</h1><div class="muted">${esc(teacherName)}${employee?.id ? ` · ${esc(employee.id)}` : ""}</div>
      <div class="box">Category: ${esc(d.category)}<br/>Uploaded: ${esc(d.uploadedAt)}<br/>Status: ${esc(d.status)}</div>`);

  return (
    <PageContainer>
      <PageHeader eyebrow="Teacher Portal · Personal" title="My Documents"
        description="Only your own joining and service documents are visible here. School-wide document management stays with the Admin."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary border-0"><FileUp className="h-4 w-4" />Upload Document</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload document</DialogTitle><DialogDescription>Goes to HR for verification.</DialogDescription></DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1"><Label className="text-xs">File</Label>
                  <Input type="file" onChange={(e) => setForm((f) => ({ ...f, name: e.target.files?.[0]?.name ?? f.name }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Document name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <DialogFooter><Button onClick={upload}>Upload</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" />Document locker</CardTitle>
          <CardDescription>{docs.length} document(s) on file for {teacherName}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Document</TableHead><TableHead>Category</TableHead><TableHead>Uploaded</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-xs">{d.category}</TableCell>
                  <TableCell className="text-xs">{d.uploadedAt}</TableCell>
                  <TableCell><Badge variant={d.status === "Verified" ? "default" : "outline"}>{d.status}</Badge></TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => download(d)}><Download className="h-4 w-4" />Download</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}