import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
  get,
  child
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9w_9kXTmw0u-DNLtw0LXSshbdc9LWGso",
  authDomain: "mpc-dashboard-ndarboe.firebaseapp.com",
  databaseURL: "https://mpc-dashboard-ndarboe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mpc-dashboard-ndarboe",
  storageBucket: "mpc-dashboard-ndarboe.appspot.com",
  messagingSenderId: "1032701774664",
  appId: "1:1032701774664:web:06e291ca0d706d3514017d",
  measurementId: "G-D1JNKJQ1P7"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const form = document.getElementById("dataForm");
  const modal = document.getElementById("dataModal");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  // Show modal
  addBtn?.addEventListener("click", () => {
    form.reset();
    form.setAttribute("data-mode", "add");
    modal.style.display = "block";
  });

  // Hide modal
  cancelBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Sidebar toggle
  toggleSidebar?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    toggleSidebar.textContent = sidebar.classList.contains("collapsed") ? "⮞" : "⮜";
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {};
    form.querySelectorAll("input").forEach(input => {
      formData[input.name] = input.value;
    });

    const mode = form.getAttribute("data-mode");
    const dbRef = ref(database, "equipment");

    try {
      if (mode === "edit") {
        const id = form.getAttribute("data-id");
        await set(ref(database, `equipment/${id}`), formData);
      } else {
        const newRef = push(dbRef);
        await set(newRef, formData);
      }
      modal.style.display = "none";
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  });


loadData();

// Load data dari Firebase dan terapkan filter
function loadData() {
  const tbody = document.getElementById("dataTable");
  if (!tbody) return;
  tbody.innerHTML = "";

  const dbRef = ref(database, "equipment");
  onValue(dbRef, (snapshot) => {
    const allData = [];
    const equipmentSet = new Set();
    const pitSet = new Set();
    const activitySet = new Set();

    snapshot.forEach(child => {
      const data = child.val();
      allData.push({ id: child.key, ...data });
      equipmentSet.add(data.equipment);
      pitSet.add(data.pit);
      activitySet.add(data.activity);
    });

    // Isi dropdown filter
    fillDropdown("filterEquipment", equipmentSet);
    fillDropdown("filterPIT", pitSet);
    fillDropdown("filterActivity", activitySet);

    // Tampilkan data yang sudah difilter
    const filtered = applyFilters(allData);
    filtered.forEach(item => createRow(item.id, item));
  });
}

// Isi dropdown filter
function fillDropdown(id, dataSet) {
  const select = document.getElementById(id);
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = `<option value="">All</option>`;
  [...dataSet].sort().forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = currentValue;
}

// Terapkan filter berdasarkan dropdown
function applyFilters(dataList) {
  const equipmentFilter = document.getElementById("filterEquipment").value;
  const pitFilter = document.getElementById("filterPIT").value;
  const activityFilter = document.getElementById("filterActivity").value;

  return dataList.filter(item => {
    const matchEquipment = equipmentFilter === "" || item.equipment === equipmentFilter;
    const matchPIT = pitFilter === "" || item.pit === pitFilter;
    const matchActivity = activityFilter === "" || item.activity === activityFilter;
    return matchEquipment && matchPIT && matchActivity;
  });
}

// Event listener untuk filter
["filterEquipment", "filterPIT", "filterActivity"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", loadData);
});

// Buat baris tabel
function createRow(id, data) {
  const tbody = document.getElementById("dataTable");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.equipment || ""}</td>
    <td>${data.model || ""}</td>
    <td>${data.pit || ""}</td>
    <td>${data.activity || ""}</td>
    <td>${data.description || ""}</td>
    <td>${data.lashType || ""}</td>
    <td>${data.lastPMSMU || ""}</td>
    <td>${data.currentSMU || ""}</td>
    <td>${data.lastPMDate || ""}</td>
    <td>${data.nextPM || ""}</td>
    <td>${data.nextTypePM || ""}</td>
    <td>${data.devHrs || ""}</td>
    <td>${data.planDate || ""}</td>
    <td>
      <button onclick="editData('${id}')">✏️</button>
      <button onclick="deleteData('${id}')">🗑️</button>
    </td>`;
  row.id = `row-${id}`;
  tbody.appendChild(row);
}

// Edit data
window.editData = function (id) {
  const dbRef = ref(database);
  get(child(dbRef, `equipment/${id}`)).then((snapshot) => {
    const data = snapshot.val();
    const form = document.getElementById("dataForm");
    for (const key in data) {
      const input = form.querySelector(`[name=${key}]`);
      if (input) input.value = data[key];
    }
    form.setAttribute("data-mode", "edit");
    form.setAttribute("data-id", id);
    document.getElementById("dataModal").style.display = "block";
  }).catch(error => {
    console.error("Gagal mengambil data:", error);
  });
};

// Hapus data
window.deleteData = function (id) {
  if (confirm("Yakin mau hapus data ini?")) {
    const dbRef = ref(database, `equipment/${id}`);
    remove(dbRef).catch(error => {
      console.error("Gagal menghapus data:", error);
    });
  }
};