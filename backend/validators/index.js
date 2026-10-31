/**
 * Centralized Zod Validation Schemas for DS Financial API
 * Ensures type safety and input validation across all endpoints
 */
const { z } = require('zod');

// ── Authentication ─────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const emailSchema = z.string().email('Invalid email format');

const fingerprintSchema = z.object({
  visitorId: z.string().optional(),
  fingerprintHash: z.string().optional()
}).optional();

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  aadhar: z.string().regex(/^\d{12}$/, 'Invalid Aadhaar format').optional().or(z.literal('')),
  fingerprint: fingerprintSchema
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  fingerprint: fingerprintSchema
});

const faceRegisterSchema = z.object({
  descriptor: z.array(z.number()).length(128, 'Face descriptor must have exactly 128 elements')
});

const faceVerifySchema = z.object({
  descriptor: z.array(z.number()).min(1, 'Face descriptor is required'),
  email: emailSchema.optional()
});

const demoLoginSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required'),
  fingerprint: fingerprintSchema
});

const trustDeviceSchema = z.object({
  deviceId: z.union([z.string(), z.number()]).refine(v => v !== '', 'deviceId is required'),
  trusted: z.boolean().optional()
});

// ── GST Compliance ─────────────────────────────────────────────
const gstinSchema = z
  .string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, 'Invalid GSTIN format');

const gstinValidateSchema = z.object({
  gstin: gstinSchema,
  context: z.object({}).passthrough().optional()
});

const purchaseRecordSchema = z.object({
  supplier_gstin: gstinSchema.optional(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional(),
  taxable_value: z.number().positive().optional(),
  igst: z.number().min(0).optional(),
  cgst: z.number().min(0).optional(),
  sgst: z.number().min(0).optional(),
  total: z.number().positive().optional()
});

const itcRiskSchema = z.object({
  purchaseData: z.array(purchaseRecordSchema).min(1, 'purchaseData is required'),
  gstr2bData: z.array(z.object({}).passthrough()).optional()
});

const shellCompanySchema = z.object({
  invoiceData: z.array(z.object({}).passthrough()).min(1, 'invoiceData is required')
});

const verifyRatesSchema = z.object({
  invoices: z.array(z.object({}).passthrough()).min(1, 'invoices is required')
});

const comprehensiveAnalysisSchema = z.object({
  gstin: gstinSchema.optional(),
  purchaseData: z.array(purchaseRecordSchema).optional(),
  invoices: z.array(z.object({}).passthrough()).optional()
});

// ── Tax Optimization ───────────────────────────────────────────
const taxProfileSchema = z.object({
  income: z.number().positive('Income must be positive'),
  age: z.number().int().min(1).max(120).optional().default(35),
  gender: z.enum(['male', 'female', 'other']).optional().default('male'),
  employmentType: z.enum(['salaried', 'business', 'professional']).optional().default('salaried'),
  cityType: z.enum(['metro', 'non-metro']).optional().default('metro'),
  basicSalary: z.number().min(0).optional(),
  hraReceived: z.number().min(0).optional(),
  currentInvestments: z.number().min(0).optional().default(0),
  total80C: z.number().min(0).optional(),
  rent: z.number().min(0).optional().default(0),
  livingArrangement: z.enum(['rented', 'owned', 'company_provided']).optional().default('rented'),
  homeLoanInterest: z.number().min(0).optional().default(0),
  nps: z.number().min(0).optional().default(0),
  employerNPS: z.number().min(0).optional().default(0),
  healthInsuranceSelf: z.number().min(0).optional().default(0),
  healthInsuranceParents: z.number().min(0).optional().default(0),
  educationLoan: z.number().min(0).optional().default(0),
  donations: z.number().min(0).optional().default(0),
  taxRegime: z.enum(['auto', 'old', 'new']).optional().default('auto'),
  priority: z.enum(['savings', 'balanced', 'growth']).optional().default('balanced'),
  investmentHorizon: z.enum(['short', 'medium', 'long']).optional().default('medium')
});

const hraSchema = z.object({
  basicSalary: z.number().positive(),
  hraReceived: z.number().positive(),
  rentPaid: z.number().positive(),
  cityType: z.enum(['metro', 'non-metro']).optional().default('metro')
});

// ── AI Services ────────────────────────────────────────────────
const aiAskSchema = z.object({
  question: z.string().min(1, 'Question is required').max(8000),
  provider: z.enum(['openai', 'anthropic', 'groq', 'openrouter']).optional(),
  model: z.string().optional(),
  context: z.object({}).passthrough().optional()
});

const aiSummarizeSchema = z.object({
  document: z.string().min(1, 'Document is required'),
  maxLength: z.number().int().min(50).max(2000).optional().default(500)
});

const aiChatSchema = z.object({
  user_message: z.string().min(1, 'user_message is required'),
  model_snapshot: z.object({}).passthrough().optional(),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

const aiMemoSchema = z.object({
  model_snapshot: z.object({}).passthrough()
});

const guardianMessageSchema = z.object({
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  action: z.enum(['ALLOW', 'WARN', 'WARN_COOL_OFF', 'BLOCK']),
  factors: z.array(z.string()).min(1),
  amount: z.number().min(0).optional(),
  payee: z.string().optional()
});

// ── Banking ────────────────────────────────────────────────────
const createAccountSchema = z.object({
  accountType: z.enum(['savings', 'current', 'fixed_deposit', 'salary']),
  balance: z.number().min(0).optional().default(0),
  ifsc: z.string().optional(),
  branch: z.string().optional()
});

const createTransactionSchema = z.object({
  type: z.enum(['credit', 'debit', 'transfer', 'upi', 'neft', 'imps']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(200).optional(),
  toAccount: z.number().int().optional(),
  fromAccount: z.number().int().optional()
});

const createBeneficiarySchema = z.object({
  name: z.string().min(1, 'Beneficiary name is required').max(100),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  bankName: z.string().optional(),
  upiId: z.string().optional()
});

const createCardSchema = z.object({
  cardType: z.enum(['debit', 'credit', 'prepaid']).optional().default('debit'),
  limitDaily: z.number().min(0).optional().default(50000),
  limitMonthly: z.number().min(0).optional().default(500000)
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'frozen', 'closed', 'blocked', 'expired', 'paid', 'cancelled'])
});

const createBillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  frequency: z.enum(['monthly', 'quarterly', 'yearly', 'weekly']).optional().default('monthly')
});

