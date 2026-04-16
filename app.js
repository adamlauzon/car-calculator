// Data storage
let data = {
    currentVehicles: [],
    dealerships: []
};

// Load data from localStorage on startup
function loadData() {
    const saved = localStorage.getItem('carCalculatorData');
    if (saved) {
        data = JSON.parse(saved);
    }
    render();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('carCalculatorData', JSON.stringify(data));
}

// Generate unique IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Calculate payment
function calculatePayment(principal, annualRate, frequency, durationMonths) {
    if (annualRate === 0) {
        // No interest
        const paymentsPerMonth = getPaymentsPerMonth(frequency);
        const totalPayments = durationMonths * paymentsPerMonth;
        return principal / totalPayments;
    }

    const ratePerPeriod = (annualRate / 100) / (12 * getPaymentsPerMonth(frequency));
    const totalPayments = durationMonths * getPaymentsPerMonth(frequency);

    const payment = principal * (ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPayments)) /
                    (Math.pow(1 + ratePerPeriod, totalPayments) - 1);

    return payment;
}

// Get payments per month based on frequency
function getPaymentsPerMonth(frequency) {
    switch(frequency) {
        case 'weekly': return 52 / 12;
        case 'biweekly': return 26 / 12;
        case 'monthly': return 1;
        default: return 1;
    }
}

// Get frequency label
function getFrequencyLabel(frequency) {
    switch(frequency) {
        case 'weekly': return 'week';
        case 'biweekly': return 'bi-weekly';
        case 'monthly': return 'month';
        default: return frequency;
    }
}

// Current Vehicles Functions
function addCurrentVehicle() {
    document.getElementById('vehicleModalTitle').textContent = 'Add Current Vehicle';
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
    document.getElementById('vehicleModal').style.display = 'block';
}

function editCurrentVehicle(id) {
    const vehicle = data.currentVehicles.find(v => v.id === id);
    if (!vehicle) return;

    document.getElementById('vehicleModalTitle').textContent = 'Edit Current Vehicle';
    document.getElementById('vehicleId').value = vehicle.id;
    document.getElementById('vehicleName').value = vehicle.name;
    document.getElementById('vehicleOwing').value = vehicle.owing;
    document.getElementById('vehicleModal').style.display = 'block';
}

function saveCurrentVehicle(event) {
    event.preventDefault();

    const id = document.getElementById('vehicleId').value;
    const vehicle = {
        name: document.getElementById('vehicleName').value,
        owing: parseFloat(document.getElementById('vehicleOwing').value)
    };

    if (id) {
        const index = data.currentVehicles.findIndex(v => v.id === id);
        data.currentVehicles[index] = { ...vehicle, id };
    } else {
        data.currentVehicles.push({ ...vehicle, id: generateId() });
    }

    saveData();
    render();
    closeVehicleModal();
}

function deleteCurrentVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    data.currentVehicles = data.currentVehicles.filter(v => v.id !== id);

    // Remove appraisals for this vehicle
    data.dealerships.forEach(d => {
        d.appraisals = d.appraisals.filter(a => a.vehicleId !== id);
    });

    saveData();
    render();
}

function closeVehicleModal() {
    document.getElementById('vehicleModal').style.display = 'none';
}

// Dealership Functions
function addDealership() {
    document.getElementById('dealershipModalTitle').textContent = 'Add Dealership';
    document.getElementById('dealershipForm').reset();
    document.getElementById('dealershipId').value = '';
    document.getElementById('dealershipModal').style.display = 'block';
}

function editDealership(id) {
    const dealership = data.dealerships.find(d => d.id === id);
    if (!dealership) return;

    document.getElementById('dealershipModalTitle').textContent = 'Edit Dealership';
    document.getElementById('dealershipId').value = dealership.id;
    document.getElementById('dealershipName').value = dealership.name;
    document.getElementById('dealershipModal').style.display = 'block';
}

function saveDealership(event) {
    event.preventDefault();

    const id = document.getElementById('dealershipId').value;
    const dealership = {
        name: document.getElementById('dealershipName').value,
        appraisals: [],
        vehicles: []
    };

    if (id) {
        const index = data.dealerships.findIndex(d => d.id === id);
        const existing = data.dealerships[index];
        data.dealerships[index] = {
            ...dealership,
            id,
            appraisals: existing.appraisals,
            vehicles: existing.vehicles
        };
    } else {
        data.dealerships.push({ ...dealership, id: generateId() });
    }

    saveData();
    render();
    closeDealershipModal();
}

