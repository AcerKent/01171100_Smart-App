        // ========================================
        // TIME UPDATE
        // ========================================
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
            document.getElementById('current-time').textContent = now.toLocaleString('zh-TW', options);
        }
        updateTime();
        setInterval(updateTime, 1000);

        // ========================================
        // JSON TOGGLE
        // ========================================
        function toggleJson() {
            const content = document.getElementById('json-content');
            const toggle = document.getElementById('json-toggle');
            content.classList.toggle('open');
            toggle.classList.toggle('open');
        }

        // ========================================
        // HELPER FUNCTIONS
        // ========================================

        // XSS Protection: Escape HTML special characters
        function escapeHtml(text) {
            if (text === null || text === undefined) return '';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }

        function translateGender(gender) {
            const map = { 'male': '男性', 'female': '女性', 'other': '其他', 'unknown': '未知' };
            return map[gender] || gender || '未標註';
        }

        function formatDate(dateString) {
            if (!dateString) return '未標註';
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }

        function calculateAge(birthDate) {
            if (!birthDate) return '--';
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
            return age + ' 歲';
        }

        function getInitials(name) {
            if (!name) return '?';
            return name.charAt(0).toUpperCase();
        }

        function getValueStatus(code, value, valueConceptCode, numericValue) {
            // VeriSee DR - Diabetic Retinopathy Severity Classification
            // LOINC: 71490-7 (Left eye), 71491-5 (Right eye)
            // Answer Codes:
            //   LA18643-9: No apparent retinopathy        → 定期追蹤 (normal)
            //   LA18644-7: Mild non-proliferative         → 定期追蹤 (normal)
            //   LA18645-4: Moderate non-proliferative     → 建議轉診 (critical)
            //   LA18646-2: Severe non-proliferative       → 建議轉診 (critical)
            //   LA18648-8: Proliferative retinopathy      → 建議轉診 (critical)
            const drCodes = ['71490-7', '71491-5'];
            const referralCodes = ['LA18645-4', 'LA18646-2', 'LA18648-8'];
            const followUpCodes = ['LA18643-9', 'LA18644-7'];

            if (drCodes.includes(code) && valueConceptCode) {
                if (referralCodes.includes(valueConceptCode)) {
                    return 'critical'; // Recommend referral
                } else {
                    return 'normal'; // Regular follow-up
                }
            }

            // VeriOsteo OP - T-score and Z-score thresholds
            // 38267-1 = T-score, threshold <= -2.5 → critical
            // 85394-5 = Z-score, threshold <= -2.0 → critical
            if (code === '38267-1' && numericValue !== undefined) {
                const tScore = parseFloat(numericValue);
                if (!isNaN(tScore) && tScore <= -2.5) {
                    return 'critical';
                }
                return 'normal';
            }

            if (code === '85394-5' && numericValue !== undefined) {
                const zScore = parseFloat(numericValue);
                if (!isNaN(zScore) && zScore <= -2.0) {
                    return 'critical';
                }
                return 'normal';
            }

            const ranges = {
                '8867-4': { low: 60, high: 100 },      // Heart rate
                '9279-1': { low: 12, high: 20 },       // Respiratory rate
                '8310-5': { low: 36.1, high: 37.2 },   // Body temperature
                '2708-6': { low: 95, high: 100 },      // Oxygen saturation
                '8480-6': { low: 90, high: 140 },      // Systolic BP
                '8462-4': { low: 60, high: 90 },       // Diastolic BP
                '2339-0': { low: 70, high: 100 },      // Glucose
                '718-7': { low: 12, high: 17 },        // Hemoglobin
                '6690-2': { low: 4, high: 11 },        // WBC (thousands)
                '777-3': { low: 150, high: 400 },      // Platelet (thousands)
                '2160-0': { low: 0.6, high: 1.2 },     // Creatinine
            };

            const range = ranges[code];
            if (!range || isNaN(value)) return 'normal';

            const numValue = parseFloat(value);
            if (numValue < range.low * 0.7 || numValue > range.high * 1.3) return 'critical';
            if (numValue < range.low || numValue > range.high) return 'warning';
            return 'normal';
        }

        // Get badge text based on status and special codes
        function getBadgeText(status, code, valueConceptCode, numericValue) {
            // VeriSee DR - Diabetic Retinopathy Severity Classification
            // LOINC: 71490-7 (Left eye), 71491-5 (Right eye)
            // Answer Codes:
            //   LA18643-9: No apparent retinopathy        → 定期追蹤
            //   LA18644-7: Mild non-proliferative         → 定期追蹤
            //   LA18645-4: Moderate non-proliferative     → 建議轉診
            //   LA18646-2: Severe non-proliferative       → 建議轉診
            //   LA18648-8: Proliferative retinopathy      → 建議轉診
            const drCodes = ['71490-7', '71491-5'];
            const referralCodes = ['LA18645-4', 'LA18646-2', 'LA18648-8'];
            const followUpCodes = ['LA18643-9', 'LA18644-7'];

            if (drCodes.includes(code)) {
                if (referralCodes.includes(valueConceptCode)) {
                    return '建議轉診';
                } else {
                    return '定期追蹤';
                }
            }

            // VeriOsteo OP - Bone density score thresholds
            // 38267-1 = T-score, threshold <= -2.5
            // 85394-5 = Z-score, threshold <= -2.0
            if (code === '38267-1' && numericValue !== undefined) {
                const tScore = parseFloat(numericValue);
                if (!isNaN(tScore) && tScore <= -2.5) {
                    return '疑似異常';
                } else {
                    return '未發現明顯異常';
                }
            }

            if (code === '85394-5' && numericValue !== undefined) {
                const zScore = parseFloat(numericValue);
                if (!isNaN(zScore) && zScore <= -2.0) {
                    return '疑似異常';
                } else {
                    return '未發現明顯異常';
                }
            }

            // Default badge text
            return status === 'critical' ? '異常' : status === 'warning' ? '偏離' : '正常';
        }

        // Format numeric values to appropriate decimal places
        function formatValue(value, unit) {
            if (value === null || value === undefined || value === '--') return '--';
            if (typeof value === 'string') return value;

            const num = parseFloat(value);
            if (isNaN(num)) return value;

            // Determine decimal places based on unit/magnitude
            if (unit === '%' || unit === 'bpm' || unit === '/min') {
                return Math.round(num); // No decimals for percentages, heart rate
            } else if (unit === '°C' || unit === 'degC') {
                return num.toFixed(1); // 1 decimal for temperature
            } else if (Math.abs(num) >= 100) {
                return num.toFixed(0); // No decimals for large numbers
            } else if (Math.abs(num) >= 10) {
                return num.toFixed(1); // 1 decimal for medium numbers
            } else {
                return num.toFixed(2); // 2 decimals for small numbers
            }
        }

        // ========================================
        // CATEGORIZE OBSERVATIONS
        // ========================================
        function categorizeObservations(observations, deviceMap = {}, patientAge = null) {
            const categories = {
                vitalSigns: { title: '生命徵象', icon: '❤️', iconClass: 'vital', items: new Map() },
                laboratory: { title: '實驗室檢驗', icon: '🔬', iconClass: 'lab', items: new Map() },
                imaging: { title: '影像檢驗', icon: '📷', iconClass: 'imaging', items: new Map() },
                verisee: { title: 'VeriSee DR (Acer Medical)', icon: '👁️', iconClass: 'verisee', items: new Map() },
                veriosteo: { title: 'VeriOsteo OP (Acer Medical)', icon: '🦴', iconClass: 'veriosteo', items: new Map() },
                other: { title: '其他觀察紀錄', icon: '📊', iconClass: 'other', items: new Map() }
            };

            const vitalCodes = ['8867-4', '9279-1', '8310-5', '2708-6', '85354-9', '8480-6', '8462-4', '29463-7', '8302-2', '39156-5'];
            const labCodes = ['2339-0', '718-7', '6690-2', '777-3', '2160-0', '3094-0', '1742-6', '1920-8', '2093-3', '2571-8'];
            // Imaging related LOINC codes (Radiology, CT, MRI, X-Ray, Ultrasound findings)
            const imagingCodes = ['18748-4', '18747-6', '18746-8', '24725-9', '30746-2', '24566-7', '36643-5', '42148-7', '44136-0', '24558-4'];

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

                // VeriSee DR specific LOINC codes (Diabetic Retinopathy) - found in component
                const veriseeCodes = ['71490-7', '71491-5'];
                // VeriOsteo OP specific LOINC codes (Osteoporosis) - found in component
                const veriosteoCodes = ['38267-1', '85394-5'];

                // Check device-based categorization - look in COMPONENT array for specific codes
                const deviceRef = resource.device?.reference;
                if (deviceRef) {
                    const deviceId = deviceRef.replace('Device/', '');
                    const deviceName = deviceMap[deviceId];

                    // Process VeriSee DR components
                    if (deviceName === 'VeriSee DR' && resource.component) {
                        resource.component.forEach(comp => {
                            const compCodes = comp.code?.coding?.map(c => c.code) || [];
                            const matchingCode = compCodes.find(c => veriseeCodes.includes(c));

                            if (matchingCode) {
                                const compName = comp.code?.coding?.[0]?.display || comp.code?.text || '未知項目';
                                const compValue = comp.valueCodeableConcept?.text ||
                                    comp.valueCodeableConcept?.coding?.[0]?.display ||
                                    comp.valueQuantity?.value?.toString() || '--';
                                const compUnit = comp.valueQuantity?.unit || '';
                                const compValueCode = comp.valueCodeableConcept?.coding?.[0]?.code || '';

                                const itemKey = compName + '_' + matchingCode;
                                if (!categories.verisee.items.has(itemKey)) {
                                    categories.verisee.items.set(itemKey, {
                                        name: compName,
                                        value: formatValue(compValue, compUnit),
                                        unit: compUnit,
                                        code: matchingCode,
                                        valueConceptCode: compValueCode
                                    });
                                }
                            }
                        });
                        return; // Skip normal processing for this observation
                    }

                    // VeriOsteo OP - Bone Density Score Processing
                    // Age-based Display Rules:
                    //   T-score (38267-1): 適用於 ≥50 歲（含）患者
                    //   Z-score (85394-5): 適用於 20~49 歲患者
                    // Threshold Alerts:
                    //   T-score ≤ -2.5 → 疑似異常 (critical)
                    //   Z-score ≤ -2.0 → 疑似異常 (critical)
                    if (deviceName === 'VeriOsteo OP' && resource.component) {
                        resource.component.forEach(comp => {
                            const compCodes = comp.code?.coding?.map(c => c.code) || [];
                            const matchingCode = compCodes.find(c => veriosteoCodes.includes(c));

                            if (matchingCode) {
                                // Age-based filtering: T-score for >=50, Z-score for 20-49
                                if (patientAge !== null) {
                                    const isTScore = matchingCode === '38267-1';
                                    const isZScore = matchingCode === '85394-5';
                                    if (isTScore && patientAge < 50) return; // Skip T-score if under 50
                                    if (isZScore && (patientAge < 20 || patientAge >= 50)) return; // Skip Z-score if not 20-49
                                }
                                const compName = comp.code?.coding?.[0]?.display || comp.code?.text || '未知項目';
                                const rawNumericValue = comp.valueQuantity?.value;
                                const compValue = comp.valueCodeableConcept?.text ||
                                    comp.valueCodeableConcept?.coding?.[0]?.display ||
                                    (rawNumericValue !== undefined ? rawNumericValue.toString() : '--');
                                const compUnit = comp.valueQuantity?.unit || '';
                                const compValueCode = comp.valueCodeableConcept?.coding?.[0]?.code || '';

                                const itemKey = compName + '_' + matchingCode;
                                if (!categories.veriosteo.items.has(itemKey)) {
                                    categories.veriosteo.items.set(itemKey, {
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
                        return; // Skip normal processing for this observation
                    }
                }

                // If not device-based, use existing categorization logic (check ALL codes)
                if (category === 'other') {
                    if (resource.category?.some(cat => cat.coding?.some(c => c.code === 'vital-signs')) || allCodes.some(c => vitalCodes.includes(c))) {
                        category = 'vitalSigns';
                    } else if (resource.category?.some(cat => cat.coding?.some(c => c.code === 'laboratory')) || allCodes.some(c => labCodes.includes(c))) {
                        category = 'laboratory';
                    } else if (resource.category?.some(cat => cat.coding?.some(c => c.code === 'imaging')) || allCodes.some(c => imagingCodes.includes(c))) {
                        category = 'imaging';
                    }
                }

                // Use Map to deduplicate by name (keeps first occurrence = most recent)
                const itemKey = name + '_' + primaryCode;
                if (!categories[category].items.has(itemKey)) {
                    // Extract value from various FHIR value types
                    let rawValue = '--';
                    let unit = '';

                    if (resource.valueQuantity?.value !== undefined) {
                        rawValue = resource.valueQuantity.value;
                        unit = resource.valueQuantity.unit || '';
                    } else if (resource.valueCodeableConcept) {
                        // Common for imaging findings (e.g., severity levels, interpretations)
                        rawValue = resource.valueCodeableConcept.text ||
                            resource.valueCodeableConcept.coding?.[0]?.display || '--';
                    } else if (resource.valueString) {
                        rawValue = resource.valueString;
                    } else if (resource.valueInteger !== undefined) {
                        rawValue = resource.valueInteger;
                    } else if (resource.valueBoolean !== undefined) {
                        rawValue = resource.valueBoolean ? '是' : '否';
                    } else if (resource.interpretation?.[0]) {
                        // Interpretation code (e.g., Normal, Abnormal)
                        rawValue = resource.interpretation[0].text ||
                            resource.interpretation[0].coding?.[0]?.display || '--';
                    }

                    // Extract valueCodeableConcept code for special status handling
                    const valueConceptCode = resource.valueCodeableConcept?.coding?.[0]?.code || '';

                    categories[category].items.set(itemKey, {
                        name: name,
                        value: formatValue(rawValue, unit),
                        unit: unit,
                        code: primaryCode,
                        valueConceptCode: valueConceptCode
                    });
                }
            });

            // Convert Maps to arrays for rendering
            return {
                vitalSigns: { ...categories.vitalSigns, items: Array.from(categories.vitalSigns.items.values()) },
                laboratory: { ...categories.laboratory, items: Array.from(categories.laboratory.items.values()) },
                imaging: { ...categories.imaging, items: Array.from(categories.imaging.items.values()) },
                verisee: { ...categories.verisee, items: Array.from(categories.verisee.items.values()) },
                veriosteo: { ...categories.veriosteo, items: Array.from(categories.veriosteo.items.values()) },
                other: { ...categories.other, items: Array.from(categories.other.items.values()) }
            };
        }

        // ========================================
        // RENDER PATIENT INFO
        // ========================================
        function renderPatientInfo(patient) {
            const name = patient.name?.[0]?.text ||
                (patient.name?.[0]?.family + (patient.name?.[0]?.given?.join('') || '')) ||
                '未知姓名';
            const gender = translateGender(patient.gender);
            const genderClass = patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : '';
            const birthDate = patient.birthDate;
            const age = calculateAge(birthDate);
            const patientId = patient.id || '未知';
            const phone = patient.telecom?.find(t => t.system === 'phone')?.value || '未登錄';
            const address = patient.address?.[0]?.text ||
                (patient.address?.[0]?.city || '') + (patient.address?.[0]?.line?.join('') || '') ||
                '未登錄';

            return `
                <div class="patient-card">
                    <div class="patient-header">
                        <div class="patient-avatar ${genderClass}">${escapeHtml(getInitials(name))}</div>
                        <div class="patient-main-info">
                            <div class="patient-name">${escapeHtml(name)}</div>
                            <div class="patient-id">
                                <span>病患識別碼</span>
                                <span class="patient-id-badge">${escapeHtml(patientId)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="patient-info-grid">
                        <div class="info-item">
                            <span class="info-label">性別</span>
                            <span class="info-value ${genderClass}">${escapeHtml(gender)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">出生日期</span>
                            <span class="info-value">${escapeHtml(formatDate(birthDate))}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">年齡</span>
                            <span class="info-value">${escapeHtml(age)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">聯絡電話</span>
                            <span class="info-value">${escapeHtml(phone)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">通訊地址</span>
                            <span class="info-value">${escapeHtml(address)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========================================
        // RENDER OBSERVATIONS
        // ========================================
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

        // ========================================
        // MAIN FHIR CLIENT LOGIC
        // ========================================
        FHIR.oauth2.ready()
            .then(async function (client) {
                const patientId = client.patient.id;
                let allData = {};

                try {
                    // Fetch patient
                    const patient = await client.request("Patient/" + patientId);
                    allData.patient = patient;
                    document.getElementById("patient-display").innerHTML = renderPatientInfo(patient);

                    // Fetch observations
                    const observations = await client.request(`Observation?patient=${patientId}&_count=50&_sort=-date`);
                    allData.observations = observations;

                    // Build device lookup map from observations that have device references
                    const deviceMap = {};
                    if (observations.entry?.length > 0) {
                        const deviceRefs = new Set();
                        observations.entry.forEach(obs => {
                            const deviceRef = obs.resource?.device?.reference;
                            if (deviceRef) {
                                deviceRefs.add(deviceRef.replace('Device/', ''));
                            }
                        });

                        // Fetch Device resources
                        for (const deviceId of deviceRefs) {
                            try {
                                const device = await client.request(`Device/${deviceId}`);
                                const deviceName = device.deviceName?.[0]?.name || '';
                                deviceMap[deviceId] = deviceName;
                            } catch (e) {
                                console.log(`Failed to fetch Device/${deviceId}:`, e.message);
                            }
                        }
                        allData.devices = deviceMap;

                        // Calculate patient age for VeriOsteo filtering
                        const patientAge = patient.birthDate ? calculateAge(patient.birthDate) : null;
                        const numericAge = patientAge ? parseInt(patientAge.replace(/[^0-9]/g, '')) : null;
                        const categories = categorizeObservations(observations.entry, deviceMap, numericAge);
                        document.getElementById("results-display").innerHTML = renderObservations(categories);
                    } else {
                        document.getElementById("results-display").innerHTML = `
                            <div class="results-section">
                                <div class="no-data">
                                    <div class="no-data-icon">📭</div>
                                    <p>目前沒有可顯示的檢查結果</p>
                                </div>
                            </div>
                        `;
                    }

                    // Show JSON
                    document.getElementById("json-section").style.display = "block";
                    document.getElementById("json-output").textContent = JSON.stringify(allData, null, 2);

                } catch (error) {
                    console.error("Error:", error);
                    document.getElementById("results-display").innerHTML = `
                        <div class="error-container">
                            <div class="error-icon">⚠️</div>
                            <div class="error-title">無法載入檢查結果</div>
                            <div class="error-message">${escapeHtml(error.message)}</div>
                        </div>
                    `;
                }
            })
            .catch(function (error) {
                console.error(error);
                document.getElementById("patient-display").innerHTML = `
                    <div class="patient-card">
                        <div class="error-container">
                            <div class="error-icon">❌</div>
                            <div class="error-title">無法連接 FHIR 伺服器</div>
                            <div class="error-message">${escapeHtml(error.message)}</div>
                        </div>
                    </div>
                `;
            });