const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional().default(0),
  deadline: z.string().optional(),
  goalType: z.string().optional()
});

const createLoanSchema = z.object({
  loanType: z.enum(['home', 'car', 'personal', 'education', 'business']),
  principalAmount: z.number().positive(),
  interestRate: z.number().min(0).max(100),
  tenureMonths: z.number().int().positive(),
  purpose: z.string().optional()
});

const createRecurringSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional().default('monthly'),
  category: z.string().optional(),
  accountId: z.number().int().optional(),
  beneficiaryId: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  nextExecution: z.string().optional()
});

const contributeSchema = z.object({
  amount: z.number().positive()
});

const createPaymentOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).optional().default('INR'),
  receipt: z.string().optional(),
  notes: z.object({}).passthrough().optional()
});

const verifyPaymentSchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
  payee: z.string().optional()
});

const createSubscriptionSchema = z.object({
  planId: z.string().min(1)
});

// ── Protection API ─────────────────────────────────────────────
const protectWealthSchema = z.object({
  user_id: z.string().optional(),
  amount: z.number().min(0).optional(),
  payee: z.string().optional(),
  visitor_id: z.string().optional(),
  fingerprint_hash: z.string().optional(),
  device_fingerprint: z.object({}).passthrough().optional(),
  seconds_since_login: z.number().min(0).optional().default(60),
  historical_avg_amount: z.number().min(0).optional(),
  otp_attempts: z.number().int().min(0).optional().default(0),
  retry_count: z.number().int().min(0).optional().default(0),
  is_first_time_investment: z.boolean().optional().default(false),
  behavioral_deviation: z.number().min(0).max(1).optional().default(0),
  graph_risk_bonus: z.number().min(0).optional().default(0),
  purpose: z.string().optional(),
  email: z.string().optional(),
  demo_scenario: z.enum(['low', 'medium', 'high']).optional(),
  user_id: z.string().optional()
});

// ── Account Aggregator ─────────────────────────────────────────
const createAaConsentSchema = z.object({
  bankName: z.string().min(1),
  accountMask: z.string().optional(),
  scopes: z.array(z.string()).optional()
});

// ── Export schemas ─────────────────────────────────────────────
module.exports = {
  registerSchema,
  loginSchema,
  faceRegisterSchema,
  faceVerifySchema,
  demoLoginSchema,
  trustDeviceSchema,
  gstinValidateSchema,
  itcRiskSchema,
  shellCompanySchema,
  verifyRatesSchema,
  comprehensiveAnalysisSchema,
  taxProfileSchema,
  hraSchema,
  aiAskSchema,
  aiSummarizeSchema,
  aiChatSchema,
  aiMemoSchema,
  guardianMessageSchema,
  createAccountSchema,
  createTransactionSchema,
  createBeneficiarySchema,
  createCardSchema,
  updateStatusSchema,
  createBillSchema,
  createGoalSchema,
  createLoanSchema,
  createRecurringSchema,
  contributeSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
  createSubscriptionSchema,
  protectWealthSchema,
  createAaConsentSchema
};
