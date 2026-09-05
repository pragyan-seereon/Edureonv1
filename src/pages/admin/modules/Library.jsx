import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  BookPlus,
  Clock,
  IndianRupee,
  Library,
  Plus,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import {
  PageContainer,
  PageHeader,
} from "../../../components/page-shell";

import { KpiCard } from "../../../components/kpi-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import {
  addLibraryBook,
  getLibraryBooks,
  getLibraryDashboard,
  getLibraryIssues,
  issueLibraryBook,
  returnLibraryBook,
} from "../../../api/library";

import { getAllStudents } from "../../../api/students";

import useAuthStore from "../../../store/authStore";
import useSessionStore from "../../../store/sessionStore";


/* =========================================================
   DATE HELPERS
========================================================= */

const pad = (number) =>
  String(number).padStart(2, "0");


const formatDate = (date) =>
  `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;


const today = () =>
  formatDate(new Date());


const addDays = (date, days) => {
  const value = new Date(`${date}T00:00:00`);

  value.setDate(
    value.getDate() + days
  );

  return formatDate(value);
};


/* =========================================================
   API HELPERS
========================================================= */

const dataOf = (
  response,
  fallback = []
) => {
  return response?.data?.data ?? fallback;
};


const errorOf = (
  error,
  fallback
) => {

  if (error?.response?.status === 409) {

    return (
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      "Conflict — please check the library data."
    );
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    fallback
  );
};


/* =========================================================
   MAIN LIBRARY PAGE
========================================================= */

export default function LibraryPage() {

  const instituteUUID = useAuthStore(
    (state) => state.instituteUUID
  );

  const sessionYear = useSessionStore(
    (state) => state.sessionYear
  );


  /* =======================================================
     STATE
  ======================================================= */

  const [dashboard, setDashboard] = useState({
    catalog: 0,
    total_titles: 0,
    total_copies: 0,
    issued: 0,
    issued_copies: 0,
    available: 0,
    available_copies: 0,
    overdue: 0,
    pending_fines: 0,
  });


  const [books, setBooks] = useState([]);


  const [issues, setIssues] = useState({
    active: [],
    overdue: [],
    history: [],
  });


  const [query, setQuery] = useState("");


  const [loading, setLoading] = useState(true);


  const [loadingBooks, setLoadingBooks] =
    useState(false);


  const [addOpen, setAddOpen] =
    useState(false);


  const [issueOpen, setIssueOpen] =
    useState(false);


  /* =======================================================
     LOAD OVERVIEW
  ======================================================= */

  const loadOverview = useCallback(
    async () => {

      if (
        !instituteUUID ||
        !sessionYear
      ) {
        return;
      }

      setLoading(true);

      try {

        const [
          summary,
          active,
          overdue,
          history,
        ] = await Promise.all([
          getLibraryDashboard(),

          getLibraryIssues(
            "active",
            sessionYear
          ),

          getLibraryIssues(
            "overdue",
            sessionYear
          ),

          getLibraryIssues(
            "history",
            sessionYear
          ),
        ]);


        setDashboard(
          dataOf(summary, {
            catalog: 0,
            total_titles: 0,
            total_copies: 0,
            issued: 0,
            issued_copies: 0,
            available: 0,
            available_copies: 0,
            overdue: 0,
            pending_fines: 0,
          })
        );


        setIssues({
          active: dataOf(active, []),
          overdue: dataOf(overdue, []),
          history: dataOf(history, []),
        });

      } catch (error) {

        toast.error(
          errorOf(
            error,
            "Failed to load library data"
          )
        );

      } finally {

        setLoading(false);

      }

    },
    [
      instituteUUID,
      sessionYear,
    ]
  );


  /* =======================================================
     LOAD BOOKS
  ======================================================= */

  const loadBooks = useCallback(
    async (search = "") => {

      if (
        !instituteUUID ||
        !sessionYear
      ) {
        return;
      }

      setLoadingBooks(true);

      try {

        const response =
          await getLibraryBooks(search);

        setBooks(
          dataOf(response, [])
        );

      } catch (error) {

        toast.error(
          errorOf(
            error,
            "Failed to load books"
          )
        );

      } finally {

        setLoadingBooks(false);

      }

    },
    [
      instituteUUID,
      sessionYear,
    ]
  );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    const timer = setTimeout(
      () => {
        loadOverview();
      },
      0
    );

    return () =>
      clearTimeout(timer);

  }, [loadOverview]);


  /* =======================================================
     BOOK SEARCH
  ======================================================= */

  useEffect(() => {

    const timer = setTimeout(
      () => {
        loadBooks(query);
      },
      300
    );

    return () =>
      clearTimeout(timer);

  }, [
    query,
    loadBooks,
  ]);


  /* =======================================================
     REFRESH EVERYTHING
  ======================================================= */

  const refresh = async () => {

    await Promise.all([
      loadOverview(),
      loadBooks(query),
    ]);

  };


  /* =======================================================
     RETURN BOOK
  ======================================================= */

  const handleReturn = async (
    issueUUID
  ) => {

    try {

      const response =
        await returnLibraryBook(
          issueUUID,
          today()
        );

      toast.success(
        response?.data?.message ||
        "Book returned successfully"
      );

      await refresh();

    } catch (error) {

      toast.error(
        errorOf(
          error,
          "Failed to return book"
        )
      );

    }

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PageContainer>

      <PageHeader
        eyebrow="Operations"
        title="Library & Circulation"
        description="Catalog, issue books to students with due dates, and track overdue fines."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAddOpen(true)
              }
            >
              <BookPlus className="h-4 w-4" />
              Add Book
            </Button>

            <Button
              size="sm"
              className="gradient-primary border-0"
              onClick={() =>
                setIssueOpen(true)
              }
            >
              <Plus className="h-4 w-4" />
              Issue Book
            </Button>
          </>
        }
      />


      {/* =================================================
          DIALOGS
      ================================================= */}

      <AddBookDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={refresh}
      />


      <IssueDialog
        open={issueOpen}
        books={books}
        sessionYear={sessionYear}
        onOpenChange={setIssueOpen}
        onSaved={refresh}
      />


      {/* =================================================
          KPI
      ================================================= */}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mb-6
        "
      >

        <KpiCard
          label="Catalog"
          value={
            dashboard.total_titles ??
            dashboard.catalog ??
            0
          }
          icon={
            <Library className="h-5 w-5" />
          }
          tone="primary"
        />


        <KpiCard
          label="Issued"
          value={
            dashboard.issued_copies ??
            dashboard.issued ??
            0
          }
          icon={
            <BookOpen className="h-5 w-5" />
          }
          tone="info"
        />


        <KpiCard
          label="Overdue"
          value={
            dashboard.overdue ?? 0
          }
          icon={
            <Clock className="h-5 w-5" />
          }
          tone="warning"
        />


        <KpiCard
          label="Pending Fines"
          value={`₹${Number(
            dashboard.pending_fines ?? 0
          ).toLocaleString("en-IN")}`}
          icon={
            <IndianRupee className="h-5 w-5" />
          }
          tone="success"
        />

      </div>


      {/* =================================================
          TABS
      ================================================= */}

      <Tabs
        defaultValue="catalog"
      >

        <TabsList>

          <TabsTrigger value="catalog">
            Catalog
          </TabsTrigger>

          <TabsTrigger value="active">
            Active Issues
          </TabsTrigger>

          <TabsTrigger value="overdue">
            Overdue
          </TabsTrigger>

          <TabsTrigger value="history">
            History
          </TabsTrigger>

        </TabsList>


        {/* =================================================
            CATALOG
        ================================================= */}

        <TabsContent
          value="catalog"
          className="mt-4"
        >

          <Card
            className="border-border/60"
          >

            <CardHeader
              className="
                flex-row
                items-center
                justify-between
                space-y-0
              "
            >

              <div>

                <CardTitle className="text-base">
                  Book Catalog
                </CardTitle>

                <CardDescription>
                  {books.length} titles
                </CardDescription>

              </div>


              <div
                className="
                  relative
                  w-64
                "
              >

                <Search
                  className="
                    h-4
                    w-4
                    absolute
                    left-2.5
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  placeholder="ISBN, title or author"
                  className="pl-8 h-9"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                />

              </div>

            </CardHeader>


            <CardContent className="p-0">

              <BooksTable
                books={books}
                loading={
                  loading ||
                  loadingBooks
                }
              />

            </CardContent>

          </Card>

        </TabsContent>


        {/* =================================================
            ACTIVE
        ================================================= */}

        <TabsContent
          value="active"
          className="mt-4"
        >

          <IssuesTable
            issues={issues.active}
            loading={loading}
            onReturn={handleReturn}
          />

        </TabsContent>


        {/* =================================================
            OVERDUE
        ================================================= */}

        <TabsContent
          value="overdue"
          className="mt-4"
        >

          <IssuesTable
            issues={issues.overdue}
            loading={loading}
            onReturn={handleReturn}
          />

        </TabsContent>


        {/* =================================================
            HISTORY
        ================================================= */}

        <TabsContent
          value="history"
          className="mt-4"
        >

          <IssuesTable
            issues={issues.history}
            loading={loading}
            onReturn={handleReturn}
          />

        </TabsContent>

      </Tabs>

    </PageContainer>
  );
}


/* =========================================================
   BOOK TABLE
========================================================= */

function BooksTable({
  books,
  loading,
}) {

  return (
    <Table>

      <TableHeader>

        <TableRow>

          <TableHead>
            ISBN
          </TableHead>

          <TableHead>
            Title
          </TableHead>

          <TableHead>
            Author
          </TableHead>

          <TableHead>
            Category
          </TableHead>

          <TableHead>
            Copies
          </TableHead>

          <TableHead>
            Issued
          </TableHead>

          <TableHead>
            Available
          </TableHead>

        </TableRow>

      </TableHeader>


      <TableBody>

        {loading && (

          <EmptyRow
            colSpan={7}
            text="Loading books…"
          />

        )}


        {!loading &&
          books.map((book) => {

            /*
             * IMPORTANT:
             *
             * Do NOT calculate availability from
             * frontend issue records.
             *
             * Backend returns:
             *
             * copies
             * total_copies
             * issued_copies
             * available
             * available_copies
             */

            const totalCopies =
              Number(
                book.total_copies ??
                book.copies ??
                0
              );


            const issuedCopies =
              Number(
                book.issued_copies ??
                0
              );


            const availableCopies =
              Number(
                book.available_copies ??
                book.available ??
                Math.max(
                  0,
                  totalCopies -
                    issuedCopies
                )
              );


            return (
              <TableRow
                key={
                  book.book_uuid
                }
              >

                {/* ISBN */}

                <TableCell
                  className="
                    font-mono
                    text-xs
                  "
                >
                  {book.isbn}
                </TableCell>


                {/* TITLE */}

                <TableCell
                  className="
                    font-medium
                  "
                >
                  {book.title}
                </TableCell>


                {/* AUTHOR */}

                <TableCell
                  className="
                    text-sm
                  "
                >
                  {book.author || "—"}
                </TableCell>


                {/* CATEGORY */}

                <TableCell>

                  <Badge
                    variant="secondary"
                  >
                    {book.category}
                  </Badge>

                </TableCell>


                {/* TOTAL */}

                <TableCell>
                  {totalCopies}
                </TableCell>


                {/* ISSUED */}

                <TableCell>
                  {issuedCopies}
                </TableCell>


                {/* AVAILABLE */}

                <TableCell>

                  <Badge
                    variant={
                      availableCopies <= 0
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {availableCopies}
                  </Badge>

                </TableCell>

              </TableRow>
            );
          })}


        {!loading &&
          !books.length && (

            <EmptyRow
              colSpan={7}
              text="No books found."
            />

          )}

      </TableBody>

    </Table>
  );
}


/* =========================================================
   ISSUES TABLE
========================================================= */

function IssuesTable({
  issues,
  loading,
  onReturn,
}) {

  return (
    <Card
      className="border-border/60"
    >

      <CardContent className="p-0">

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>
                ID
              </TableHead>

              <TableHead>
                Book
              </TableHead>

              <TableHead>
                Student
              </TableHead>

              <TableHead>
                Issued
              </TableHead>

              <TableHead>
                Due
              </TableHead>

              <TableHead>
                Returned
              </TableHead>

              <TableHead>
                Fee/day
              </TableHead>

              <TableHead>
                Fine
              </TableHead>

              <TableHead />

            </TableRow>

          </TableHeader>


          <TableBody>

            {!loading &&
              issues.map((issue) => {

                const fine =
                  Number(
                    issue.fine_amount ?? 0
                  );


                return (
                  <TableRow
                    key={
                      issue.issue_uuid
                    }
                  >

                    {/* ISSUE NUMBER */}

                    <TableCell
                      className="
                        font-mono
                        text-xs
                      "
                    >
                      {issue.issue_number}
                    </TableCell>


                    {/* BOOK */}

                    <TableCell
                      className="
                        text-sm
                        font-medium
                      "
                    >
                      {issue.book_title}
                    </TableCell>


                    {/* STUDENT */}

                    <TableCell
                      className="
                        text-sm
                      "
                    >

                      {issue.student_name}

                      <span
                        className="
                          font-mono
                          text-[10px]
                          text-muted-foreground
                          ml-1
                        "
                      >
                        ·{" "}
                        {issue.student_no}
                      </span>

                    </TableCell>


                    {/* ISSUED */}

                    <TableCell
                      className="text-xs"
                    >
                      {issue.issued_on}
                    </TableCell>


                    {/* DUE */}

                    <TableCell
                      className="text-xs"
                    >

                      {issue.due_on}

                      {issue.is_overdue && (

                        <Badge
                          variant="destructive"
                          className="
                            ml-1
                            text-[9px]
                          "
                        >
                          Overdue
                        </Badge>

                      )}

                    </TableCell>


                    {/* RETURNED */}

                    <TableCell
                      className="
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {issue.returned_on ||
                        "—"}
                    </TableCell>


                    {/* FEE */}

                    <TableCell
                      className="text-xs"
                    >
                      ₹
                      {issue.late_fee_per_day}
                    </TableCell>


                    {/* FINE */}

                    <TableCell
                      className={
                        fine > 0
                          ? "text-destructive font-semibold"
                          : ""
                      }
                    >

                      {fine > 0
                        ? `₹${fine}`
                        : "—"}

                    </TableCell>


                    {/* RETURN */}

                    <TableCell>

                      {!issue.returned_on && (

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onReturn(
                              issue.issue_uuid
                            )
                          }
                        >
                          Return
                        </Button>

                      )}

                    </TableCell>

                  </TableRow>
                );
              })}


            {!loading &&
              !issues.length && (

                <EmptyRow
                  colSpan={9}
                  text="No records."
                />

              )}


            {loading && (

              <EmptyRow
                colSpan={9}
                text="Loading issues…"
              />

            )}

          </TableBody>

        </Table>

      </CardContent>

    </Card>
  );
}


/* =========================================================
   EMPTY ROW
========================================================= */

function EmptyRow({
  colSpan,
  text,
}) {

  return (
    <TableRow>

      <TableCell
        colSpan={colSpan}
        className="
          text-center
          text-sm
          text-muted-foreground
          py-8
        "
      >
        {text}
      </TableCell>

    </TableRow>
  );
}


/* =========================================================
   ADD BOOK DIALOG
========================================================= */

function AddBookDialog({
  open,
  onOpenChange,
  onSaved,
}) {

  const empty = {
    isbn: "",
    title: "",
    author: "",
    category: "Fiction",
    copies: 1,
  };


  const [form, setForm] =
    useState(empty);


  const [saving, setSaving] =
    useState(false);


  /* =======================================================
     SUBMIT
  ======================================================= */

  const submit = async () => {

    if (!form.isbn.trim()) {

      toast.error(
        "ISBN is required"
      );

      return;
    }


    if (!form.title.trim()) {

      toast.error(
        "Title is required"
      );

      return;
    }


    if (!form.author.trim()) {

      toast.error(
        "Author is required"
      );

      return;
    }


    const copies =
      Number(form.copies);


    if (
      !Number.isInteger(copies) ||
      copies < 1
    ) {

      toast.error(
        "Copies must be at least 1"
      );

      return;
    }


    setSaving(true);


    try {

      const response =
        await addLibraryBook({
          isbn:
            form.isbn.trim(),

          title:
            form.title.trim(),

          author:
            form.author.trim(),

          category:
            form.category.trim(),

          copies,
        });


      toast.success(
        response?.data?.message ||
        "Book added successfully"
      );


      onOpenChange(false);

      setForm(empty);

      await onSaved();

    } catch (error) {

      toast.error(
        errorOf(
          error,
          "Failed to add book"
        )
      );

    } finally {

      setSaving(false);

    }

  };


  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            Add Book
          </DialogTitle>

          <DialogDescription>
            Add a title to the institute catalog.
          </DialogDescription>

        </DialogHeader>


        <div
          className="
            grid
            grid-cols-2
            gap-3
            py-2
          "
        >

          {/* ISBN */}

          <div>

            <Label className="text-xs">
              ISBN
            </Label>

            <Input
              value={form.isbn}
              onChange={(event) =>
                setForm({
                  ...form,
                  isbn:
                    event.target.value,
                })
              }
              placeholder="ISBN"
            />

          </div>


          {/* TITLE */}

          <div>

            <Label className="text-xs">
              Title
            </Label>

            <Input
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              placeholder="Book title"
            />

          </div>


          {/* AUTHOR */}

          <div>

            <Label className="text-xs">
              Author
            </Label>

            <Input
              value={form.author}
              onChange={(event) =>
                setForm({
                  ...form,
                  author:
                    event.target.value,
                })
              }
              placeholder="Author"
            />

          </div>


          {/* CATEGORY */}

          <div>

            <Label className="text-xs">
              Category
            </Label>

            <Input
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value,
                })
              }
              placeholder="Category"
            />

          </div>


          {/* COPIES */}

          <div>

            <Label className="text-xs">
              Copies
            </Label>

            <Input
              type="number"
              min="1"
              value={form.copies}
              onChange={(event) =>
                setForm({
                  ...form,
                  copies:
                    event.target.value,
                })
              }
            />

          </div>

        </div>


        <DialogFooter>

          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>


          <Button
            disabled={saving}
            onClick={submit}
          >
            {saving
              ? "Adding…"
              : "Add Book"}
          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}


/* =========================================================
   ISSUE BOOK DIALOG
========================================================= */

function IssueDialog({
  open,
  books,
  sessionYear,
  onOpenChange,
  onSaved,
}) {

  /* =======================================================
     STATE
  ======================================================= */

  const [
    bookUuid,
    setBookUuid,
  ] = useState("");


  const [
    studentUuid,
    setStudentUuid,
  ] = useState("");


  const [
    studentQuery,
    setStudentQuery,
  ] = useState("");


  const [
    students,
    setStudents,
  ] = useState([]);


  const [
    issuedOn,
    setIssuedOn,
  ] = useState(today());


  const [
    dueOn,
    setDueOn,
  ] = useState(
    addDays(today(), 14)
  );


  const [
    lateFee,
    setLateFee,
  ] = useState(5);


  const [
    saving,
    setSaving,
  ] = useState(false);


  /* =======================================================
     AVAILABLE BOOKS
  ======================================================= */

  const availableBooks =
    books.filter((book) => {

      const available =
        Number(
          book.available_copies ??
          book.available ??
          0
        );

      return available > 0;

    });


  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

  useEffect(() => {

    if (!open) {
      return undefined;
    }


    const timer =
      setTimeout(
        async () => {

          try {

            const response =
              await getAllStudents(
                sessionYear
              );


            const results =
              Array.isArray(
                response?.data
              )
                ? response.data
                : dataOf(
                    response,
                    []
                  );


            const search =
              studentQuery
                .trim()
                .toLowerCase();


            const filtered =
              results.filter(
                (student) => {

                  if (!search) {
                    return true;
                  }


                  return [
                    student.full_name,
                    student.student_no,
                    student.admission_no,
                    student.admission_number,
                    student.class_name,
                    student.section_name,
                    student.class,
                    student.section,
                  ].some(
                    (value) =>
                      String(
                        value || ""
                      )
                        .toLowerCase()
                        .includes(
                          search
                        )
                  );

                }
              );


            setStudents(
              filtered
            );

          } catch (error) {

            toast.error(
              errorOf(
                error,
                "Failed to search students"
              )
            );

          }

        },
        300
      );


    return () =>
      clearTimeout(timer);

  }, [
    open,
    sessionYear,
    studentQuery,
  ]);


  /* =======================================================
     RESET DIALOG
  ======================================================= */

  const handleOpenChange = (
    nextOpen
  ) => {

    onOpenChange(
      nextOpen
    );


    if (nextOpen) {
      return;
    }


    setBookUuid("");
    setStudentUuid("");
    setStudentQuery("");
    setStudents([]);

    setIssuedOn(
      today()
    );

    setDueOn(
      addDays(
        today(),
        14
      )
    );

    setLateFee(5);

  };


  /* =======================================================
     SELECT STUDENT
  ======================================================= */

  const chooseStudent = (
    student
  ) => {

    setStudentUuid(
      student.student_uuid
    );


    setStudentQuery(
      student.full_name ||
      student.student_no ||
      ""
    );

  };


  /* =======================================================
     ISSUE BOOK
  ======================================================= */

  const submit = async () => {

    const selectedBookUuid =
      bookUuid ||
      availableBooks[0]
        ?.book_uuid;


    if (!selectedBookUuid) {

      toast.error(
        "Select a book"
      );

      return;
    }


    if (!studentUuid) {

      toast.error(
        "Select a student"
      );

      return;
    }


    if (!issuedOn) {

      toast.error(
        "Select issue date"
      );

      return;
    }


    if (!dueOn) {

      toast.error(
        "Select due date"
      );

      return;
    }


    if (dueOn < issuedOn) {

      toast.error(
        "Due date cannot be before issue date"
      );

      return;
    }


    const fee =
      Number(lateFee);


    if (
      Number.isNaN(fee) ||
      fee < 0
    ) {

      toast.error(
        "Invalid late fee"
      );

      return;
    }


    setSaving(true);


    try {

      /*
       * IMPORTANT:
       * Send session_year to backend.
       */

      const response =
        await issueLibraryBook({

          book_uuid:
            selectedBookUuid,

          student_uuid:
            studentUuid,

          issued_on:
            issuedOn,

          due_on:
            dueOn,

          late_fee_per_day:
            fee,

          session_year:
            sessionYear || null,

        });


      toast.success(
        response?.data?.message ||
        "Book issued successfully"
      );


      onOpenChange(false);

      await onSaved();

    } catch (error) {

      toast.error(
        errorOf(
          error,
          "Failed to issue book"
        )
      );

    } finally {

      setSaving(false);

    }

  };


  /* =======================================================
     SELECTED STUDENT
  ======================================================= */

  const selectedStudent =
    students.find(
      (student) =>
        student.student_uuid ===
        studentUuid
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >

      <DialogContent
        className="max-w-lg"
      >

        <DialogHeader>

          <DialogTitle>
            Issue Book to Student
          </DialogTitle>

          <DialogDescription>
            Set the due date and per-day late fee.
          </DialogDescription>

        </DialogHeader>


        <div
          className="
            space-y-3
            py-2
          "
        >

          {/* =============================================
              BOOK
          ============================================= */}

          <div>

            <Label className="text-xs">
              Book
            </Label>


            <Select
              value={
                bookUuid ||
                availableBooks[0]
                  ?.book_uuid ||
                ""
              }
              onValueChange={
                setBookUuid
              }
            >

              <SelectTrigger>

                <SelectValue
                  placeholder={
                    availableBooks.length
                      ? "Select a book"
                      : "No books available"
                  }
                />

              </SelectTrigger>


              <SelectContent>

                {availableBooks.map(
                  (book) => {

                    const available =
                      Number(
                        book.available_copies ??
                        book.available ??
                        0
                      );


                    return (
                      <SelectItem
                        key={
                          book.book_uuid
                        }
                        value={
                          book.book_uuid
                        }
                      >

                        {book.title}

                        {" ("}

                        {available}

                        {" left)"}

                      </SelectItem>
                    );

                  }
                )}

              </SelectContent>

            </Select>

          </div>


          {/* =============================================
              STUDENT
          ============================================= */}

          <div className="relative">

            <Label className="text-xs">
              Search Student
            </Label>


            <Input
              value={
                studentQuery
              }
              onChange={(event) => {

                setStudentQuery(
                  event.target.value
                );

                setStudentUuid("");

              }}
              placeholder="Name or admission number"
            />


            {/* SEARCH RESULTS */}

            {studentQuery &&
              !studentUuid && (

                <div
                  className="
                    absolute
                    z-50
                    mt-1
                    max-h-52
                    w-full
                    overflow-y-auto
                    rounded-md
                    border
                    bg-popover
                    p-1
                    shadow-md
                  "
                >

                  {students.map(
                    (student) => (

                      <button
                        type="button"
                        key={
                          student.student_uuid
                        }
                        className="
                          w-full
                          rounded-sm
                          px-3
                          py-2
                          text-left
                          hover:bg-accent
                        "
                        onClick={() =>
                          chooseStudent(
                            student
                          )
                        }
                      >

                        <span
                          className="
                            block
                            text-sm
                            font-medium
                          "
                        >
                          {
                            student.full_name
                          }
                        </span>


                        <span
                          className="
                            block
                            text-xs
                            text-muted-foreground
                          "
                        >

                          Class:{" "}
                          {
                            student.class_name ||
                            student.class ||
                            "—"
                          }

                          {" · "}

                          Section:{" "}
                          {
                            student.section_name ||
                            student.section ||
                            "—"
                          }

                          {" · "}

                          Admission:{" "}
                          {
                            student.admission_number ||
                            student.admission_no ||
                            student.student_no ||
                            "—"
                          }

                        </span>

                      </button>

                    )
                  )}


                  {!students.length && (

                    <div
                      className="
                        px-3
                        py-3
                        text-sm
                        text-muted-foreground
                      "
                    >
                      No students found.
                    </div>

                  )}

                </div>

              )}


            {/* SELECTED STUDENT */}

            {studentUuid && (

              <div
                className="
                  mt-1
                  rounded-md
                  border
                  border-primary/30
                  bg-primary/5
                  px-3
                  py-2
                  text-xs
                  text-muted-foreground
                "
              >

                Selected:{" "}
                {
                  selectedStudent?.full_name ||
                  studentQuery
                }

              </div>

            )}

          </div>


          {/* =============================================
              DATES + FEE
          ============================================= */}

          <div
            className="
              grid
              grid-cols-3
              gap-3
            "
          >

            {/* ISSUED */}

            <div>

              <Label className="text-xs">
                Issued On
              </Label>

              <Input
                type="date"
                value={issuedOn}
                onChange={(event) =>
                  setIssuedOn(
                    event.target.value
                  )
                }
              />

            </div>


            {/* DUE */}

            <div>

              <Label className="text-xs">
                Due On
              </Label>

              <Input
                type="date"
                value={dueOn}
                onChange={(event) =>
                  setDueOn(
                    event.target.value
                  )
                }
              />

            </div>


            {/* FEE */}

            <div>

              <Label className="text-xs">
                Fee (₹/day)
              </Label>

              <Input
                type="number"
                min="0"
                value={lateFee}
                onChange={(event) =>
                  setLateFee(
                    event.target.value
                  )
                }
              />

            </div>

          </div>


          {/* =============================================
              AVAILABILITY INFO
          ============================================= */}

          {bookUuid && (

            <div
              className="
                rounded-md
                border
                bg-muted/30
                px-3
                py-2
                text-xs
              "
            >

              {(() => {

                const selectedBook =
                  books.find(
                    (book) =>
                      book.book_uuid ===
                      bookUuid
                  );


                if (!selectedBook) {
                  return null;
                }


                const available =
                  Number(
                    selectedBook.available_copies ??
                    selectedBook.available ??
                    0
                  );


                const issued =
                  Number(
                    selectedBook.issued_copies ??
                    0
                  );


                const total =
                  Number(
                    selectedBook.total_copies ??
                    selectedBook.copies ??
                    0
                  );


                return (
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span>
                      Total:{" "}
                      <strong>
                        {total}
                      </strong>
                    </span>

                    <span>
                      Issued:{" "}
                      <strong>
                        {issued}
                      </strong>
                    </span>

                    <span
                      className={
                        available > 0
                          ? "text-success font-semibold"
                          : "text-destructive font-semibold"
                      }
                    >
                      Available:{" "}
                      {available}
                    </span>

                  </div>
                );

              })()}

            </div>

          )}

        </div>


        <DialogFooter>

          <Button
            variant="outline"
            onClick={() =>
              handleOpenChange(
                false
              )
            }
          >
            Cancel
          </Button>


          <Button
            disabled={
              saving ||
              !availableBooks.length ||
              !studentUuid
            }
            onClick={submit}
          >

            {saving
              ? "Issuing…"
              : "Issue Book"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}