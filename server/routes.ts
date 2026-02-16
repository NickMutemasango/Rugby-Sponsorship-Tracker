import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertStaffSchema, insertPartnerSchema, insertDealSchema, insertInteractionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- AUTH SETUP ---
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- STAFF ROUTES ---
  app.get(api.staff.me.path, isAuthenticated, async (req: any, res) => {
    // Current user's staff profile
    const userId = req.user.claims.sub;
    const staff = await storage.getStaffByUserId(userId);
    if (!staff) {
      return res.status(404).json({ message: "Staff profile not found" });
    }
    res.json(staff);
  });

  app.get(api.staff.list.path, isAuthenticated, async (req, res) => {
    const staffList = await storage.getAllStaff();
    res.json(staffList);
  });

  // --- PARTNER ROUTES ---
  app.get(api.partners.list.path, isAuthenticated, async (req, res) => {
    // Validate optional query params if needed, or just pass them
    const partners = await storage.getPartners();
    res.json(partners);
  });

  app.get(api.partners.get.path, isAuthenticated, async (req, res) => {
    const partner = await storage.getPartner(Number(req.params.id));
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json(partner);
  });

  app.post(api.partners.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.partners.create.input.parse(req.body);
      
      // Get current staff ID
      const userId = req.user.claims.sub;
      let staffProfile = await storage.getStaffByUserId(userId);
      
      // Auto-create staff profile if missing (simple fallback)
      if (!staffProfile) {
        staffProfile = await storage.createStaff({
          userId: userId,
          role: 'staff',
          department: 'Other'
        });
      }

      const partner = await storage.createPartner({
        ...input,
        createdById: staffProfile.id
      });
      res.status(201).json(partner);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.partners.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.partners.update.input.parse(req.body);
      const partner = await storage.updatePartner(Number(req.params.id), input);
      res.json(partner);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // --- DEAL ROUTES ---
  app.get(api.deals.list.path, isAuthenticated, async (req, res) => {
    const deals = await storage.getDeals();
    res.json(deals);
  });

  app.get(api.deals.get.path, isAuthenticated, async (req, res) => {
    const deal = await storage.getDeal(Number(req.params.id));
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  });

  app.post(api.deals.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.deals.create.input.parse(req.body);
      
      // Get current staff ID
      const userId = req.user.claims.sub;
      let staffProfile = await storage.getStaffByUserId(userId);
      if (!staffProfile) {
         staffProfile = await storage.createStaff({ userId, role: 'staff', department: 'Other' });
      }

      const deal = await storage.createDeal({
        ...input,
        createdById: staffProfile.id,
        updatedById: staffProfile.id
      });
      res.status(201).json(deal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.deals.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.deals.update.input.parse(req.body);
      
      // Get current staff ID
      const userId = req.user.claims.sub;
      let staffProfile = await storage.getStaffByUserId(userId);
      if (!staffProfile) {
         staffProfile = await storage.createStaff({ userId, role: 'staff', department: 'Other' });
      }

      const deal = await storage.updateDeal(Number(req.params.id), {
        ...input,
        updatedById: staffProfile.id
      });
      res.json(deal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // --- INTERACTION ROUTES ---
  app.get(api.interactions.list.path, isAuthenticated, async (req, res) => {
    const dealId = req.query.dealId ? Number(req.query.dealId) : undefined;
    const staffId = req.query.staffId ? Number(req.query.staffId) : undefined;
    const interactions = await storage.getInteractions({ dealId, staffId });
    res.json(interactions);
  });

  app.post(api.interactions.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.interactions.create.input.parse(req.body);

      // Get current staff ID
      const userId = req.user.claims.sub;
      let staffProfile = await storage.getStaffByUserId(userId);
      if (!staffProfile) {
         staffProfile = await storage.createStaff({ userId, role: 'staff', department: 'Other' });
      }

      const interaction = await storage.createInteraction({
        ...input,
        initiatedById: staffProfile.id
      });
      res.status(201).json(interaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // --- REPORT ROUTES ---
  app.get(api.reports.tiers.path, isAuthenticated, async (req, res) => {
    const report = await storage.getTierReport();
    res.json(report);
  });

  app.get(api.reports.sectors.path, isAuthenticated, async (req, res) => {
    const report = await storage.getSectorReport();
    res.json(report);
  });

  app.get(api.reports.funding.path, isAuthenticated, async (req, res) => {
    const report = await storage.getFundingReport();
    res.json(report);
  });

  app.get(api.reports.metrics.path, isAuthenticated, async (req, res) => {
    const metrics = await storage.getMetrics();
    res.json(metrics);
  });

  return httpServer;
}
