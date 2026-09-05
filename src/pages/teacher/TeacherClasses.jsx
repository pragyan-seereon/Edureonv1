import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  CalendarCheck,
  ClipboardList,
  Crown,
  Loader2,
} from "lucide-react";
import { getTeacherClasses } from "../../api/teacherclass"; 

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getTeacherClasses();
        if (isMounted) {
          setClasses(res?.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load your classes. Please try again."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader title="My Classes & Sections" />

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading your classes...
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-destructive">{error}</div>
      )}

      {!loading && !error && classes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No classes assigned yet.
        </div>
      )}

      {!loading && !error && classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Card
              key={c.section_uuid + c.subject_uuid}
              className="border-border/60 hover:shadow-md transition"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">
                      Class {c.class_name}
                    </CardTitle>
                    <CardDescription>
                      {c.subject_name} · Room {c.room_label}
                    </CardDescription>
                  </div>
                  {c.is_class_teacher && (
                    <Badge className="bg-warning/15 text-warning border-warning/20">
                      <Crown className="h-3 w-3" />
                      Class Teacher
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-md bg-muted/40">
                    <div className="text-xs text-muted-foreground">
                      Students
                    </div>
                    <div className="text-lg font-semibold">
                      {c.current_students}
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        / {c.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/40">
                    <div className="text-xs text-muted-foreground">
                      Class Teacher
                    </div>
                    <div className="text-sm font-semibold truncate">
                      {c.is_class_teacher ? "You" : c.class_teacher_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/teacher/attendance?classUuid=${encodeURIComponent(c.class_uuid)}&sectionUuid=${encodeURIComponent(c.section_uuid)}`}
                    >
                      <CalendarCheck className="h-4 w-4" />
                      Attendance
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/teacher/assignments">
                      <ClipboardList className="h-4 w-4" />
                      Assignments
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
