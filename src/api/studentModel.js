// // import api from "./axios";

// // import useAuthStore from "../store/authStore";
// // import useSessionStore from "../store/sessionStore";

// // // ============================================================
// // // Common Headers
// // // ============================================================

// // const getHeaders = () => {
// //   const { instituteUUID } = useAuthStore.getState();

// //   return {
// //     "X-Institute-UUID": instituteUUID,
// //   };
// // };

// // // ============================================================
// // // Active Session
// // // ============================================================

// // const getSessionYear = () => {
// //   return useSessionStore.getState().sessionYear;
// // };

// // // ============================================================
// // // Student Model API
// // // ============================================================

// // const studentModel = {
// //   // ==========================================================
// //   // Get logged-in student's dues
// //   //
// //   // Backend ownership logic must resolve the current user
// //   // to the linked student and return only that student's data.
// //   // ==========================================================

// //   getMyDues: async ({
// //     academicYear = null,
// //     paymentStatus = null,
// //   } = {}) => {
// //     const params = {};

// //     const year = academicYear || getSessionYear();

// //     if (year) {
// //       params.academic_year = year;
// //     }

// //     if (paymentStatus) {
// //       params.payment_status = paymentStatus;
// //     }

// //     const response = await api.get("/student-dues", {
// //       params,
// //       headers: getHeaders(),
// //     });

// //     return response.data;
// //   },

// //   // ==========================================================
// //   // Get one student's dues
// //   //
// //   // Use only when backend confirms ownership.
// //   // Student users should NOT be able to access another student.
// //   // ==========================================================

// //   getStudentDues: async (studentUuid, {
// //     academicYear = null,
// //     paymentStatus = null,
// //   } = {}) => {
// //     const params = {};

// //     const year = academicYear || getSessionYear();

// //     if (year) {
// //       params.academic_year = year;
// //     }

// //     if (paymentStatus) {
// //       params.payment_status = paymentStatus;
// //     }

// //     const response = await api.get(
// //       `/fee-assignments/student/${studentUuid}`,
// //       {
// //         params,
// //         headers: getHeaders(),
// //       }
// //     );

// //     return response.data;
// //   },

// //   // ==========================================================
// //   // Create Payment
// //   //
// //   // Change ONLY the URL here if your payment backend uses
// //   // another endpoint.
// //   // ==========================================================

// //   createPayment: async (payload) => {
// //     const response = await api.post(
// //       "/payments",
// //       payload,
// //       {
// //         headers: getHeaders(),
// //       }
// //     );

// //     return response.data;
// //   },

// //   // ==========================================================
// //   // Get Payment History
// //   // ==========================================================

// //   getPaymentHistory: async ({
// //     academicYear = null,
// //   } = {}) => {
// //     const params = {};

// //     const year = academicYear || getSessionYear();

// //     if (year) {
// //       params.academic_year = year;
// //     }

// //     const response = await api.get(
// //       "/payments",
// //       {
// //         params,
// //         headers: getHeaders(),
// //       }
// //     );

// //     return response.data;
// //   },

// //   // ==========================================================
// //   // Get Payment Receipt
// //   // ==========================================================

// //   getReceipt: async (paymentUuid) => {
// //     const response = await api.get(
// //       `/payments/${paymentUuid}/receipt`,
// //       {
// //         headers: getHeaders(),
// //         responseType: "blob",
// //       }
// //     );

// //     return response;
// //   },
// // };

// // export default studentModel;



// import api from "./axios";

// import useAuthStore from "../store/authStore";
// import useSessionStore from "../store/sessionStore";

// // ============================================================
// // Common Headers
// // ============================================================

// const getHeaders = () => {
//   const { instituteUUID } = useAuthStore.getState();

//   return {
//     "X-Institute-UUID": instituteUUID,
//   };
// };

// // ============================================================
// // Active Session
// // ============================================================

// const getSessionYear = () => {
//   return useSessionStore.getState().sessionYear;
// };

// // ============================================================
// // Student Model API
// // ============================================================

// const studentModel = {
//   // ==========================================================
//   // Get logged-in student's dues
//   //
//   // Backend ownership logic must resolve the current user
//   // to the linked student and return only that student's data.
//   // ==========================================================

//   getMyDues: async ({
//     academicYear = null,
//     paymentStatus = null,
//   } = {}) => {
//     const params = {};

//     const year = academicYear || getSessionYear();

//     if (year) {
//       params.academic_year = year;
//     }

//     if (paymentStatus) {
//       params.payment_status = paymentStatus;
//     }

//     const response = await api.get("/student-dues", {
//       params,
//       headers: getHeaders(),
//     });

//     return response.data;
//   },

//   // ==========================================================
//   // Get one student's dues
//   //
//   // Use only when backend confirms ownership.
//   // Student users should NOT be able to access another student.
//   // ==========================================================

