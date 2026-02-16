import { storage } from "./storage";
import { users, staff, partners, deals, interactions } from "@shared/schema";
import { db } from "./db";

async function seed() {
  console.log("Seeding database...");

  // check if data exists
  const existingStaff = await storage.getAllStaff();
  if (existingStaff.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  // Create Admin User & Staff
  // Note: specific IDs for seeding might conflict with randomUUID if we were using UUIDs for users, 
  // but users table uses randomUUID default. We'll let it generate.
  
  // We can't easily create a user with a specific password hash here because we don't have the hashing logic 
  // readily available (it's handled by Replit Auth / OIDC). 
  // However, we can create 'mock' users for display purposes if we want, or just rely on the first user logging in.
  // BUT, to show data on the dashboard immediately without logging in as 5 different people, 
  // we can create "Ghost" staff members linked to placeholder users.
  
  console.log("Creating staff...");
  const staffMembers = [
    { name: "TJ Chifokoyo", role: "manager", department: "Commercial", title: "Head of Commercial" },
    { name: "Sarah Mbatha", role: "staff", department: "Commercial", title: "Sponsorship Manager" },
    { name: "James Ndlovu", role: "staff", department: "Operations", title: "Operations Lead" },
  ];

  const createdStaff = [];

  for (const s of staffMembers) {
    // Create a placeholder user
    const [user] = await db.insert(users).values({
      username: s.name.toLowerCase().replace(" ", "."),
      password: "placeholder_hash", // Won't be able to login, but needed for FK
      email: `${s.name.toLowerCase().replace(" ", ".")}@zru.rugby`,
      firstName: s.name.split(" ")[0],
      lastName: s.name.split(" ")[1],
    }).returning();

    const staffProfile = await storage.createStaff({
      userId: user.id,
      role: s.role as any,
      department: s.department as any,
      positionTitle: s.title
    });
    
    createdStaff.push({ ...staffProfile, name: s.name });
  }

  console.log("Creating partners...");
  const partnersData = [
    {
      organizationName: "TSL Group",
      organizationTypes: ["Financial Services/Banking"],
      countryOfRegistration: "Zimbabwe",
      primaryContactName: "John Doe",
      primaryContactEmail: "john@tsl.co.zw",
      partnershipNature: "Commercial Sponsorship",
      teamsInterested: ["Sables 15s"],
      createdById: createdStaff[0].id // TJ
    },
    {
      organizationName: "Innscor",
      organizationTypes: ["Retail/FMCG"],
      countryOfRegistration: "Zimbabwe",
      primaryContactName: "Jane Smith",
      primaryContactEmail: "jane@innscor.co.zw",
      partnershipNature: "Commercial Sponsorship",
      teamsInterested: ["Cheetahs 7s"],
      createdById: createdStaff[1].id // Sarah
    },
    {
      organizationName: "ZIMNAT",
      organizationTypes: ["Financial Services/Banking"],
      countryOfRegistration: "Zimbabwe",
      primaryContactName: "Mike Brown",
      primaryContactEmail: "mike@zimnat.co.zw",
      partnershipNature: "In-Kind",
      teamsInterested: ["National Program"],
      createdById: createdStaff[2].id // James
    },
    {
      organizationName: "Econet",
      organizationTypes: ["Telecommunications"],
      countryOfRegistration: "Zimbabwe",
      primaryContactName: "Sarah Connor",
      primaryContactEmail: "sarah@econet.co.zw",
      partnershipNature: "Broadcasting/Media Rights",
      teamsInterested: ["All Teams"],
      createdById: createdStaff[0].id // TJ
    },
     {
      organizationName: "Delta Beverages",
      organizationTypes: ["Beverage Company"],
      countryOfRegistration: "Zimbabwe",
      primaryContactName: "Tom Hardy",
      primaryContactEmail: "tom@delta.co.zw",
      partnershipNature: "Commercial Sponsorship",
      teamsInterested: ["Sables 15s"],
      createdById: createdStaff[0].id // TJ
    }
  ];

  const createdPartners = [];
  for (const p of partnersData) {
    const partner = await storage.createPartner(p as any);
    createdPartners.push(partner);
  }

  console.log("Creating deals...");
  const dealsData = [
    {
      partnerId: createdPartners[0].id, // TSL
      createdById: createdStaff[0].id,
      dealName: "TSL Title Sponsorship",
      status: "Negotiating",
      sponsorshipTier: "Title Partner",
      programmeCategory: "Competitions & Campaign",
      annualValue: "650000",
      probability: 75
    },
    {
      partnerId: createdPartners[1].id, // Innscor
      createdById: createdStaff[1].id,
      dealName: "Innscor Kit Deal",
      status: "Proposal Sent",
      sponsorshipTier: "Official Partner",
      programmeCategory: "Daily Training Environment",
      annualValue: "180000",
      probability: 40
    },
    {
      partnerId: createdPartners[2].id, // ZIMNAT
      createdById: createdStaff[2].id,
      dealName: "ZIMNAT Insurance",
      status: "In Conversation",
      sponsorshipTier: "Supporting Partner",
      programmeCategory: "Administration & Financial Controls",
      annualValue: "35000",
      probability: 20
    },
    {
      partnerId: createdPartners[3].id, // Econet
      createdById: createdStaff[0].id,
      dealName: "Econet Digital",
      status: "Prospect",
      sponsorshipTier: "Principal Partner",
      programmeCategory: "Competitions & Campaign",
      annualValue: "500000",
      probability: 10
    },
     {
      partnerId: createdPartners[4].id, // Delta
      createdById: createdStaff[0].id,
      dealName: "Zambezi Lager Sleeve",
      status: "Closed",
      sponsorshipTier: "Principal Partner",
      programmeCategory: "Competitions & Campaign",
      annualValue: "450000",
      probability: 100
    }
  ];

  for (const d of dealsData) {
    await storage.createDeal({
      ...d,
      monthlyValue: (Number(d.annualValue) / 12).toString(),
      closeProbability: d.probability
    } as any);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
