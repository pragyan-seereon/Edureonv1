// import { useCallback, useEffect, useState } from "react";
// import { BookOpen, Search } from "lucide-react";
// import { toast } from "sonner";
// import { PageContainer, PageHeader } from "../../components/page-shell";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
// import { Badge } from "../../components/ui/badge";
// import { Input } from "../../components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
// import { getLibraryBooks, getMyLibraryIssues } from "../../api/library";
// import useSessionStore from "../../store/sessionStore";

// const dataOf = (response) => response?.data?.data ?? [];
// const errorOf = (error, fallback) => error?.response?.data?.message || error?.response?.data?.detail || fallback;

// export default function Library() {
//   const sessionYear = useSessionStore((state) => state.sessionYear);
//   const [books, setBooks] = useState([]);
//   const [issues, setIssues] = useState({ active: [], overdue: [], history: [] });
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(true);

//   const loadIssues = useCallback(async () => {
//     if (!sessionYear) return;
//     setLoading(true);
//     try {
//       const [active, overdue, history] = await Promise.all([getMyLibraryIssues("active"), getMyLibraryIssues("overdue"), getMyLibraryIssues("history")]);
//       setIssues({ active: dataOf(active), overdue: dataOf(overdue), history: dataOf(history) });
//     } catch (error) { toast.error(errorOf(error, "Failed to load your library records")); }
//     finally { setLoading(false); }
//   }, [sessionYear]);
//   const loadBooks = useCallback(async (search) => {
//     if (!sessionYear) return;
//     try { setBooks(dataOf(await getLibraryBooks(search))); }
//     catch (error) { toast.error(errorOf(error, "Failed to load book catalog")); }
//   }, [sessionYear]);
//   useEffect(() => { const timer = setTimeout(loadIssues, 0); return () => clearTimeout(timer); }, [loadIssues]);
//   useEffect(() => { const timer = setTimeout(() => loadBooks(query), 300); return () => clearTimeout(timer); }, [query, loadBooks]);

//   return <PageContainer>
//     <PageHeader eyebrow="Student Portal" title="Library" description="My issued books, catalog search, overdue items, and reading history." />
//     <Tabs defaultValue="my" className="space-y-4"><TabsList><TabsTrigger value="my">My Books</TabsTrigger><TabsTrigger value="overdue">Overdue</TabsTrigger><TabsTrigger value="catalog">Catalog</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
//       <TabsContent value="my"><IssueCards title="Currently Issued" issues={issues.active} loading={loading} /></TabsContent>
//       <TabsContent value="overdue"><IssueCards title="Overdue Books" issues={issues.overdue} loading={loading} /></TabsContent>
//       <TabsContent value="catalog"><Card className="border-border/60"><CardHeader className="pb-2 flex-row items-center justify-between space-y-0"><div><CardTitle className="font-display text-base">Search Catalog</CardTitle><CardDescription>{books.length} titles found</CardDescription></div><div className="relative w-64"><Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ISBN, title or author…" className="pl-8 h-9" /></div></CardHeader><CardContent className="p-0"><BooksTable books={books} /></CardContent></Card></TabsContent>
//       <TabsContent value="history"><IssueCards title="Reading History" issues={issues.history} loading={loading} /></TabsContent>
//     </Tabs>
//   </PageContainer>;
// }

// function IssueCards({ title, issues, loading }) {
//   return <Card className="border-border/60"><CardHeader className="pb-2"><CardTitle className="font-display text-base">{title}</CardTitle><CardDescription>{issues.length} books</CardDescription></CardHeader><CardContent className="space-y-2">
//     {issues.map((issue) => <div key={issue.issue_uuid} className="flex items-center gap-3 p-3 border rounded-md"><div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div><div className="flex-1 min-w-0"><div className="text-sm font-medium">{issue.book_title}</div><div className="text-[11px] text-muted-foreground">{issue.issue_number} · Issued {issue.issued_on} · Due {issue.due_on}{issue.returned_on ? ` · Returned ${issue.returned_on}` : ""}</div></div>{issue.fine_amount > 0 ? <Badge variant="destructive">Fine ₹{issue.fine_amount}</Badge> : <Badge variant="outline" className={issue.is_overdue ? "text-destructive" : "bg-success/10 text-success border-success/20"}>{issue.is_overdue ? "Overdue" : issue.returned_on ? "Returned" : "Active"}</Badge>}</div>)}
//     {!issues.length && <div className="text-center text-sm text-muted-foreground py-8">{loading ? "Loading…" : "No records."}</div>}
//   </CardContent></Card>;
// }

