import { useEffect, useMemo, useState } from "react";
import { Loader2, Megaphone, Search, FileText, Image as ImageIcon, Video, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getTeacherPortalNotices } from "../../api/notice";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";

const errorMessage = (error) => error?.response?.data?.detail?.message || error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Unable to load notices.";
const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
};

// Normalizes a notice's attachments to {name, type, url}, matching the shape
// the /communications API returns (original_file_name / mime_type / file_url).
const getNoticeAttachments = (notice) =>
  (Array.isArray(notice.attachments) ? notice.attachments : []).map((attachment) => ({
    name: attachment.original_file_name ?? attachment.name,
    type: attachment.mime_type ?? attachment.type,
    url: attachment.file_url ?? attachment.url,
  }));

// Classifies an attachment as image / video / pdf / other, using the mime
// type when available and falling back to the file extension.
const getFileKind = (att) => {
  const type = att?.type || "";
  const name = (att?.name || att?.url || "").toLowerCase();
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/.test(name)) return "image";
  if (type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/.test(name)) return "video";
  if (type === "application/pdf" || /\.pdf$/.test(name)) return "pdf";
  return "other";
};

const attachmentIcon = (att) => {
  const kind = getFileKind(att);
  if (kind === "image") return <ImageIcon className="h-3 w-3" />;
  if (kind === "video") return <Video className="h-3 w-3" />;
  return <FileText className="h-3 w-3" />;
};

export default function TeacherNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [previewAttachment, setPreviewAttachment] = useState(null);

  useEffect(() => {
    getTeacherPortalNotices()
      .then((response) => setNotices(response?.data ?? []))
      .catch((error) => toast.error(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(notices.map((notice) => notice.category?.name).filter(Boolean))], [notices]);
  const visibleNotices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notices.filter((notice) =>
      (category === "all" || notice.category?.name === category)
      && (!query || [notice.title, notice.description, notice.category?.name].some((field) => field?.toLowerCase().includes(query)))
    );
  }, [notices, search, category]);

  return <PageContainer>
    <PageHeader eyebrow="Teacher Portal" title="Communications" description="Communication notes shared with teachers."
      actions={<div className="flex gap-2"><div className="relative"><Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="h-9 w-52 pl-8" placeholder="Search notices…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Select value={category} onValueChange={setCategory}><SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>} />
    <Card className="border-border/60"><CardContent className="p-0 divide-y">
      {loading && <div className="p-8 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading notices…</div>}
      {!loading && visibleNotices.map((notice) => <div key={notice.notes_uuid} className="flex gap-3 p-4 hover:bg-muted/40"><div className="h-9 w-9 rounded-md flex items-center justify-center bg-info/10 text-info shrink-0"><Megaphone className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium">{notice.title}</span>{notice.category?.name && <Badge variant="outline" className="text-[10px]">{notice.category.name}</Badge>}</div><div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(notice.start_date || notice.published_at || notice.created_at)}</div>{notice.description && <div className="mt-1 text-xs whitespace-pre-wrap">{notice.description}</div>}
        {getNoticeAttachments(notice).length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">
          {getNoticeAttachments(notice).map((att, idx) => <div key={idx} className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] bg-muted/20">
            {attachmentIcon(att)}
            <span className="truncate max-w-[140px]">{att.name}</span>
            {att.url ? <>
              <button type="button" title={`View ${att.name}`} onClick={() => setPreviewAttachment(att)} className="ml-1 rounded p-0.5 hover:bg-muted">
                <Eye className="h-3.5 w-3.5" />
              </button>
              <a href={att.url} download={att.name} title={`Download ${att.name}`} className="rounded p-0.5 hover:bg-muted">
                <Download className="h-3.5 w-3.5" />
              </a>
            </> : <EyeOff className="ml-1 h-3.5 w-3.5 text-muted-foreground" />}
          </div>)}
        </div>}
      </div></div>)}
      {!loading && visibleNotices.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No notices found.</div>}
    </CardContent></Card>

    <Dialog open={!!previewAttachment} onOpenChange={(open) => !open && setPreviewAttachment(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            {previewAttachment && attachmentIcon(previewAttachment)}
            <span className="truncate">{previewAttachment?.name || "Attachment"}</span>
          </DialogTitle>
        </DialogHeader>
        {previewAttachment && <div className="space-y-3">
          <div className="rounded-md border bg-muted/20 flex items-center justify-center overflow-hidden min-h-[200px] max-h-[70vh]">
            {getFileKind(previewAttachment) === "image" && <img src={previewAttachment.url} alt={previewAttachment.name} className="max-h-[70vh] w-auto object-contain" />}
            {getFileKind(previewAttachment) === "video" && <video src={previewAttachment.url} controls className="max-h-[70vh] w-full" />}
            {getFileKind(previewAttachment) === "pdf" && <iframe src={previewAttachment.url} title={previewAttachment.name} className="w-full h-[70vh]" />}
            {getFileKind(previewAttachment) === "other" && <div className="flex flex-col items-center gap-2 p-8 text-sm text-muted-foreground"><FileText className="h-8 w-8" />No inline preview available for this file type.</div>}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setPreviewAttachment(null)}>Close</Button>
            <a href={previewAttachment.url} download={previewAttachment.name} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Download</Button>
            </a>
          </DialogFooter>
        </div>}
      </DialogContent>
    </Dialog>
  </PageContainer>;
}