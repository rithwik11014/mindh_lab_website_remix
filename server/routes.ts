import express from "express";
import fs from "fs";
import path from "path";
import {
  requireAdminAuth,
  getAdminUsers,
  saveAdminUsers,
  createSession,
  invalidateSession,
  getSession,
  verifyPassword,
  hashPassword,
  extractToken,
  parseCookies,
} from "./auth";
import { handleFileUpload, handleFileDelete } from "./upload";
import {
  getHomepageData,
  saveHomepageData,
  getAboutData,
  saveAboutData,
  getResearchData,
  saveResearchData,
  getGalleryData,
  saveGalleryData,
  getSettingsData,
  saveSettingsData,
} from "./dataStore";
import { ResearchPillar, GalleryItem, ContactInquiry } from "../src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

function getInquiries(): ContactInquiry[] {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const raw = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read inquiries file:", err);
  }
  return [];
}

function saveInquiries(list: ContactInquiry[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not save inquiries:", err);
  }
}

export function registerAdminAndConfigRoutes(app: express.Express) {
  // ----------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------

  // POST /api/auth/login
  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }

      const users = getAdminUsers();
      const cleanUsername = String(username).trim().toLowerCase();

      const user = users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername ||
          u.email.toLowerCase() === cleanUsername
      );

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid administrator credentials." });
      }

      const isMatch = verifyPassword(String(password), user.salt, user.hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid administrator credentials." });
      }

      // Update lastLogin
      user.lastLogin = new Date().toISOString();
      saveAdminUsers(users);

      // Create session token
      const session = createSession(user);

      // Set HTTP-only cookie
      res.cookie("mindh_admin_token", session.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
        path: "/",
      });

      return res.json({
        success: true,
        message: "Authentication successful",
        token: session.token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        },
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Authentication failure", error: err?.message });
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req, res) => {
    try {
      const token = extractToken(req);
      if (token) {
        invalidateSession(token);
      }
      res.clearCookie("mindh_admin_token", { path: "/" });
      return res.json({ success: true, message: "Logged out successfully" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Logout failure", error: err?.message });
    }
  });

  // GET /api/auth/me
  app.get("/api/auth/me", (req, res) => {
    try {
      const token = extractToken(req);
      const session = getSession(token || undefined);
      if (!session) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      const users = getAdminUsers();
      const user = users.find((u) => u.id === session.userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      return res.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Session check failure", error: err?.message });
    }
  });

  // POST /api/auth/change-password
  app.post("/api/auth/change-password", requireAdminAuth, (req, res) => {
    try {
      const session = (req as any).adminSession;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Both current and new password are required." });
      }

      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
      }

      const users = getAdminUsers();
      const userIndex = users.findIndex((u) => u.id === session.userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      const user = users[userIndex];
      const isMatch = verifyPassword(String(currentPassword), user.salt, user.hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password does not match." });
      }

      const { salt, hash } = hashPassword(String(newPassword));
      users[userIndex] = {
        ...user,
        salt,
        hash,
      };
      saveAdminUsers(users);

      return res.json({ success: true, message: "Password updated successfully." });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to update password", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // MEDIA UPLOAD & ASSET MANAGEMENT
  // ----------------------------------------------------
  app.post("/api/admin/upload", requireAdminAuth, handleFileUpload);
  app.delete("/api/admin/upload", requireAdminAuth, handleFileDelete);

  // ----------------------------------------------------
  // HOMEPAGE CONFIGURATION
  // ----------------------------------------------------
  app.get("/api/homepage-config", (_req, res) => {
    try {
      const data = getHomepageData();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to get homepage config", error: err?.message });
    }
  });

  app.put("/api/homepage-config", requireAdminAuth, (req, res) => {
    try {
      const updated = req.body;
      saveHomepageData(updated);
      return res.json({ success: true, message: "Homepage content saved and published successfully.", data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to save homepage config", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // ABOUT CONFIGURATION
  // ----------------------------------------------------
  app.get("/api/about-config", (_req, res) => {
    try {
      const data = getAboutData();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to get about config", error: err?.message });
    }
  });

  app.put("/api/about-config", requireAdminAuth, (req, res) => {
    try {
      const updated = req.body;
      saveAboutData(updated);
      return res.json({ success: true, message: "About section saved and published successfully.", data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to save about config", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // RESEARCH PILLARS & PROJECTS
  // ----------------------------------------------------
  app.get("/api/research", (req, res) => {
    try {
      const token = extractToken(req);
      const session = getSession(token || undefined);
      const isAdmin = !!session;

      let list = getResearchData();
      if (!isAdmin) {
        list = list.filter((p) => p.published !== false);
      }
      // Sort by orderIndex
      list.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      return res.json({ success: true, count: list.length, research: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to get research thrusts", error: err?.message });
    }
  });

  app.post("/api/research", requireAdminAuth, (req, res) => {
    try {
      const { title, subtitle, description, technologies, metrics, icon, grantNumber, status, published } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: "Title and description are required." });
      }

      const list = getResearchData();
      const newPillar: ResearchPillar = {
        id: `res-${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle?.trim() || "",
        description: description.trim(),
        technologies: Array.isArray(technologies) ? technologies : [],
        metrics: Array.isArray(metrics) ? metrics : [],
        icon: icon?.trim() || "Activity",
        grantNumber: grantNumber?.trim() || undefined,
        status: status?.trim() || "Active",
        published: published !== false,
        orderIndex: list.length,
      };

      list.push(newPillar);
      saveResearchData(list);

      return res.status(201).json({
        success: true,
        message: "Research area created successfully.",
        pillar: newPillar,
        research: list,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to create research area", error: err?.message });
    }
  });

  app.put("/api/research/:id", requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const list = getResearchData();
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "Research area not found" });
      }

      const existing = list[idx];
      const updated: ResearchPillar = {
        ...existing,
        ...req.body,
        id, // ensure ID is preserved
      };

      list[idx] = updated;
      saveResearchData(list);

      return res.json({
        success: true,
        message: "Research area updated successfully.",
        pillar: updated,
        research: list,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to update research area", error: err?.message });
    }
  });

  app.delete("/api/research/:id", requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      let list = getResearchData();
      const initialLen = list.length;
      list = list.filter((p) => p.id !== id);

      if (list.length === initialLen) {
        return res.status(404).json({ success: false, message: "Research area not found" });
      }

      saveResearchData(list);
      return res.json({ success: true, message: "Research area permanently deleted.", deletedId: id, research: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to delete research area", error: err?.message });
    }
  });

  app.put("/api/research-reorder", requireAdminAuth, (req, res) => {
    try {
      const { orderIds } = req.body;
      if (!Array.isArray(orderIds)) {
        return res.status(400).json({ success: false, message: "orderIds array required" });
      }
      const list = getResearchData();
      const idMap = new Map<string, number>();
      orderIds.forEach((id, index) => idMap.set(id, index));

      list.forEach((item) => {
        if (idMap.has(item.id)) {
          item.orderIndex = idMap.get(item.id);
        }
      });
      list.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      saveResearchData(list);

      return res.json({ success: true, message: "Research areas reordered successfully.", research: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to reorder research areas", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // GALLERY
  // ----------------------------------------------------
  app.get("/api/gallery", (req, res) => {
    try {
      const token = extractToken(req);
      const session = getSession(token || undefined);
      const isAdmin = !!session;

      let list = getGalleryData();
      if (!isAdmin) {
        list = list.filter((g) => g.published !== false);
      }
      list.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      return res.json({ success: true, count: list.length, gallery: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to get gallery items", error: err?.message });
    }
  });

  app.post("/api/gallery", requireAdminAuth, (req, res) => {
    try {
      const { title, caption, category, imageUrl, date, published } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ success: false, message: "Title and image URL are required." });
      }

      const list = getGalleryData();
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}`,
        title: title.trim(),
        caption: caption?.trim() || "",
        category: category?.trim() || "Experimental Setup",
        imageUrl: imageUrl.trim(),
        date: date?.trim() || new Date().toISOString().split("T")[0],
        published: published !== false,
        orderIndex: list.length,
      };

      list.push(newItem);
      saveGalleryData(list);

      return res.status(201).json({
        success: true,
        message: "Gallery photo added successfully.",
        item: newItem,
        gallery: list,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to add gallery item", error: err?.message });
    }
  });

  app.put("/api/gallery/:id", requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const list = getGalleryData();
      const idx = list.findIndex((g) => g.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "Gallery item not found" });
      }

      const updated: GalleryItem = {
        ...list[idx],
        ...req.body,
        id,
      };

      list[idx] = updated;
      saveGalleryData(list);

      return res.json({ success: true, message: "Gallery photo updated successfully.", item: updated, gallery: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to update gallery item", error: err?.message });
    }
  });

  app.delete("/api/gallery/:id", requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      let list = getGalleryData();
      const initialLen = list.length;
      list = list.filter((g) => g.id !== id);

      if (list.length === initialLen) {
        return res.status(404).json({ success: false, message: "Gallery item not found" });
      }

      saveGalleryData(list);
      return res.json({ success: true, message: "Gallery photo permanently deleted.", deletedId: id, gallery: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to delete gallery item", error: err?.message });
    }
  });

  app.put("/api/gallery-reorder", requireAdminAuth, (req, res) => {
    try {
      const { orderIds } = req.body;
      if (!Array.isArray(orderIds)) {
        return res.status(400).json({ success: false, message: "orderIds array required" });
      }
      const list = getGalleryData();
      const idMap = new Map<string, number>();
      orderIds.forEach((id, index) => idMap.set(id, index));

      list.forEach((item) => {
        if (idMap.has(item.id)) {
          item.orderIndex = idMap.get(item.id);
        }
      });
      list.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      saveGalleryData(list);

      return res.json({ success: true, message: "Gallery reordered successfully.", gallery: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to reorder gallery", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // SITE SETTINGS & CONTACT DETAILS
  // ----------------------------------------------------
  app.get("/api/settings", (_req, res) => {
    try {
      const data = getSettingsData();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to get settings", error: err?.message });
    }
  });

  app.put("/api/settings", requireAdminAuth, (req, res) => {
    try {
      const existing = getSettingsData();
      const updated = {
        ...existing,
        ...req.body,
        socialLinks: {
          ...(existing.socialLinks || {}),
          ...(req.body.socialLinks || {}),
        },
      };
      saveSettingsData(updated);
      return res.json({ success: true, message: "Site settings and logo placeholders updated.", data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to save settings", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // ADMIN INQUIRIES MANAGEMENT
  // ----------------------------------------------------
  app.get("/api/admin/inquiries", requireAdminAuth, (_req, res) => {
    try {
      const list = getInquiries();
      return res.json({ success: true, count: list.length, inquiries: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to get inquiries", error: err?.message });
    }
  });

  app.put("/api/admin/inquiries/:id/status", requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const list = getInquiries();
      const idx = list.findIndex((inq) => inq.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "Inquiry not found" });
      }

      list[idx].status = status || "Reviewed";
      saveInquiries(list);

      return res.json({ success: true, message: `Inquiry status updated to ${status}.`, inquiry: list[idx] });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to update inquiry status", error: err?.message });
    }
  });

  app.delete("/api/admin/inquiries/:id", requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      let list = getInquiries();
      const initialLen = list.length;
      list = list.filter((inq) => inq.id !== id);

      if (list.length === initialLen) {
        return res.status(404).json({ success: false, message: "Inquiry not found" });
      }

      saveInquiries(list);
      return res.json({ success: true, message: "Inquiry message deleted.", deletedId: id });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to delete inquiry", error: err?.message });
    }
  });

  // ----------------------------------------------------
  // FILE UPLOAD (Images & Assets)
  // ----------------------------------------------------
  app.post("/api/upload", requireAdminAuth, handleFileUpload);
  app.post("/api/upload/delete", requireAdminAuth, handleFileDelete);
}
