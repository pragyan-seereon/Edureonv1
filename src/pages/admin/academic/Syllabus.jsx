/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Upload,
  FileText,
  Loader2,
  Eye,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  PaginationBar,
} from "../../../components/pagination-controls";
import { usePagination } from "../../../lib/use-pagination";

// ---- Static mock data — swap for real classes + API responses later ----
const MOCK_CLASSES = [
  { class_uuid: "c1", name: "Class 1" },
  { class_uuid: "c2", name: "Class 2" },
  { class_uuid: "c3", name: "Class 3" },
  { class_uuid: "c4", name: "Class 4" },
];

const MOCK_SYLLABUS_ROWS = [
  {
    syllabus_uuid: "s1",
    class_uuid: "c1",
    class_name: "Class 1",
    academic_year: "2026-27",
    file_name: "class-1-syllabus.pdf",
    status: "Active",
  },
  {
    syllabus_uuid: "s2",
    class_uuid: "c2",
    class_name: "Class 2",
    academic_year: "2026-27",
    file_name: "class-2-syllabus.pdf",
    status: "Active",
  },
  {
    syllabus_uuid: "s3",
    class_uuid: "c3",
    class_name: "Class 3",
    academic_year: "2025-26",
    file_name: "class-3-syllabus-old.pdf",
    status: "Archived",
  },
];

export default function Syllabus() {
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [syllabusRows, setSyllabusRows] = useState(MOCK_SYLLABUS_ROWS);
  const [deleting, setDeleting] = useState(false);

  const syllabusPage = usePagination(syllabusRows, 10);

  // ---- Upload dialog state (UI only — no upload wired yet) ----
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importClassUUID, setImportClassUUID] = useState("");
  const [importYear, setImportYear] = useState("2026-27");
  const [importStep, setImportStep] = useState("select"); // "select" -> "file"
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    setImportClassUUID("");
    setImportYear(academicYear || "2026-27");
    setSelectedFileName("");
    setImportStep("select");
    setImportDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    if (!importClassUUID) {
      toast.error("Select a class to continue");
      return;
    }
    if (!importYear.trim()) {
      toast.error("Enter an academic year, e.g. 2026-27");
      return;
    }
    setImportStep("file");
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  // ---- File picked — this just fakes the upload locally for now ----
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF file");
      return;
    }

    setSelectedFileName(file.name);
    setUploading(true);

    // Fake network delay so the loading state is visible in the design.
    setTimeout(() => {
      const className =
        MOCK_CLASSES.find((c) => c.class_uuid === importClassUUID)?.name || "—";

      setSyllabusRows((prev) => [
        {
          syllabus_uuid: `s${Date.now()}`,
          class_uuid: importClassUUID,
          class_name: className,
          academic_year: importYear.trim(),
          file_name: file.name,
          status: "Active",
        },
        ...prev,
      ]);
      setAcademicYear(importYear.trim());
      setUploading(false);
      toast.success(`Uploaded ${file.name}`);
      setImportDialogOpen(false);
    }, 900);
  };

  const handleViewSyllabus = () => {
    toast.info("Preview will open the PDF once upload is wired to the backend");
  };

  const handleDeleteSyllabus = (item) => {
    if (!window.confirm("Delete this syllabus? This cannot be undone.")) return;
    setDeleting(true);
    setTimeout(() => {
      setSyllabusRows((prev) =>
        prev.filter((r) => r.syllabus_uuid !== item.syllabus_uuid),
      );
      setDeleting(false);
      toast.success("Syllabus deleted");
    }, 400);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic"
        title="Syllabus"
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelected}
            />
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Syllabus
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Class Syllabuses</CardTitle>
            {/* <CardDescription>
              Upload a PDF syllabus per class and academic year — no section needed.
            </CardDescription> */}
          </div>
          {/* <div className="w-36">
            <Label className="text-xs font-medium text-muted-foreground">
              Academic Year
            </Label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-27"
            />
          </div> */}
        </CardHeader>

        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">File</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {syllabusRows.length ? (
                syllabusPage.pageItems.map((item) => (
                  <tr key={item.syllabus_uuid} className="border-b last:border-0">
                    <td className="px-5 py-4 font-medium">{item.class_name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {item.file_name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "Archived"
                            ? "bg-muted text-muted-foreground"
                            : "bg-emerald-500/10 text-emerald-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={handleViewSyllabus}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSyllabus(item)}
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-muted-foreground">
                    No syllabus uploaded for this academic year yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <PaginationBar {...syllabusPage} itemLabel="syllabuses" showPageSize={false} />
        </CardContent>
      </Card>

      {/* ---- Upload dialog: step 1 select class/year, step 2 choose PDF ---- */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Syllabus</DialogTitle>
            <DialogDescription>
              {importStep === "select"
                ? "Select the class   for this syllabus."
                : "Confirmed. Choose the PDF file to upload."}
            </DialogDescription>
          </DialogHeader>

          {importStep === "select" ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Class</Label>
                <Select value={importClassUUID} onValueChange={setImportClassUUID}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CLASSES.map((c) => (
                      <SelectItem key={c.class_uuid} value={c.class_uuid}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Academic Year</Label>
                <Input
                  value={importYear}
                  onChange={(e) => setImportYear(e.target.value)}
                  placeholder="2026-27"
                />
              </div> */}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading {selectedFileName}…
                </div>
              ) : (
                "Waiting for file selection — pick a PDF from the dialog that opened."
              )}
            </div>
          )}

          <DialogFooter>
            {importStep === "select" ? (
              <>
                <Button variant="ghost" onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmSelection}>Continue</Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setImportStep("select")}
                  disabled={uploading}
                >
                  Back
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Choose File
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}