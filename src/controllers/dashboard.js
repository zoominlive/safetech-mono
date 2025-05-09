const { Project, Customer, User } = require('../models');
const { Op } = require('sequelize');
const { msToTime } = require('../utils/msToTime');
const { OK } = require('../helpers/constants');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Total Open Projects
    const totalOpenProjects = await Project.count({
      where: { status: { [Op.ne]: 'Completed' } }
    });

    // Projects completed in last 30 days
    const projectsCompletedLast30 = await Project.count({
      where: {
        status: 'Completed',
        updated_at: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Average time to complete
    const completedProjects = await Project.findAll({
      where: { status: 'Completed' },
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

    // Projects older than 48 hours
    const projectsOlderThan48Hrs = await Project.count({
      where: {
        start_date: { [Op.lte]: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        status: { [Op.ne]: 'Completed' }
      }
    });

    // In Progress Projects
    const inProgress = await Project.findAll({
      where: {
        status: { [Op.in]: ['New', 'In Progress'] }
      },
      include: [
        { model: Customer, as: 'company', attributes: ['name'] },
        { model: User, as: 'technician', attributes: ['name'] }
      ],
      order: [['start_date', 'DESC']]
    });

    const awaitingReview = await Project.findAll({
      where: {
        status: 'Completed',
        pm_id: { [Op.ne]: null }
      },
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
          company: p.company.name,
          startDate: p.start_date,
          technician: `${p.technician?.name}`,
          status: p.status
        })),
        awaitingReview: awaitingReview.map(p => ({
          projectName: p.name,
          company: p.Customer?.company_name,
          completedDate: p.updated_at
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};