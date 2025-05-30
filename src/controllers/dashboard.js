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

    return res.status(OK).json({
      code: OK,
      message: 'Dashboard summary fetched successfully',
      success: true,
      data: {
        overview: {
          totalOpenProjects,
          projectsCompletedLast30Days: projectsCompletedLast30,
          avgTimeToComplete: avgTime,
          projectsOlderThan48Hrs
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