//   getStudentDues: async (studentUuid, {
//     academicYear = null,
//     paymentStatus = null,
//   } = {}) => {
//     const params = {};

//     const year = academicYear || getSessionYear();

//     if (year) {
//       params.academic_year = year;
//     }

//     if (paymentStatus) {
//       params.payment_status = paymentStatus;
//     }

//     const response = await api.get(
//       `/fee-assignments/student/${studentUuid}`,
//       {
//         params,
//         headers: getHeaders(),
//       }
//     );

//     return response.data;
//   },

//   // ==========================================================
//   // Create Payment
//   //
//   // Change ONLY the URL here if your payment backend uses
//   // another endpoint.
//   // ==========================================================

//   createPayment: async (payload) => {
//     const response = await api.post(
//       "/payments",
//       payload,
//       {
//         headers: getHeaders(),
//       }
//     );

//     return response.data;
//   },

//   // ==========================================================
//   // Create Razorpay Order
//   //
//   // Called from Fees.jsx before opening the Razorpay checkout
//   // widget. Expected to return something like:
//   //
//   // {
//   //   order_id: "order_xxx",
//   //   amount_paise: 832500,
//   //   currency: "INR",
//   //   razorpay_key_id: "rzp_test_xxx"
//   // }
//   //
//   // ADJUST THE URL to match your actual backend route if it
//   // differs from "/payments/razorpay/create-order".
//   // ==========================================================

//   createRazorpayOrder: async ({
//     studentUuid,
//     assignmentUuid = null,
//     dueUuids = [],
//   } = {}) => {
//     const response = await api.post(
//       "/payments/razorpay/create-order",
//       {
//         student_uuid: studentUuid,
//         assignment_uuid: assignmentUuid,
//         due_uuids: dueUuids,
//       },
//       {
//         headers: getHeaders(),
//       }
//     );

//     return response.data;
//   },

//   // ==========================================================
//   // Verify Razorpay Payment
//   //
//   // Called from the Razorpay checkout success handler in
//   // Fees.jsx once the user completes payment on Razorpay's
//   // side. The backend should validate the signature and mark
//   // the relevant dues as paid.
//   //
//   // ADJUST THE URL to match your actual backend route if it
//   // differs from "/payments/razorpay/verify".
//   // ==========================================================

//   verifyRazorpayPayment: async ({
//     studentUuid,
//     assignmentUuid = null,
//     dueUuids = [],
//     razorpayOrderId,
//     razorpayPaymentId,
//     razorpaySignature,
//     remarks = null,
//   } = {}) => {
//     const response = await api.post(
//       "/payments/razorpay/verify",
//       {
//         student_uuid: studentUuid,
//         assignment_uuid: assignmentUuid,
//         due_uuids: dueUuids,
//         razorpay_order_id: razorpayOrderId,
//         razorpay_payment_id: razorpayPaymentId,
//         razorpay_signature: razorpaySignature,
//         remarks,
//       },
//       {
//         headers: getHeaders(),
//       }
//     );

//     return response.data;
//   },

//   // ==========================================================
//   // Get Payment History
//   // ==========================================================

//   getPaymentHistory: async ({
//     academicYear = null,
//   } = {}) => {
//     const params = {};

//     const year = academicYear || getSessionYear();

//     if (year) {
//       params.academic_year = year;
//     }

//     const response = await api.get(
//       "/payments",
//       {
//         params,
//         headers: getHeaders(),
//       }
//     );

//     return response.data;
//   },

//   // ==========================================================
//   // Get Payment Receipt
//   // ==========================================================

//   getReceipt: async (paymentUuid) => {
//     const response = await api.get(
//       `/payments/${paymentUuid}/receipt`,
//       {
//         headers: getHeaders(),
//         responseType: "blob",
//       }
//     );

//     return response;
//   },
// };

// export default studentModel;



import api from "./axios";

import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

// ============================================================
// Common Headers
// ============================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ============================================================
// Active Session
// ============================================================

const getSessionYear = () => {
  return useSessionStore.getState().sessionYear;
};

// ============================================================
// Student Model API
// ============================================================

