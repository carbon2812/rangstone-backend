const { z } = require("zod");

const idParam = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const payoutIdParam = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const permissionSchema = z.object({
  body: z.object({
    canBookPackages: z.boolean(),
    canBookHotels: z.boolean(),
    canBookCars: z.boolean(),
    canBookBikes: z.boolean()
  }),
  params: z.object({
    id: z.string().min(1)
  })
});

const commissionType = z.enum(["PERCENTAGE", "FIXED"]);
const nonNegativeNumber = z.coerce.number().min(0);

const commissionRuleSchema = z.object({
  body: z.object({
    packageCommissionType: commissionType,
    packageCommissionValue: nonNegativeNumber,
    hotelCommissionType: commissionType,
    hotelCommissionValue: nonNegativeNumber,
    carCommissionType: commissionType,
    carCommissionValue: nonNegativeNumber,
    bikeCommissionType: commissionType,
    bikeCommissionValue: nonNegativeNumber
  }),
  params: z.object({
    id: z.string().min(1)
  })
});

const payoutCreateSchema = z.object({
  body: z.object({
    agentId: z.string().min(1),
    amount: nonNegativeNumber,
    payoutMonth: z.string().regex(/^\d{4}-\d{2}$/, "payoutMonth must use YYYY-MM format."),
    remarks: z.string().optional()
  })
});

const payoutActionSchema = z.object({
  body: z.object({
    remarks: z.string().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  })
});

const payoutListSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "PROCESSING", "PAID"]).optional()
  })
});

module.exports = {
  idParam,
  payoutIdParam,
  permissionSchema,
  commissionRuleSchema,
  payoutCreateSchema,
  payoutActionSchema,
  payoutListSchema
};
