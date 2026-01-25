/**
 * observations.js - VeriInsights 智析通 觀察資料模組
 * 
 * 包含 FHIR Observation 資料分類與渲染函數
 */

// ========================================
// OBSERVATION CATEGORIZATION
// ========================================

/**
 * Categorize observations by type and device
 * @param {Array} observations - Array of FHIR Observation entries
 * @param {Object} deviceMap - Map of device ID to device name
 * @param {number|null} patientAge - Patient age for filtering
 * @returns {Object} Categorized observations
 */
function categorizeObservations(observations, deviceMap = {}, patientAge = null) {
    const categories = {
        // vitalSigns: { title: '生命徵象', icon: '❤️', iconClass: 'vital', items: new Map() },
        // laboratory: { title: '實驗室檢驗', icon: '🔬', iconClass: 'lab', items: new Map() },
        // imaging: { title: '影像檢驗', icon: '📷', iconClass: 'imaging', items: new Map() },
        verisee: { title: 'VeriSee DR (Acer Medical)', icon: '👁️', iconClass: 'verisee', items: new Map() },
        veriosteo: { title: 'VeriOsteo OP (Acer Medical)', icon: '🦴', iconClass: 'veriosteo', items: new Map() },
        // other: { title: '其他觀察紀錄', icon: '📊', iconClass: 'other', items: new Map() }
    };

    // Sort by date descending to keep only the latest
    const sortedObs = [...observations].sort((a, b) => {
        const dateA = new Date(a.resource?.effectiveDateTime || 0);
        const dateB = new Date(b.resource?.effectiveDateTime || 0);
        return dateB - dateA;
    });

    sortedObs.forEach(obs => {
        if (!obs.resource) return;
        const resource = obs.resource;

        // Get all codes from coding array
        const allCodings = resource.code?.coding || [];
        const allCodes = allCodings.map(c => c.code).filter(Boolean);
        const primaryCoding = allCodings[0];
        const primaryCode = primaryCoding?.code || '';
        const name = primaryCoding?.display || resource.code?.text || '未知項目';

        let category = 'other';

        // Check device-based categorization
        const deviceRef = resource.device?.reference;
        if (deviceRef) {
            const deviceId = deviceRef.replace('Device/', '');
            const deviceName = deviceMap[deviceId];

            // Process VeriSee DR components
            if (deviceName === 'VeriSee DR' && resource.component) {
                processVeriSeeDR(resource.component, categories.verisee);
                return;
            }

            // Process VeriOsteo OP components
            if (deviceName === 'VeriOsteo OP' && resource.component) {
                processVeriOsteoOP(resource.component, categories.veriosteo, patientAge);
                return;
            }
        }

        /*
        // Standard categorization by LOINC codes
        if (category === 'other') {
            if (resource.category?.some(cat => cat.coding?.some(c => c.code === 'vital-signs')) || 
                allCodes.some(c => VITAL_CODES.includes(c))) {
                category = 'vitalSigns';
            } else if (resource.category?.some(cat => cat.coding?.some(c => c.code === 'laboratory')) || 
                       allCodes.some(c => LAB_CODES.includes(c))) {
                category = 'laboratory';
            } else if (resource.category?.some(cat => cat.coding?.some(c => c.code === 'imaging')) || 
                       allCodes.some(c => IMAGING_CODES.includes(c))) {
                category = 'imaging';
            }
        }
        */

        // Add to category (deduplicate by name)
        const itemKey = name + '_' + primaryCode;
        if (category !== 'other' && categories[category] && !categories[category].items.has(itemKey)) {
            const valueData = extractObservationValue(resource);
            categories[category].items.set(itemKey, {
                name: name,
                value: formatValue(valueData.value, valueData.unit),
                unit: valueData.unit,
                code: primaryCode,
                valueConceptCode: valueData.valueConceptCode
            });
        }
    });

    // Convert Maps to arrays for rendering
    return {
        // vitalSigns: { ...categories.vitalSigns, items: Array.from(categories.vitalSigns.items.values()) },
        // laboratory: { ...categories.laboratory, items: Array.from(categories.laboratory.items.values()) },
        // imaging: { ...categories.imaging, items: Array.from(categories.imaging.items.values()) },
        verisee: { ...categories.verisee, items: Array.from(categories.verisee.items.values()) },
        veriosteo: { ...categories.veriosteo, items: Array.from(categories.veriosteo.items.values()) },
        // other: { ...categories.other, items: Array.from(categories.other.items.values()) }
    };
}

/**
 * Process VeriSee DR components
 * @param {Array} components - Observation components
 * @param {Object} category - VeriSee category object
 */
function processVeriSeeDR(components, category) {
    components.forEach(comp => {
        const compCodes = comp.code?.coding?.map(c => c.code) || [];
        const matchingCode = compCodes.find(c => VERISEE_DR.codes.includes(c));

        if (matchingCode) {
            const compName = comp.code?.coding?.[0]?.display || comp.code?.text || '未知項目';
            const compValue = comp.valueCodeableConcept?.text ||
                comp.valueCodeableConcept?.coding?.[0]?.display ||
                comp.valueQuantity?.value?.toString() || '--';
            const compUnit = comp.valueQuantity?.unit || '';
            const compValueCode = comp.valueCodeableConcept?.coding?.[0]?.code || '';

            const itemKey = compName + '_' + matchingCode;
            if (!category.items.has(itemKey)) {
                category.items.set(itemKey, {
                    name: compName,
                    value: formatValue(compValue, compUnit),
                    unit: compUnit,
                    code: matchingCode,
                    valueConceptCode: compValueCode
                });
            }
        }
    });
}

