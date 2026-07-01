/* ===========================
   EMS — Frontend Application
   =========================== */

const API = "/api/employees";

// ── DOM References ──────────────────────────
const tbody = document.getElementById("employee-tbody");
const emptyState = document.getElementById("empty-state");
const tableScroll = document.querySelector(".table-scroll");

const btnAdd = document.getElementById("btn-add-employee");
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const btnCancel = document.getElementById("btn-cancel");
const btnSubmit = document.getElementById("btn-submit");
const employeeForm = document.getElementById("employee-form");

const formId = document.getElementById("form-id");
const formName = document.getElementById("form-name");
const formDept = document.getElementById("form-department");
const formSalary = document.getElementById("form-salary");

const deleteOverlay = document.getElementById("delete-overlay");
const deleteText = document.getElementById("delete-text");
const btnDeleteCancel = document.getElementById("btn-delete-cancel");
const btnDeleteConfirm = document.getElementById("btn-delete-confirm");

const searchInput = document.getElementById("search-input");
const filterDept = document.getElementById("filter-dept");

const statTotal = document.getElementById("stat-total-value");
const statDept = document.getElementById("stat-dept-value");
const statSalary = document.getElementById("stat-salary-value");
const statPayroll = document.getElementById("stat-payroll-value");

const toastContainer = document.getElementById("toast-container");

// ── State ───────────────────────────────────
let employees = [];
let deleteTargetId = null;

