import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export const uploadHandler = upload.single('policyDocument');

export const analyzePolicyDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // In production, you would:
    // 1. Extract text from PDF using OCR (pdf-parse, tesseract.js, or Google Vision API)
    // 2. Send to Gemini AI for structured extraction
    // 3. Return parsed policy data

    // For now, return mock response
    const mockParsedPolicy = {
      policyNumber: 'AUTO-2024-' + Math.floor(Math.random() * 100000),
      insurer: 'Sample Insurance Co.',
      policyType: 'auto',
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      premiumAmount: 1200,
      coverageAmount: 100000,
      deductible: 500,
      policyholder: {
        firstName: 'John',
        lastName: 'Doe'
      },
      coverages: [
        { type: 'Liability', limit: 100000, deductible: 0 },
        { type: 'Collision', limit: 50000, deductible: 500 }
      ],
      gapAnalysis: {
        risks: ['Underinsured motorist coverage missing', 'Low liability limits'],
        recommendations: ['Add underinsured motorist coverage', 'Increase liability limits to $250,000']
      }
    };

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      data: mockParsedPolicy
    });
  } catch (error) {
    next(error);
  }
};

export const getGapAnalysis = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Get customer policies
    const policies = await query(
      'SELECT * FROM policies WHERE customer_id = ? AND status = "active"',
      [customerId]
    );

    // Perform gap analysis
    const gaps = {
      missingCoverages: [],
      lowLimits: [],
      recommendations: []
    };

    // Simple gap analysis logic (expand in production)
    const policyTypes = policies.map(p => p.policy_type);
    if (!policyTypes.includes('life')) {
      gaps.missingCoverages.push('Life Insurance');
    }
    if (!policyTypes.includes('umbrella')) {
      gaps.recommendations.push('Consider umbrella policy for additional liability protection');
    }

    res.status(200).json({ success: true, data: gaps });
  } catch (error) {
    next(error);
  }
};
