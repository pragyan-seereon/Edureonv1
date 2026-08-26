import { useMemo } from "react";
import { useAuth } from "./auth";
import { useEmployees } from "./store";

/**
 * Resolves the Employee record backing the signed-in teacher session and the
 * class / subject scope that teacher is allowed to work with.
 */
export function useTeacherCtx() {
  const { user } = useAuth();
  const employees = useEmployees();

  return useMemo(() => {
    const email = user?.email?.toLowerCase();
    const name = (user?.name ?? "").toLowerCase();
    const emp =
      (email ? employees.find((e) => e.email?.toLowerCase() === email) : undefined) ??
      (name ? employees.find((e) => e.name.toLowerCase() === name) : undefined) ??
      employees.find((e) => (e.assignments?.length ?? 0) > 0 && (e.type ?? "Academic") === "Academic") ??
      employees.find((e) => (e.type ?? "Academic") === "Academic");

    const assignments = emp?.assignments ?? [];
    const classes = [...new Set(assignments.map((a) => `${a.class}-${a.section}`))];
    const subjects = [...new Set(assignments.map((a) => a.subject))];

    return {
      employee: emp,
      teacherName: emp?.name ?? user?.name ?? "Teacher",
      assignments,
      classes: classes.length ? classes : ["X-B", "IX-A"],
      subjects: subjects.length ? subjects : ["Math"],
    };
  }, [employees, user?.email, user?.name]);
}