// ── Avatar Colors ───────────────────────────
const avatarColors = [
  "#6c5ce7", "#00cec9", "#e17055", "#74b9ff",
  "#fdcb6e", "#a29bfe", "#55efc4", "#ff7675",
  "#81ecec", "#fab1a0", "#636e72", "#fd79a8"
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ── Badge Class ─────────────────────────────
function getBadgeClass(dept) {
  const d = dept.toLowerCase();
  if (d === "it" || d === "engineering" || d === "tech") return "badge-it";
  if (d === "hr" || d === "human resources") return "badge-hr";
  if (d === "finance" || d === "accounting") return "badge-finance";
  if (d === "marketing" || d === "sales") return "badge-marketing";
  return "badge-default";
}

// ── Format Currency ─────────────────────────
function formatCurrency(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

// ── Toast Notifications ─────────────────────
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icons = {
    success: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

// ── Stats Update ────────────────────────────
function updateStats() {
  const total = employees.length;
  const depts = new Set(employees.map(e => e.department)).size;
  const totalSalary = employees.reduce((sum, e) => sum + Number(e.salary), 0);
  const avg = total > 0 ? Math.round(totalSalary / total) : 0;

  animateValue(statTotal, total);
  animateValue(statDept, depts);
  statSalary.textContent = formatCurrency(avg);
  statPayroll.textContent = formatCurrency(totalSalary);
}

function animateValue(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  const diff = target - current;
  const steps = 15;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    el.textContent = Math.round(current + (diff * step) / steps);
    if (step >= steps) {
      el.textContent = target;
      clearInterval(interval);
    }
  }, 20);
}

// ── Department Filter ───────────────────────
function updateDeptFilter() {
  const depts = [...new Set(employees.map(e => e.department))].sort();
  filterDept.innerHTML = `<option value="all">All</option>`;
  depts.forEach(d => {
    filterDept.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

// ── Render Table ────────────────────────────
function renderTable() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const deptFilter = filterDept.value;

  let filtered = employees.filter(emp => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.department.toLowerCase().includes(searchTerm) ||
      String(emp.id).includes(searchTerm);
    const matchDept = deptFilter === "all" || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  if (filtered.length === 0) {
    tableScroll.style.display = "none";
    emptyState.style.display = "flex";
  } else {
    tableScroll.style.display = "block";
    emptyState.style.display = "none";
  }

  tbody.innerHTML = "";

  filtered.forEach((emp, i) => {
    const tr = document.createElement("tr");
    tr.style.animation = `fadeInRow 0.3s ${i * 0.04}s var(--ease) both`;

    tr.innerHTML = `
      <td class="cell-id">#${emp.id}</td>
      <td>
        <div class="cell-name">
          <div class="avatar" style="background:${getAvatarColor(emp.name)}">${getInitials(emp.name)}</div>
          <span>${emp.name}</span>
        </div>
      </td>
      <td><span class="badge ${getBadgeClass(emp.department)}">${emp.department}</span></td>
      <td class="cell-salary">${formatCurrency(emp.salary)}</td>
      <td>
        <div class="cell-actions">
          <button class="btn-icon btn-edit" data-id="${emp.id}" title="Edit" aria-label="Edit ${emp.name}">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-delete" data-id="${emp.id}" title="Delete" aria-label="Delete ${emp.name}">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Add fadeInRow animation dynamically
  if (!document.getElementById("row-anim-style")) {
    const style = document.createElement("style");
    style.id = "row-anim-style";
    style.textContent = `
      @keyframes fadeInRow {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ── Skeleton Loader ─────────────────────────
function showSkeleton() {
  tbody.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const tr = document.createElement("tr");
    tr.className = "skeleton-row";
    tr.innerHTML = `
      <td><span class="skeleton" style="width:30px"></span></td>
      <td><div style="display:flex;align-items:center;gap:0.7rem"><span class="skeleton" style="width:34px;height:34px;border-radius:50%"></span><span class="skeleton" style="width:100px"></span></div></td>
      <td><span class="skeleton" style="width:60px"></span></td>
      <td><span class="skeleton" style="width:70px"></span></td>
      <td><span class="skeleton" style="width:50px"></span></td>
    `;
    tbody.appendChild(tr);
  }
}

// ── API Calls ───────────────────────────────
async function fetchEmployees() {
  showSkeleton();
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    employees = data.map((emp) => {
      const id = emp.id !== undefined ? Number(emp.id) : undefined;
      return {
        ...emp,
        id: Number.isFinite(id) ? id : emp._id
      };
    });
    updateStats();
    updateDeptFilter();
    renderTable();
  } catch (err) {
    showToast("Failed to load employees", "error");
    tbody.innerHTML = "";
    emptyState.style.display = "flex";
    tableScroll.style.display = "none";
  }
}

async function createEmployee(data) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create");
    const result = await res.json();
    showToast(`${result.employee.name} added successfully`);
    await fetchEmployees();
  } catch (err) {
    showToast("Failed to add employee", "error");
  }
}

async function updateEmployee(id, data) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update");
    showToast("Employee updated successfully");
    await fetchEmployees();
  } catch (err) {
    showToast("Failed to update employee", "error");
  }
}

async function deleteEmployee(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    showToast("Employee deleted successfully");
    await fetchEmployees();
  } catch (err) {
    showToast("Failed to delete employee", "error");
  }
}

// ── Modal Helpers ───────────────────────────
function openModal(mode = "add", emp = null) {
  employeeForm.reset();
  formId.value = "";

  if (mode === "edit" && emp) {
    modalTitle.textContent = "Edit Employee";
    btnSubmit.textContent = "Update Employee";
    formId.value = emp.id;
    formName.value = emp.name;
    formDept.value = emp.department;
    formSalary.value = emp.salary;
  } else {
    modalTitle.textContent = "Add Employee";
    btnSubmit.textContent = "Save Employee";
  }

  modalOverlay.classList.add("active");
  setTimeout(() => formName.focus(), 100);
}

function closeModal() {
  modalOverlay.classList.remove("active");
}

function openDeleteDialog(id) {
  const emp = employees.find(e => e.id === id);
  deleteTargetId = id;
  deleteText.textContent = emp
    ? `Are you sure you want to delete "${emp.name}"? This action cannot be undone.`
    : "This action cannot be undone.";
  deleteOverlay.classList.add("active");
}

function closeDeleteDialog() {
  deleteOverlay.classList.remove("active");
  deleteTargetId = null;
}

// ── Event Listeners ─────────────────────────
btnAdd.addEventListener("click", () => openModal("add"));
modalClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

employeeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: formName.value.trim(),
    department: formDept.value.trim(),
    salary: Number(formSalary.value)
  };

  if (!data.name || !data.department || !data.salary) {
    showToast("Please fill all fields", "error");
    return;
  }

  const id = formId.value;
  closeModal();

  if (id) {
    await updateEmployee(id, data);
  } else {
    await createEmployee(data);
  }
});

// Table action delegation
tbody.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-edit");
  const deleteBtn = e.target.closest(".btn-delete");

  if (editBtn) {
    const id = editBtn.dataset.id;
    const emp = employees.find(e => String(e.id) === id);
    if (emp) openModal("edit", emp);
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    openDeleteDialog(id);
  }
});

// Delete dialog
btnDeleteCancel.addEventListener("click", closeDeleteDialog);
deleteOverlay.addEventListener("click", (e) => {
  if (e.target === deleteOverlay) closeDeleteDialog();
});
btnDeleteConfirm.addEventListener("click", async () => {
  const id = deleteTargetId;
  if (id !== null) {
    closeDeleteDialog();
    await deleteEmployee(id);
  }
});

// Search & Filter
searchInput.addEventListener("input", renderTable);
filterDept.addEventListener("change", renderTable);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeDeleteDialog();
  }
});

// ── Init ────────────────────────────────────
fetchEmployees();
