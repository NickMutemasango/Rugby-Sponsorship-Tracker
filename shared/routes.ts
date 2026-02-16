import { z } from 'zod';
import { 
  insertPartnerSchema, 
  insertDealSchema, 
  insertInteractionSchema,
  partners, 
  deals, 
  interactions,
  staff,
  userRoles,
  organizationTypes,
  partnershipNatures,
  teams,
  sponsorshipTiers,
  programmeCategories
} from './schema';
import { users } from './models/auth';

// Export shared constants and schemas for frontend
export { 
  insertPartnerSchema, 
  insertDealSchema, 
  insertInteractionSchema,
  organizationTypes,
  partnershipNatures,
  teams,
  sponsorshipTiers,
  programmeCategories,
  userRoles
};

// === SHARED ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  // --- PARTNERS ---
  partners: {
    list: {
      method: 'GET' as const,
      path: '/api/partners' as const,
      input: z.object({
        search: z.string().optional(),
        sector: z.string().optional(),
        cursor: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof partners.$inferSelect>()), // Returns simple array for list
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/partners/:id' as const,
      responses: {
        200: z.custom<typeof partners.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/partners' as const,
      input: insertPartnerSchema,
      responses: {
        201: z.custom<typeof partners.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/partners/:id' as const,
      input: insertPartnerSchema.partial(),
      responses: {
        200: z.custom<typeof partners.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },

  // --- DEALS ---
  deals: {
    list: {
      method: 'GET' as const,
      path: '/api/deals' as const,
      input: z.object({
        status: z.string().optional(),
        tier: z.string().optional(),
        partnerId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof deals.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/deals/:id' as const,
      responses: {
        200: z.custom<typeof deals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/deals' as const,
      input: insertDealSchema,
      responses: {
        201: z.custom<typeof deals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/deals/:id' as const,
      input: insertDealSchema.partial(),
      responses: {
        200: z.custom<typeof deals.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },

  // --- INTERACTIONS ---
  interactions: {
    list: {
      method: 'GET' as const,
      path: '/api/interactions' as const,
      input: z.object({
        dealId: z.number().optional(), // Filter by deal
        staffId: z.number().optional(), // Filter by staff
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof interactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/interactions' as const,
      input: insertInteractionSchema,
      responses: {
        201: z.custom<typeof interactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // --- STAFF ---
  staff: {
    me: {
      method: 'GET' as const,
      path: '/api/staff/me' as const,
      responses: {
        200: z.custom<typeof staff.$inferSelect>(),
        404: errorSchemas.notFound, // If user exists but no staff profile
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/staff' as const,
      responses: {
        200: z.array(z.custom<typeof staff.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    }
  },

  // --- DASHBOARD / REPORTS ---
  reports: {
    tiers: {
      method: 'GET' as const,
      path: '/api/reports/tiers' as const,
      responses: {
        200: z.array(z.object({
          tier: z.string(),
          count: z.number(),
          capacity: z.number().nullable(), // Infinity for In-Kind
          value: z.number(),
          status: z.enum(['AVAILABLE', 'FULL', 'EXHAUSTED', 'ACTIVE'])
        })),
      },
    },
    sectors: {
      method: 'GET' as const,
      path: '/api/reports/sectors' as const,
      responses: {
        200: z.array(z.object({
          sector: z.string(),
          activeCount: z.number(),
          prospectCount: z.number(),
          potentialValue: z.number(),
        })),
      },
    },
    funding: {
      method: 'GET' as const,
      path: '/api/reports/funding' as const,
      responses: {
        200: z.array(z.object({
          category: z.string(),
          raised: z.number(),
          target: z.number(),
          percentage: z.number(),
        })),
      },
    },
    metrics: {
      method: 'GET' as const,
      path: '/api/reports/metrics' as const,
      responses: {
        200: z.object({
          totalProspectValue: z.number(),
          committedValue: z.number(),
          openProposals: z.number(),
          pendingDecisions: z.number(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
