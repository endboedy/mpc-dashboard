
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

function openModal(index = null) {
  const form = document.getElementById('addForm');
  form.reset();
  form.setAttribute('data-index', index !== null ? index : '');

  if (index !== null) {
    const row = document.querySelectorAll('#data-table tr')[index];
    const cells = row.querySelectorAll('td');
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input, i) => {
      input.value = cells[i]?.textContent || '';
    });
  }

  document.getElementById('dataModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('dataModal').style.display = 'none';
}

document.getElementById('addForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const index = form.getAttribute('data-index');

  // 🔢 Rumus otomatis
  data.Description = `${data.Equipment} - ${data.LashTypePM}`;
  data.NextPM = parseInt(data.LastPMSMU || 0) + 250;
  data.DevHrs = parseInt(data.CurrentSMU || 0) - data.NextPM;

  const daysToPlan = (data.NextPM - data.CurrentSMU) / 15;
  const planDate = new Date();
  planDate.setDate(planDate.getDate() + daysToPlan);
  data.PlanDate = planDate.toISOString().split("T")[0];

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${data.Equipment}</td>
    <td>${data.Model}</td>
    <td>${data.PIT}</td>
    <td>${data.Activity}</td>
    <td>${data.Description}</td>
    <td>${data.LashTypePM}</td>
    <td>${data.LastPMSMU}</td>
    <td>${data.CurrentSMU}</td>
    <td>${data.LastPMDate}</td>
    <td>${data.NextPM}</td>
    <td>${data.NextTypePM}</td>
    <td>${data.DevHrs}</td>
    <td>${data.PlanDate}</td>
    <td class="action-buttons">
      <button onclick="editRow(${index !== '' ? index : document.querySelectorAll('#data-table tr').length})">Edit</button>
      <button onclick="deleteRow(${index !== '' ? index : document.querySelectorAll('#data-table tr').length})">Delete</button>
    </td>
  `;

  if (index !== '') {
    document.querySelectorAll('#data-table tr')[index].replaceWith(row);
  } else {
    document.getElementById('data-table').appendChild(row);
  }

  form.removeAttribute('data-index');
  form.reset();
  closeModal();
});

function editRow(index) {
  openModal(index);
}

function deleteRow(index) {
  if (confirm("Yakin mau hapus data ini?")) {
    const row = document.querySelectorAll('#data-table tr')[index];
    row.remove();
  }
}
