const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Custom OTP Authentication API",
    version: "1.0.0",
    description:
      "Express.js backend for Flutter authentication using Fast2SMS WhatsApp OTP, Firebase Admin custom tokens, and Firestore OTP storage."
  },
  servers: [
    {
      url: process.env.API_BASE_URL || "https://rangstone-backend-production.up.railway.app",
      description: "Configured API server"
    }
  ],
  tags: [
    {
      name: "Authentication",
      description: "OTP and Firebase custom token authentication endpoints"
    }
  ],
  paths: {
    "/api/auth/send-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Send OTP",
        description: "Sends a WhatsApp OTP to the given phone number using Fast2SMS.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SendOtpRequest"
              },
              example: {
                phone: "7376263360"
              }
            }
          }
        },
        responses: {
          200: {
            description: "OTP sent successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessMessage"
                },
                example: {
                  success: true,
                  message: "OTP sent successfully"
                }
              }
            }
          },
          400: {
            $ref: "#/components/responses/BadRequest"
          },
          429: {
            $ref: "#/components/responses/TooManyRequests"
          },
          500: {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    },
    "/api/auth/verify-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Verify OTP",
        description:
          "Verifies the OTP, deletes it after success, and returns a Firebase custom token for Flutter sign-in.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/VerifyOtpRequest"
              },
              example: {
                phone: "7376263360",
                otp: "123456"
              }
            }
          }
        },
        responses: {
          200: {
            description: "OTP verified successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/VerifyOtpResponse"
                },
                example: {
                  success: true,
                  message: "OTP verified successfully",
                  firebaseToken: "CUSTOM_FIREBASE_TOKEN",
                  uid: "phone_7376263360"
                }
              }
            }
          },
          400: {
            $ref: "#/components/responses/BadRequest"
          },
          401: {
            $ref: "#/components/responses/Unauthorized"
          },
          404: {
            $ref: "#/components/responses/NotFound"
          },
          429: {
            $ref: "#/components/responses/TooManyRequests"
          },
          500: {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    },
    "/api/auth/wallet": {
      get: {
        tags: ["Authentication"],
        summary: "Get Fast2SMS wallet balance",
        description: "Fetches the current Fast2SMS wallet balance using the configured API key.",
        responses: {
          200: {
            description: "Fast2SMS wallet balance fetched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WalletBalanceResponse"
                },
                example: {
                  success: true,
                  message: "Fast2SMS wallet balance fetched successfully",
                  wallet: {
                    return: true,
                    wallet: "100.00"
                  }
                }
              }
            }
          },
          429: {
            $ref: "#/components/responses/TooManyRequests"
          },
          500: {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      SendOtpRequest: {
        type: "object",
        required: ["phone"],
        properties: {
          phone: {
            type: "string",
            pattern: "^\\d{10,15}$",
            example: "7376263360"
          }
        }
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["phone", "otp"],
        properties: {
          phone: {
            type: "string",
            pattern: "^\\d{10,15}$",
            example: "7376263360"
          },
          otp: {
            type: "string",
            minLength: 4,
            maxLength: 8,
            example: "123456"
          }
        }
      },
      SuccessMessage: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Operation completed successfully"
          }
        }
      },
      VerifyOtpResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "OTP verified successfully"
          },
          firebaseToken: {
            type: "string",
            example: "CUSTOM_FIREBASE_TOKEN"
          },
          uid: {
            type: "string",
            example: "phone_7376263360"
          }
        }
      },
      WalletBalanceResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Fast2SMS wallet balance fetched successfully"
          },
          wallet: {
            type: "object",
            description: "Raw Fast2SMS wallet API response."
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          message: {
            type: "string",
            example: "Error message"
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            },
            example: {
              success: false,
              message: "A valid phone number with 10 to 15 digits is required."
            }
          }
        }
      },
      Unauthorized: {
        description: "Invalid or expired OTP",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            },
            example: {
              success: false,
              message: "Invalid OTP."
            }
          }
        }
      },
      NotFound: {
        description: "Requested resource was not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            },
            example: {
              success: false,
              message: "OTP not found. Please request a new OTP."
            }
          }
        }
      },
      TooManyRequests: {
        description: "Rate limit exceeded",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            },
            example: {
              success: false,
              message: "Too many requests. Please try again later."
            }
          }
        }
      },
      InternalServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            },
            example: {
              success: false,
              message: "Internal server error"
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerDocument;
