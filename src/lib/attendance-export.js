import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const STATUS_LABEL = { P: "Present", A: "Absent", L: "On Leave" };

function buildRows(students) {
  return students.map((s, i) => ({
    "#": i + 1,
    "Student No": s.student_no,
    "Student Name": s.student_name,
    Status: STATUS_LABEL[s.attendance_status] ?? s.attendance_status,
  }));
}

export function exportAttendancePDF(report) {
  const {
    class_name,
    section_name,
    attendance_date,
    students,
    total_students,
    present,
    absent,
    on_leave,
  } = report;

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Attendance Report", 14, 16);
  doc.setFontSize(10);
  doc.text(`Class ${class_name} - Section ${section_name}`, 14, 23);
  doc.text(`Date: ${attendance_date}`, 14, 29);
  doc.text(
    `Total: ${total_students}   Present: ${present}   Absent: ${absent}   On Leave: ${on_leave}`,
    14,
    35,
  );

  autoTable(doc, {
    startY: 40,
    head: [["#", "Student No", "Student Name", "Status"]],
    body: students.map((s, i) => [
      i + 1,
      s.student_no,
      s.student_name,
      STATUS_LABEL[s.attendance_status] ?? s.attendance_status,
    ]),
  });

  doc.save(`attendance_${section_name}_${attendance_date}.pdf`);
}

export function exportAttendanceExcel(report) {
  const { section_name, attendance_date, students } = report;

  const ws = XLSX.utils.json_to_sheet(buildRows(students));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, `attendance_${section_name}_${attendance_date}.xlsx`);
}