const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Staff Club API',
            version: '1.0.0',
            description: 'A comprehensive API for Staff Club management system with employee data, authentication, and user management.',
            contact: {
                name: 'API Support',
                email: 'support@staffclub.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Development server'
            },
            {
                url: 'https://api.staffclub.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Employee: {
                    type: 'object',
                    required: ['employeeId', 'firstName', 'lastName', 'email', 'phone', 'password', 'address', 'designation', 'currentSalary', 'emergencyContact'],
                    properties: {
                        employeeId: {
                            type: 'string',
                            description: 'Unique employee identifier',
                            example: 'EMP001'
                        },
                        firstName: {
                            type: 'string',
                            description: 'Employee first name',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            description: 'Employee last name',
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Employee email address',
                            example: 'john.doe@company.com'
                        },
                        phone: {
                            type: 'string',
                            description: 'Employee phone number',
                            example: '+919876543210'
                        },
                        password: {
                            type: 'string',
                            description: 'Employee password (min 6 characters)',
                            example: 'password123'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin', 'moderator', 'manager', 'supervisor'],
                            default: 'user',
                            description: 'Employee role in the system'
                        },
                        type: {
                            type: 'string',
                            enum: ['full-time', 'part-time', 'contract', 'intern'],
                            default: 'full-time',
                            description: 'Employment type'
                        },
                        joinDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Date of joining',
                            example: '2024-01-15'
                        },
                        address: {
                            type: 'object',
                            required: ['street', 'city', 'state', 'zipCode'],
                            properties: {
                                street: {
                                    type: 'string',
                                    description: 'Street address',
                                    example: '123 Main Street'
                                },
                                city: {
                                    type: 'string',
                                    description: 'City name',
                                    example: 'Mumbai'
                                },
                                state: {
                                    type: 'string',
                                    description: 'State name',
                                    example: 'Maharashtra'
                                },
                                zipCode: {
                                    type: 'string',
                                    description: 'ZIP/Postal code',
                                    example: '400001'
                                },
                                country: {
                                    type: 'string',
                                    default: 'India',
                                    description: 'Country name',
                                    example: 'India'
                                }
                            }
                        },
                        designation: {
                            type: 'string',
                            description: 'Job designation/title',
                            example: 'Software Engineer'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'terminated', 'resigned', 'on-leave'],
                            default: 'active',
                            description: 'Employment status'
                        },
                        hasLoan: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether employee has an active loan'
                        },
                        hasChitfund: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether employee participates in chitfund'
                        },
                        currentSalary: {
                            type: 'number',
                            minimum: 0,
                            description: 'Current salary amount',
                            example: 50000
                        },
                        emergencyContact: {
                            type: 'object',
                            required: ['name', 'relationship', 'phone'],
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Emergency contact name',
                                    example: 'Jane Doe'
                                },
                                relationship: {
                                    type: 'string',
                                    description: 'Relationship to employee',
                                    example: 'Spouse'
                                },
                                phone: {
                                    type: 'string',
                                    description: 'Emergency contact phone',
                                    example: '+919876543211'
                                },
                                address: {
                                    type: 'string',
                                    description: 'Emergency contact address',
                                    example: '123 Main Street, Mumbai'
                                }
                            }
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'john.doe@company.com'
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                            example: 'password123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Login successful'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    $ref: '#/components/schemas/Employee'
                                },
                                token: {
                                    type: 'string',
                                    description: 'JWT token for authentication',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                }
                            }
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Validation failed'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        example: 'email'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Please provide a valid email'
                                    }
                                }
                            }
                        }
                    }
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Users retrieved successfully'
                        },
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Employee'
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: {
                                    type: 'integer',
                                    example: 1
                                },
                                limit: {
                                    type: 'integer',
                                    example: 10
                                },
                                total: {
                                    type: 'integer',
                                    example: 50
                                },
                                totalPages: {
                                    type: 'integer',
                                    example: 5
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js',
        './src/app.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 