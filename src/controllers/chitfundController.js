const { validationResult } = require('express-validator');
const chitfundService = require('../services/chitfundService');

class ChitfundController {
    async createChitfund(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const chitfund = await chitfundService.createChitfund(req.body);

            res.status(201).json({
                success: true,
                message: 'Chitfund created successfully',
                data: chitfund
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllChitfunds(req, res) {
        try {
            const filters = {
                financeYearId: req.query.financeYearId,
                chitStatus: req.query.chitStatus
            };

            const chitfunds = await chitfundService.getAllChitfunds(filters);

            res.status(200).json({
                success: true,
                message: 'Chitfunds retrieved successfully',
                data: chitfunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChitfundById(req, res) {
        try {
            const chitfund = await chitfundService.getChitfundById(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Chitfund retrieved successfully',
                data: chitfund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateChitfund(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const chitfund = await chitfundService.updateChitfund(req.params.id, req.body);

            res.status(200).json({
                success: true,
                message: 'Chitfund updated successfully',
                data: chitfund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteChitfund(req, res) {
        try {
            await chitfundService.deleteChitfund(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Chitfund deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChitfundsByFinancialYear(req, res) {
        try {
            const chitfunds = await chitfundService.getChitfundsByFinancialYear(req.params.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Chitfunds retrieved successfully',
                data: chitfunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChitfundsByStatus(req, res) {
        try {
            const chitfunds = await chitfundService.getChitfundsByStatus(req.params.status);

            res.status(200).json({
                success: true,
                message: 'Chitfunds retrieved successfully',
                data: chitfunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async addStaffToChitfund(req, res) {
        try {
            const chitfund = await chitfundService.addStaffToChitfund(req.params.id, req.params.staffId);

            res.status(200).json({
                success: true,
                message: 'Staff member added to chitfund successfully',
                data: chitfund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async removeStaffFromChitfund(req, res) {
        try {
            const chitfund = await chitfundService.removeStaffFromChitfund(req.params.id, req.params.staffId);

            res.status(200).json({
                success: true,
                message: 'Staff member removed from chitfund successfully',
                data: chitfund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async completeChitfund(req, res) {
        try {
            const chitfund = await chitfundService.completeChitfund(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Chitfund completed successfully',
                data: chitfund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChitfundStats(req, res) {
        try {
            const stats = await chitfundService.getChitfundStats(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Chitfund statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getChitfundsWithSummary(req, res) {
        try {
            const chitfunds = await chitfundService.getChitfundsWithSummary(req.query.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Chitfunds with summary retrieved successfully',
                data: chitfunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ChitfundController(); 