/**
 * Process VeriOsteo OP components with age filtering
 * @param {Array} components - Observation components
 * @param {Object} category - VeriOsteo category object
 * @param {number|null} patientAge - Patient age for filtering
 */
function processVeriOsteoOP(components, category, patientAge) {
    components.forEach(comp => {
        const compCodes = comp.code?.coding?.map(c => c.code) || [];
        const matchingCode = compCodes.find(c => VERIOSTEO_OP.codes.includes(c));

        if (matchingCode) {
            // Age-based filtering
            if (patientAge !== null) {
                const isTScore = matchingCode === VERIOSTEO_OP.tScoreCode;
                const isZScore = matchingCode === VERIOSTEO_OP.zScoreCode;

                // T-score: only for age >= 50
                if (isTScore && patientAge < VERIOSTEO_OP.tScoreMinAge) return;

                // Z-score: only for age 20-49
                if (isZScore && (patientAge < VERIOSTEO_OP.zScoreMinAge ||
                    patientAge > VERIOSTEO_OP.zScoreMaxAge)) return;
            }

            const compName = comp.code?.coding?.[0]?.display || comp.code?.text || '未知項目';
            const rawNumericValue = comp.valueQuantity?.value;
            const compValue = comp.valueCodeableConcept?.text ||
                comp.valueCodeableConcept?.coding?.[0]?.display ||
                (rawNumericValue !== undefined ? rawNumericValue.toString() : '--');
            const compUnit = comp.valueQuantity?.unit || '';
            const compValueCode = comp.valueCodeableConcept?.coding?.[0]?.code || '';

            const itemKey = compName + '_' + matchingCode;
            if (!category.items.has(itemKey)) {
                category.items.set(itemKey, {
                    name: compName,
                    value: formatValue(compValue, compUnit),
                    unit: compUnit,
                    code: matchingCode,
                    valueConceptCode: compValueCode,
                    numericValue: rawNumericValue
                });
            }
        }
    });
}

/**
 * Extract value from FHIR Observation resource
 * @param {Object} resource - FHIR Observation resource
 * @returns {Object} { value, unit, valueConceptCode }
 */
function extractObservationValue(resource) {
    let value = '--';
    let unit = '';
    let valueConceptCode = '';

    if (resource.valueQuantity?.value !== undefined) {
        value = resource.valueQuantity.value;
        unit = resource.valueQuantity.unit || '';
    } else if (resource.valueCodeableConcept) {
        value = resource.valueCodeableConcept.text ||
            resource.valueCodeableConcept.coding?.[0]?.display || '--';
        valueConceptCode = resource.valueCodeableConcept.coding?.[0]?.code || '';
    } else if (resource.valueString) {
        value = resource.valueString;
    } else if (resource.valueInteger !== undefined) {
        value = resource.valueInteger;
    } else if (resource.valueBoolean !== undefined) {
        value = resource.valueBoolean ? '是' : '否';
    } else if (resource.interpretation?.[0]) {
        value = resource.interpretation[0].text ||
            resource.interpretation[0].coding?.[0]?.display || '--';
    }

    return { value, unit, valueConceptCode };
}

// ========================================
// OBSERVATION RENDERING
// ========================================

/**
 * Render observations by category
 * @param {Object} categories - Categorized observations
 * @returns {string} HTML string
 */
function renderObservations(categories) {
    let html = '<div class="results-container">';
    let hasData = false;

    for (const [key, category] of Object.entries(categories)) {
        if (category.items.length === 0) continue;
        hasData = true;

        html += `
            <div class="results-section">
                <div class="section-header">
                    <div class="section-icon ${category.iconClass}">${category.icon}</div>
                    <span class="section-title">${category.title}</span>
                    <span class="section-count">${category.items.length} 項</span>
                </div>
                <div class="result-list">
        `;

        category.items.forEach(item => {
            const status = getValueStatus(item.code, item.value, item.valueConceptCode, item.numericValue);
            const badgeText = getBadgeText(status, item.code, item.valueConceptCode, item.numericValue);

            html += `
                <div class="result-item">
                    <div class="result-name">
                        <span class="status-dot ${status}"></span>
                        <span>${escapeHtml(item.name)}</span>
                    </div>
                    <div class="result-value-container">
                        <span class="result-value">${escapeHtml(item.value)}</span>
                        <span class="result-unit">${escapeHtml(item.unit)}</span>
                        <span class="result-badge ${status}">${badgeText}</span>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
    }

    html += '</div>';

    if (!hasData) {
        html = `
            <div class="results-section">
                <div class="no-data">
                    <div class="no-data-icon">📭</div>
                    <p>目前沒有可顯示的檢查結果</p>
                </div>
            </div>
        `;
    }

    return html;
}