const studentModel = {
  // ==========================================================
  // MY STUDENT PROFILE
  //
  // Backend:
  // GET /me/profile
  //
  // Backend ownership:
  //
  // current_user
  //      ↓
  // current_user.user_uuid
  //      ↓
  // Student.user_uuid
  //      ↓
  // ONLY logged-in student's profile
  // ==========================================================

  getMyProfile: async () => {
    const response = await api.get(
      "/students/me/profile",
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  },

  // ==========================================================
  // Get logged-in student's dues
  //
  // Backend ownership logic must resolve the current user
  // to the linked student and return only that student's data.
  // ==========================================================

  getMyDues: async ({
    academicYear = null,
    paymentStatus = null,
  } = {}) => {
    const params = {};

    const year = academicYear || getSessionYear();

    if (year) {
      params.academic_year = year;
    }

    if (paymentStatus) {
      params.payment_status = paymentStatus;
    }

    const response = await api.get("/student-dues", {
      params,
      headers: getHeaders(),
    });

    return response.data;
  },

  // ==========================================================
  // Get one student's dues
  //
  // Use only when backend confirms ownership.
  // Student users should NOT be able to access another student.
  // ==========================================================

  getStudentDues: async (
    studentUuid,
    {
      academicYear = null,
      paymentStatus = null,
    } = {}
  ) => {
    const params = {};

    const year = academicYear || getSessionYear();

    if (year) {
      params.academic_year = year;
    }

    if (paymentStatus) {
      params.payment_status = paymentStatus;
    }

    const response = await api.get(
      `/fee-assignments/student/${studentUuid}`,
      {
        params,
        headers: getHeaders(),
      }
    );

    return response.data;
  },

  // ==========================================================
  // Create Payment
  // ==========================================================

  createPayment: async (payload) => {
    const response = await api.post(
      "/payments",
      payload,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  },

  // ==========================================================
  // Create Razorpay Order
  // ==========================================================

  createRazorpayOrder: async ({
    studentUuid,
    assignmentUuid = null,
    dueUuids = [],
  } = {}) => {
    const response = await api.post(
      "/payments/razorpay/create-order",
      {
        student_uuid: studentUuid,
        assignment_uuid: assignmentUuid,
        due_uuids: dueUuids,
      },
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  },

  // ==========================================================
  // Verify Razorpay Payment
  // ==========================================================

  verifyRazorpayPayment: async ({
    studentUuid,
    assignmentUuid = null,
    dueUuids = [],
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    remarks = null,
  } = {}) => {
    const response = await api.post(
      "/payments/razorpay/verify",
      {
        student_uuid: studentUuid,
        assignment_uuid: assignmentUuid,
        due_uuids: dueUuids,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        remarks,
      },
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  },

  // ==========================================================
  // Get Payment History
  // ==========================================================

  getPaymentHistory: async ({
    academicYear = null,
  } = {}) => {
    const params = {};

    const year = academicYear || getSessionYear();

    if (year) {
      params.academic_year = year;
    }

    const response = await api.get(
      "/payments",
      {
        params,
        headers: getHeaders(),
      }
    );

    return response.data;
  },

  // ==========================================================
  // Get Payment Receipt
  // ==========================================================

  getReceipt: async (paymentUuid) => {
    const response = await api.get(
      `/payments/${paymentUuid}/receipt`,
      {
        headers: getHeaders(),
        responseType: "blob",
      }
    );

    return response;
  },

  getMyAssignments: async () => {
    const response = await api.get("/assignments", {
      params: { page: 1, page_size: 100 },
      headers: getHeaders(),
    });
    return response.data;
  },

  getMyAssignmentDetail: async (assignmentUuid) => {
    const response = await api.get(`/assignments/${assignmentUuid}/detail`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  submitAssignment: async (assignmentUuid, { file, comment = "" }) => {
    const formData = new FormData();
    formData.append("submission_file_1", file);
    if (comment.trim()) formData.append("comment", comment.trim());

    const response = await api.post(
      `/assignments/${assignmentUuid}/submit`,
      formData,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": undefined,
        },
      }
    );
    return response.data;
  },

  getAssignmentInquiries: async (assignmentUuid) => {
    const response = await api.get(`/assignments/${assignmentUuid}/inquiries`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  createAssignmentInquiry: async (assignmentUuid, question) => {
    const response = await api.post(
      `/assignments/${assignmentUuid}/inquiries`,
      { question: question.trim() },
      { headers: getHeaders() }
    );
    return response.data;
  },

  getMyAttendance: async ({ dateFrom = null, dateTo = null } = {}) => {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    const response = await api.get("/student-portal/attendance", {
      params,
      headers: getHeaders(),
    });
    return response.data;
  },

  getMyGatePasses: async () => {
    const response = await api.get("/student-portal/gate-passes", {
      headers: getHeaders(),
    });
    return response.data;
  },

  getPortalContent: async () => {
    const response = await api.get("/portal/content", {
      headers: getHeaders(),
    });
    return response.data;
  },

  getMyMaterials: async () => {
    const response = await api.get("/materials", { headers: getHeaders() });
    return response.data;
  },

  getMaterialDownloadUrl: async (materialUuid) => {
    const response = await api.get(`/materials/${materialUuid}/download`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getMyLessonPlans: async () => {
    const response = await api.get("/lesson-plans", { headers: getHeaders() });
    return response.data;
  },

  getLessonPlanDownloadUrl: async (lessonPlanUuid) => {
    const response = await api.get(`/lesson-plans/${lessonPlanUuid}/download`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

export default studentModel;
