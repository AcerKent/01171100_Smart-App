/**
 * app.js - VeriInsights 智析通 主程式
 * 
 * FHIR Client 初始化與資料載入
 * 
 * 依賴模組：
 *   - config.js (設定檔)
 *   - utils.js (工具函數)
 *   - patient.js (病患資料處理)
 *   - observations.js (觀察資料處理)
 */

// ========================================
// INITIALIZATION
// ========================================

// Start time update
updateTime();
setInterval(updateTime, 1000);

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
            const observations = await client.request(
                `Observation?patient=${patientId}&_count=50&_sort=-date`
            );
            allData.observations = observations;

            // Build device lookup map
            const deviceMap = await buildDeviceMap(client, observations);
            allData.devices = deviceMap;

            // Render observations
            if (observations.entry?.length > 0) {
                const patientAge = getNumericAge(patient.birthDate);
                const categories = categorizeObservations(observations.entry, deviceMap, patientAge);
                document.getElementById("results-display").innerHTML = renderObservations(categories);
            } else {
                document.getElementById("results-display").innerHTML = renderNoData();
            }

            // Show JSON debug section
            document.getElementById("json-section").style.display = "block";
            document.getElementById("json-output").textContent = JSON.stringify(allData, null, 2);

        } catch (error) {
            console.error("Error:", error);
            document.getElementById("results-display").innerHTML = renderError(error.message);
        }
    })
    .catch(function (error) {
        console.error(error);
        document.getElementById("patient-display").innerHTML = renderConnectionError(error.message);
    });

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Build device ID to name lookup map
 * @param {Object} client - FHIR client
 * @param {Object} observations - Observations bundle
 * @returns {Object} Device map
 */
async function buildDeviceMap(client, observations) {
    const deviceMap = {};

    if (!observations.entry?.length) return deviceMap;

    const deviceRefs = new Set();
    observations.entry.forEach(obs => {
        const deviceRef = obs.resource?.device?.reference;
        if (deviceRef) {
            deviceRefs.add(deviceRef.replace('Device/', ''));
        }
    });

    for (const deviceId of deviceRefs) {
        try {
            const device = await client.request(`Device/${deviceId}`);
            const deviceName = device.deviceName?.[0]?.name || '';
            deviceMap[deviceId] = deviceName;
        } catch (e) {
            console.log(`Failed to fetch Device/${deviceId}:`, e.message);
        }
    }

    return deviceMap;
}

/**
 * Render no data message
 * @returns {string} HTML string
 */
function renderNoData() {
    return `
        <div class="results-section">
            <div class="no-data">
                <div class="no-data-icon">📭</div>
                <p>目前沒有可顯示的檢查結果</p>
            </div>
        </div>
    `;
}

/**
 * Render error message
 * @param {string} message - Error message
 * @returns {string} HTML string
 */
function renderError(message) {
    return `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-title">無法載入檢查結果</div>
            <div class="error-message">${escapeHtml(message)}</div>
        </div>
    `;
}

/**
 * Render connection error message
 * @param {string} message - Error message
 * @returns {string} HTML string
 */
function renderConnectionError(message) {
    return `
        <div class="patient-card">
            <div class="error-container">
                <div class="error-icon">❌</div>
                <div class="error-title">無法連接 FHIR 伺服器</div>
                <div class="error-message">${escapeHtml(message)}</div>
            </div>
        </div>
    `;
}
