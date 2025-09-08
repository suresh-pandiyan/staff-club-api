const { validationResult } = require('express-validator');
const emergencyFundService = require('../services/emergencyFundService');

class EmergencyFundController {
    async createEmergencyFund(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const emergencyFund = await emergencyFundService.createEmergencyFund(req.body);
            res.status(201).json({
                success: true,
                message: 'Emergency fund created successfully',
                data: emergencyFund
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getEmergencyFundsByFinancialYear(req, res) {
        try {
            const emergencyFunds = await emergencyFundService.getAllEmergencyFunds(req.query);
            res.status(200).json({
                success: true,
                message: 'Emergency funds retrieved successfully',
                data: emergencyFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateEmergencyFund(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const emergencyFund = await emergencyFundService.updateEmergencyFund(req.params.id, req.body);

            res.status(200).json({
                success: true,
                message: 'Emergency fund updated successfully',
                data: emergencyFund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    async deleteEmergencyFund(req, res) {
        try {
            await emergencyFundService.deleteEmergencyFund(req.params.id);
            res.status(200).json(
                {
                    success: true,
                    message: 'Emergency fund deleted successfully'
                }
            );
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getEmergencyFundById(req, res) {
        try {
            const emergencyFund = await emergencyFundService.getEmergencyFundById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Emergency fund retrieved successfully',
                data: emergencyFund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getActiveEmergencyFunds(req, res) {
        try {
            const emergencyFunds = await emergencyFundService.getActiveEmergencyFunds();

            res.status(200).json({
                success: true,
                message: 'Active emergency funds retrieved successfully',
                data: emergencyFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async closeEmergencyFund(req, res) {
        try {
            const emergencyFund = await emergencyFundService.closeEmergencyFund(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Emergency fund closed successfully',
                data: emergencyFund
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getEmergencyFundStats(req, res) {
        try {
            const stats = await emergencyFundService.getEmergencyFundStats(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Emergency fund statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getEmergencyFundsWithSummary(req, res) {
        try {
            const emergencyFunds = await emergencyFundService.getEmergencyFundsWithSummary(req.query.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Emergency funds with summary retrieved successfully',
                data: emergencyFunds
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new EmergencyFundController(); 