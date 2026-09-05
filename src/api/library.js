import api from "./axios";
import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

// ============================================================
// Common Headers
// Authorization is added by the shared Axios interceptor.
// ============================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  if (!instituteUUID) {
    throw new Error("Institute context not available yet");
  }

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ============================================================
// Active Session
// ============================================================

const getSessionYear = () => {
  const { sessionYear } = useSessionStore.getState();

  if (!sessionYear) {
    throw new Error("Session year not selected yet");
  }

  return sessionYear;
};

// ============================================================
// Library Dashboard
// GET - Session
// ============================================================

export const getLibraryDashboard = () => {
  return api.get("/library/dashboard", {
    headers: getHeaders(),
    params: {
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// List / Search Books
// GET - Session
// ============================================================

export const getLibraryBooks = (query = "") => {
  return api.get("/library/books", {
    headers: getHeaders(),
    params: {
      query,
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Add Book
// POST - JSON
// ============================================================

export const addLibraryBook = (data) => {
  return api.post("/library/books", data, {
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Search Students for Issue
// GET - Session
// ============================================================

export const searchLibraryStudents = (query = "") => {
  return api.get("/library/students", {
    headers: getHeaders(),
    params: {
      query,
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Issue Book
// POST - JSON
// ============================================================

export const issueLibraryBook = (data) => {
  return api.post(
    "/library/issues",
    {
      ...data,
      session_year: getSessionYear(),
    },
    {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
    },
  );
};

// ============================================================
// Active / Overdue / History Issues
// GET - Session
// ============================================================

export const getLibraryIssues = (status = "active") => {
  return api.get("/library/issues", {
    headers: getHeaders(),
    params: {
      status,
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Return Book
// POST - JSON
// ============================================================

export const returnLibraryBook = (issueUuid, returnedOn) => {
  return api.post(
    `/library/issues/${encodeURIComponent(issueUuid)}/return`,
    {
      returned_on: returnedOn,
    },
    {
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
    },
  );
};

// ============================================================
// Student Active / Overdue / History Issues
// GET - Session
// ============================================================

export const getMyLibraryIssues = (status = "active") => {
  return api.get("/library/my-issues", {
    headers: getHeaders(),
    params: {
      status,
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Default Export
// ============================================================

export default {
  getLibraryDashboard,
  getLibraryBooks,
  addLibraryBook,
  searchLibraryStudents,
  issueLibraryBook,
  getLibraryIssues,
  returnLibraryBook,
  getMyLibraryIssues,
};