function deleteDealership(id) {
    if (!confirm('Are you sure you want to delete this dealership?')) return;

    data.dealerships = data.dealerships.filter(d => d.id !== id);
    saveData();
    render();
}

function closeDealershipModal() {
    document.getElementById('dealershipModal').style.display = 'none';
}

// Dealership Vehicle Functions
function addDealershipVehicle(dealershipId) {
    document.getElementById('dealershipVehicleModalTitle').textContent = 'Add Vehicle';
    document.getElementById('dealershipVehicleForm').reset();
    document.getElementById('dealershipVehicleId').value = '';
    document.getElementById('dealershipVehicleDealershipId').value = dealershipId;
    document.getElementById('dealershipVehicleModal').style.display = 'block';
}

function editDealershipVehicle(dealershipId, vehicleId) {
    const dealership = data.dealerships.find(d => d.id === dealershipId);
    if (!dealership) return;

    const vehicle = dealership.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    document.getElementById('dealershipVehicleModalTitle').textContent = 'Edit Vehicle';
    document.getElementById('dealershipVehicleId').value = vehicle.id;
    document.getElementById('dealershipVehicleDealershipId').value = dealershipId;
    document.getElementById('dealershipVehicleName').value = vehicle.name;
    document.getElementById('dealershipVehiclePrice').value = vehicle.price;
    document.getElementById('dealershipVehicleInterest').value = vehicle.interestRate;
    document.getElementById('dealershipVehicleFrequency').value = vehicle.frequency;
    document.getElementById('dealershipVehicleDuration').value = vehicle.duration;
    document.getElementById('dealershipVehicleDownPayment').value = vehicle.downPayment || 0;
    document.getElementById('dealershipVehicleIncludeTax').checked = vehicle.includeTax || false;
    document.getElementById('dealershipVehicleModal').style.display = 'block';
}

function saveDealershipVehicle(event) {
    event.preventDefault();

    const dealershipId = document.getElementById('dealershipVehicleDealershipId').value;
    const vehicleId = document.getElementById('dealershipVehicleId').value;

    const vehicle = {
        name: document.getElementById('dealershipVehicleName').value,
        price: parseFloat(document.getElementById('dealershipVehiclePrice').value),
        interestRate: parseFloat(document.getElementById('dealershipVehicleInterest').value),
        frequency: document.getElementById('dealershipVehicleFrequency').value,
        duration: parseInt(document.getElementById('dealershipVehicleDuration').value),
        downPayment: parseFloat(document.getElementById('dealershipVehicleDownPayment').value) || 0,
        includeTax: document.getElementById('dealershipVehicleIncludeTax').checked
    };

    const dealership = data.dealerships.find(d => d.id === dealershipId);
    if (!dealership) return;

    if (vehicleId) {
        const index = dealership.vehicles.findIndex(v => v.id === vehicleId);
        dealership.vehicles[index] = { ...vehicle, id: vehicleId };
    } else {
        dealership.vehicles.push({ ...vehicle, id: generateId() });
    }

    saveData();
    render();
    closeDealershipVehicleModal();
}

function deleteDealershipVehicle(dealershipId, vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    const dealership = data.dealerships.find(d => d.id === dealershipId);
    if (!dealership) return;

    dealership.vehicles = dealership.vehicles.filter(v => v.id !== vehicleId);
    saveData();
    render();
}

function closeDealershipVehicleModal() {
    document.getElementById('dealershipVehicleModal').style.display = 'none';
}

// Appraisal Functions
function addAppraisal(dealershipId) {
    // Populate vehicle dropdown
    const select = document.getElementById('appraisalVehicleId');
    select.innerHTML = '';

    if (data.currentVehicles.length === 0) {
        alert('Please add your current vehicles first.');
        return;
    }

    data.currentVehicles.forEach(v => {
        const option = document.createElement('option');
        option.value = v.id;
        option.textContent = v.name;
        select.appendChild(option);
    });

    document.getElementById('appraisalModalTitle').textContent = 'Add Appraisal';
    document.getElementById('appraisalForm').reset();
    document.getElementById('appraisalDealershipId').value = dealershipId;
    document.getElementById('appraisalModal').style.display = 'block';
}