// function BooksTable({ books }) {
//   return <Table><TableHeader><TableRow><TableHead>ISBN</TableHead><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Category</TableHead><TableHead>Copies</TableHead><TableHead className="text-right">Available</TableHead></TableRow></TableHeader><TableBody>{books.map((book) => <TableRow key={book.book_uuid}><TableCell className="font-mono text-xs">{book.isbn}</TableCell><TableCell className="text-sm font-medium">{book.title}</TableCell><TableCell className="text-xs text-muted-foreground">{book.author}</TableCell><TableCell><Badge variant="secondary" className="text-[10px]">{book.category}</Badge></TableCell><TableCell>{book.copies}</TableCell><TableCell className="text-right"><span className={book.available > 0 ? "text-success font-semibold" : "text-destructive"}>{book.available}</span></TableCell></TableRow>)}{!books.length && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No books found.</TableCell></TableRow>}</TableBody></Table>;
// }

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { toast } from "sonner";

import {
  PageContainer,
  PageHeader,
} from "../../components/page-shell";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  getLibraryBooks,
  getMyLibraryIssues,
} from "../../api/library";

import useSessionStore from "../../store/sessionStore";


/* =========================================================
   HELPERS
========================================================= */

const dataOf = (response) => {
  return response?.data?.data ?? [];
};


const errorOf = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    fallback
  );
};


/* =========================================================
   MAIN LIBRARY PAGE
========================================================= */

export default function Library() {

  const sessionYear = useSessionStore(
    (state) => state.sessionYear
  );

  const [books, setBooks] = useState([]);

  const [issues, setIssues] = useState({
    active: [],
    overdue: [],
    history: [],
  });

  const [query, setQuery] = useState("");

  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);


  /* =======================================================
     LOAD STUDENT ISSUES
  ======================================================= */

  const loadIssues = useCallback(async () => {

    if (!sessionYear) {
      setLoadingIssues(false);
      return;
    }

    setLoadingIssues(true);

    try {

      const [
        active,
        overdue,
        history,
      ] = await Promise.all([
        getMyLibraryIssues("active"),
        getMyLibraryIssues("overdue"),
        getMyLibraryIssues("history"),
      ]);

      setIssues({
        active: dataOf(active),
        overdue: dataOf(overdue),
        history: dataOf(history),
      });

    } catch (error) {

      toast.error(
        errorOf(
          error,
          "Failed to load your library records"
        )
      );

    } finally {

      setLoadingIssues(false);

    }

  }, [sessionYear]);


  /* =======================================================
     LOAD BOOK CATALOG
  ======================================================= */

  const loadBooks = useCallback(async (search) => {

    if (!sessionYear) {
      setLoadingBooks(false);
      return;
    }

    setLoadingBooks(true);

    try {

      const response = await getLibraryBooks(search);

      setBooks(dataOf(response));

    } catch (error) {

      toast.error(
        errorOf(
          error,
          "Failed to load book catalog"
        )
      );

    } finally {

      setLoadingBooks(false);

    }

  }, [sessionYear]);


  /* =======================================================
     INITIAL ISSUE LOAD
  ======================================================= */

  useEffect(() => {

    const timer = setTimeout(() => {
      loadIssues();
    }, 0);

    return () => {
      clearTimeout(timer);
    };

  }, [loadIssues]);


  /* =======================================================
     SEARCH BOOKS
  ======================================================= */

  useEffect(() => {

    const timer = setTimeout(() => {
      loadBooks(query);
    }, 300);

    return () => {
      clearTimeout(timer);
    };

  }, [query, loadBooks]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PageContainer>

      <PageHeader
        eyebrow="Student Portal"
        title="Library"
        description="My issued books, catalog search, overdue items, and reading history."
      />

      <Tabs
        defaultValue="my"
        className="space-y-4"
      >

        <TabsList>

          <TabsTrigger value="my">
            My Books
          </TabsTrigger>

          <TabsTrigger value="overdue">
            Overdue
          </TabsTrigger>

          <TabsTrigger value="catalog">
            Catalog
          </TabsTrigger>

          <TabsTrigger value="history">
            History
          </TabsTrigger>

        </TabsList>


        {/* =================================================
            MY BOOKS
        ================================================= */}

        <TabsContent value="my">

          <IssueCards
            title="Currently Issued"
            issues={issues.active}
            loading={loadingIssues}
          />

        </TabsContent>


        {/* =================================================
            OVERDUE
        ================================================= */}

        <TabsContent value="overdue">

          <IssueCards
            title="Overdue Books"
            issues={issues.overdue}
            loading={loadingIssues}
          />

        </TabsContent>


        {/* =================================================
            CATALOG
        ================================================= */}

        <TabsContent value="catalog">

          <Card className="border-border/60">

            <CardHeader
              className="
                pb-2
                flex-row
                items-center
                justify-between
                space-y-0
              "
            >

              <div>

                <CardTitle className="font-display text-base">
                  Search Catalog
                </CardTitle>

                <CardDescription>
                  {books.length} titles found
                </CardDescription>

              </div>


              <div className="relative w-64">

                <Search
                  className="
                    h-4
                    w-4
                    absolute
                    left-2.5
                    top-2.5
                    text-muted-foreground
                  "
                />

                <Input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="ISBN, title or author…"
                  className="pl-8 h-9"
                />

              </div>

            </CardHeader>


            <CardContent className="p-0">

              <BooksTable
                books={books}
                loading={loadingBooks}
              />

            </CardContent>

          </Card>

        </TabsContent>


        {/* =================================================
            HISTORY
        ================================================= */}

        <TabsContent value="history">

          <IssueCards
            title="Reading History"
            issues={issues.history}
            loading={loadingIssues}
          />

        </TabsContent>

      </Tabs>

    </PageContainer>
  );
}


