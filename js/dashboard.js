// =========================================================
// STERIAPP DASHBOARD criado 05/05/2026 marcel nery
// dashboard.js
// =========================================================

// ===============================
// BASE URL
// ===============================

const BASE_URL =
  "https://api.steriapp.com.br";

// ===============================
// TOKEN
// ===============================

const token =
  localStorage.getItem("token");

// ===============================
// PROTEÇÃO LOGIN
// ===============================

if(!token){

  window.location.href =
    "/pages/login.html";
}

// ===============================
// ELEMENTOS
// ===============================

const clinicName =
  document.getElementById("clinicName");

const loggedUser =
  document.getElementById("nickname");

const serialNumber =
  document.getElementById("autoclaveSerial");

const totalCycles =
  document.getElementById("totalCycles");

const lastCycle =
  document.getElementById("lastCycle");

const labelsPrinted =
  document.getElementById("labelsCount");

const cloudStatus =
  document.querySelector(".cloud-ok");


const cyclesTable =
  document.getElementById("cyclesTableBody");

  const autoclaveModel =
  document.getElementById("autoclaveModel");

// ===============================
// INIT
// ===============================

initializeDashboard();

// ===============================
// INITIALIZE
// ===============================

async function initializeDashboard(){

  try{

    await loadUser();

    await loadCycles();

  }
 catch(error){

  console.error(
    "ERRO DASHBOARD:",
    error
  );

  alert(
    error.message
  );
}
}

// ===============================
// LOAD USER
// ===============================

async function loadUser(){

  const response =
    await fetch(
      `${BASE_URL}/api/user`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

  if(!response.ok){

    logout();

    return;
  }

  const user =
    await response.json();

  console.log(
    "👤 USER:",
    user
  );

  // =========================
  // TOP INFO
  // =========================

  clinicName.innerText =
    user.clinic || "-";

  loggedUser.innerText =
    user.nickname || "-";

  // =========================
  // AUTOCLAVE
  // =========================

  if(
    user.autoclaves &&
    user.autoclaves.length > 0
  ){
      autoclaveModel.innerText =
      user.autoclaves[0].model || "-";
    serialNumber.innerText =
      user.autoclaves[0].serial || "-";
  }
  else{

    serialNumber.innerText =
      "Nenhuma autoclave";
  }
}

// ===============================
// LOAD CYCLES
// ===============================

async function loadCycles(){

  const response =
    await fetch(
      `${BASE_URL}/api/laudos?page=1&limit=10`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

  if(!response.ok){

    throw new Error(
      "Erro ao carregar ciclos"
    );
  }

  const json =
    await response.json();

  console.log(
    "📦 CICLOS:",
    json
  );

  const cycles =
    json.data || [];

  // =========================
  // CARDS
  // =========================

  totalCycles.innerText =
    json.total || 0;

  labelsPrinted.innerText =
    json.total || 0;

  cloudStatus.innerHTML =
    `
      <span class="cloud-ok">
        Online
      </span>
    `;

  // =========================
  // ÚLTIMO CICLO
  // =========================

  if(cycles.length > 0){

    lastCycle.innerText =
      "#" + cycles[0].cycleNumber;
  }
  else{

    lastCycle.innerText =
      "-";
  }

  // =========================
  // TABLE
  // =========================

  renderCycles(cycles);
}

// ===============================
// RENDER TABLE
// ===============================

function renderCycles(cycles){

  cyclesTable.innerHTML = "";

  if(cycles.length === 0){

    cyclesTable.innerHTML =
      `
      <tr>
        <td colspan="9">
          Nenhum ciclo encontrado
        </td>
      </tr>
      `;

    return;
  }

  cycles.forEach(cycle => {

    const tr =
      document.createElement("tr");

    // =========================
    // STATUS
    // =========================

    const statusClass =
      cycle.result === "SUCESSO"
      ? "status-success"
      : "status-error";

    // =========================
    // DATA
    // =========================

    const formattedDate =
      formatDate(cycle.startTime);

    // =========================
    // QR URL
    // =========================

    const qrUrl =
      `${BASE_URL}/laudo/${cycle.id}`;

    // =========================
    // ROW
    // =========================

    tr.innerHTML = `

      <td>
        #${cycle.cycleNumber}
      </td>

      <td>
        ${formattedDate}
      </td>

      <td>
        ${cycle.serialNumber || "-"}
      </td>

      <td>
        ${cycle.program || "-"}
      </td>

      <td>
        <span class="${statusClass}">
          ${cycle.result}
        </span>
      </td>

      <td>
        <a
          href="${qrUrl}"
          target="_blank"
          class="table-button"
        >
          QR Code
        </a>
      </td>

      <td>
        <button
          class="table-button"
          onclick="printLabel('${cycle.id}')"
        >
          Etiqueta
        </button>
      </td>

      <td>
        ${
          cycle.errorCode
          ? `
            <span class="status-error">
              ${cycle.errorCode}
            </span>
          `
          : `
            <span class="status-success">
              OK
            </span>
          `
        }
      </td>

      <td>
        <button
          class="table-button"
          onclick="openPdf('${cycle.id}')"
        >
          PDF
        </button>
      </td>
    `;

    cyclesTable.appendChild(tr);
  });
}

// ===============================
// FORMAT DATE
// ===============================

function formatDate(date){

  if(!date){
    return "-";
  }

  const d =
    new Date(date);

  return d.toLocaleDateString(
    "pt-BR",
    {
      day:"2-digit",
      month:"2-digit",
      year:"numeric",
    }
  );
}

// ===============================
// PDF
// ===============================

function openPdf(id){

  window.open(
    `${BASE_URL}/laudo/${id}`,
    "_blank"
  );
}

// ===============================
// PRINT LABEL
// ===============================

function printLabel(cycleId){

  if(!cycleId){
    alert("Não foi possível identificar o ciclo.");
    return;
  }

  window.location.href =
    `/pages/label_print.html?id=${encodeURIComponent(cycleId)}`;
}

// ===============================
// FILTERS
// ===============================

function filterToday(){

  alert(
    "Filtro Hoje em desenvolvimento"
  );
}

function filter7Days(){

  alert(
    "Filtro 7 dias em desenvolvimento"
  );
}

function filter30Days(){

  alert(
    "Filtro 30 dias em desenvolvimento"
  );
}

// ===============================
// LOGOUT
// ===============================

function logout(){

  localStorage.removeItem(
    "token"
  );

  window.location.href =
    "/pages/login.html";
}