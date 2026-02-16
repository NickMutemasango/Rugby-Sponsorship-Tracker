import { 
  users, partners, deals, interactions, staff,
  type User, type InsertUser,
  type Partner, type InsertPartner,
  type Deal, type InsertDeal,
  type Interaction, type InsertInteraction,
  type Staff, type InsertStaff,
  sponsorshipTiers,
  programmeCategories,
  organizationTypes
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Users & Staff
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getStaffByUserId(userId: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  getAllStaff(): Promise<(Staff & { user: User })[]>;

  // Partners
  getPartners(filter?: { search?: string; sector?: string }): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner>;

  // Deals
  getDeals(filter?: { status?: string; tier?: string; partnerId?: number }): Promise<Deal[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal>;

  // Interactions
  getInteractions(filter?: { dealId?: number; staffId?: number }): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;

  // Reports
  getTierReport(): Promise<any[]>;
  getSectorReport(): Promise<any[]>;
  getFundingReport(): Promise<any[]>;
  getMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // --- USERS & STAFF ---
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getStaffByUserId(userId: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.userId, userId));
    return staffMember;
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staffMember] = await db.insert(staff).values(insertStaff).returning();
    return staffMember;
  }

  async getAllStaff(): Promise<(Staff & { user: User })[]> {
    const result = await db
      .select({
        staff: staff,
        user: users
      })
      .from(staff)
      .innerJoin(users, eq(staff.userId, users.id));
    
    return result.map(r => ({ ...r.staff, user: r.user }));
  }

  // --- PARTNERS ---
  async getPartners(filter?: { search?: string; sector?: string }): Promise<Partner[]> {
    let query = db.select().from(partners);
    
    if (filter?.search) {
      query.where(sql`${partners.organizationName} ILIKE ${`%${filter.search}%`}`);
    }
    
    // Note: Filtering by array column (organizationTypes) is tricky in pure SQL via Drizzle without specific dialect support, 
    // but we can use sql operator. For now, simple listing.
    
    return await query.orderBy(desc(partners.createdAt));
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const [partner] = await db.insert(partners).values(insertPartner).returning();
    return partner;
  }

  async updatePartner(id: number, updateData: Partial<InsertPartner>): Promise<Partner> {
    const [partner] = await db
      .update(partners)
      .set({ ...updateData })
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  // --- DEALS ---
  async getDeals(filter?: { status?: string; tier?: string; partnerId?: number }): Promise<Deal[]> {
    const conditions = [];
    if (filter?.status) conditions.push(eq(deals.status, filter.status as any));
    if (filter?.tier) conditions.push(eq(deals.sponsorshipTier, filter.tier as any));
    if (filter?.partnerId) conditions.push(eq(deals.partnerId, filter.partnerId));

    return await db
      .select()
      .from(deals)
      .where(and(...conditions))
      .orderBy(desc(deals.updatedAt));
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }

  async updateDeal(id: number, updateData: Partial<InsertDeal>): Promise<Deal> {
    const [deal] = await db
      .update(deals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
    return deal;
  }

  // --- INTERACTIONS ---
  async getInteractions(filter?: { dealId?: number; staffId?: number }): Promise<Interaction[]> {
    const conditions = [];
    if (filter?.dealId) conditions.push(eq(interactions.dealId, filter.dealId));
    if (filter?.staffId) conditions.push(eq(interactions.initiatedById, filter.staffId));

    return await db
      .select()
      .from(interactions)
      .where(and(...conditions))
      .orderBy(desc(interactions.interactionDate));
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const [interaction] = await db.insert(interactions).values(insertInteraction).returning();
    
    // Also update the deal's updated_at timestamp
    await db
      .update(deals)
      .set({ updatedAt: new Date() })
      .where(eq(deals.id, insertInteraction.dealId));
      
    return interaction;
  }

  // --- REPORTS ---
  async getTierReport(): Promise<any[]> {
    // We'll calculate this in memory for simplicity or complex SQL grouping
    // Getting all active deals first
    const allDeals = await db.select().from(deals);

    // Initial tier config from requirements
    const tierConfig: Record<string, { capacity: number, value: number }> = {
      "Title Partner": { capacity: 1, value: 650000 },
      "Principal Partner": { capacity: 2, value: 400000 },
      "Official Partner": { capacity: 5, value: 150000 },
      "Supporting Partner": { capacity: 10, value: 20000 },
      "In-Kind": { capacity: Infinity, value: 0 }
    };

    return sponsorshipTiers.map(tier => {
      const tierDeals = allDeals.filter(d => d.sponsorshipTier === tier && 
        (d.status === 'Closed' || d.status === 'Negotiating')); // Count active/likely deals
      
      const count = tierDeals.length;
      const config = tierConfig[tier] || { capacity: 0, value: 0 };
      const capacity = config.capacity === Infinity ? null : config.capacity;
      
      let status = 'AVAILABLE';
      if (capacity !== null) {
        if (count >= capacity) status = 'EXHAUSTED';
        else if (count >= capacity * 0.8) status = 'FULL'; // Near full
      } else {
        status = 'ACTIVE';
      }

      const value = tierDeals.reduce((sum, d) => sum + Number(d.annualValue || 0), 0);

      return {
        tier,
        count,
        capacity,
        value,
        status
      };
    });
  }

  async getSectorReport(): Promise<any[]> {
    const allPartners = await db.select().from(partners);
    // Simple count by first organization type for now
    
    const sectorCounts: Record<string, { active: number, prospect: number, value: number }> = {};
    
    // Initialize
    organizationTypes.forEach(t => {
      sectorCounts[t] = { active: 0, prospect: 0, value: 0 };
    });
    
    // Get deals to check status
    const allDeals = await db.select().from(deals);
    
    for (const partner of allPartners) {
      const type = partner.organizationTypes?.[0] || "Other";
      if (!sectorCounts[type]) sectorCounts[type] = { active: 0, prospect: 0, value: 0 };
      
      // Find deals for this partner
      const partnerDeals = allDeals.filter(d => d.partnerId === partner.id);
      const isActive = partnerDeals.some(d => d.status === 'Closed');
      const value = partnerDeals.reduce((sum, d) => sum + Number(d.annualValue || 0), 0);
      
      if (isActive) {
        sectorCounts[type].active++;
      } else {
        sectorCounts[type].prospect++;
      }
      sectorCounts[type].value += value;
    }

    return Object.entries(sectorCounts).map(([sector, data]) => ({
      sector,
      activeCount: data.active,
      prospectCount: data.prospect,
      potentialValue: data.value
    }));
  }

  async getFundingReport(): Promise<any[]> {
    const targets: Record<string, number> = {
      "Daily Training Environment": 1060000,
      "Competitions & Campaign": 619599,
      "Programme Management & Leadership": 366500,
      "Sports Science & Sports Medicine": 177400,
      "Administration & Financial Controls": 192001,
      "HP People Development": 126500
    };

    const allDeals = await db.select().from(deals);

    return programmeCategories.map(category => {
      const categoryDeals = allDeals.filter(d => d.programmeCategory === category && d.status === 'Closed');
      const raised = categoryDeals.reduce((sum, d) => sum + Number(d.annualValue || 0), 0);
      const target = targets[category] || 0;
      
      return {
        category,
        raised,
        target,
        percentage: target > 0 ? Math.round((raised / target) * 100) : 0
      };
    });
  }

  async getMetrics(): Promise<any> {
    const allDeals = await db.select().from(deals);
    
    const totalProspectValue = allDeals
      .filter(d => d.status !== 'Closed' && d.status !== 'Stalled')
      .reduce((sum, d) => sum + Number(d.annualValue || 0), 0);
      
    const committedValue = allDeals
      .filter(d => d.status === 'Closed')
      .reduce((sum, d) => sum + Number(d.annualValue || 0), 0);
      
    const openProposals = allDeals.filter(d => d.status === 'Proposal Sent').length;
    const pendingDecisions = allDeals.filter(d => d.status === 'Negotiating').length;

    return {
      totalProspectValue,
      committedValue,
      openProposals,
      pendingDecisions
    };
  }
}

export const storage = new DatabaseStorage();
