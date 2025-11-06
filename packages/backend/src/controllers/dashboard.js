const { Project, Customer, User, Report, sequelize } = require('../models');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { msToTime } = require('../utils/msToTime');
const { OK, USER_ROLE } = require('../helpers/constants');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Build role-based filtering
    let roleWhereCondition = {};
    let roleInclude = [];
    
    if (req.user) {
      // Filter for Technician role: projects assigned via technician_id OR many-to-many relationship
      if (req.user.role === USER_ROLE.TECHNICIAN) {
        // Use OR condition to check both technician_id and many-to-many relationship
        // Use Sequelize.literal with escaped value - use Sequelize.col to reference the outer table's id
        const escapedUserId = sequelize.escape(req.user.id);
        roleWhereCondition = {
          [Op.or]: [
            { technician_id: req.user.id },
            sequelize.where(
              Sequelize.col('Project.id'),
              {
                [Op.in]: sequelize.literal(`(
                  SELECT pt.project_id 
                  FROM project_technicians pt 
                  WHERE pt.user_id = ${escapedUserId}
                )`)
              }
            )
          ]
        };
      }
      
      // Filter for Project Manager role: projects where pm_id matches logged-in user
      if (req.user.role === USER_ROLE.PROJECT_MANAGER) {
        roleWhereCondition = { pm_id: req.user.id };
      }
    }

    // Total Open Projects (not Complete)
    const totalOpenProjects = await Project.count({
      where: {
        ...roleWhereCondition,
        status: { [Op.ne]: 'Complete' }
      },
      include: roleInclude
    });

    // Projects completed in last 30 days (status Complete)
    const projectsCompletedLast30 = await Project.count({
      where: {
        ...roleWhereCondition,
        status: 'Complete',
        updated_at: { [Op.gte]: thirtyDaysAgo }
      },
      include: roleInclude
    });

    // Average time to complete (status Complete)
    const completedProjects = await Project.findAll({
      where: {
        ...roleWhereCondition,
        status: 'Complete'
      },
      attributes: ['start_date', 'updated_at'],
      include: roleInclude
    });

    let totalDuration = 0;
    completedProjects.forEach(p => {
      if (p.start_date && p.updated_at) {
        totalDuration += new Date(p.updated_at) - new Date(p.start_date);
      }
    });
    const avgTime = completedProjects.length
      ? msToTime(totalDuration / completedProjects.length)
      : '0D 0H';

    // Projects older than 48 hours (not Complete)
    const projectsOlderThan48Hrs = await Project.count({
      where: {
        ...roleWhereCondition,
        start_date: { [Op.lte]: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Complete' }
      },
      include: roleInclude
    });

    // New Projects (New)
    const newProjects = await Project.findAll({
      where: {
        ...roleWhereCondition,
        status: { [Op.in]: ['New'] }
      },
      include: [
        ...roleInclude,
        { model: Customer, as: 'company', attributes: ['company_name', 'first_name', 'last_name'], required: false },
        { model: User, as: 'technician', attributes: ['first_name', 'last_name'], required: false },
        { model: User, as: 'technicians', attributes: ['id', 'first_name', 'last_name'], through: { attributes: [] }, required: false },
        { model: Report, as: "reports", attributes: ["id", "name"], required: false }
      ],
      order: [['start_date', 'DESC']]
    });
    
    // In Progress Projects (New or In Progress)
    const inProgress = await Project.findAll({
      where: {
        ...roleWhereCondition,
        status: { [Op.in]: ['In Progress'] }
      },
      include: [
        ...roleInclude,
        { model: Customer, as: 'company', attributes: ['company_name', 'first_name', 'last_name'], required: false },
        { model: User, as: 'technician', attributes: ['first_name', 'last_name'], required: false },
        { model: User, as: 'technicians', attributes: ['id', 'first_name', 'last_name'], through: { attributes: [] }, required: false },
        { model: Report, as: "reports", attributes: ["id", "name"], required: false }
      ],
      order: [['start_date', 'DESC']]
    });

    // Awaiting Review (PM Review)
    const awaitingReview = await Project.findAll({
      where: {
        ...roleWhereCondition,
        status: 'PM Review'
      },
      include: [
        ...roleInclude,
        { model: Customer, as: 'company', attributes: ['company_name', 'first_name', 'last_name'], required: false },
        { model: User, as: 'technician', attributes: ['first_name', 'last_name'], required: false },
        { model: User, as: 'technicians', attributes: ['id', 'first_name', 'last_name'], through: { attributes: [] }, required: false },
        { model: Report, as: "reports", attributes: ["id", "name"], required: false }
      ],
      order: [['updated_at', 'DESC']]
    });

    // --- Month-to-date (MTD) calculations ---
    // Current MTD: from 1st of this month to today
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Previous MTD: from 1st of last month to same day as today (e.g. May 1-4 if today is June 4)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonthMTD = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // 1. Total Open Projects (not Complete)
    const totalOpenProjectsMTD = await Project.count({
      where: {
        ...roleWhereCondition,
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfThisMonth, now] }
      },
      include: roleInclude
    });
    const totalOpenProjectsPrevMTD = await Project.count({
      where: {
        ...roleWhereCondition,
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      },
      include: roleInclude
    });
    const totalOpenProjectsChange = totalOpenProjectsPrevMTD === 0 ? null : ((totalOpenProjectsMTD - totalOpenProjectsPrevMTD) / totalOpenProjectsPrevMTD * 100).toFixed(1);

    // 2. Projects Completed (status Complete)
    const projectsCompletedMTD = await Project.count({
      where: {
        ...roleWhereCondition,
        status: 'Complete',
        updated_at: { [Op.between]: [startOfThisMonth, now] }
      },
      include: roleInclude
    });
    const projectsCompletedPrevMTD = await Project.count({
      where: {
        ...roleWhereCondition,
        status: 'Complete',
        updated_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      },
      include: roleInclude
    });
    const projectsCompletedChange = projectsCompletedPrevMTD === 0 ? null : ((projectsCompletedMTD - projectsCompletedPrevMTD) / projectsCompletedPrevMTD * 100).toFixed(1);

    // 3. Avg. Time To Complete (status Complete)
    const completedProjectsMTD = await Project.findAll({
      where: {
        ...roleWhereCondition,
        status: 'Complete',
        updated_at: { [Op.between]: [startOfThisMonth, now] }
      },
      attributes: ['start_date', 'updated_at'],
      include: roleInclude
    });
    let totalDurationMTD = 0;
    completedProjectsMTD.forEach(p => {
      if (p.start_date && p.updated_at) {
        totalDurationMTD += new Date(p.updated_at) - new Date(p.start_date);
      }
    });
    const avgTimeMTD = completedProjectsMTD.length ? (totalDurationMTD / completedProjectsMTD.length) : 0;

    const completedProjectsPrevMTD = await Project.findAll({
      where: {
        ...roleWhereCondition,
        status: 'Complete',
        updated_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      },
      attributes: ['start_date', 'updated_at'],
      include: roleInclude
    });
    let totalDurationPrevMTD = 0;
    completedProjectsPrevMTD.forEach(p => {
      if (p.start_date && p.updated_at) {
        totalDurationPrevMTD += new Date(p.updated_at) - new Date(p.start_date);
      }
    });
    const avgTimePrevMTD = completedProjectsPrevMTD.length ? (totalDurationPrevMTD / completedProjectsPrevMTD.length) : 0;
    const avgTimeChange = avgTimePrevMTD === 0 ? null : (((avgTimeMTD - avgTimePrevMTD) / avgTimePrevMTD) * 100).toFixed(1);

    // 4. Projects Older Than 48hrs (not Complete)
    const projectsOlderThan48HrsMTD = await Project.count({
      where: {
        ...roleWhereCondition,
        start_date: { [Op.lte]: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfThisMonth, now] }
      },
      include: roleInclude
    });
    const projectsOlderThan48HrsPrevMTD = await Project.count({
      where: {
        ...roleWhereCondition,
        start_date: { [Op.lte]: new Date(endOfLastMonthMTD.getTime() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      },
      include: roleInclude
    });
    const projectsOlderThan48HrsChange = projectsOlderThan48HrsPrevMTD === 0 ? null : ((projectsOlderThan48HrsMTD - projectsOlderThan48HrsPrevMTD) / projectsOlderThan48HrsPrevMTD * 100).toFixed(1);

    return res.status(OK).json({
      code: OK,
      message: 'Dashboard summary fetched successfully',
      success: true,
      data: {
        overview: {
          totalOpenProjects,
          projectsCompletedLast30Days: projectsCompletedLast30,
          avgTimeToComplete: avgTime,
          projectsOlderThan48Hrs,
          mtd: {
            totalOpenProjectsChange,
            projectsCompletedChange,
            avgTimeChange,
            projectsOlderThan48HrsChange
          }
        },
        inProgress: inProgress.map(p => ({
          id: p.id,
          projectName: p.name,
          company: p.company?.company_name || 'No Company',
          startDate: p.start_date,
          technician: p.technician?.first_name + ' ' + p.technician?.last_name,
          technicians: (p.technicians || []).map(t => `${t.first_name} ${t.last_name}`),
          status: p.status,
          reports: p.reports.map(r => ({
            id: r.id,
            reportName: r.name,
            reportDate: r.date_of_assessment
          }))
        })),
        newProjects: newProjects.map(p => ({
          id: p.id,
          projectName: p.name,
          company: p.company?.company_name || 'No Company',
          startDate: p.start_date,
          technician: p.technician?.first_name+ ' ' + p.technician?.last_name,
          technicians: (p.technicians || []).map(t => `${t.first_name} ${t.last_name}`),
          status: p.status,
          reports: p.reports.map(r => ({
            id: r.id,
            reportName: r.name,
            reportDate: r.date_of_assessment
          }))
        })),
        awaitingReview: awaitingReview.map(p => ({
          id: p.id,
          projectName: p.name,
          company: p.company?.company_name || 'No Company',
          completedDate: p.updated_at,
          reports: p.reports.map(r => ({
            id: r.id,
            reportName: r.name,
            reportDate: r.date_of_assessment
          }))
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};