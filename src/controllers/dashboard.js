const { Project, Customer, User } = require('../models');
const { Op } = require('sequelize');
const { msToTime } = require('../utils/msToTime');
const { OK } = require('../helpers/constants');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Total Open Projects (not Complete)
    const totalOpenProjects = await Project.count({
      where: { status: { [Op.ne]: 'Complete' } }
    });

    // Projects completed in last 30 days (status Complete)
    const projectsCompletedLast30 = await Project.count({
      where: {
        status: 'Complete',
        updated_at: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Average time to complete (status Complete)
    const completedProjects = await Project.findAll({
      where: { status: 'Complete' },
      attributes: ['start_date', 'updated_at']
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
        start_date: { [Op.lte]: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Complete' }
      }
    });

    // New Projects (New)
    const newProjects = await Project.findAll({
      where: {
        status: { [Op.in]: ['New'] }
      },
      include: [
        { model: Customer, as: 'company', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'technician', attributes: ['first_name', 'last_name'] }
      ],
      order: [['start_date', 'DESC']]
    });
    
    // In Progress Projects (New or In Progress)
    const inProgress = await Project.findAll({
      where: {
        status: { [Op.in]: ['In Progress'] }
      },
      include: [
        { model: Customer, as: 'company', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'technician', attributes: ['first_name', 'last_name'] }
      ],
      order: [['start_date', 'DESC']]
    });

    // Awaiting Review (PM Review)
    const awaitingReview = await Project.findAll({
      where: {
        status: 'PM Review'
      },
      include: [
        { model: Customer, as: 'company', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'technician', attributes: ['first_name', 'last_name'] }
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
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfThisMonth, now] }
      }
    });
    const totalOpenProjectsPrevMTD = await Project.count({
      where: {
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      }
    });
    const totalOpenProjectsChange = totalOpenProjectsPrevMTD === 0 ? null : ((totalOpenProjectsMTD - totalOpenProjectsPrevMTD) / totalOpenProjectsPrevMTD * 100).toFixed(1);

    // 2. Projects Completed (status Complete)
    const projectsCompletedMTD = await Project.count({
      where: {
        status: 'Complete',
        updated_at: { [Op.between]: [startOfThisMonth, now] }
      }
    });
    const projectsCompletedPrevMTD = await Project.count({
      where: {
        status: 'Complete',
        updated_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      }
    });
    const projectsCompletedChange = projectsCompletedPrevMTD === 0 ? null : ((projectsCompletedMTD - projectsCompletedPrevMTD) / projectsCompletedPrevMTD * 100).toFixed(1);

    // 3. Avg. Time To Complete (status Complete)
    const completedProjectsMTD = await Project.findAll({
      where: {
        status: 'Complete',
        updated_at: { [Op.between]: [startOfThisMonth, now] }
      },
      attributes: ['start_date', 'updated_at']
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
        status: 'Complete',
        updated_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      },
      attributes: ['start_date', 'updated_at']
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
        start_date: { [Op.lte]: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfThisMonth, now] }
      }
    });
    const projectsOlderThan48HrsPrevMTD = await Project.count({
      where: {
        start_date: { [Op.lte]: new Date(endOfLastMonthMTD.getTime() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Complete' },
        created_at: { [Op.between]: [startOfLastMonth, endOfLastMonthMTD] }
      }
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
          projectName: p.name,
          company: p.company.first_name + ' ' + p.company.last_name,
          startDate: p.start_date,
          technician: `${p.technician?.first_name}`,
          status: p.status
        })),
        newProjects: newProjects.map(p => ({
          projectName: p.name,
          company: p.company.first_name + ' ' + p.company.last_name,
          startDate: p.start_date,
          technician: `${p.technician?.first_name}`,
          status: p.status
        })),
        awaitingReview: awaitingReview.map(p => ({
          projectName: p.name,
          company: p.company.first_name + ' ' + p.company.last_name,
          completedDate: p.updated_at
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};