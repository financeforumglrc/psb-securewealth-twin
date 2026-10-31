/**
 * HSN/SAC GST Rate Reference Data — SINGLE SOURCE OF TRUTH
 * DS Financial Solutions
 *
 * All GST rate lookups in the backend must consume this module
 * (see algorithms/taxRateErrorDetector.js). Frontend copies
 * (gst-black-mirror-enhanced.js, gst-tools.js) mirror this data and
 * carry a comment pointing here.
 *
 * Entry shape:
 *   rate          {number}  Headline GST rate (%) for the most common case.
 *   description   {string}  Human-readable description.
 *   category      {string}  Grouping label.
 *   effectiveFrom {string}  ISO date from which `rate` applies.
 *   priceTiers    {Array?}  Optional value-dependent rate tiers:
 *                           { maxPrice, rate, effectiveFrom, effectiveTo? }
 *                           (maxPrice: null = no upper bound).
 *   notes         {string?} Optional caveats / pending notifications.
 */
const HSN_RATE_DATA = {
    // Chapter 84 - Machinery
    '8471': { rate: 18, description: 'Computers, Laptops, Data Processing Machines', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8473': { rate: 18, description: 'Computer Parts & Accessories', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8443': { rate: 18, description: 'Printers, Photocopiers', category: 'Office Equipment', effectiveFrom: '2017-07-01' },
    '8471.30': { rate: 18, description: 'Portable Computers (Laptops)', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8471.41': { rate: 18, description: 'Desktop Computers', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8471.49': { rate: 18, description: 'Other Computers', category: 'Electronics', effectiveFrom: '2017-07-01' },

    // Chapter 85 - Electrical Equipment
    '8517': { rate: 18, description: 'Telephones, Smartphones', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8517.12': { rate: 18, description: 'Mobile Phones, Smartphones', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8528': { rate: 18, description: 'Monitors, TVs, Projectors', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8528.52': { rate: 18, description: 'Computer Monitors', category: 'Electronics', effectiveFrom: '2017-07-01' },
    '8504': { rate: 18, description: 'Transformers, UPS, Power Supplies', category: 'Electronics', effectiveFrom: '2017-07-01' },

    // Chapter 94 - Furniture
    '9401': { rate: 18, description: 'Seats, Chairs (Office/Home)', category: 'Furniture', effectiveFrom: '2017-07-01' },
    '9403': { rate: 18, description: 'Furniture (Other)', category: 'Furniture', effectiveFrom: '2017-07-01' },
    '9404': { rate: 18, description: 'Mattresses, Bedding', category: 'Furniture', effectiveFrom: '2017-07-01' },

    // Chapter 48 - Paper Products
    '4820': { rate: 12, description: 'Registers, Notebooks, Stationery', category: 'Stationery', effectiveFrom: '2017-07-01' },
    '4802': { rate: 12, description: 'Paper, Uncoated', category: 'Paper', effectiveFrom: '2017-07-01' },
    '4810': { rate: 12, description: 'Paper, Coated', category: 'Paper', effectiveFrom: '2017-07-01' },

    // Chapter 30 - Pharmaceuticals
    '3004': { rate: 12, description: 'Medicaments (General)', category: 'Pharma', effectiveFrom: '2017-07-01' },
    '3004.90': { rate: 5, description: 'Life-saving Drugs', category: 'Pharma', effectiveFrom: '2017-07-01' },
    '3002': { rate: 5, description: 'Vaccines, Blood Products', category: 'Pharma', effectiveFrom: '2017-07-01' },
    '3006': { rate: 12, description: 'Pharmaceutical Goods', category: 'Pharma', effectiveFrom: '2017-07-01' },

    // Chapter 22 - Beverages
    '2201': { rate: 0, description: 'Water (Natural, Not Aerated)', category: 'Beverages', effectiveFrom: '2017-07-01' },
    '2202': { rate: 28, description: 'Aerated Beverages, Soft Drinks', category: 'Beverages', effectiveFrom: '2017-07-01' },
    '2202.10': { rate: 28, description: 'Aerated Waters with Sugar', category: 'Beverages', effectiveFrom: '2017-07-01' },

    // Chapter 87 - Vehicles
    '8703': { rate: 28, description: 'Motor Cars, SUVs', category: 'Automobiles', effectiveFrom: '2017-07-01' },
    '8703.21': { rate: 28, description: 'Small Cars (<1200cc petrol)', category: 'Automobiles', effectiveFrom: '2017-07-01' },
    '8711': { rate: 28, description: 'Motorcycles, Scooters', category: 'Automobiles', effectiveFrom: '2017-07-01' },
    '8704': { rate: 28, description: 'Commercial Vehicles, Trucks', category: 'Automobiles', effectiveFrom: '2017-07-01' },

    // Services (SAC Codes)
    '9954': { rate: 18, description: 'Construction Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9954.11': { rate: 12, description: 'Affordable Housing Construction', category: 'Services', effectiveFrom: '2017-07-01' },
    '9963': {
        rate: 12,
        description: 'Hotel Accommodation (₹1001–₹7500/night)',
        category: 'Services',
        effectiveFrom: '2022-07-18',
        priceTiers: [
            // Rooms ≤ ₹1000/night were EXEMPT before 18 Jul 2022; taxed 12% thereafter
            { maxPrice: 1000, rate: 0, effectiveFrom: '2017-07-01', effectiveTo: '2022-07-17' },
            { maxPrice: 7500, rate: 12, effectiveFrom: '2022-07-18' },
            { maxPrice: null, rate: 18, effectiveFrom: '2017-07-01' }
        ],
        notes: '≤₹1000/night exempt pre-18-Jul-2022 (exemption withdrawn by Notif. 04/2022); ₹1001–₹7500 → 12%; >₹7500 → 18% (see 9963.10).'
    },
    '9963.10': { rate: 18, description: 'Hotel Accommodation (>₹7500/night)', category: 'Services', effectiveFrom: '2017-07-01' },
    '9971': { rate: 18, description: 'Financial Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9972': { rate: 18, description: 'Real Estate Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9973': { rate: 18, description: 'Leasing/Rental Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9983': { rate: 18, description: 'Professional Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9984': { rate: 18, description: 'Telecom Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9985': { rate: 18, description: 'Support Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9986': { rate: 18, description: 'Support Services (Manufacturing)', category: 'Services', effectiveFrom: '2017-07-01' },
    '9987': { rate: 5, description: 'Maintenance & Repair Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9988': { rate: 18, description: 'Manufacturing Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9991': { rate: 18, description: 'Public Administration Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9992': { rate: 0, description: 'Education Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9993': { rate: 0, description: 'Healthcare Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9995': { rate: 18, description: 'Recreational Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9996': { rate: 18, description: 'Personal Services', category: 'Services', effectiveFrom: '2017-07-01' },
    '9997': { rate: 18, description: 'Other Services', category: 'Services', effectiveFrom: '2017-07-01' },

    // Food Items
    '1001': { rate: 0, description: 'Wheat', category: 'Food', effectiveFrom: '2017-07-01' },
    '1006': { rate: 5, description: 'Rice (Branded)', category: 'Food', effectiveFrom: '2017-07-01' },
    '0402': { rate: 5, description: 'Milk Products', category: 'Food', effectiveFrom: '2017-07-01' },
    // 1905 split: bread is 0%; biscuits are 18% (do NOT lump them together)
    '1905': { rate: 0, description: 'Bread (All Types)', category: 'Food', effectiveFrom: '2017-07-01' },
    '1905.31': { rate: 18, description: 'Biscuits', category: 'Food', effectiveFrom: '2017-07-01' },
    '2106': { rate: 18, description: 'Food Preparations', category: 'Food', effectiveFrom: '2017-07-01' },

    // Textiles
    '5208': { rate: 5, description: 'Cotton Fabrics', category: 'Textiles', effectiveFrom: '2017-07-01' },
    // Apparel/garments: rate depends on sale value per piece.
    // ≤ ₹1000 → 5%, above → 12% (from 01 Jan 2022).
    // GST 2.0 (22 Sep 2025): 5% threshold raised from ₹1000 to ₹2500.
    '6101': {
        rate: 5,
        description: 'Readymade Garments (≤ ₹1000/piece)',
        category: 'Textiles',
        effectiveFrom: '2022-01-01',
        priceTiers: [
            { maxPrice: 1000, rate: 5, effectiveFrom: '2022-01-01' },
            { maxPrice: 2500, rate: 5, effectiveFrom: '2025-09-22' },
            { maxPrice: null, rate: 12, effectiveFrom: '2022-01-01' }
        ],
        notes: '5% up to ₹1000/piece (₹2500 from 22-Sep-2025); 12% above the threshold.'
    },
    '6109': {
        rate: 5,
        description: 'T-Shirts, Vests (≤ ₹1000/piece)',
        category: 'Textiles',
        effectiveFrom: '2022-01-01',
        priceTiers: [
            { maxPrice: 1000, rate: 5, effectiveFrom: '2022-01-01' },
            { maxPrice: 2500, rate: 5, effectiveFrom: '2025-09-22' },
            { maxPrice: null, rate: 12, effectiveFrom: '2022-01-01' }
        ],
        notes: '5% up to ₹1000/piece (₹2500 from 22-Sep-2025); 12% above the threshold.'
    },

    // Gold & Jewellery
    '7108': { rate: 3, description: 'Gold', category: 'Precious Metals', effectiveFrom: '2017-07-01' },
    '7113': { rate: 3, description: 'Gold Jewellery', category: 'Precious Metals', effectiveFrom: '2017-07-01' },
    '7117': { rate: 3, description: 'Imitation Jewellery', category: 'Precious Metals', effectiveFrom: '2017-07-01' }
};

module.exports = HSN_RATE_DATA;
