import { pgTable, text, serial, integer, boolean, timestamp, date, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

// === ENUMS ===
export const userRoles = ["admin", "manager", "staff"] as const;
export const departments = ["Commercial", "Operations", "Coaching", "Finance", "Other"] as const;
export const organizationTypes = [
  "Equipment/Kit Supplier", "Beverage Company", "Financial Services/Banking", "Telecommunications",
  "Technology/Digital Services", "Healthcare/Wellness", "Hospitality/Tourism", "Retail/FMCG",
  "Media/Broadcasting", "Sports Management/Agency", "Other"
] as const;
export const partnershipNatures = [
  "Kit Supply", "Commercial Sponsorship", "In-Kind", "Broadcasting/Media Rights",
  "Player/Team Management", "Tournament/Event Hosting", "Other"
] as const;
export const teams = [
  "Sables 15s", "Cheetahs 7s", "Junior Sables U20s", "U18s", "U16s", "U17s", "U14s", "Deaf Rugby (Male)",
  "Lady Sables 15s", "Lady Cheetahs 7s", "Women's U20s", "U18s", "U16s", "Multiple Teams", "National Program"
] as const;
export const sponsorshipTiers = ["Title Partner", "Principal Partner", "Official Partner", "Supporting Partner", "In-Kind"] as const;
export const programmeCategories = [
  "Daily Training Environment", "Competitions & Campaign", "Programme Management & Leadership",
  "Sports Science & Sports Medicine", "Administration & Financial Controls", "HP People Development"
] as const;
export const dealStatuses = ["Prospect", "In Conversation", "Proposal Sent", "Negotiating", "Closed", "Stalled"] as const;
export const interactionTypes = ["Phone call", "Email", "Meeting", "Video call", "Other"] as const;

// === TABLES ===

// Staff profile extension for the auth users
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role", { enum: userRoles }).default("staff").notNull(),
  department: text("department", { enum: departments }).default("Other").notNull(),
  positionTitle: text("position_title"),
  phone: text("phone"),
});

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  organizationName: text("organization_name").notNull().unique(),
  organizationTypes: text("organization_types").array().notNull(), // Multi-select
  countryOfRegistration: text("country_of_registration").notNull(),
  website: text("website"),
  primarySocialMedia: text("primary_social_media"),
  
  // Contacts
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactJobTitle: text("primary_contact_job_title"),
  primaryContactEmail: text("primary_contact_email").notNull(),
  primaryContactPhone: text("primary_contact_phone"),
  primaryContactLinkedin: text("primary_contact_linkedin"),
  
  secondaryContactName: text("secondary_contact_name"),
  secondaryContactJobTitle: text("secondary_contact_job_title"),
  secondaryContactEmail: text("secondary_contact_email"),
  secondaryContactPhone: text("secondary_contact_phone"),

  // Interest & Alignment
  partnershipNature: text("partnership_nature", { enum: partnershipNatures }).notNull(),
  teamsInterested: text("teams_interested").array().notNull(), // Multi-select
  strategicObjectives: text("strategic_objectives").array(),
  geographicMarkets: text("geographic_markets").array(),
  sportsSponsorshipExperience: text("sports_sponsorship_experience"),
  successKpis: text("success_kpis"),
  
  // Activation & Ops
  activationRequirements: text("activation_requirements").array(),
  athleteRepresentationNeeded: boolean("athlete_representation_needed").default(false),
  athleteRepresentationServices: text("athlete_representation_services"),
  africanOrgExperience: text("african_org_experience"),
  developmentSupportCapacity: text("development_support_capacity").array(),
  developmentSupportDescription: text("development_support_description"),
  
  // Governance
  restrictedCategories: text("restricted_categories").array(), // Should be validated to be empty or "None"
  codeOfConductReviewed: boolean("code_of_conduct_reviewed").default(false),
  
  // Communication
  preferredContactMethod: text("preferred_contact_method"),
  decisionTimeline: text("decision_timeline"),
  inDiscussionsWithOtherUnions: boolean("in_discussions_with_other_unions").default(false),
  otherUnions: text("other_unions"),
  additionalVision: text("additional_vision"),
  howHeardAbout: text("how_heard_about"),
  
  // Consent
  consentToContact: boolean("consent_to_contact").default(false).notNull(),
  consentToShare: boolean("consent_to_share").default(false),
  confidentialityAcknowledged: boolean("confidentiality_acknowledged").default(false).notNull(),
  dataProtectionConsent: boolean("data_protection_consent").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  createdById: integer("created_by_id").references(() => staff.id), // Staff member who entered this
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  createdById: integer("created_by_id").references(() => staff.id), // Staff member who initiated
  initiatedContactDate: timestamp("initiated_contact_date").defaultNow(),
  
  dealName: text("deal_name").notNull(),
  status: text("status", { enum: dealStatuses }).default("Prospect").notNull(),
  sponsorshipTier: text("sponsorship_tier", { enum: sponsorshipTiers }),
  programmeCategory: text("programme_category", { enum: programmeCategories }),
  
  // Financials
  annualValue: decimal("annual_value", { precision: 12, scale: 2 }), // Supports large numbers
  monthlyValue: decimal("monthly_value", { precision: 12, scale: 2 }),
  commitmentAmount: text("commitment_amount"), // Range string from form
  paymentTerms: text("payment_terms"),
  currency: text("currency").default("USD"),
  
  // Dates
  decisionDate: date("decision_date"),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  contractRenewalDate: date("contract_renewal_date"),
  
  closeProbability: integer("close_probability"), // 0-100
  
  // In-Kind specific
  inKindValueDescription: text("in_kind_value_description"),
  inKindProductsServices: text("in_kind_products_services"),
  
  proposedDuration: text("proposed_duration"),
  proposedStartDate: date("proposed_start_date"),
  description: text("description"),
  nextSteps: text("next_steps"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedById: integer("updated_by_id").references(() => staff.id),
});

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => deals.id),
  initiatedById: integer("initiated_by_id").references(() => staff.id),
  
  interactionType: text("interaction_type", { enum: interactionTypes }).notNull(),
  interactionDate: timestamp("interaction_date").defaultNow().notNull(),
  durationMinutes: integer("duration_minutes"),
  
  notes: text("notes"),
  nextAction: text("next_action"),
  nextActionDate: date("next_action_date"),
  nextActionOwnerId: integer("next_action_owner_id").references(() => staff.id),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const staffRelations = relations(staff, ({ one, many }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  createdPartners: many(partners, { relationName: "partnerCreator" }),
  createdDeals: many(deals, { relationName: "dealCreator" }),
  updatedDeals: many(deals, { relationName: "dealUpdater" }),
  initiatedInteractions: many(interactions, { relationName: "interactionInitiator" }),
  assignedActions: many(interactions, { relationName: "actionOwner" }),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  createdBy: one(staff, {
    fields: [partners.createdById],
    references: [staff.id],
    relationName: "partnerCreator",
  }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  partner: one(partners, {
    fields: [deals.partnerId],
    references: [partners.id],
  }),
  createdBy: one(staff, {
    fields: [deals.createdById],
    references: [staff.id],
    relationName: "dealCreator",
  }),
  updatedBy: one(staff, {
    fields: [deals.updatedById],
    references: [staff.id],
    relationName: "dealUpdater",
  }),
  interactions: many(interactions),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  deal: one(deals, {
    fields: [interactions.dealId],
    references: [deals.id],
  }),
  initiatedBy: one(staff, {
    fields: [interactions.initiatedById],
    references: [staff.id],
    relationName: "interactionInitiator",
  }),
  nextActionOwner: one(staff, {
    fields: [interactions.nextActionOwnerId],
    references: [staff.id],
    relationName: "actionOwner",
  }),
}));

// === ZOD SCHEMAS ===
export const insertStaffSchema = createInsertSchema(staff);
export const insertPartnerSchema = createInsertSchema(partners).omit({ 
  id: true, 
  createdAt: true, 
  createdById: true // Set by server
});
export const insertDealSchema = createInsertSchema(deals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  createdById: true, // Set by server
  updatedById: true  // Set by server
});
export const insertInteractionSchema = createInsertSchema(interactions).omit({ 
  id: true, 
  createdAt: true,
  initiatedById: true // Set by server
});

// === TYPES ===
export type Staff = typeof staff.$inferSelect;
export type Partner = typeof partners.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Interaction = typeof interactions.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

// API Response Types
export type PartnerWithCreator = Partner & { createdBy: Staff | null };
export type DealWithPartner = Deal & { partner: Partner };
export type InteractionWithDetails = Interaction & { 
  initiatedBy: Staff | null;
  nextActionOwner: Staff | null;
};
