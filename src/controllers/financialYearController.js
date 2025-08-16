const { validationResult } = require('express-validator');
const financialYearService = require('../services/financialYearService');

class FinancialYearController {
    async createFinancialYear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const financialYear = await financialYearService.createFinancialYear(req.body);

            res.status(201).json({
                success: true,
                message: 'Financial year created successfully',
                data: financialYear
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllFinancialYears(req, res) {
        try {
            const filters = {
                currentlyActive: req.query.currentlyActive
            };

            const financialYears = await financialYearService.getAllFinancialYears(filters);

            res.status(200).json({
                success: true,
                message: 'Financial years retrieved successfully',
                data: financialYears
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getFinancialYearById(req, res) {
        try {
            const financialYear = await financialYearService.getFinancialYearById(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Financial year retrieved successfully',
                data: financialYear
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateFinancialYear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const financialYear = await financialYearService.updateFinancialYear(req.params.id, req.body);

            res.status(200).json({
                success: true,
                message: 'Financial year updated successfully',
                data: financialYear
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteFinancialYear(req, res) {
        try {
            await financialYearService.deleteFinancialYear(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Financial year deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCurrentlyActiveFinancialYear(req, res) {
        try {
            const financialYear = await financialYearService.getCurrentlyActiveFinancialYear();

            res.status(200).json({
                success: true,
                message: 'Currently active financial year retrieved successfully',
                data: financialYear
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async setCurrentlyActiveFinancialYear(req, res) {
        try {
            const financialYear = await financialYearService.setCurrentlyActiveFinancialYear(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Financial year set as currently active successfully',
                data: financialYear
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getFinancialYearsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const financialYears = await financialYearService.getFinancialYearsByDateRange(startDate, endDate);

            res.status(200).json({
                success: true,
                message: 'Financial years retrieved successfully',
                data: financialYears
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getFinancialYearByDate(req, res) {
        try {
            const { date } = req.query;
            const financialYear = await financialYearService.getFinancialYearByDate(date);

            res.status(200).json({
                success: true,
                message: 'Financial year retrieved successfully',
                data: financialYear
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getFinancialYearStats(req, res) {
        try {
            const stats = await financialYearService.getFinancialYearStats(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Financial year statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getFinancialYearsWithStats(req, res) {
        try {
            const financialYears = await financialYearService.getFinancialYearsWithStats();

            res.status(200).json({
                success: true,
                message: 'Financial years with statistics retrieved successfully',
                data: financialYears
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new FinancialYearController(); 