/**
 * patient.js - VeriInsights 智析通 病患資料模組
 * 
 * 包含病患資料處理與渲染函數
 */

// ========================================
// PATIENT INFO RENDERING
// ========================================

/**
 * Render patient information card
 * @param {Object} patient - FHIR Patient resource
 * @returns {string} HTML string for patient card
 */
function renderPatientInfo(patient) {
    const name = patient.name?.[0]?.text ||
        (patient.name?.[0]?.family + (patient.name?.[0]?.given?.join('') || '')) ||
        '未知姓名';
    const gender = translateGender(patient.gender);
    const genderClass = patient.gender === 'male' ? 'male' :
        patient.gender === 'female' ? 'female' : '';
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
