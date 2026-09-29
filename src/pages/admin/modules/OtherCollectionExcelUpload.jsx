import { useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { downloadOtherCollectionExcelTemplate, importOtherCollectionExcel } from "../../../api/other_collection";


function uploadError(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.reason || "Invalid input").join("; ");
  if (detail && typeof detail === "object") {
    return [detail.message, detail.row ? `Excel row ${detail.row}:` : "", detail.reason].filter(Boolean).join(" ");
  }
  return "Unable to upload the Excel file. Please try again.";
}

export default function OtherCollectionExcelUpload({ onImported }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function changeOpen(next) {
    if (busy) return;
    setOpen(next);
    if (next) {
      setFile(null);
      setError("");
      setResult(null);
    }
  }

  async function downloadTemplate() {
    setDownloading(true);
    setError("");
    try {
      const response = await downloadOtherCollectionExcelTemplate();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "other_payments_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Unable to download the template. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || result) return;
    if (!file || !/\.(xlsx|xls)$/i.test(file.name) || !file.size) {
      setError("Choose a non-empty .xlsx or .xls file.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await importOtherCollectionExcel(body);
      if (!response.data?.success) throw new Error("Import was not completed.");
      setResult(response.data);
      await onImported();
    } catch (failure) {
      setError(uploadError(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => changeOpen(true)}>
        <Upload className="mr-2 h-4 w-4" /> Upload Excel
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Upload other payments</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Upload your payment report. Name, Phone Number and Email are matched to database records to detect the payer and role. Added By is matched automatically.</p>
          <Button type="button" variant="outline" onClick={downloadTemplate} disabled={downloading || busy}>
            <Download className="mr-2 h-4 w-4" /> {downloading ? "Downloading…" : "Download Excel template"}
          </Button>
          <form onSubmit={submit} className="space-y-4">
            <fieldset disabled={busy || Boolean(result)} className="space-y-4 disabled:opacity-70">
              <div className="space-y-2">
                <Label htmlFor="other-excel-file">Excel file</Label>
                <Input id="other-excel-file" type="file" accept=".xlsx,.xls" required onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} />
              </div>
            </fieldset>
            {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {result && <div role="status" className="space-y-2 rounded-md border p-3 text-sm">
              <p className="font-medium">Import complete: {result.imported ?? 0} imported, {result.already_imported ?? 0} already imported.</p>
              <p>{result.total_rows ?? 0} Excel rows processed.</p>
              {result.warnings?.length > 0 && <details>
                <summary className="cursor-pointer text-amber-700">Review {result.warnings.length} warnings</summary>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">{result.warnings.map((warning, index) => <li key={index}>Row {warning.row}: {warning.reason}</li>)}</ul>
              </details>}
            </div>}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => changeOpen(false)}>{result ? "Done" : "Cancel"}</Button>
              {!result && <Button type="submit" disabled={busy || !file} className="bg-[#173b73] hover:bg-[#122f5c]">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{busy ? "Uploading…" : "Upload Excel"}
              </Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
