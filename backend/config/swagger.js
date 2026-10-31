/**
 * DS Financial API — Comprehensive OpenAPI 3.0 Documentation
 * Patent-Protected Financial Intelligence Platform
 */
const swaggerDocumentation = {
  openapi: '3.0.3',
  info: {
    title: 'DS Financial API',
    version: '2.0.0',
    description: `# DS Financial API Platform

**India's first patent-protected AI-powered financial intelligence suite.**

## Key Capabilities
- **GST Compliance Suite** (PAT-001 to PAT-006): GSTIN validation, ITC risk scoring, shell company detection, rate verification, ITC recovery prediction
- **Multi-Regime Tax Optimizer** (PAT-004): Old vs New regime comparison, HRA, 80C, NPS optimization
- **AI Orchestrator** (PAT-007): Multi-provider AI (Gemini, Claude, GPT-4o) with failover, context-aware financial chat, document analysis
- **Financial Modeling**: DCF, Comps, LBO, M&A, WACC, Sensitivity analysis
- **SecureWealth Banking Suite**: Accounts, transactions, cards, bills, goals, assets, loans, recurring payments
- **KYC & Account Aggregator**: PAN/Aadhaar verification, Setu AA integration
- **Real-time Protection**: Fraud graph analysis, behavioral biometrics, OTP-based transaction verification`,
    contact: {
      name: 'DS Financial Solutions',
      url: 'https://dsfinancial.in',
      email: 'support@dsfinancial.in'
    },
    license: {
      name: 'Proprietary — Patent Pending',
      url: 'https://dsfinancial.in/patents'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local development'
    },
    {
      url: 'https://psb-securewealth-backend.onrender.com/api/v1',
      description: 'Production (Render)'
    }
  ],
  externalDocs: {
    description: 'API Demo Console',
    url: 'https://dsfinancial-47556.surge.sh/api-demo.html'
  },
  tags: [
    { name: 'Health', description: 'API health and status endpoints' },
    { name: 'Authentication', description: 'User registration, login, JWT management, device fingerprinting' },
    { name: 'GST Compliance', description: 'Patent-protected GST validation, ITC analysis, shell company detection (PAT-001 to PAT-006)' },
    { name: 'Tax Optimization', description: 'Multi-regime tax calculator, HRA, investment optimization (PAT-004)' },
    { name: 'AI Services', description: 'Multi-provider AI chat, document analysis, financial advisory (PAT-007)' },
    { name: 'Financial Modeling', description: 'DCF, scenario analysis, financial model management' },
    { name: 'Banking', description: 'Accounts, transactions, cards, bills, goals, loans, recurring payments' },
    { name: 'Payments', description: 'Razorpay integration, payment orders, webhooks' },
    { name: 'KYC', description: 'KYC verification, document upload' },
    { name: 'Account Aggregator', description: 'Setu AA integration, consent management' },
    { name: 'Admin', description: 'Admin dashboard, user management, system monitoring' },
    { name: 'Screener', description: 'Stock screener, company financials, peer comparison' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'API health check',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    version: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    patents: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', format: 'password', minLength: 8, example: 'Password123' },
                  name: { type: 'string', example: 'John Doe' },
                  phone: { type: 'string', example: '+919876543210' },
                  pan_number: { type: 'string', example: 'ABCDE1234F' },
                  fingerprint: { type: 'object', description: 'Device fingerprint for biometric auth' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'User already exists' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  fingerprint: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/face-verify': {
      post: {
        tags: ['Authentication'],
        summary: 'Biometric face login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['descriptor'],
                properties: {
                  descriptor: { type: 'array', items: { type: 'number' }, description: '128-element face descriptor array' },
                  email: { type: 'string', description: 'Optional email to narrow search' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Face login successful' },
          '401': { description: 'Face not recognized' }
        }
      }
    },
    '/gst/validate-gstin': {
      post: {
        tags: ['GST Compliance'],
        summary: 'Validate GSTIN with comprehensive risk analysis (PAT-001)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['gstin'],
                properties: {
                  gstin: { type: 'string', example: '29ABCDE1234F1Z5' },
                  context: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'GSTIN validation complete' }
        }
      }
    },
    '/gst/analyze-itc-risk': {
      post: {
        tags: ['GST Compliance'],
        summary: 'Analyze Input Tax Credit risks (PAT-002)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['purchaseData'],
                properties: {
                  purchaseData: { type: 'array', items: { type: 'object' } },
                  gstr2bData: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'ITC risk analysis complete' }
        }
      }
    },
    '/gst/detect-shell-companies': {
      post: {
        tags: ['GST Compliance'],
        summary: 'Detect shell company indicators (PAT-003)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['invoiceData'],
                properties: {
                  invoiceData: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Shell company analysis complete' }
        }
      }
    },
    '/tax/calculate-income-tax': {
      post: {
        tags: ['Tax Optimization'],
        summary: 'Calculate income tax under both regimes (PAT-004)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['income'],
                properties: {
                  income: { type: 'number', example: 1500000 },
                  age: { type: 'number', example: 35 },
                  employmentType: { type: 'string', enum: ['salaried', 'business', 'professional'] },
                  cityType: { type: 'string', enum: ['metro', 'non-metro'] },
                  currentInvestments: { type: 'number' },
                  hraReceived: { type: 'number' },
                  rent: { type: 'number' },
                  homeLoanInterest: { type: 'number' },
                  nps: { type: 'number' },
                  healthInsuranceSelf: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Tax calculation complete' }
        }
      }
    },
    '/ai/ask': {
      post: {
        tags: ['AI Services'],
        summary: 'Ask AI a financial question (PAT-007)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['question'],
                properties: {
                  question: { type: 'string', example: 'What is the tax saving under 80C?' },
                  provider: { type: 'string', enum: ['openai', 'anthropic', 'groq'] },
                  context: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'AI response' }
        }
      }
    },
    '/ai/chat': {
      post: {
        tags: ['AI Services'],
        summary: 'Context-aware AI chat about financial model',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['user_message'],
                properties: {
                  user_message: { type: 'string' },
                  model_snapshot: { type: 'object' },
                  conversation_history: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Chat response (JSON or SSE stream)' }
        }
      }
    },
    '/banking/accounts': {
      get: {
        tags: ['Banking'],
        summary: 'List user bank accounts',
        responses: {
          '200': { description: 'Accounts list' }
        }
      },
      post: {
        tags: ['Banking'],
        summary: 'Create a new bank account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountType'],
                properties: {
                  accountType: { type: 'string', enum: ['savings', 'current', 'fixed_deposit'] },
                  balance: { type: 'number' },
                  ifsc: { type: 'string' },
                  branch: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Account created' }
        }
      }
    },
    '/banking/transactions': {
      get: {
        tags: ['Banking'],
        summary: 'List transactions with filters',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string' } },
          { name: 'endDate', in: 'query', schema: { type: 'string' } },
          { name: 'accountId', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } }
        ],
        responses: {
          '200': { description: 'Transactions list' }
        }
      },
      post: {
        tags: ['Banking'],
        summary: 'Create a transaction (credit/debit/transfer/UPI/NEFT/IMPS)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'amount'],
                properties: {
                  type: { type: 'string', enum: ['credit', 'debit', 'transfer', 'upi', 'neft', 'imps'] },
                  amount: { type: 'number' },
                  description: { type: 'string' },
                  toAccount: { type: 'integer' },
                  fromAccount: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Transaction created' }
        }
      }
    },
    '/banking/dashboard': {
      get: {
        tags: ['Banking'],
        summary: 'Financial dashboard summary',
        responses: {
          '200': { description: 'Dashboard data' }
        }
      }
    },
    '/screener/search': {
      get: {
        tags: ['Screener'],
        summary: 'Search companies by name',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Search results' }
        }
      }
    },
    '/screener/company/{ticker}': {
      get: {
        tags: ['Screener'],
        summary: 'Full company financial data',
        parameters: [
          { name: 'ticker', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Company financials' }
        }
      }
    },
    '/screener/dcf-inputs/{ticker}': {
      get: {
        tags: ['Screener'],
        summary: 'DCF-ready model inputs for a company',
        parameters: [
          { name: 'ticker', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'DCF inputs' }
        }
      }
    },
    '/protect-wealth-action': {
      post: {
        tags: ['Protection'],
        summary: 'Evaluate wealth protection risk for a transaction',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user_id: { type: 'string' },
                  amount: { type: 'number' },
                  payee: { type: 'string' },
                  visitor_id: { type: 'string' },
                  fingerprint_hash: { type: 'string' },
                  seconds_since_login: { type: 'number' },
                  historical_avg_amount: { type: 'number' },
                  retry_count: { type: 'number' },
                  demo_scenario: { type: 'string', enum: ['low', 'medium', 'high'] }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Risk assessment' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Standard JWT authentication. Get token via /auth/login or /auth/register.'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Enterprise API key (coming soon)'
      },
      BYOKAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-BYOK-Key',
        description: 'Bring Your Own Key for AI providers. Format: provider:api_key'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          code: { type: 'string' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          patent: { type: 'string' },
          api_version: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          tier: { type: 'string', enum: ['free', 'premium', 'enterprise'] },
          createdAt: { type: 'string' },
          lastLogin: { type: 'string' }
        }
      },
      GSTINValidation: {
        type: 'object',
        properties: {
          gstin: { type: 'string' },
          isValid: { type: 'boolean' },
          stateCode: { type: 'string' },
          entityType: { type: 'string' },
          riskScore: { type: 'number' },
          riskLevel: { type: 'string' },
          checks: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  },
  security: [
    { BearerAuth: [] }
  ]
};

module.exports = swaggerDocumentation;