/* =========================================================
   ISSUE CARDS
========================================================= */

function IssueCards({
  title,
  issues,
  loading,
}) {

  return (
    <Card className="border-border/60">

      <CardHeader className="pb-2">

        <CardTitle className="font-display text-base">
          {title}
        </CardTitle>

        <CardDescription>
          {issues.length} books
        </CardDescription>

      </CardHeader>


      <CardContent className="space-y-2">

        {issues.map((issue) => (

          <div
            key={issue.issue_uuid}
            className="
              flex
              items-center
              gap-3
              p-3
              border
              rounded-md
            "
          >

            <div
              className="
                h-10
                w-10
                rounded-md
                flex
                items-center
                justify-center
                bg-primary/10
                text-primary
              "
            >

              <BookOpen className="h-5 w-5" />

            </div>


            <div className="flex-1 min-w-0">

              <div className="text-sm font-medium">
                {issue.book_title}
              </div>

              <div className="text-[11px] text-muted-foreground">

                {issue.issue_number}

                {" · "}

                Issued {issue.issued_on}

                {" · "}

                Due {issue.due_on}

                {issue.returned_on &&
                  ` · Returned ${issue.returned_on}`}

              </div>

            </div>


            {Number(issue.fine_amount || 0) > 0 ? (

              <Badge variant="destructive">
                Fine ₹{issue.fine_amount}
              </Badge>

            ) : (

              <Badge
                variant="outline"
                className={
                  issue.is_overdue
                    ? "text-destructive"
                    : issue.returned_on
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-success/10 text-success border-success/20"
                }
              >

                {issue.is_overdue
                  ? "Overdue"
                  : issue.returned_on
                    ? "Returned"
                    : "Active"}

              </Badge>

            )}

          </div>

        ))}


        {!issues.length && (

          <div
            className="
              text-center
              text-sm
              text-muted-foreground
              py-8
            "
          >

            {loading
              ? "Loading…"
              : "No records."}

          </div>

        )}

      </CardContent>

    </Card>
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

      {/* ===================================================
          HEADER
      =================================================== */}

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

          <TableHead className="text-right">
            Available
          </TableHead>

        </TableRow>

      </TableHeader>


      {/* ===================================================
          BODY
      =================================================== */}

      <TableBody>

        {loading && (

          <TableRow>

            <TableCell
              colSpan={7}
              className="
                text-center
                text-sm
                text-muted-foreground
                py-8
              "
            >
              Loading books…
            </TableCell>

          </TableRow>

        )}


        {!loading && books.map((book) => {

          /*
           * Backend now returns:
           *
           * copies
           * total_copies
           * issued_copies
           * available
           * available_copies
           */

          const totalCopies = Number(
            book.total_copies ??
            book.copies ??
            0
          );

          const issuedCopies = Number(
            book.issued_copies ??
            0
          );

          const availableCopies = Number(
            book.available_copies ??
            book.available ??
            Math.max(
              0,
              totalCopies - issuedCopies
            )
          );


          return (
            <TableRow
              key={book.book_uuid}
            >

              {/* ISBN */}

              <TableCell className="font-mono text-xs">
                {book.isbn}
              </TableCell>


              {/* TITLE */}

              <TableCell className="text-sm font-medium">
                {book.title}
              </TableCell>


              {/* AUTHOR */}

              <TableCell className="text-xs text-muted-foreground">
                {book.author || "-"}
              </TableCell>


              {/* CATEGORY */}

              <TableCell>

                <Badge
                  variant="secondary"
                  className="text-[10px]"
                >
                  {book.category}
                </Badge>

              </TableCell>


              {/* TOTAL COPIES */}

              <TableCell>
                {totalCopies}
              </TableCell>


              {/* ISSUED */}

              <TableCell>
                {issuedCopies}
              </TableCell>


              {/* AVAILABLE */}

              <TableCell className="text-right">

                <span
                  className={
                    availableCopies > 0
                      ? "text-success font-semibold"
                      : "text-destructive font-semibold"
                  }
                >
                  {availableCopies}
                </span>

              </TableCell>

            </TableRow>
          );
        })}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && !books.length && (

          <TableRow>

            <TableCell
              colSpan={7}
              className="
                text-center
                text-sm
                text-muted-foreground
                py-8
              "
            >
              No books found.
            </TableCell>

          </TableRow>

        )}

      </TableBody>

    </Table>
  );
}