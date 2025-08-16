const { validationResult } = require('express-validator');
const loanService = require('../services/loanService');

class LoanController {
    async createLoan(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const loan = await loanService.createLoan(req.body);

            res.status(201).json({
                success: true,
                message: 'Loan created successfully',
                data: loan
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllLoans(req, res) {
        try {
            const filters = {
                financeYearId: req.query.financeYearId,
                allowTopup: req.query.allowTopup
            };

            const loans = await loanService.getAllLoans(filters);

            res.status(200).json({
                success: true,
                message: 'Loans retrieved successfully',
                data: loans
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLoanById(req, res) {
        try {
            const loan = await loanService.getLoanById(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Loan retrieved successfully',
                data: loan
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateLoan(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const loan = await loanService.updateLoan(req.params.id, req.body);

            res.status(200).json({
                success: true,
                message: 'Loan updated successfully',
                data: loan
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteLoan(req, res) {
        try {
            await loanService.deleteLoan(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Loan deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLoansByFinancialYear(req, res) {
        try {
            const loans = await loanService.getLoansByFinancialYear(req.params.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Loans retrieved successfully',
                data: loans
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLoansWithTopup(req, res) {
        try {
            const loans = await loanService.getLoansWithTopup();

            res.status(200).json({
                success: true,
                message: 'Loans with topup retrieved successfully',
                data: loans
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLoansWithoutTopup(req, res) {
        try {
            const loans = await loanService.getLoansWithoutTopup();

            res.status(200).json({
                success: true,
                message: 'Loans without topup retrieved successfully',
                data: loans
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async enableTopup(req, res) {
        try {
            const loan = await loanService.enableTopup(req.params.id, req.body.topupAmount);

            res.status(200).json({
                success: true,
                message: 'Topup enabled successfully',
                data: loan
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async disableTopup(req, res) {
        try {
            const loan = await loanService.disableTopup(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Topup disabled successfully',
                data: loan
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateLoanAmount(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const loan = await loanService.updateLoanAmount(req.params.id, req.body.loanAmount);

            res.status(200).json({
                success: true,
                message: 'Loan amount updated successfully',
                data: loan
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateTopupAmount(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const loan = await loanService.updateTopupAmount(req.params.id, req.body.topupAmount);

            res.status(200).json({
                success: true,
                message: 'Topup amount updated successfully',
                data: loan
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLoanStats(req, res) {
        try {
            const stats = await loanService.getLoanStats(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Loan statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLoansWithSummary(req, res) {
        try {
            const loans = await loanService.getLoansWithSummary(req.query.financeYearId);

            res.status(200).json({
                success: true,
                message: 'Loans with summary retrieved successfully',
                data: loans
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new LoanController(); 