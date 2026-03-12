import { Router } from "express";
import { requireAdmin } from "../../auth/middleware.js";
import { pool } from "../../db/pool.js";

const router = Router();

// GET /analytics/dashboard — main KPIs
router.get("/dashboard", requireAdmin, async (_req, res) => {
  try {
    const [
      leadsThisMonth,
      leadsLastMonth,
      activeClients,
      activeProjects,
      newLeadsTotal,
      projectsByStatus,
      leadsByStatus,
      recentLeads,
      recentProjects,
      revenueThisMonth,
      revenueLastMonth,
      pendingInvoices,
      overdueInvoices,
      recentInvoices,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM leads WHERE created_at >= date_trunc('month', NOW())`),
      pool.query(
        `SELECT COUNT(*) FROM leads
         WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
           AND created_at < date_trunc('month', NOW())`
      ),
      pool.query(`SELECT COUNT(*) FROM clients WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM projects WHERE status NOT IN ('completed','cancelled')`),
      pool.query(`SELECT COUNT(*) FROM leads`),
      pool.query(`SELECT status, COUNT(*) AS count FROM projects GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) AS count FROM leads GROUP BY status`),
      pool.query(
        `SELECT id, name, email, company_name, status, source, created_at
         FROM leads ORDER BY created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT p.id, p.name, p.status, p.health, p.deadline, p.priority, c.name AS client_name
         FROM projects p LEFT JOIN clients c ON c.id = p.client_id
         ORDER BY p.updated_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT COALESCE(SUM(total),0) AS amount FROM invoices
         WHERE status = 'paid' AND paid_at >= date_trunc('month', NOW())`
      ),
      pool.query(
        `SELECT COALESCE(SUM(total),0) AS amount FROM invoices
         WHERE status = 'paid'
           AND paid_at >= date_trunc('month', NOW() - INTERVAL '1 month')
           AND paid_at < date_trunc('month', NOW())`
      ),
      pool.query(
        `SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS amount
         FROM invoices WHERE status IN ('sent','viewed')`
      ),
      pool.query(
        `SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS amount
         FROM invoices WHERE due_date < CURRENT_DATE AND status NOT IN ('paid','cancelled')`
      ),
      pool.query(
        `SELECT i.id, i.number, i.status, i.total, i.due_date, i.issue_date, cl.name AS client_name
         FROM invoices i LEFT JOIN clients cl ON cl.id = i.client_id
         ORDER BY i.issue_date DESC LIMIT 5`
      ),
    ]);

    const leadsThisMonthCount = Number(leadsThisMonth.rows[0].count);
    const leadsLastMonthCount = Number(leadsLastMonth.rows[0].count);
    const leadsDelta = leadsLastMonthCount > 0
      ? Math.round(((leadsThisMonthCount - leadsLastMonthCount) / leadsLastMonthCount) * 100)
      : null;

    const revThisMonth = Number(revenueThisMonth.rows[0].amount);
    const revLastMonth = Number(revenueLastMonth.rows[0].amount);
    const revDelta = revLastMonth > 0
      ? Math.round(((revThisMonth - revLastMonth) / revLastMonth) * 100)
      : null;

    res.json({
      kpis: {
        leadsThisMonth: leadsThisMonthCount,
        leadsThisMonthDelta: leadsDelta,
        leadsTotal: Number(newLeadsTotal.rows[0].count),
        activeClients: Number(activeClients.rows[0].count),
        activeProjects: Number(activeProjects.rows[0].count),
        revenueThisMonth: revThisMonth,
        revenueThisMonthDelta: revDelta,
        pendingInvoicesCount: Number(pendingInvoices.rows[0].count),
        pendingInvoicesAmount: Number(pendingInvoices.rows[0].amount),
        overdueInvoicesCount: Number(overdueInvoices.rows[0].count),
        overdueInvoicesAmount: Number(overdueInvoices.rows[0].amount),
      },
      projectsByStatus: projectsByStatus.rows,
      leadsByStatus: leadsByStatus.rows,
      recentLeads: recentLeads.rows,
      recentProjects: recentProjects.rows,
      recentInvoices: recentInvoices.rows,
    });
  } catch (err) {
    console.error("[analytics] dashboard error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch dashboard data" });
  }
});

// GET /analytics/advanced — advanced analytics
router.get("/advanced", requireAdmin, async (_req, res) => {
  try {
    const [
      monthlyRevenue,
      leadsFunnel,
      projectsByType,
      topClients,
      ticketStats,
      invoicesByStatus,
    ] = await Promise.all([
      pool.query(
        `SELECT TO_CHAR(paid_at, 'YYYY-MM') AS month, COALESCE(SUM(total),0) AS revenue
         FROM invoices
         WHERE status='paid' AND paid_at >= NOW() - INTERVAL '12 months'
         GROUP BY month ORDER BY month`
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count FROM leads GROUP BY status ORDER BY COUNT(*) DESC`
      ),
      pool.query(
        `SELECT type, COUNT(*) AS count FROM projects GROUP BY type ORDER BY COUNT(*) DESC`
      ),
      pool.query(
        `SELECT c.id, c.name,
                COALESCE(SUM(i.total) FILTER (WHERE i.status='paid'),0) AS "totalRevenue",
                COUNT(DISTINCT p.id) AS "projectCount",
                COUNT(DISTINCT t.id) AS "ticketCount"
         FROM clients c
         LEFT JOIN invoices i ON i.client_id=c.id
         LEFT JOIN projects p ON p.client_id=c.id
         LEFT JOIN tickets t ON t.client_id=c.id
         GROUP BY c.id, c.name
         ORDER BY "totalRevenue" DESC LIMIT 5`
      ),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE status='open') AS open,
           COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
           COUNT(*) FILTER (WHERE status='resolved' AND resolved_at >= date_trunc('month',NOW())) AS resolved_this_month,
           ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400) FILTER (WHERE resolved_at IS NOT NULL),1) AS avg_resolution_days
         FROM tickets`
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count, COALESCE(SUM(total),0) AS total
         FROM invoices GROUP BY status ORDER BY COUNT(*) DESC`
      ),
    ]);

    const ts = ticketStats.rows[0];

    res.json({
      monthlyRevenue: monthlyRevenue.rows.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue),
      })),
      leadsFunnel: leadsFunnel.rows.map((r) => ({
        status: r.status,
        count: Number(r.count),
      })),
      projectsByType: projectsByType.rows.map((r) => ({
        type: r.type,
        count: Number(r.count),
      })),
      topClients: topClients.rows.map((r) => ({
        id: r.id,
        name: r.name,
        totalRevenue: Number(r.totalRevenue),
        projectCount: Number(r.projectCount),
        ticketCount: Number(r.ticketCount),
      })),
      ticketStats: {
        open: Number(ts.open),
        in_progress: Number(ts.in_progress),
        resolved_this_month: Number(ts.resolved_this_month),
        avg_resolution_days: ts.avg_resolution_days !== null ? Number(ts.avg_resolution_days) : null,
      },
      invoicesByStatus: invoicesByStatus.rows.map((r) => ({
        status: r.status,
        count: Number(r.count),
        total: Number(r.total),
      })),
    });
  } catch (err) {
    console.error("[analytics] advanced error", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch advanced analytics" });
  }
});

export default router;

