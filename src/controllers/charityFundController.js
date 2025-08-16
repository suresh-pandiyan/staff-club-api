const { validationResult } = require('express-validator');
const charityFundService = require('../services/charityFundService');

class CharityFundController {
    async createCharityFund(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const charityFund = await charityFundService.createCharityFund(req.body);

            res.status(201).json({
                success: true,
                message: 'Charity fund created successfully',
                data: charityFund
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllCharityFunds(req, res) {
        try {
            const filters = {
                financeYearId: req.query.financeYearId,
                status: req.query.status
            };

            const charityFunds = await charityFundService.getAllCharityFunds(filters);

            res.status(200).json({
                success: true,
                message: 'Charity funds retrieved successfully',
                data: charityFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCharityFundById(req, res) {
        try {
            const charityFund = await charityFundService.getCharityFundById(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Charity fund retrieved successfully',
                data: charityFund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateCharityFund(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const charityFund = await charityFundService.updateCharityFund(req.params.id, req.body);

            res.status(200).json({
                success: true,
                message: 'Charity fund updated successfully',
                data: charityFund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteCharityFund(req, res) {
        try {
            await charityFundService.deleteCharityFund(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Charity fund deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCharityFundsByFinancialYear(req, res) {
        try {
            const charityFunds = await charityFundService.getCharityFundsByFinancialYear(req.params.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Charity funds retrieved successfully',
                data: charityFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getActiveCharityFunds(req, res) {
        try {
            const charityFunds = await charityFundService.getActiveCharityFunds();

            res.status(200).json({
                success: true,
                message: 'Active charity funds retrieved successfully',
                data: charityFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async closeCharityFund(req, res) {
        try {
            const charityFund = await charityFundService.closeCharityFund(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Charity fund closed successfully',
                data: charityFund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCharityFundStats(req, res) {
        try {
            const stats = await charityFundService.getCharityFundStats(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Charity fund statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCharityFundsWithSummary(req, res) {
        try {
            const charityFunds = await charityFundService.getCharityFundsWithSummary(req.query.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Charity funds with summary retrieved successfully',
                data: charityFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new CharityFundController(); 