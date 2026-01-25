/**
 * utils.js - VeriInsights 智析通 工具函數
 * 
 * 包含通用工具函數：XSS 保護、日期格式化、年齡計算等
 */

// ========================================
// XSS PROTECTION
// ========================================

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {*} text - Input text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ========================================
// DATE & TIME FUNCTIONS
// ========================================

/**
 * Format date string to Taiwan locale format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (YYYY/MM/DD)
 */
function formatDate(dateString) {
    if (!dateString) return '未標註';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date string
 * @returns {string} Age in years with unit
 */
function calculateAge(birthDate) {
    if (!birthDate) return '--';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age + ' 歲';
}

/**
 * Get numeric age from birth date (for filtering)
 * @param {string} birthDate - Birth date string
 * @returns {number|null} Age in years
 */
function getNumericAge(birthDate) {
    if (!birthDate) return null;
    const ageStr = calculateAge(birthDate);
    return parseInt(ageStr.replace(/[^0-9]/g, '')) || null;
}

// ========================================
// STRING FUNCTIONS
// ========================================

/**
 * Get initials from name (first character)
 * @param {string} name - Full name
 * @returns {string} First character uppercase
 */
function getInitials(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
}

/**
 * Translate gender code to Chinese
 * @param {string} gender - Gender code (male/female/other/unknown)
 * @returns {string} Chinese translation
 */
function translateGender(gender) {
    return GENDER_MAP[gender] || gender || '未標註';
}

// ========================================
// VALUE FORMATTING
// ========================================

/**
 * Format numeric values to appropriate decimal places
 * @param {*} value - Raw value
 * @param {string} unit - Unit string
 * @returns {string} Formatted value
 */
function formatValue(value, unit) {
    if (value === null || value === undefined || value === '--') return '--';
    if (typeof value === 'string') return value;

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Determine decimal places based on unit/magnitude
    if (unit === '%' || unit === 'bpm' || unit === '/min') {
        return Math.round(num).toString();
    } else if (unit === '°C' || unit === 'degC') {
        return num.toFixed(1);
    } else if (Math.abs(num) >= 100) {
        return num.toFixed(0);
    } else if (Math.abs(num) >= 10) {
        return num.toFixed(1);
    } else {
        return num.toFixed(2);
    }
}

// ========================================
// STATUS DETERMINATION
// ========================================

/**
 * Determine value status based on code and value
 * @param {string} code - LOINC code
 * @param {*} value - Display value
 * @param {string} valueConceptCode - Value concept code (for categorical values)
 * @param {number} numericValue - Raw numeric value
 * @returns {string} Status: 'normal', 'warning', or 'critical'
 */
function getValueStatus(code, value, valueConceptCode, numericValue) {
    // VeriSee DR - Diabetic Retinopathy
    if (VERISEE_DR.codes.includes(code) && valueConceptCode) {
        if (VERISEE_DR.referralCodes.includes(valueConceptCode)) {
            return 'critical';
        }
        return 'normal';
    }

    // VeriOsteo OP - T-score
    if (code === VERIOSTEO_OP.tScoreCode && numericValue !== undefined) {
        const tScore = parseFloat(numericValue);
        if (!isNaN(tScore) && tScore <= VERIOSTEO_OP.tScoreThreshold) {
            return 'critical';
        }
        return 'normal';
    }

    // VeriOsteo OP - Z-score
    if (code === VERIOSTEO_OP.zScoreCode && numericValue !== undefined) {
        const zScore = parseFloat(numericValue);
        if (!isNaN(zScore) && zScore <= VERIOSTEO_OP.zScoreThreshold) {
            return 'critical';
        }
        return 'normal';
    }

    // Standard reference ranges
    const range = REFERENCE_RANGES[code];
    if (!range || isNaN(value)) return 'normal';

    const numValue = parseFloat(value);
    if (numValue < range.low * 0.7 || numValue > range.high * 1.3) return 'critical';
    if (numValue < range.low || numValue > range.high) return 'warning';
    return 'normal';
}

/**
 * Get badge text based on status and special codes
 * @param {string} status - Status from getValueStatus
 * @param {string} code - LOINC code
 * @param {string} valueConceptCode - Value concept code
 * @param {number} numericValue - Raw numeric value
 * @returns {string} Badge display text
 */
function getBadgeText(status, code, valueConceptCode, numericValue) {
    // VeriSee DR - Diabetic Retinopathy
    if (VERISEE_DR.codes.includes(code)) {
        if (VERISEE_DR.referralCodes.includes(valueConceptCode)) {
            return BADGE_TEXT.referral;
        }
        return BADGE_TEXT.followUp;
    }

    // VeriOsteo OP - T-score
    if (code === VERIOSTEO_OP.tScoreCode && numericValue !== undefined) {
        const tScore = parseFloat(numericValue);
        if (!isNaN(tScore) && tScore <= VERIOSTEO_OP.tScoreThreshold) {
            return BADGE_TEXT.abnormal;
        }
        return BADGE_TEXT.noAbnormal;
    }

    // VeriOsteo OP - Z-score
    if (code === VERIOSTEO_OP.zScoreCode && numericValue !== undefined) {
        const zScore = parseFloat(numericValue);
        if (!isNaN(zScore) && zScore <= VERIOSTEO_OP.zScoreThreshold) {
            return BADGE_TEXT.abnormal;
        }
        return BADGE_TEXT.noAbnormal;
    }

    // Default badge text
    return BADGE_TEXT[status] || BADGE_TEXT.normal;
}

// ========================================
// UI FUNCTIONS
// ========================================

/**
 * Update current time display
 */
function updateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = now.toLocaleString('zh-TW', options);
    }
}

/**
 * Toggle JSON debug section visibility
 */
function toggleJson() {
    const content = document.getElementById('json-content');
    const toggle = document.getElementById('json-toggle');
    if (content) content.classList.toggle('open');
    if (toggle) toggle.classList.toggle('open');
}
