// =========================================================
// FACTORY DASHBOARD • STERIAPP
// factory-dashboard.js
// =========================================================
// =========================================================
// ELEMENTOS
// =========================================================
const totalUsers =
  document.getElementById("totalUsers");
const totalAutoclaves =
  document.getElementById("totalAutoclaves");
const todayCycles =
  document.getElementById("todayCycles");
const totalCycles =
  document.getElementById("totalCycles");
const factoryCyclesTable =
  document.getElementById("factoryCyclesTable");
// =========================================================
// DADOS MOCK INDUSTRIAIS
// =========================================================
const factoryData = [
  {
    clinic:"Odonto Prime",
    user:"Marcel",
    autoclave:"TANZO CLASSIC",
    serial:"S2401ZJ0091W",
    cycle:"401",
    program:"02 Envolto",
    result:"SUCESSO",
    date:"12/05/2026"
  },
  {
    clinic:"Clínica Santos",
    user:"Nayara",
    autoclave:"WOSON TANDA",
    serial:"S2401ZJ0088A",
    cycle:"402",
    program:"Flash",
    result:"ERRO",
    date:"12/05/2026"
  },
  {
    clinic:"Odonto Life",
    user:"Carlos",
    autoclave:"TANZO PREMIUM",
    serial:"S2401ZJ0077B",
    cycle:"403",
    program:"Instrumental",
    result:"SUCESSO",
    date:"12/05/2026"
  }
];
// =========================================================
// INIT
// =========================================================
initializeFactoryDashboard();
// =========================================================
// INITIALIZE
// =========================================================
function initializeFactoryDashboard(){
  loadCards();
  renderFactoryTable();
  initializeButtons();
}
// =========================================================
// CARDS
// =========================================================
function loadCards(){
  totalUsers.innerText =
    "128";
  totalAutoclaves.innerText =
    "214";
  todayCycles.innerText =
    "947";
  totalCycles.innerText =
    "18.420";
}
// =========================================================
// RENDER TABLE
// =========================================================
function renderFactoryTable(){
  factoryCyclesTable.innerHTML = "";
  factoryData.forEach(item => {
    const tr =
      document.createElement("tr");
    // =========================
    // STATUS
    // =========================
    const statusClass =
      item.result === "SUCESSO"
      ? "status-success"
      : "status-error";
    // =========================
    // ROW
    // =========================
    tr.innerHTML = `
      <td>
        ${item.clinic}
      </td>
      <td>
        ${item.user}
      </td>
      <td>
        ${item.autoclave}
      </td>
      <td>
        ${item.serial}
      </td>
      <td>
        #${item.cycle}
      </td>
      <td>
        ${item.program}
      </td>
      <td>
        <span class="${statusClass}">
          ${item.result}
        </span>
      </td>
      <td>
        ${item.date}
      </td>
      <td>
        <button
          class="table-button"
          onclick="openQr('${item.serial}')"
        >
          QR Code
        </button>
      </td>
      <td>
        <button
          class="table-button"
          onclick="openPdf('${item.cycle}')"
        >
          PDF
        </button>
      </td>
    `;
    factoryCyclesTable.appendChild(tr);
  });
}
// =========================================================
// QR CODE
// =========================================================
function openQr(serial){
  alert(
    `QR Code da autoclave ${serial}`
  );
}
// =========================================================
// PDF
// =========================================================
function openPdf(cycle){
  alert(
    `Abrindo PDF do ciclo ${cycle}`
  );
}
// =========================================================
// BUTTONS
// =========================================================
function initializeButtons(){
  // =====================================================
  // SUPPORT BUTTON
  // =====================================================
  const supportButton =
    document.querySelector(".support-button");
  if(supportButton){
    supportButton.addEventListener(
      "click",
      () => {
        window.open(
          "https://wa.me/5513999999999",
          "_blank"
        );
      }
    );
  }
  // =====================================================
  // LOGOUT
  // =====================================================
  const logoutButton =
    document.querySelector(".logout-button");
  if(logoutButton){
    logoutButton.addEventListener(
      "click",
      logout
    );
  }
}
// =========================================================
// LOGOUT
// =========================================================
function logout(){
  localStorage.removeItem(
    "token"
  );
  window.location.href =
    "/pages/login.html";
}
// =========================================================
// CONSOLE
// =========================================================
console.log(
  "🏭 Factory Dashboard carregado com sucesso"
);