function saveAppraisal(event) {
    event.preventDefault();

    const dealershipId = document.getElementById('appraisalDealershipId').value;
    const vehicleId = document.getElementById('appraisalVehicleId').value;
    const amount = parseFloat(document.getElementById('appraisalAmount').value);

    const dealership = data.dealerships.find(d => d.id === dealershipId);
    if (!dealership) return;

    // Remove existing appraisal for this vehicle if any
    dealership.appraisals = dealership.appraisals.filter(a => a.vehicleId !== vehicleId);

    // Add new appraisal
    dealership.appraisals.push({
        id: generateId(),
        vehicleId,
        amount
    });

    saveData();
    render();
    closeAppraisalModal();
}

function deleteAppraisal(dealershipId, appraisalId) {
    if (!confirm('Are you sure you want to delete this appraisal?')) return;

    const dealership = data.dealerships.find(d => d.id === dealershipId);
    if (!dealership) return;

    dealership.appraisals = dealership.appraisals.filter(a => a.id !== appraisalId);
    saveData();
    render();
}

function closeAppraisalModal() {
    document.getElementById('appraisalModal').style.display = 'none';
}

// Render Functions
function renderCurrentVehicles() {
    const container = document.getElementById('currentVehicles');

    if (data.currentVehicles.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No vehicles added yet.</p></div>';
        return;
    }

    container.innerHTML = data.currentVehicles.map(vehicle => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${vehicle.name}</div>
                <div class="card-actions">
                    <button onclick="editCurrentVehicle('${vehicle.id}')" class="btn btn-secondary">Edit</button>
                    <button onclick="deleteCurrentVehicle('${vehicle.id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-item">
                    <label>Amount Owing:</label>
                    <span>${formatCurrency(vehicle.owing)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDealerships() {
    const container = document.getElementById('dealerships');

    if (data.dealerships.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No dealerships added yet.</p></div>';
        return;
    }

    container.innerHTML = data.dealerships.map(dealership => {
        const appraisalsHTML = dealership.appraisals.map(appraisal => {
            const vehicle = data.currentVehicles.find(v => v.id === appraisal.vehicleId);
            return `
                <div class="card-item">
                    <label>${vehicle ? vehicle.name : 'Unknown Vehicle'}:</label>
                    <span>${formatCurrency(appraisal.amount)}
                        <button onclick="deleteAppraisal('${dealership.id}', '${appraisal.id}')"
                                class="btn btn-danger" style="margin-left: 10px;">Delete</button>
                    </span>
                </div>
            `;
        }).join('');

        const vehiclesHTML = dealership.vehicles.map(vehicle => `
            <div class="nested-card">
                <div class="card-header">
                    <div class="card-title">${vehicle.name}</div>
                    <div class="card-actions">
                        <button onclick="editDealershipVehicle('${dealership.id}', '${vehicle.id}')"
                                class="btn btn-secondary">Edit</button>
                        <button onclick="deleteDealershipVehicle('${dealership.id}', '${vehicle.id}')"
                                class="btn btn-danger">Delete</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-item">
                        <label>Price:</label>
                        <span>${formatCurrency(vehicle.price)}</span>
                    </div>
                    <div class="card-item">
                        <label>Interest Rate:</label>
                        <span>${vehicle.interestRate}%</span>
                    </div>
                    <div class="card-item">
                        <label>Payment Frequency:</label>
                        <span>${vehicle.frequency}</span>
                    </div>
                    <div class="card-item">
                        <label>Loan Duration:</label>
                        <span>${vehicle.duration} months</span>
                    </div>
                    <div class="card-item">
                        <label>Include HST:</label>
                        <span>${vehicle.includeTax ? 'Yes (13%)' : 'No'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">${dealership.name}</div>
                    <div class="card-actions">
                        <button onclick="editDealership('${dealership.id}')" class="btn btn-secondary">Edit</button>
                        <button onclick="deleteDealership('${dealership.id}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
                <div class="card-body">
                    <h4 style="margin-top: 15px; margin-bottom: 10px; color: #2d3748;">Appraisals</h4>
                    ${appraisalsHTML || '<p style="color: #a0aec0;">No appraisals added.</p>'}
                    <button onclick="addAppraisal('${dealership.id}')" class="btn btn-secondary" style="margin-top: 10px;">
                        + Add Appraisal
                    </button>

                    <h4 style="margin-top: 20px; margin-bottom: 10px; color: #2d3748;">Vehicles</h4>
                    <div class="nested-list">
                        ${vehiclesHTML || '<p style="color: #a0aec0;">No vehicles added.</p>'}
                    </div>
                    <button onclick="addDealershipVehicle('${dealership.id}')" class="btn btn-secondary" style="margin-top: 10px;">
                        + Add Vehicle
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderPaymentComparison() {
    const container = document.getElementById('paymentComparison');
    const comparisons = [];

    data.dealerships.forEach(dealership => {
        dealership.vehicles.forEach(vehicle => {
            // Calculate total appraisal value from this dealership
            const totalAppraisal = dealership.appraisals.reduce((sum, appraisal) => {
                return sum + appraisal.amount;
            }, 0);

            // Calculate total owing on current vehicles
            const totalOwing = data.currentVehicles.reduce((sum, v) => {
                return sum + v.owing;
            }, 0);

            const HST_RATE = 0.13;
            let vehiclePrice = vehicle.price;
            let taxAmount = 0;
            let taxSavings = 0;
            let taxableAmount = 0;

            // Calculate tax if includeTax is checked
            if (vehicle.includeTax) {
                // Calculate full tax on vehicle price
                const fullTaxAmount = vehicle.price * HST_RATE;

                // Tax savings from trade-in (you don't pay tax on the trade-in portion)
                taxSavings = totalAppraisal * HST_RATE;

                // Actual tax amount after applying trade-in savings
                taxAmount = fullTaxAmount - taxSavings;

                // Taxable amount is the difference between price and trade-in
                taxableAmount = Math.max(0, vehicle.price - totalAppraisal);
            }

            // Net cost after trade-in and tax
            const netCost = vehiclePrice - totalAppraisal + totalOwing + taxAmount;

            // Down payment reduces the amount to be financed
            const downPayment = vehicle.downPayment || 0;
            const amountToFinance = netCost - downPayment;

            // Calculate payment
            const payment = calculatePayment(
                amountToFinance,
                vehicle.interestRate,
                vehicle.frequency,
                vehicle.duration
            );

            comparisons.push({
                dealershipName: dealership.name,
                vehicleName: vehicle.name,
                payment,
                frequency: vehicle.frequency,
                netCost,
                downPayment,
                amountToFinance,
                price: vehicle.price,
                appraisal: totalAppraisal,
                owing: totalOwing,
                interestRate: vehicle.interestRate,
                duration: vehicle.duration,
                includeTax: vehicle.includeTax,
                taxAmount,
                taxSavings,
                taxableAmount
            });
        });
    });

    if (comparisons.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Add dealerships and vehicles to see payment comparisons.</p></div>';
        return;
    }

    // Sort by payment amount
    comparisons.sort((a, b) => a.payment - b.payment);

    container.innerHTML = comparisons.map(comp => {
        const taxDetails = comp.includeTax ? `
            <div>Taxable Amount: ${formatCurrency(comp.taxableAmount)}</div>
            <div>HST (13%): ${formatCurrency(comp.taxAmount)}</div>
            <div style="color: #9ae6b4; font-weight: 600;">Tax Savings from Trade-in: ${formatCurrency(comp.taxSavings)}</div>
        ` : '';

        const downPaymentDetails = comp.downPayment > 0 ? `
            <div style="color: #fbd38d; font-weight: 600;">Down Payment: ${formatCurrency(comp.downPayment)}</div>
        ` : '';

        return `
            <div class="comparison-card">
                <h4>${comp.vehicleName}</h4>
                <div class="dealership-name">${comp.dealershipName}</div>
                <div class="payment-amount">${formatCurrency(comp.payment)}<span style="font-size: 0.4em;">/${getFrequencyLabel(comp.frequency)}</span></div>
                <div class="payment-details">
                    <div>Vehicle Price: ${formatCurrency(comp.price)}</div>
                    <div>Trade-in Value: ${formatCurrency(comp.appraisal)}</div>
                    <div>Remaining Owing: ${formatCurrency(comp.owing)}</div>
                    ${taxDetails}
                    ${downPaymentDetails}
                    <div>Interest Rate: ${comp.interestRate}%</div>
                    <div>Duration: ${comp.duration} months</div>
                </div>
                <div class="net-cost">
                    <strong>Amount Financed: ${formatCurrency(comp.amountToFinance)}</strong>
                </div>
            </div>
        `;
    }).join('');
}

function render() {
    renderCurrentVehicles();
    renderDealerships();
    renderPaymentComparison();
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Initialize app
loadData();
