// LOAD SAVED RECORDS
let tickets = [];

try {
    tickets = JSON.parse(localStorage.getItem("ictTickets")) || [];
} catch (error) {
    tickets = [];
}

// SAVE RECORDS
function saveTickets() {
    try {
        localStorage.setItem("ictTickets", JSON.stringify(tickets));
    } catch (error) {
        alert("Unable to save records. Browser storage may be full.");
    }
}

// NAVIGATION
function showPage(pageId, button) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".nav-btn").forEach(btn => {
            if (btn.getAttribute("onclick").includes(pageId)) {
                btn.classList.add("active");
            }
        });
    }

    updateDashboard();
    renderTickets();
    updateReports();
}

// GENERATE TICKET ID
function generateID() {
    return "ICT-" + Date.now().toString().slice(-7);
}

// FORM SUBMISSION
document.getElementById("ticketForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const ticket = {
        id: generateID(),
        date: new Date().toLocaleDateString(),
        client: document.getElementById("client").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value,
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        technician: document.getElementById("technician").value.trim(),
        status: document.getElementById("status").value,
        description: document.getElementById("description").value.trim(),
        remarks: document.getElementById("remarks").value.trim()
    };

    if (!ticket.client || !ticket.phone || !ticket.description) {
        alert("Please fill in all required fields.");
        return;
    }

    tickets.unshift(ticket);
    saveTickets();

    alert("Support ticket registered successfully! Ticket ID: " + ticket.id);

    this.reset();
    showPage("tickets");
});

// SAFE TEXT DISPLAY
function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// BADGE
function badge(value) {
    let className = value.toLowerCase();

    if (value === "In Progress") className = "progress";

    return `<span class="badge ${className}">${safe(value)}</span>`;
}

// UPDATE DASHBOARD
function updateDashboard() {
    document.getElementById("totalTickets").textContent = tickets.length;

    document.getElementById("openTickets").textContent =
        tickets.filter(t => t.status === "Open").length;

    document.getElementById("progressTickets").textContent =
        tickets.filter(t => t.status === "In Progress").length;

    document.getElementById("resolvedTickets").textContent =
        tickets.filter(t => t.status === "Resolved").length;

    const recent = tickets.slice(0, 5);

    document.getElementById("recentTable").innerHTML = recent.length
        ? recent.map(t => `
            <tr>
                <td>${safe(t.id)}</td>
                <td>${safe(t.client)}</td>
                <td>${safe(t.category)}</td>
                <td>${badge(t.priority)}</td>
                <td>${badge(t.status)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="5" class="empty">No tickets registered yet.</td></tr>`;
}

// DISPLAY TICKETS
function renderTickets() {
    const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
    const status = document.getElementById("statusFilter")?.value || "";
    const priority = document.getElementById("priorityFilter")?.value || "";

    const filtered = tickets.filter(t => {
        const matchesSearch = [
            t.id, t.client, t.phone, t.category,
            t.department, t.technician
        ].some(value => String(value || "").toLowerCase().includes(search));

        return matchesSearch &&
            (!status || t.status === status) &&
            (!priority || t.priority === priority);
    });

    document.getElementById("ticketTable").innerHTML = filtered.length
        ? filtered.map(t => `
            <tr>
                <td>${safe(t.id)}</td>
                <td>${safe(t.date)}</td>
                <td>${safe(t.client)}</td>
                <td>${safe(t.department)}</td>
                <td>${safe(t.category)}</td>
                <td>${safe(t.technician)}</td>
                <td>${badge(t.priority)}</td>
                <td>
                    <select onchange="changeStatus('${t.id}',this.value)">
                        <option ${t.status === "Open" ? "selected" : ""}>Open</option>
                        <option ${t.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option ${t.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-small btn-light"
                    onclick="viewTicket('${t.id}')">View</button>

                    <button class="btn btn-small btn-danger"
                    onclick="deleteTicket('${t.id}')">Delete</button>
                </td>
            </tr>
        `).join("")
        : `<tr><td colspan="9" class="empty">No matching tickets found.</td></tr>`;
}

// CHANGE STATUS
function changeStatus(id, newStatus) {
    const ticket = tickets.find(t => t.id === id);

    if (ticket) {
        ticket.status = newStatus;
        saveTickets();
        updateDashboard();
        updateReports();
    }
}

// VIEW TICKET
function viewTicket(id) {
    const t = tickets.find(ticket => ticket.id === id);

    if (!t) return;

    alert(
        "TICKET DETAILS\n\n" +
        "ID: " + t.id +
        "\nClient: " + t.client +
        "\nPhone: " + t.phone +
        "\nEmail: " + (t.email || "Not provided") +
        "\nDepartment: " + t.department +
        "\nCategory: " + t.category +
        "\nPriority: " + t.priority +
        "\nTechnician: " + t.technician +
        "\nStatus: " + t.status +
        "\nDescription: " + t.description +
        "\nRemarks: " + (t.remarks || "None")
    );
}

// DELETE TICKET
function deleteTicket(id) {
    if (confirm("Are you sure you want to delete this ticket?")) {
        tickets = tickets.filter(t => t.id !== id);
        saveTickets();
        updateDashboard();
        renderTickets();
        updateReports();
    }
}

// REPORTS
function updateReports() {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === "Resolved").length;
    const pending = tickets.filter(t => t.status !== "Resolved").length;
    const critical = tickets.filter(t => t.priority === "Critical").length;

    document.getElementById("reportTotal").textContent = total;
    document.getElementById("reportResolved").textContent = resolved;
    document.getElementById("reportPending").textContent = pending;
    document.getElementById("reportCritical").textContent = critical;

    const statuses = ["Open", "In Progress", "Resolved"];

    document.getElementById("reportBars").innerHTML = statuses.map(status => {
        const count = tickets.filter(t => t.status === status).length;
        const percent = total ? (count / total) * 100 : 0;

        return `
            <div style="margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;
                margin-bottom:7px;font-size:13px;">
                    <strong>${status}</strong>
                    <span>${count}</span>
                </div>
                <div style="height:12px;background:#eee3dc;border-radius:20px;overflow:hidden;">
                    <div style="height:100%;width:${percent}%;
                    background:var(--burgundy);border-radius:20px;"></div>
                </div>
            </div>
        `;
    }).join("");
}

// EXPORT TO CSV
function exportCSV() {
    if (!tickets.length) {
        alert("There are no records to export.");
        return;
    }

    const columns = [
        "id", "date", "client", "phone", "email",
        "department", "category", "priority", "technician",
        "status", "description", "remarks"
    ];

    const csvEscape = value =>
        '"' + String(value ?? "").replace(/"/g, '""') + '"';

    const rows = [
        columns.join(","),
        ...tickets.map(t => columns.map(col => csvEscape(t[col])).join(","))
    ];

    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ICT_Help_Desk_Records.csv";
    link.click();

    URL.revokeObjectURL(url);
}

// INITIALIZE
updateDashboard();
renderTickets();
updateReports();
