/* eslint-disable react-hooks/static-components */
import { PageContainer, PageHeader } from "../../components/page-shell";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Megaphone, Send, Archive, EyeOff, CheckCircle2, CalendarDays } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth";
import { useNotices, useSections, useAcademicCalendar, noticesApi } from "../../lib/store";

const cats = ["Academic", "Events", "Fees", "Holiday", "Exam", "General"];
const auds = ["All", "Teachers", "Students", "Parents", "Staff", "Class"];

export default function TeacherNotices() {
  const { user } = useAuth();
  const notices = useNotices();
  const sections = useSections();
  const calendar = useAcademicCalendar();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "Academic", audience: "All", targetClass: "", attachments: [] });

  // Teachers read notices; only admins/principals publish them.
  const canPublish = user?.role === "admin" || user?.role === "super_admin";

  const visible = canPublish
    ? notices
    : notices.filter((n) => n.status === "Published" && (n.audience === "All" || n.audience === "Teachers" || n.audience === "Staff" || n.audience === "Class"));

  const circulars = visible.filter((n) => n.category === "General" || n.category === "Academic");
  const events = calendar.filter((e) => !e.archived);

  const submit = (publish) => {
    if (!form.title || !form.body) { toast.error("Title and body required"); return; }
    noticesApi.add({ ...form, by: "Principal", status: publish ? "Published" : "Draft" });
    toast.success(publish ? "Published" : "Saved as draft");
    setOpen(false);
    setForm({ ...form, title: "", body: "" });
  };

  const NoticeList = ({ items }) => (
    <Card><CardContent className="p-0 divide-y">
      {items.map((n) => (
        <div key={n.id} className="p-3 hover:bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-info/10 text-info shrink-0"><Megaphone className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{n.title}</span>
                <Badge variant="outline" className="text-[10px]">{n.category}</Badge>
                <Badge variant="secondary" className="text-[10px]">{n.audience}{n.targetClass ? ` · ${n.targetClass}` : ""}</Badge>
                <Badge variant={n.status === "Published" ? "default" : "outline"} className="text-[10px] ml-auto">{n.status}</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{n.by} · {new Date(n.createdAt).toLocaleDateString("en-IN")} · {n.acks.length} acknowledgements</div>
              <div className="text-xs mt-1 whitespace-pre-wrap">{n.body}</div>
              <div className="flex gap-2 mt-2">
                {canPublish && n.status === "Draft" && <Button size="sm" variant="outline" onClick={() => { noticesApi.publish(n.id); toast.success("Published"); }}><Send className="h-3.5 w-3.5" />Publish</Button>}
                {canPublish && n.status === "Published" && <Button size="sm" variant="outline" onClick={() => { noticesApi.unpublish(n.id); toast.success("Unpublished"); }}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>}
                {canPublish && n.status !== "Archived" && <Button size="sm" variant="outline" onClick={() => { noticesApi.archive(n.id); toast.success("Archived"); }}><Archive className="h-3.5 w-3.5" />Archive</Button>}
                <Button size="sm" variant="ghost" onClick={() => { noticesApi.acknowledge(n.id, user?.name ?? "You"); toast.success("Acknowledged"); }}><CheckCircle2 className="h-3.5 w-3.5" />Acknowledge</Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nothing here yet.</div>}
    </CardContent></Card>
  );

  return (
    <PageContainer>
      <PageHeader  title={canPublish ? "Notices" : "Notices, Circulars & Events"}
        actions={canPublish ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary border-0"><Plus className="h-4 w-4" />New Notice</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Create notice</DialogTitle><DialogDescription>Target a specific audience or class.</DialogDescription></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Message</Label><Textarea rows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Audience</Label>
                    <Select value={form.audience} onValueChange={(v) => setForm((f) => ({ ...f, audience: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{auds.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                {form.audience === "Class" && (
                  <div className="space-y-1.5"><Label>Class</Label>
                    <Select value={form.targetClass} onValueChange={(v) => setForm((f) => ({ ...f, targetClass: v }))}>
                      <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                      <SelectContent>{sections.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => submit(false)}>Save Draft</Button><Button className="gradient-primary border-0" onClick={() => submit(true)}><Send className="h-4 w-4" />Publish</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      <Tabs defaultValue="notices">
        <TabsList>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="circulars">Circulars</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="notices" className="mt-4"><NoticeList items={visible} /></TabsContent>
        <TabsContent value="circulars" className="mt-4"><NoticeList items={circulars} /></TabsContent>
        <TabsContent value="events" className="mt-4">
          <Card><CardContent className="p-0 divide-y">
            {events.map((e) => (
              <div key={e.id} className="p-3 flex items-start gap-3">
                <div className="h-9 w-9 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0"><CalendarDays className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{e.event}</span>
                    <Badge variant="outline" className="text-[10px]">{e.customType || e.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{e.audience}</Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{e.date}</div>
                  {e.notes && <div className="text-xs mt-1 text-muted-foreground">{e.notes}</div>}
                </div>
              </div>
            ))}
            {events.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No events scheduled.</div>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}