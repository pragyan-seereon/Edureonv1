import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Download, ExternalLink, FileBox, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import studentModel from "../../api/studentModel";
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const errorMessage = (error, fallback = "Unable to load study content.") => error?.response?.data?.detail?.message || error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback;
const openUrl = (url) => window.open(url, "_blank", "noopener,noreferrer");

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingUuid, setDownloadingUuid] = useState(null);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("all");

  useEffect(() => {
    Promise.allSettled([studentModel.getMyMaterials(), studentModel.getMyLessonPlans()]).then(([materialsResult, lessonsResult]) => {
      if (materialsResult.status === "fulfilled") setMaterials(materialsResult.value?.data || []);
      else toast.error(errorMessage(materialsResult.reason, "Unable to load study materials."));
      if (lessonsResult.status === "fulfilled") setLessonPlans(lessonsResult.value?.data || []);
      else toast.error(errorMessage(lessonsResult.reason, "Unable to load lesson plans."));
    }).finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => [...new Set([...materials, ...lessonPlans].map((item) => item.subject_name).filter(Boolean))], [materials, lessonPlans]);
  const matches = (item) => {
    const query = q.trim().toLowerCase();
    return (subject === "all" || item.subject_name === subject) && (!query || [item.title, item.description, item.file_name, item.subject_name, item.chapter, item.topic, item.learning_objectives].some((field) => field?.toLowerCase().includes(query)));
  };
  const visibleMaterials = useMemo(() => materials.filter(matches), [materials, q, subject]);
  const visibleLessons = useMemo(() => lessonPlans.filter(matches), [lessonPlans, q, subject]);
  const classLabel = materials[0]?.class_name || lessonPlans[0]?.class_name;

  const download = async (uuid, getUrl) => {
    setDownloadingUuid(uuid);
    try {
      const response = await getUrl(uuid);
      const url = response?.data?.download_url;
      if (!url) throw new Error("No download URL was returned.");
      openUrl(url);
      toast.success("Download opened.");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to open the download."));
    } finally {
      setDownloadingUuid(null);
    }
  };

  return <PageContainer>
    <PageHeader eyebrow="Student Portal" title="Study Materials" description={classLabel ? `Resources and lesson plans mapped to ${classLabel}` : "Resources and lesson plans mapped to your class"} />
    <div className="flex gap-2 mb-3"><div className="relative flex-1 max-w-sm"><Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8 h-9" placeholder="Search…" value={q} onChange={(event) => setQ(event.target.value)} /></div><Select value={subject} onValueChange={setSubject}><SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All subjects</SelectItem>{subjects.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
    <Tabs defaultValue="materials"><TabsList><TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger><TabsTrigger value="lessons">Lesson Plans ({lessonPlans.length})</TabsTrigger></TabsList>
      <TabsContent value="materials"><Card><CardContent className="p-0 divide-y">{loading && <Loading label="Loading materials…" />}{!loading && visibleMaterials.map((material) => <div key={material.material_uuid} className="flex items-start gap-3 p-3 hover:bg-muted/40"><Icon icon={<FileBox className="h-4 w-4" />} /><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{material.title}</div><div className="text-[11px] text-muted-foreground">{material.subject_name || "—"} · {material.type || "File"}{material.file_name && ` · ${material.file_name}`}</div>{material.description && <div className="text-[11px] mt-1 text-muted-foreground">{material.description}</div>}</div><Button size="sm" variant="outline" disabled={downloadingUuid === material.material_uuid} onClick={() => download(material.material_uuid, studentModel.getMaterialDownloadUrl)}><DownloadIcon loading={downloadingUuid === material.material_uuid} />Download</Button><Badge variant="outline" className="text-[10px]">{material.downloads ?? 0}</Badge></div>)}{!loading && visibleMaterials.length === 0 && <Empty label="No materials match your filters." />}</CardContent></Card></TabsContent>
      <TabsContent value="lessons"><Card><CardContent className="p-0 divide-y">{loading && <Loading label="Loading lesson plans…" />}{!loading && visibleLessons.map((lesson) => <div key={lesson.lesson_plan_uuid} className="flex items-start gap-3 p-3 hover:bg-muted/40"><Icon icon={<BookOpenCheck className="h-4 w-4" />} /><div className="flex-1 min-w-0"><div className="text-sm font-medium">{lesson.title}</div><div className="text-[11px] text-muted-foreground">{lesson.subject_name || "—"} · {lesson.chapter || "—"}{lesson.topic && ` · ${lesson.topic}`}</div><div className="text-[11px] mt-1 text-muted-foreground">Week of {lesson.week_of || "—"} · {lesson.periods ?? 0} periods</div>{lesson.learning_objectives && <div className="text-xs mt-1">{lesson.learning_objectives}</div>}</div>{lesson.reference_url && <Button size="sm" variant="ghost" onClick={() => openUrl(lesson.reference_url)}><ExternalLink className="h-3.5 w-3.5" />Reference</Button>}{lesson.pdf_file_name && <Button size="sm" variant="outline" disabled={downloadingUuid === lesson.lesson_plan_uuid} onClick={() => download(lesson.lesson_plan_uuid, studentModel.getLessonPlanDownloadUrl)}><DownloadIcon loading={downloadingUuid === lesson.lesson_plan_uuid} />PDF</Button>}</div>)}{!loading && visibleLessons.length === 0 && <Empty label="No lesson plans match your filters." />}</CardContent></Card></TabsContent>
    </Tabs>
  </PageContainer>;
}

function Icon({ icon }) { return <div className="h-9 w-9 rounded-md flex items-center justify-center bg-info/10 text-info shrink-0">{icon}</div>; }
function Loading({ label }) { return <div className="text-sm text-muted-foreground text-center p-6"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{label}</div>; }
function Empty({ label }) { return <div className="text-sm text-muted-foreground text-center p-6">{label}</div>; }
function DownloadIcon({ loading }) { return loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />; }
