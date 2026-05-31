const env = require("../config/env");

const ok = (message, data = {}) => ({
  success: true,
  message,
  data
});

const auth = [{ bearerAuth: [] }];

const jsonBody = (example) => ({
  required: true,
  content: {
    "application/json": {
      example
    }
  }
});

const multipartBody = (properties) => ({
  required: true,
  content: {
    "multipart/form-data": {
      schema: {
        type: "object",
        properties: {
          ...properties,
          images: {
            type: "array",
            items: { type: "string", format: "binary" }
          }
        }
      }
    }
  }
});

const successResponse = (message, data = {}) => ({
  description: message,
  content: {
    "application/json": {
      example: ok(message, data)
    }
  }
});

const crudPaths = (tag, basePath, sampleCreate, roles) => ({
  [basePath]: {
    get: {
      tags: [tag],
      summary: `List ${tag.toLowerCase()}`,
      responses: { 200: successResponse(`${tag} fetched successfully`, []) }
    },
    post: {
      tags: [tag],
      summary: `Create ${tag.toLowerCase()}`,
      description: `Requires roles: ${roles}`,
      security: auth,
      requestBody: jsonBody(sampleCreate),
      responses: { 201: successResponse(`${tag} created successfully`, sampleCreate) }
    }
  },
  [`${basePath}/{id}`]: {
    get: {
      tags: [tag],
      summary: `Get ${tag.toLowerCase()} by id`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: successResponse(`${tag} fetched successfully`, sampleCreate) }
    },
    patch: {
      tags: [tag],
      summary: `Update ${tag.toLowerCase()}`,
      description: `Requires roles: ${roles}`,
      security: auth,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: jsonBody(sampleCreate),
      responses: { 200: successResponse(`${tag} updated successfully`, sampleCreate) }
    },
    delete: {
      tags: [tag],
      summary: `Delete ${tag.toLowerCase()}`,
      description: `Requires roles: ${roles}`,
      security: auth,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: successResponse(`${tag} deleted successfully`) }
    }
  }
});

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Rangstone Tourism Backend API",
    version: "1.0.0",
    description:
      "Production-ready Express, PostgreSQL, Prisma, JWT, Firebase Storage, Razorpay, RBAC, and Swagger API for Rangstone Tourism."
  },
  servers: [
    {
      url: env.apiBaseUrl,
      description: "Configured API server"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Packages" },
    { name: "Bookings" },
    { name: "Captains" },
    { name: "Agents" },
    { name: "Hotels" },
    { name: "Vehicles" },
    { name: "Payments" },
    { name: "Reviews" },
    { name: "Dashboard" },
    { name: "Agent Admin" },
    { name: "Agent Portal" }
  ],
  paths: {
    "/api/auth/send-otp": {
      post: {
        tags: ["Auth"],
        summary: "Send OTP",
        requestBody: jsonBody({ phone: "9876543210" }),
        responses: { 200: successResponse("OTP sent successfully", { isExistingUser: false, profileRequired: true }) }
      }
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP and issue JWT tokens",
        requestBody: jsonBody({ phone: "9876543210", otp: "123456" }),
        responses: {
          200: successResponse("OTP verified successfully", {
            accessToken: "JWT_ACCESS_TOKEN",
            refreshToken: "JWT_REFRESH_TOKEN",
            profileRequired: true,
            user: { id: "user_id", role: "CUSTOMER" }
          })
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register or complete profile",
        requestBody: jsonBody({
          phoneNumber: "9876543210",
          firstName: "Rangstone",
          lastName: "Customer",
          email: "customer@example.com",
          password: "secret123",
          role: "CUSTOMER"
        }),
        responses: { 201: successResponse("User registered successfully") }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Password login",
        requestBody: jsonBody({ phoneNumber: "9876543210", password: "secret123" }),
        responses: { 200: successResponse("Login successful") }
      }
    },
    "/api/auth/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token",
        requestBody: jsonBody({ refreshToken: "JWT_REFRESH_TOKEN" }),
        responses: { 200: successResponse("Token refreshed successfully") }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke refresh token",
        requestBody: jsonBody({ refreshToken: "JWT_REFRESH_TOKEN" }),
        responses: { 200: successResponse("Logout successful") }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: auth,
        responses: { 200: successResponse("Profile fetched successfully") }
      }
    },
    "/api/auth/check-user": {
      post: {
        tags: ["Auth"],
        summary: "Check whether user is new or existing",
        requestBody: jsonBody({ phone: "9876543210" }),
        responses: { 200: successResponse("User status fetched successfully", { isExistingUser: true, profileRequired: false }) }
      }
    },
    ...crudPaths(
      "Users",
      "/api/users",
      { phoneNumber: "9876543210", role: "CUSTOMER", firstName: "User" },
      "SUPER_ADMIN, ADMIN"
    ),
    "/api/users/{id}/block": {
      patch: {
        tags: ["Users"],
        summary: "Block or unblock user",
        security: auth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: jsonBody({ isBlocked: true }),
        responses: { 200: successResponse("User block status updated successfully") }
      }
    },
    "/api/users/activity-logs": {
      get: {
        tags: ["Users"],
        summary: "Activity logs",
        security: auth,
        responses: { 200: successResponse("Activity logs fetched successfully", []) }
      }
    },
    "/api/packages": {
      get: { tags: ["Packages"], summary: "List packages", responses: { 200: successResponse("Packages fetched successfully", []) } },
      post: {
        tags: ["Packages"],
        summary: "Create package with Firebase Storage images",
        description: "Requires roles: SUPER_ADMIN, ADMIN, TRAVEL_VENDOR",
        security: auth,
        requestBody: multipartBody({
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          location: { type: "string" },
          price: { type: "number" },
          offerPrice: { type: "number" },
          duration: { type: "string" },
          seats: { type: "integer" },
          pickupPoints: { type: "array", items: { type: "string" } },
          tripDates: { type: "array", items: { type: "object" } }
        }),
        responses: { 201: successResponse("Package created successfully") }
      }
    },
    "/api/packages/{id}": {
      get: { tags: ["Packages"], summary: "Get package", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Package fetched successfully") } },
      patch: { tags: ["Packages"], summary: "Update package", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: jsonBody({ title: "Updated package" }), responses: { 200: successResponse("Package updated successfully") } },
      delete: { tags: ["Packages"], summary: "Delete package", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Package deleted successfully") } }
    },
    "/api/packages/assign-captain": {
      post: { tags: ["Packages"], summary: "Assign captain to trip date", security: auth, requestBody: jsonBody({ packageDateId: "date_id", captainId: "captain_id" }), responses: { 200: successResponse("Captain assigned successfully") } }
    },
    "/api/bookings/packages": {
      post: { tags: ["Bookings"], summary: "Customer or agent package booking", security: auth, requestBody: jsonBody({ packageDateId: "date_id", seatsBooked: 2, referralCode: "AGENT1234" }), responses: { 201: successResponse("Package booking created successfully") } }
    },
    "/api/bookings/hotels": {
      post: { tags: ["Bookings"], summary: "Customer hotel booking", security: auth, requestBody: jsonBody({ roomId: "room_id", checkInDate: "2026-06-10", checkOutDate: "2026-06-12" }), responses: { 201: successResponse("Hotel booking created successfully") } }
    },
    "/api/bookings/vehicles": {
      post: { tags: ["Bookings"], summary: "Customer vehicle booking", security: auth, requestBody: jsonBody({ vehicleId: "vehicle_id", pickupLocation: "Airport", dropLocation: "Hotel", startDateTime: "2026-06-10T10:00:00.000Z", endDateTime: "2026-06-11T10:00:00.000Z", rentalType: "DAILY" }), responses: { 201: successResponse("Vehicle booking created successfully") } }
    },
    "/api/bookings/history": {
      get: { tags: ["Bookings"], summary: "Booking history", security: auth, responses: { 200: successResponse("Booking history fetched successfully") } }
    },
    "/api/captains/assigned-trips": {
      get: { tags: ["Captains"], summary: "Captain assigned trips", security: auth, responses: { 200: successResponse("Assigned trips fetched successfully") } }
    },
    "/api/captains/verify-ticket": {
      post: { tags: ["Captains"], summary: "Verify or mark boarding status", security: auth, requestBody: jsonBody({ bookingCode: "PKG-123", status: "BOARDED" }), responses: { 200: successResponse("Ticket verification updated successfully") } }
    },
    ...crudPaths("Hotels", "/api/hotels", { name: "Sea View", description: "Beach hotel", location: "Goa" }, "SUPER_ADMIN, ADMIN, HOTEL_VENDOR"),
    ...crudPaths("Vehicles", "/api/vehicles", { type: "CAR", brand: "Toyota", model: "Innova", registrationNumber: "TN01AB1234" }, "SUPER_ADMIN, ADMIN, VEHICLE_VENDOR"),
    "/api/agents/me": {
      get: { tags: ["Agents"], summary: "Agent profile", security: auth, responses: { 200: successResponse("Agent profile fetched successfully") } }
    },
    "/api/agents/commissions": {
      get: { tags: ["Agents"], summary: "Commission history", security: auth, responses: { 200: successResponse("Commission history fetched successfully") } }
    },
    "/api/agents/payouts/calculate": {
      post: { tags: ["Agents"], summary: "Calculate monthly payout", security: auth, requestBody: jsonBody({ period: "2026-05" }), responses: { 201: successResponse("Monthly payout calculated successfully") } }
    },
    "/api/payments/razorpay/order": {
      post: { tags: ["Payments"], summary: "Create Razorpay order", security: auth, requestBody: jsonBody({ bookingType: "PACKAGE", bookingId: "booking_id" }), responses: { 201: successResponse("Razorpay order created successfully") } }
    },
    "/api/payments/razorpay/verify": {
      post: { tags: ["Payments"], summary: "Verify Razorpay payment", security: auth, requestBody: jsonBody({ razorpayOrderId: "order_id", razorpayPaymentId: "pay_id", razorpaySignature: "signature" }), responses: { 200: successResponse("Payment verified successfully") } }
    },
    "/api/reviews": {
      get: { tags: ["Reviews"], summary: "List visible reviews", responses: { 200: successResponse("Reviews fetched successfully", []) } },
      post: { tags: ["Reviews"], summary: "Create review", security: auth, requestBody: jsonBody({ targetType: "PACKAGE", targetId: "package_id", rating: 5, comment: "Great trip" }), responses: { 201: successResponse("Review created successfully") } }
    },
    "/api/dashboard/overview": {
      get: { tags: ["Dashboard"], summary: "Admin metrics", security: auth, responses: { 200: successResponse("Dashboard overview fetched successfully") } }
    },
    "/api/dashboard/revenue-graph": {
      get: { tags: ["Dashboard"], summary: "Daily revenue graph data", security: auth, responses: { 200: successResponse("Revenue graph fetched successfully", []) } }
    },
    "/api/admin/dashboard/agents": {
      get: { tags: ["Agent Admin"], summary: "Agent admin dashboard metrics", security: auth, responses: { 200: successResponse("Agent admin dashboard metrics fetched successfully") } }
    },
    "/api/admin/agents": {
      get: { tags: ["Agent Admin"], summary: "List all agents", security: auth, responses: { 200: successResponse("Agents fetched successfully", []) } }
    },
    "/api/admin/agents/{id}": {
      get: { tags: ["Agent Admin"], summary: "Get agent details", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Agent fetched successfully") } }
    },
    "/api/admin/agents/{id}/permissions": {
      get: { tags: ["Agent Admin"], summary: "Get agent booking permissions", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Agent permissions fetched successfully") } },
      put: { tags: ["Agent Admin"], summary: "Update agent booking permissions", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: jsonBody({ canBookPackages: true, canBookHotels: true, canBookCars: false, canBookBikes: false }), responses: { 200: successResponse("Agent permissions updated successfully") } }
    },
    "/api/admin/agents/{id}/commission-rules": {
      get: { tags: ["Agent Admin"], summary: "Get agent commission rules", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Agent commission rules fetched successfully") } },
      put: { tags: ["Agent Admin"], summary: "Update per-service commission rules", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: jsonBody({ packageCommissionType: "PERCENTAGE", packageCommissionValue: 10, hotelCommissionType: "FIXED", hotelCommissionValue: 500, carCommissionType: "PERCENTAGE", carCommissionValue: 8, bikeCommissionType: "FIXED", bikeCommissionValue: 100 }), responses: { 200: successResponse("Agent commission rules updated successfully") } }
    },
    "/api/admin/agents/{id}/wallet": {
      get: { tags: ["Agent Admin"], summary: "Get agent wallet", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Agent wallet fetched successfully") } }
    },
    "/api/admin/agents/{id}/transactions": {
      get: { tags: ["Agent Admin"], summary: "Get agent commission transactions", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: successResponse("Agent commission transactions fetched successfully", []) } }
    },
    "/api/admin/payouts": {
      get: { tags: ["Agent Admin"], summary: "List payouts", security: auth, responses: { 200: successResponse("Agent payouts fetched successfully", []) } },
      post: { tags: ["Agent Admin"], summary: "Create payout request", security: auth, requestBody: jsonBody({ agentId: "agent_id", amount: 5000, payoutMonth: "2026-05", remarks: "May payout" }), responses: { 201: successResponse("Agent payout created successfully") } }
    },
    "/api/admin/payouts/{id}/approve": {
      patch: { tags: ["Agent Admin"], summary: "Approve payout", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: jsonBody({ remarks: "Approved" }), responses: { 200: successResponse("Agent payout approved successfully") } }
    },
    "/api/admin/payouts/{id}/pay": {
      patch: { tags: ["Agent Admin"], summary: "Mark payout as paid", security: auth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: jsonBody({ remarks: "Bank transfer completed" }), responses: { 200: successResponse("Agent payout marked as paid successfully") } }
    },
    "/api/agent/dashboard": {
      get: { tags: ["Agent Portal"], summary: "Agent dashboard metrics", security: auth, responses: { 200: successResponse("Agent dashboard fetched successfully") } }
    },
    "/api/agent/wallet": {
      get: { tags: ["Agent Portal"], summary: "Agent wallet", security: auth, responses: { 200: successResponse("Agent wallet fetched successfully") } }
    },
    "/api/agent/commission-history": {
      get: { tags: ["Agent Portal"], summary: "Agent commission history", security: auth, responses: { 200: successResponse("Agent commission history fetched successfully", []) } }
    },
    "/api/agent/payout-history": {
      get: { tags: ["Agent Portal"], summary: "Agent payout history", security: auth, responses: { 200: successResponse("Agent payout history fetched successfully", []) } }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object" }
        }
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" }
        }
      }
    }
  }
};
