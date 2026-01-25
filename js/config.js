/**
 * config.js - VeriInsights 智析通 設定檔
 * 
 * 包含 LOINC 代碼定義、閾值設定、狀態判斷規則
 */

// ========================================
// LOINC CODE DEFINITIONS
// ========================================

/**
 * VeriSee DR - Diabetic Retinopathy Severity Classification
 * LOINC: 71490-7 (Left eye), 71491-5 (Right eye)
 * 
 * Answer Codes:
 *   LA18643-9: No apparent retinopathy        → 定期追蹤 (normal)
 *   LA18644-7: Mild non-proliferative         → 定期追蹤 (normal)
 *   LA18645-4: Moderate non-proliferative     → 建議轉診 (critical)
 *   LA18646-2: Severe non-proliferative       → 建議轉診 (critical)
 *   LA18648-8: Proliferative retinopathy      → 建議轉診 (critical)
 */
const VERISEE_DR = {
    codes: ['71490-7', '71491-5'],
    referralCodes: ['LA18645-4', 'LA18646-2', 'LA18648-8'],
    followUpCodes: ['LA18643-9', 'LA18644-7']
};

/**
 * VeriOsteo OP - Bone Density Score Processing
 * 
 * Age-based Display Rules:
 *   T-score (38267-1): 適用於 ≥50 歲（含）患者
 *   Z-score (85394-5): 適用於 20~49 歲患者
 * 
 * Threshold Alerts:
 *   T-score ≤ -2.5 → 疑似異常 (critical)
 *   Z-score ≤ -2.0 → 疑似異常 (critical)
 */
const VERIOSTEO_OP = {
    codes: ['38267-1', '85394-5'],
    tScoreCode: '38267-1',
    zScoreCode: '85394-5',
    tScoreThreshold: -2.5,
    zScoreThreshold: -2.0,
    tScoreMinAge: 50,
    zScoreMinAge: 20,
    zScoreMaxAge: 49
};

// Vital Signs LOINC codes
const VITAL_CODES = [
    '8867-4',   // Heart rate
    '9279-1',   // Respiratory rate
    '8310-5',   // Body temperature
    '2708-6',   // Oxygen saturation
    '85354-9',  // Blood pressure panel
    '8480-6',   // Systolic BP
    '8462-4',   // Diastolic BP
    '29463-7',  // Body weight
    '8302-2',   // Body height
    '39156-5'   // BMI
];

// Laboratory LOINC codes
const LAB_CODES = [
    '2339-0',   // Glucose
    '718-7',    // Hemoglobin
    '6690-2',   // WBC
    '777-3',    // Platelet
    '2160-0',   // Creatinine
    '3094-0',   // BUN
    '1742-6',   // ALT
    '1920-8',   // AST
    '2093-3',   // Cholesterol
    '2571-8'    // Triglycerides
];

// Imaging LOINC codes
const IMAGING_CODES = [
    '18748-4',  // Diagnostic imaging study
    '18747-6',  // CT study
    '18746-8',  // MRI study
    '24725-9',  // X-Ray
    '30746-2',  // Ultrasound
    '24566-7',  // Mammography
    '36643-5',  // XR Chest
    '42148-7',  // US Abdomen
    '44136-0',  // PET scan
    '24558-4'   // MR Brain
];

// ========================================
// REFERENCE RANGES
// ========================================

const REFERENCE_RANGES = {
    '8867-4': { low: 60, high: 100 },      // Heart rate (bpm)
    '9279-1': { low: 12, high: 20 },       // Respiratory rate (/min)
    '8310-5': { low: 36.1, high: 37.2 },   // Body temperature (°C)
    '2708-6': { low: 95, high: 100 },      // Oxygen saturation (%)
    '8480-6': { low: 90, high: 140 },      // Systolic BP (mmHg)
    '8462-4': { low: 60, high: 90 },       // Diastolic BP (mmHg)
    '2339-0': { low: 70, high: 100 },      // Glucose (mg/dL)
    '718-7': { low: 12, high: 17 },        // Hemoglobin (g/dL)
    '6690-2': { low: 4, high: 11 },        // WBC (thousands)
    '777-3': { low: 150, high: 400 },      // Platelet (thousands)
    '2160-0': { low: 0.6, high: 1.2 }      // Creatinine (mg/dL)
};

// ========================================
// TRANSLATIONS
// ========================================

const GENDER_MAP = {
    'male': '男性',
    'female': '女性',
    'other': '其他',
    'unknown': '未知'
};

const BADGE_TEXT = {
    normal: '正常',
    warning: '偏離',
    critical: '異常',
    referral: '建議轉診',
    followUp: '定期追蹤',
    abnormal: '疑似異常',
    noAbnormal: '未發現明顯異常'
};
