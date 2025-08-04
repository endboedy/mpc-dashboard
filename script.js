
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

// Modal kontrol
window.openModal = function () {
  const form = document.getElementById("addForm");
  form.reset();
  form.removeAttribute("data-id");
  document.getElementById("dataModal").style.display = "block";
};

window.closeModal = function () {
  document.getElementById("dataModal").style.display = "none";
};

window.toggleSidebar = function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
};

// Format tanggal ke dd-mmm-yyyy
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
}

// Submit form (Create & Update)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    // Hitung otomatis
    data.Description = `${data.Equipment} Sch PM ${data.NextTypePM}`;
    data.NextPM = parseInt(data.LastPMSMU || 0) + 250;
    data.DevHrs = parseInt(data.CurrentSMU || 0) - data.NextPM;

    const daysToPlan = (data.NextPM - data.CurrentSMU) / 15;
    const planDate = new Date();
    planDate.setDate(planDate.getDate() + daysToPlan);
    data.PlanDate = formatDate(planDate);

    // Format LastPMDate
    data.LastPMDate = formatDate(data.LastPMDate);

    const id = form.getAttribute("data-id");
    const dbRef = ref(database, id ? `equipment/${id}` : "equipment");

    try {
      if (id) {
        await set(dbRef, data); // Update
      } else {
        const newRef = push(dbRef); // Create
        await set(newRef, data);
      }
      form.removeAttribute("data-id");
      form.reset();
      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  });

  loadData(); // Listener aktif saat halaman siap

  // Tambahkan event listener untuk filter
  document.getElementById("filterEquipment").addEventListener("input", loadData);
  document.getElementById("filterPIT").addEventListener("input", loadData);
  document.getElementById("filterActivity").addEventListener("input", loadData);
});

// Filter data
function applyFilters(data) {
  const equipmentFilter = document.getElementById("filterEquipment")?.value.toLowerCase() || "";
  const pitFilter = document.getElementById("filterPIT")?.value.toLowerCase() || "";
  const activityFilter = document.getElementById("filterActivity")?.value.toLowerCase() || "";

  return (!equipmentFilter || data.Equipment?.toLowerCase().includes(equipmentFilter)) &&
         (!pitFilter || data.PIT?.toLowerCase().includes(pitFilter)) &&
         (!activityFilter || data.Activity?.toLowerCase().includes(activityFilter));
}

// Load data dari Firebase
function loadData() {
  const tbody = document.getElementById("data-table");
  const dbRef = ref(database, "equipment");

  onValue(dbRef, (snapshot) => {
    const rows = [];

    snapshot.forEach((child) => {
      const data = child.val();
      const id = child.key;

      if (!applyFilters(data)) return;

      rows.push({ id, data });
    });

    // Sort berdasarkan DevHrs dari terbesar ke terkecil
    rows.sort((a, b) => (b.data.DevHrs || 0) - (a.data.DevHrs || 0));

    tbody.innerHTML = "";

    rows.forEach(({ id, data }) => {
      const row = document.createElement("tr");

      // Warna berdasarkan DevHrs
      let devColor = "";
      let devFont = "";

      if (data.DevHrs > 25) {
        devColor = "background-color: red;";
        devFont = "color: white;";
      } else if (data.DevHrs >= 0) {
        devColor = "background-color: green;";
        devFont = "color: white;";
      } else if (data.DevHrs >= -25) {
        devColor = "background-color: yellow;";
        devFont = "color: black;";
      }

      row.innerHTML = `
        <td>${data.Equipment || ""}</td>
        <td>${data.Model || ""}</td>
        <td>${data.PIT || ""}</td>
        <td>${data.Activity || ""}</td>
        <td>${data.Description || ""}</td>
        <td>${data.LashTypePM || ""}</td>
        <td>${data.LastPMSMU || ""}</td>
        <td>${data.CurrentSMU || ""}</td>
        <td>${data.LastPMDate || ""}</td>
        <td>${data.NextPM || ""}</td>
        <td>${data.NextTypePM || ""}</td>
        <td style="${devColor} ${devFont}">${data.DevHrs || ""}</td>
        <td>${data.PlanDate || ""}</td>
        <td class="action-buttons">
          <button onclick="editData('${id}')">Edit</button>
          <button onclick="deleteData('${id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });
}

// Edit data
window.editData = function (id) {
  const dbRef = ref(database);
  get(child(dbRef, `equipment/${id}`)).then((snapshot) => {
    const data = snapshot.val();
    const form = document.getElementById("addForm");
    for (const key in data) {
      const input = form.querySelector(`[name=${key}]`);
      if (input) input.value = data[key];
    }
    form.setAttribute("data-id", id);
    document.getElementById("dataModal").style.display = "block";
  }).catch((error) => {
    console.error("Gagal mengambil data:", error);
  });
};

// Hapus data
window.deleteData = function (id) {
  if (confirm("Yakin mau hapus data ini?")) {
    const dbRef = ref(database, `equipment/${id}`);
    remove(dbRef).catch((error) => {
      console.error("Gagal menghapus data:", error);
    });
  }
};

