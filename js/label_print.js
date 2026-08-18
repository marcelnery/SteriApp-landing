/* ============================================================
   STERIAPP
   LABEL PRINT
   Central de Impressão de Etiquetas

   Arquivo:
   /public_html/js/label_print.js

   IMPORTANTE:
   - Não utiliza contador oficial do backend.
   - A quantidade é definida somente nesta tela.
   - Preparado para integração futura com contador central.
============================================================ */


/* ============================================================
   CONFIGURAÇÕES
============================================================ */

const BASE_URL = "https://api.steriapp.com.br/api";

const QR_CODE_LIBRARY =
  "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";


/* ============================================================
   ESTADO DA PÁGINA
============================================================ */

const state = {

  cycleId: null,

  cycle: null,

  selectedLabelType: null,

  quantity: 1,

  printMode: "a4",

  isLoading: false,

  qrLibraryLoaded: false

};


/* ============================================================
   CONFIGURAÇÃO DOS TIPOS DE ETIQUETA
============================================================ */

const LABEL_TYPES = {

  brocas: {

    name: "Etiquetas para Brocas",

    shortName: "Brocas",

    description:
      "Ideal para brocas odontológicas.",

    width: 26,

    height: 15,

    unit: "mm",

    color: "blue"

  },


  kit: {

    name: "Etiquetas para Kit",

    shortName: "Kit",

    description:
      "Instrumentais em geral.",

    width: 44.45,

    height: 16.93,

    unit: "mm",

    color: "green"

  },


  kitCirurgico: {

    name: "Kit Cirúrgico",

    shortName: "Kit Cirúrgico",

    description:
      "Caixas cirúrgicas completas.",

    width: 44.45,

    height: 16.93,

    unit: "mm",

    color: "orange"

  },


  bandeja: {

    name: "Bandejas",

    shortName: "Bandeja",

    description:
      "Etiquetas para bandejas clínicas.",

    /*
     * Medida utilizada na folha A4.
     */
    width: 44.45,

    height: 16.93,

    unit: "mm",

    /*
     * Medida específica para
     * impressora dedicada.
     */
    dedicatedWidth: 21,

    dedicatedHeight: 33,

    color: "purple"

  },


  manual: {

    name: "Etiqueta Manual",

    shortName: "Manual",

    description:
      "Etiqueta com dimensões personalizadas.",

    width: 60,

    height: 40,

    unit: "mm",

    color: "red",

    manual: true

  }

};


/* ============================================================
   ELEMENTOS DOM
============================================================ */

const elements = {};


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  cacheElements();

  initializePage();

});


/* ============================================================
   CACHE DOS ELEMENTOS
============================================================ */

function cacheElements() {

  const ids = [

    "sidebar",
    "mobileMenuButton",
    "logoutButton",

    "cycleNumber",
    "sterilizationDate",
    "clinicName",
    "operatorName",
    "dentistName",
    "autoclaveModel",
    "serialNumber",
    "program",
    "sterilizationTemperature",
    "sterilizationTime",
    "cycleResult",
    "cycleStatusBadge",

    "selectedTypeContainer",
    "selectedLabelType",
    "changeLabelType",

    "quantity",
    "quantityMinus",
    "quantityPlus",

    "printModeA4",
    "printModeDedicated",

    "labelSize",

    "configurationMessage",
    "configurationMessageText",

    "generateButton",

    "summaryCycle",
    "summaryType",
    "summaryQuantity",
    "summaryMode",

    "previewArea",
    "previewPlaceholder",
    "labelPreview",
    "previewStatus",

    "loadingOverlay",
    "loadingTitle",
    "loadingMessage",

    "confirmModal",
    "modalCycle",
    "modalType",
    "modalQuantity",
    "modalMode",

    "cancelPrintButton",
    "confirmPrintButton",

    "toast",
    "toastIcon",
    "toastTitle",
    "toastMessage",
    "closeToast",

    "systemStatus",
    "systemStatusIndicator"

  ];

  ids.forEach(id => {

    elements[id] = document.getElementById(id);

  });


  elements.labelTypeButtons =
    document.querySelectorAll(
      "[data-label-type]"
    );


  elements.printModeOptions =
    document.querySelectorAll(
      "[data-print-mode-option]"
    );

}


/* ============================================================
   INICIALIZAÇÃO PRINCIPAL
============================================================ */

async function initializePage() {

  setupEvents();

  state.cycleId = getCycleIdFromUrl();


  if (!state.cycleId) {

    showErrorState(
      "Não foi possível identificar o ciclo."
    );

    return;

  }


  updateSystemStatus(
    "Carregando ciclo...",
    false
  );


  await loadCycle();


  loadQRCodeLibrary();

}


/* ============================================================
   EVENTOS
============================================================ */

function setupEvents() {


  /* ----------------------------------------------------------
     MENU MOBILE
  ---------------------------------------------------------- */

  if (elements.mobileMenuButton) {

    elements.mobileMenuButton.addEventListener(
      "click",
      toggleSidebar
    );

  }


  /* ----------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */

  if (elements.logoutButton) {

    elements.logoutButton.addEventListener(
      "click",
      handleLogout
    );

  }


  /* ----------------------------------------------------------
     TIPOS DE ETIQUETA
  ---------------------------------------------------------- */

  elements.labelTypeButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const type =
          button.dataset.labelType;

        selectLabelType(type);

      }
    );

  });


  /* ----------------------------------------------------------
     ALTERAR TIPO
  ---------------------------------------------------------- */

  if (elements.changeLabelType) {

    elements.changeLabelType.addEventListener(
      "click",
      resetLabelType
    );

  }


  /* ----------------------------------------------------------
     QUANTIDADE
  ---------------------------------------------------------- */

  if (elements.quantityMinus) {

    elements.quantityMinus.addEventListener(
      "click",
      () => changeQuantity(-1)
    );

  }


  if (elements.quantityPlus) {

    elements.quantityPlus.addEventListener(
      "click",
      () => changeQuantity(1)
    );

  }


  if (elements.quantity) {

    elements.quantity.addEventListener(
      "input",
      handleQuantityInput
    );

    elements.quantity.addEventListener(
      "change",
      handleQuantityInput
    );

  }


  /* ----------------------------------------------------------
     MODO DE IMPRESSÃO
  ---------------------------------------------------------- */

  if (elements.printModeA4) {

    elements.printModeA4.addEventListener(
      "change",
      () => {

        if (
          elements.printModeA4.checked
        ) {

          setPrintMode("a4");

        }

      }
    );

  }


  if (elements.printModeDedicated) {

    elements.printModeDedicated.addEventListener(
      "change",
      () => {

        if (
          elements.printModeDedicated.checked
        ) {

          setPrintMode("dedicated");

        }

      }
    );

  }


  /* ----------------------------------------------------------
     GERAR
  ---------------------------------------------------------- */

  if (elements.generateButton) {

    elements.generateButton.addEventListener(
      "click",
      openConfirmation
    );

  }


  /* ----------------------------------------------------------
     CONFIRMAÇÃO
  ---------------------------------------------------------- */

  if (elements.cancelPrintButton) {

    elements.cancelPrintButton.addEventListener(
      "click",
      closeConfirmation
    );

  }


  if (elements.confirmPrintButton) {

    elements.confirmPrintButton.addEventListener(
      "click",
      confirmPrint
    );

  }


  /* ----------------------------------------------------------
     TOAST
  ---------------------------------------------------------- */

  if (elements.closeToast) {

    elements.closeToast.addEventListener(
      "click",
      hideToast
    );

  }


  /* ----------------------------------------------------------
     ESC
  ---------------------------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeConfirmation();

        hideToast();

      }

    }
  );

}


/* ============================================================
   OBTER ID DO CICLO
============================================================ */

function getCycleIdFromUrl() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get("id");

}


/* ============================================================
   CARREGAR CICLO
============================================================ */

async function loadCycle() {

  setLoading(
    true,
    "Carregando ciclo...",
    "Buscando os dados da esterilização."
  );


  try {

    const encodedId =
      encodeURIComponent(
        state.cycleId
      );


    const url =
      `${BASE_URL}/laudo/${encodedId}`;


    const response =
      await fetch(url, {

        method: "GET",

        headers: {

          "Accept":
            "application/json"

        },

        cache: "no-store"

      });


    if (!response.ok) {

      throw new Error(
        `Erro HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    const cycle =
      normalizeCycle(data);


    if (!cycle) {

      throw new Error(
        "O servidor não retornou um ciclo válido."
      );

    }


    state.cycle = cycle;


    renderCycle(cycle);


    updateSystemStatus(
      "Sistema Online",
      true
    );


    setLoading(false);


  } catch (error) {

    console.error(
      "ERRO LABEL PRINT:",
      error
    );


    setLoading(false);


    updateSystemStatus(
      "Erro de conexão",
      false
    );


    showErrorState(
      "Não foi possível carregar os dados do ciclo."
    );


    showToast(
      "Erro",
      getFriendlyErrorMessage(error),
      "error"
    );

  }

}


/* ============================================================
   NORMALIZAÇÃO DOS DADOS
============================================================ */

function normalizeCycle(data) {

  if (!data) {

    return null;

  }


  /*
   * Alguns endpoints podem retornar:
   *
   * { ...ciclo }
   *
   * ou
   *
   * { data: { ...ciclo } }
   *
   * ou
   *
   * { laudo: { ...ciclo } }
   */

  let source = data;


  if (
    data.data &&
    typeof data.data === "object"
  ) {

    source = data.data;

  }


  if (
    data.laudo &&
    typeof data.laudo === "object"
  ) {

    source = data.laudo;

  }


  if (
    source.cycle &&
    typeof source.cycle === "object"
  ) {

    source = source.cycle;

  }


  return {

    id:
      firstValue(
        source.id,
        source._id,
        state.cycleId
      ),


    cycleNumber:
      firstValue(
        source.cycleNumber,
        source.cycle,
        source.numeroCiclo,
        source.numero,
        extractCycleNumber(state.cycleId),
        "—"
      ),


    date:
      firstValue(
        source.date,
        source.data,
        source.startDate,
        source.startTime,
        source.startedAt,
        source.createdAt
      ),


    clinic:
      firstValue(
        source.clinic,
        source.clinicName,
        source.nomeClinica,
        source.clinica,
        "—"
      ),


    operator:
      firstValue(
        source.operator,
        source.operatorName,
        source.operador,
        source.nomeOperador,
        "—"
      ),


    responsible:
      firstValue(
        source.responsible,
        source.responsibleName,
        source.dentist,
        source.dentistName,
        source.nomeResponsavel,
        source.responsavel,
        "—"
      ),


    autoclave:
      firstValue(
        source.autoclave,
        source.autoclaveModel,
        source.model,
        source.modelo,
        "—"
      ),


    serial:
      firstValue(
        source.serial,
        source.serialNumber,
        source.numeroSerie,
        source.autoclaveSerial,
        "—"
      ),


    program:
      firstValue(
        source.program,
        source.programName,
        source.cycleType,
        source.tipoCiclo,
        source.tipo,
        "—"
      ),


    temperature:
      firstValue(
        source.sterilizationTemperature,
        source.temperature,
        source.temperatura,
        source.temp,
        "—"
      ),


    sterilizationTime:
      firstValue(
        source.sterilizationTime,
        source.sterilization_time,
        source.tempoEsterilizacao,
        source.tempoEsterilização,
        source.sterilizationDuration,
        "—"
      ),


    vacuumTime:
      firstValue(
        source.vacuumTime,
        source.vacuum_time,
        source.tempoVacuo,
        "—"
      ),


    dryTime:
      firstValue(
        source.dryTime,
        source.dry_time,
        source.tempoSecagem,
        "—"
      ),


    result:
      firstValue(
        source.result,
        source.status,
        source.resultado,
        source.cycleResult,
        source.success
          ? "SUCESSO"
          : null,
        "—"
      ),


    errorCode:
      firstValue(
        source.errorCode,
        source.error,
        source.codigoErro,
        null
      ),


    qrValue:
      firstValue(
        source.qrCode,
        source.qr,
        source.qrValue,
        source.traceabilityUrl,
        null
      ),


    raw:
      source

  };

}


/* ============================================================
   PRIMEIRO VALOR VÁLIDO
============================================================ */

function firstValue(...values) {

  for (const value of values) {

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {

      return value;

    }

  }


  return null;

}


/* ============================================================
   EXTRAIR NÚMERO DO CICLO
============================================================ */

function extractCycleNumber(value) {

  if (!value) {

    return null;

  }


  const match =
    String(value).match(
      /(?:ciclo|cycle)?\s*#?\s*(\d+)/i
    );


  if (match) {

    return match[1];

  }


  return null;

}


/* ============================================================
   RENDERIZAR CICLO
============================================================ */

function renderCycle(cycle) {

  setText(
    elements.cycleNumber,
    cycle.cycleNumber
  );


  setText(
    elements.sterilizationDate,
    formatDate(cycle.date)
  );


  setText(
    elements.clinicName,
    cycle.clinic
  );


  setText(
    elements.operatorName,
    cycle.operator
  );


  setText(
    elements.dentistName,
    cycle.responsible
  );


  setText(
    elements.autoclaveModel,
    cycle.autoclave
  );


  setText(
    elements.serialNumber,
    cycle.serial
  );


  setText(
    elements.program,
    cycle.program
  );


  setText(
    elements.sterilizationTemperature,
    formatTemperature(
      cycle.temperature
    )
  );


  setText(
    elements.sterilizationTime,
    formatTime(
      cycle.sterilizationTime
    )
  );


  renderCycleResult(
    cycle
  );


  updateSummary();


  updatePreview();


  setCycleStatus(
    cycle
  );

}


/* ============================================================
   STATUS DO CICLO
============================================================ */

function setCycleStatus(cycle) {

  if (!elements.cycleStatusBadge) {

    return;

  }


  const result =
    String(
      cycle.result || ""
    ).toLowerCase();


  const error =
    cycle.errorCode ||
    result.includes("erro") ||
    result.includes("error") ||
    result.includes("falha");


  if (error) {

    elements.cycleStatusBadge.textContent =
      "ERRO";

    elements.cycleStatusBadge.className =
      "status-badge error";

    return;

  }


  if (
    result.includes("sucesso") ||
    result.includes("success") ||
    result === "ok" ||
    result === "true"
  ) {

    elements.cycleStatusBadge.textContent =
      "SUCESSO";

    elements.cycleStatusBadge.className =
      "status-badge success";

    return;

  }


  elements.cycleStatusBadge.textContent =
    cycle.result || "REGISTRADO";

  elements.cycleStatusBadge.className =
    "status-badge";

}


/* ============================================================
   RESULTADO
============================================================ */

function renderCycleResult(cycle) {

  if (!elements.cycleResult) {

    return;

  }


  const result =
    String(
      cycle.result || ""
    );


  const hasError =
    cycle.errorCode ||
    result.toLowerCase().includes("erro") ||
    result.toLowerCase().includes("error") ||
    result.toLowerCase().includes("falha");


  if (hasError) {

    elements.cycleResult.textContent =
      cycle.errorCode ||
      cycle.result ||
      "ERRO";

    elements.cycleResult.className =
      "result-value error";

    return;

  }


  elements.cycleResult.textContent =
    normalizeResult(result);


  elements.cycleResult.className =
    "result-value success";

}


/* ============================================================
   SELECIONAR TIPO DE ETIQUETA
============================================================ */

function getCurrentLabelDimensions() {

  if (!state.selectedLabelType) {

    return null;

  }


  const config =
    LABEL_TYPES[state.selectedLabelType];


  if (!config) {

    return null;

  }


  /*
   * BANDEJA:
   * A4 = 44,45 × 16,93 mm
   * Dedicada = 21 × 33 mm
   */

  if (
    state.selectedLabelType === "bandeja" &&
    state.printMode === "dedicated"
  ) {

    return {

      width: config.dedicatedWidth,

      height: config.dedicatedHeight,

      unit: "mm"

    };

  }


  return {

    width: config.width,

    height: config.height,

    unit: config.unit

  };

}

function selectLabelType(type) {

  if (!LABEL_TYPES[type]) {

    return;

  }


  state.selectedLabelType =
    type;


  elements.labelTypeButtons.forEach(
    button => {

      button.classList.toggle(
        "selected",
        button.dataset.labelType === type
      );

    }
  );


  const config =
    LABEL_TYPES[type];


  setText(
    elements.selectedLabelType,
    config.name
  );


  if (
    elements.selectedTypeContainer
  ) {

    elements.selectedTypeContainer.hidden =
      false;

  }


 if (elements.labelSize) {

  const dimensions =
    getCurrentLabelDimensions();

  if (dimensions) {

    elements.labelSize.textContent =
      `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`;

  }

}


  updateConfigurationMessage();


  updateSummary();


  updatePreview();


  updateGenerateButton();

}


/* ============================================================
   RESETAR TIPO
============================================================ */

function resetLabelType() {

  state.selectedLabelType =
    null;


  elements.labelTypeButtons.forEach(
    button => {

      button.classList.remove(
        "selected"
      );

    }
  );


  if (
    elements.selectedTypeContainer
  ) {

    elements.selectedTypeContainer.hidden =
      true;

  }


  setText(
    elements.labelSize,
    "Selecione um modelo"
  );


  updateConfigurationMessage();


  updateSummary();


  updatePreview();


  updateGenerateButton();

}


/* ============================================================
   QUANTIDADE
============================================================ */

function changeQuantity(delta) {

  let quantity =
    Number(
      state.quantity
    ) || 1;


  quantity += delta;


  quantity =
    Math.max(
      1,
      Math.min(
        999,
        quantity
      )
    );


  setQuantity(quantity);

}


/* ============================================================
   INPUT DA QUANTIDADE
============================================================ */

function handleQuantityInput() {

  let quantity =
    parseInt(
      elements.quantity.value,
      10
    );


  if (
    Number.isNaN(quantity)
  ) {

    quantity = 1;

  }


  quantity =
    Math.max(
      1,
      Math.min(
        999,
        quantity
      )
    );


  setQuantity(quantity);

}


/* ============================================================
   DEFINIR QUANTIDADE
============================================================ */

function setQuantity(quantity) {

  state.quantity =
    quantity;


  if (elements.quantity) {

    elements.quantity.value =
      quantity;

  }


  updateSummary();


  updatePreview();


  updateGenerateButton();

}


/* ============================================================
   MODO DE IMPRESSÃO
============================================================ */

function setPrintMode(mode) {

  if (
    mode !== "a4" &&
    mode !== "dedicated"
  ) {

    mode = "a4";

  }


  state.printMode =
    mode;
if (
  state.selectedLabelType &&
  elements.labelSize
) {

  const dimensions =
    getCurrentLabelDimensions();

  if (dimensions) {

    elements.labelSize.textContent =
      `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`;

  }

}

  elements.printModeOptions.forEach(
    option => {

      option.classList.toggle(
        "selected",
        option.dataset.printModeOption === mode
      );

    }
  );


  updateSummary();


  updatePreview();

}


/* ============================================================
   CONFIGURAÇÃO
============================================================ */

function updateConfigurationMessage() {

  if (
    !elements.configurationMessageText
  ) {

    return;

  }


  if (
    !state.selectedLabelType
  ) {

    elements.configurationMessageText.textContent =
      "Selecione um tipo de etiqueta para continuar.";

    return;

  }


  const config =
    LABEL_TYPES[
      state.selectedLabelType
    ];


  if (config.manual) {

    elements.configurationMessageText.textContent =
      "O modelo manual está preparado para receber dimensões personalizadas.";

    return;

  }


  elements.configurationMessageText.textContent =
    `${config.name} selecionada. ${config.description}`;

}


/* ============================================================
   BOTÃO GERAR
============================================================ */

function updateGenerateButton() {

  if (
    !elements.generateButton
  ) {

    return;

  }


  const enabled =
    Boolean(
      state.cycle &&
      state.selectedLabelType &&
      state.quantity > 0
    );


  elements.generateButton.disabled =
    !enabled;

}


/* ============================================================
   RESUMO
============================================================ */

function updateSummary() {

  if (!state.cycle) {

    return;

  }


  setText(
    elements.summaryCycle,
    state.cycle.cycleNumber
  );


  if (
    state.selectedLabelType
  ) {

    setText(
      elements.summaryType,
      LABEL_TYPES[
        state.selectedLabelType
      ].shortName
    );

  } else {

    setText(
      elements.summaryType,
      "—"
    );

  }


  setText(
    elements.summaryQuantity,
    state.quantity
  );


  setText(
    elements.summaryMode,
    state.printMode === "a4"
      ? "Folha A4"
      : "Impressora dedicada"
  );

}


/* ============================================================
   PRÉVIA
============================================================ */

function updatePreview() {

  if (
    !elements.labelPreview ||
    !elements.previewPlaceholder
  ) {

    return;

  }


  if (
    !state.cycle ||
    !state.selectedLabelType
  ) {

    elements.previewPlaceholder.hidden =
      false;

    elements.labelPreview.hidden =
      true;


    setText(
      elements.previewStatus,
      "Aguardando seleção"
    );


    return;

  }


  elements.previewPlaceholder.hidden =
    true;

  elements.labelPreview.hidden =
    false;


  elements.labelPreview.innerHTML =
    buildLabelHTML(
      state.cycle,
      state.selectedLabelType,
      false
    );


  setText(
    elements.previewStatus,
    `${LABEL_TYPES[state.selectedLabelType].shortName} • ${state.quantity} etiqueta(s)`
  );


  generatePreviewQRCode();

}


/* ============================================================
   CONSTRUIR HTML DA ETIQUETA
============================================================ */

function buildLabelHTML(
  cycle,
  labelType,
  forPrint = false
) {

  const config =
    LABEL_TYPES[labelType];


  if (!config) {

    return "";

  }


  const cycleNumber =
    escapeHTML(
      cycle.cycleNumber
    );


  const clinic =
    escapeHTML(
      cycle.clinic
    );


  const operator =
    escapeHTML(
      cycle.operator
    );


  const responsible =
    escapeHTML(
      cycle.responsible
    );


  const autoclave =
    escapeHTML(
      cycle.autoclave
    );


  const serial =
    escapeHTML(
      cycle.serial
    );


  const date =
    escapeHTML(
      formatDate(cycle.date)
    );


  const temperature =
    escapeHTML(
      formatTemperature(
        cycle.temperature
      )
    );


  const sterilizationTime =
    escapeHTML(
      formatTime(
        cycle.sterilizationTime
      )
    );


  const program =
    escapeHTML(
      cycle.program
    );


  const result =
    escapeHTML(
      normalizeResult(
        cycle.result
      )
    );


  const qrId =
    createQRValue(cycle);


  
  const LABEL_CLASS_MAP = {
  brocas: "label-brocas",
  kit: "label-kit",
  kitCirurgico: "label-kit-cirurgico",
  bandeja: "label-bandeja",
  manual: "label-manual"
};

const sizeClass =
  LABEL_CLASS_MAP[labelType] || "label-manual";


  return `

    <div
      class="steri-label ${sizeClass} ${forPrint ? "print-label" : ""}"
      data-label-type="${labelType}"
      data-qr-value="${escapeHTML(qrId)}"
    >

      <div class="label-header">

        <div class="label-brand">

          <div class="label-brand-mark">
            ✓
          </div>

          <div class="label-brand-text">

            <strong>
              SteriApp
            </strong>

            <span>
              Rastreabilidade
            </span>

          </div>

        </div>


        <div class="label-cycle">

          <small>
            CICLO
          </small>

          <strong>
            #${cycleNumber}
          </strong>

        </div>

      </div>


      <div class="label-divider"></div>


      <div class="label-main">


        <div class="label-information">


          <div class="label-field">

            <span>
              Clínica
            </span>

            <strong>
              ${clinic}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Operador
            </span>

            <strong>
              ${operator}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Responsável
            </span>

            <strong>
              ${responsible}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Autoclave
            </span>

            <strong>
              ${autoclave}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Nº Série
            </span>

            <strong>
              ${serial}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Programa
            </span>

            <strong>
              ${program}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Data
            </span>

            <strong>
              ${date}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Temperatura
            </span>

            <strong>
              ${temperature}
            </strong>

          </div>


          <div class="label-field">

            <span>
              Esterilização
            </span>

            <strong>
              ${sterilizationTime}
            </strong>

          </div>


        </div>


        <div class="label-qr-area">

          <div
            class="label-qr"
            data-qr-container="true"
          ></div>


          <span class="label-qr-caption">
            RASTREABILIDADE
          </span>

        </div>


      </div>


      <div class="label-divider"></div>


      <div class="label-footer">


        <div class="label-result">

          <span>
            RESULTADO
          </span>

          <strong>
            ${result}
          </strong>

        </div>


        <div class="label-footer-cycle">

          SteriApp

        </div>


      </div>

    </div>

  `;

}


/* ============================================================
   VALOR DO QR CODE
============================================================ */

function createQRValue(cycle) {

  if (
    cycle.qrValue
  ) {

    return String(
      cycle.qrValue
    );

  }


  /*
   * Neste primeiro estágio o QR Code identifica
   * o ciclo através da URL pública do SteriApp.
   *
   * O contador oficial e a validação central
   * serão integrados posteriormente.
   */

  const origin =
    window.location.origin;


  return `${origin}/pages/cycle.html?id=${encodeURIComponent(
    cycle.id || state.cycleId
  )}`;

}


/* ============================================================
   GERAR QR CODE DA PRÉVIA
============================================================ */

function generatePreviewQRCode() {

  const container =
    elements.labelPreview?.querySelector(
      "[data-qr-container]"
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    "";


  const value =
    createQRValue(
      state.cycle
    );


  if (
    window.QRCode
  ) {

    try {

      new QRCode(
        container,
        {

          text: value,

          width: 90,

          height: 90,

          correctLevel:
            QRCode.CorrectLevel.M

        }
      );

      return;

    } catch (error) {

      console.warn(
        "Não foi possível gerar QR Code:",
        error
      );

    }

  }


  container.innerHTML = `
    <div class="qr-fallback">
      QR
    </div>
  `;

}


/* ============================================================
   CARREGAR BIBLIOTECA QR CODE
============================================================ */

function loadQRCodeLibrary() {

  if (
    window.QRCode
  ) {

    state.qrLibraryLoaded =
      true;

    updatePreview();

    return;

  }


  const script =
    document.createElement(
      "script"
    );


  script.src =
    QR_CODE_LIBRARY;


  script.async =
    true;


  script.onload =
    () => {

      state.qrLibraryLoaded =
        true;

      updatePreview();

    };


  script.onerror =
    () => {

      console.warn(
        "Biblioteca de QR Code não carregada."
      );

    };


  document.head.appendChild(
    script
  );

}


/* ============================================================
   CONFIRMAÇÃO
============================================================ */

function openConfirmation() {

  if (
    !state.cycle ||
    !state.selectedLabelType
  ) {

    showToast(
      "Atenção",
      "Selecione um tipo de etiqueta antes de continuar.",
      "warning"
    );

    return;

  }


  const config =
    LABEL_TYPES[
      state.selectedLabelType
    ];


  setText(
    elements.modalCycle,
    state.cycle.cycleNumber
  );


  setText(
    elements.modalType,
    config.name
  );


  setText(
    elements.modalQuantity,
    state.quantity
  );


  setText(
    elements.modalMode,
    state.printMode === "a4"
      ? "Folha A4"
      : "Impressora dedicada"
  );


  if (
    elements.confirmModal
  ) {

    elements.confirmModal.hidden =
      false;

    document.body.classList.add(
      "modal-open"
    );

  }

}


/* ============================================================
   FECHAR CONFIRMAÇÃO
============================================================ */

function closeConfirmation() {

  if (
    elements.confirmModal
  ) {

    elements.confirmModal.hidden =
      true;

  }


  document.body.classList.remove(
    "modal-open"
  );

}


/* ============================================================
   CONFIRMAR IMPRESSÃO
============================================================ */

async function confirmPrint() {

  if (
    !state.cycle ||
    !state.selectedLabelType
  ) {

    closeConfirmation();

    return;

  }


  closeConfirmation();


  setLoading(
    true,
    "Preparando impressão...",
    "Gerando as etiquetas de rastreabilidade."
  );


  try {

    await delay(300);


    printLabels();


  } catch (error) {

    console.error(
      "Erro ao imprimir etiquetas:",
      error
    );


    showToast(
      "Erro",
      "Não foi possível preparar a impressão.",
      "error"
    );

  } finally {

    setLoading(false);

  }

}


/* ============================================================
   IMPRESSÃO
============================================================ */

function printLabels() {

  const config =
    LABEL_TYPES[
      state.selectedLabelType
    ];


  if (!config) {

    return;

  }


  const labels = [];


  for (
    let i = 0;
    i < state.quantity;
    i++
  ) {

    labels.push(
      buildLabelHTML(
        state.cycle,
        state.selectedLabelType,
        true
      )
    );

  }


  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1100,height=800"
    );


  if (!printWindow) {

    showToast(
      "Impressão bloqueada",
      "Permita janelas pop-up para o SteriApp.",
      "warning"
    );

    return;

  }

const dimensions =
  getCurrentLabelDimensions();

if (!dimensions) {

  showToast(
    "Erro",
    "Não foi possível determinar o tamanho da etiqueta.",
    "error"
  );

  return;

}

const labelWidth =
  `${dimensions.width}mm`;

const labelHeight =
  `${dimensions.height}mm`;

  const printCSS =
    createPrintCSS(
      labelWidth,
      labelHeight,
      state.printMode
    );


  const html = `

<!DOCTYPE html>

<html
  lang="pt-BR"
>

<head>

  <meta
    charset="UTF-8"
  >

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    SteriApp - Impressão de Etiquetas
  </title>

  <style>

    ${printCSS}

  </style>

</head>


<body>

  <div
    class="print-document"
  >

    ${labels.join("")}

  </div>


  <script>

    ${getPrintQRCodeScript()}

  <\/script>


</body>

</html>

  `;


  printWindow.document.open();

  printWindow.document.write(
    html
  );

  printWindow.document.close();


  printWindow.focus();


  /*
   * Pequeno intervalo para garantir
   * carregamento da página de impressão.
   */




  showToast(
    "Etiqueta preparada",
    `${state.quantity} etiqueta(s) preparada(s) para impressão.`,
    "success"
  );

}


/* ============================================================
   CSS DA JANELA DE IMPRESSÃO
============================================================ */
function createPrintCSS(
  width,
  height,
  printMode
) {

  const dedicated =
    printMode === "dedicated";

  const type =
    state.selectedLabelType;

  return `

    * {
      box-sizing: border-box;
    }

    html,
    body {

      margin: 0;
      padding: 0;

      background: #ffffff;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      color: #111111;

    }

    body {

      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;

    }

    .print-document {

      display: ${
        dedicated
          ? "block"
          : "grid"
      };

      ${
        dedicated
          ? ""
          : `
            grid-template-columns:
              repeat(2, ${width});

            gap: 3mm;

            padding: 8mm;
          `
      }

    }

    .steri-label {

      width: ${width};
      height: ${height};

      min-width: ${width};
      min-height: ${height};

      max-width: ${width};
      max-height: ${height};

      overflow: hidden;

      position: relative;

      background: #ffffff;

      color: #111111;

      border:
        0.25mm solid #222222;

      border-radius: 0.8mm;

      padding: 1.2mm;

      page-break-inside: avoid;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

    }


    /* =====================================================
       CABEÇALHO
    ===================================================== */

    .label-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 1mm;

      height: auto;

      margin-bottom: 0.7mm;

    }


    .label-brand {

      display: flex;

      align-items: center;

      gap: 0.8mm;

      min-width: 0;

    }


    .label-brand-mark {

      width: 3.8mm;
      height: 3.8mm;

      min-width: 3.8mm;

      display: flex;

      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background: #5e2b97;

      color: #ffffff;

      font-size: 2.1mm;

      font-weight: 900;

    }


    .label-brand-text {

      display: flex;

      flex-direction: column;

      min-width: 0;

    }


    .label-brand-text strong {

      font-size: 2.4mm;

      line-height: 1;

      white-space: nowrap;

    }


    .label-brand-text span {

      font-size: 1.2mm;

      line-height: 1;

      color: #666666;

      margin-top: 0.3mm;

    }


    .label-cycle {

      text-align: right;

      flex-shrink: 0;

    }


    .label-cycle small {

      display: block;

      font-size: 1.15mm;

      line-height: 1;

      font-weight: 700;

      color: #666666;

    }


    .label-cycle strong {

      display: block;

      font-size: 2.8mm;

      line-height: 1;

      color: #5e2b97;

    }


    .label-divider {

      width: 100%;

      height: 0.18mm;

      background: #cfcfcf;

      margin: 0.7mm 0;

    }


    /* =====================================================
       CONTEÚDO
    ===================================================== */

    .label-main {

      display: flex;

      align-items: stretch;

      justify-content: space-between;

      gap: 1mm;

      height: calc(
        100% - 9mm
      );

    }


    .label-information {

      flex: 1;

      min-width: 0;

      display: grid;

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      column-gap: 1mm;

      row-gap: 0.45mm;

      overflow: hidden;

    }


    .label-field {

      min-width: 0;

      overflow: hidden;

    }


    .label-field span {

      display: block;

      font-size: 1mm;

      line-height: 1;

      color: #666666;

      text-transform: uppercase;

      font-weight: 700;

      white-space: nowrap;

    }


    .label-field strong {

      display: block;

      font-size: 1.55mm;

      line-height: 1.05;

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

      margin-top: 0.2mm;

    }


    /* =====================================================
       QR
    ===================================================== */

    .label-qr-area {

      width: 11mm;

      min-width: 11mm;

      display: flex;

      flex-direction: column;

      align-items: center;

      justify-content: center;

    }


    .label-qr {

      width: 9mm;

      height: 9mm;

      display: flex;

      align-items: center;

      justify-content: center;

      background: #ffffff;

    }


    .label-qr img {

      width: 9mm !important;

      height: 9mm !important;

      display: block;

    }


    .label-qr canvas {

      width: 9mm !important;

      height: 9mm !important;

      display: block;

    }


    .label-qr-caption {

      font-size: 0.9mm;

      line-height: 1;

      font-weight: 700;

      color: #666666;

      margin-top: 0.3mm;

      text-align: center;

      white-space: nowrap;

    }


    /* =====================================================
       RODAPÉ
    ===================================================== */

    .label-footer {

      display: flex;

      justify-content: space-between;

      align-items: center;

      height: 3mm;

      margin-top: 0.4mm;

    }


    .label-result span {

      display: block;

      font-size: 0.9mm;

      line-height: 1;

      color: #666666;

      font-weight: 700;

    }


    .label-result strong {

      display: block;

      font-size: 1.45mm;

      line-height: 1;

      color: #15803d;

    }


    .label-footer-cycle {

      font-size: 1.1mm;

      line-height: 1;

      color: #666666;

      font-weight: 700;

    }


    /* =====================================================
       BROCAS — 26 × 15 MM
    ===================================================== */

    .steri-label.label-brocas {

      width: 26mm;

      height: 15mm;

      padding: 1mm;

    }


    .steri-label.label-brocas .label-information {

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      row-gap: 0.3mm;

    }


    .steri-label.label-brocas .label-field:nth-child(n+5) {

      display: none;

    }


    .steri-label.label-brocas .label-qr-area {

      width: 8mm;

      min-width: 8mm;

    }


    .steri-label.label-brocas .label-qr {

      width: 6.5mm;

      height: 6.5mm;

    }


    .steri-label.label-brocas .label-qr img,
    .steri-label.label-brocas .label-qr canvas {

      width: 6.5mm !important;

      height: 6.5mm !important;

    }


    .steri-label.label-brocas .label-field span {

      font-size: 0.85mm;

    }


    .steri-label.label-brocas .label-field strong {

      font-size: 1.25mm;

    }


    .steri-label.label-brocas .label-brand-text strong {

      font-size: 2mm;

    }


    .steri-label.label-brocas .label-brand-text span {

      font-size: 0.9mm;

    }


    .steri-label.label-brocas .label-cycle small {

      font-size: 0.9mm;

    }


    .steri-label.label-brocas .label-cycle strong {

      font-size: 2.2mm;

    }


    /* =====================================================
       KIT / KIT CIRÚRGICO / BANDEJA
       44,45 × 16,93 MM
    ===================================================== */

    .steri-label.label-kit,
    .steri-label.label-kitCirurgico,
    .steri-label.label-bandeja {

      width: 44.45mm;

      height: 16.93mm;

      padding: 1.2mm;

    }


    /* =====================================================
       BANDEJA DEDICADA
       21 × 33 MM
    ===================================================== */

    ${
      type === "bandeja" && dedicated
        ? `

          .steri-label.label-bandeja {

            width: 21mm;

            height: 33mm;

            padding: 1.2mm;

          }

          .steri-label.label-bandeja .label-main {

            flex-direction: column;

            height: auto;

            gap: 1mm;

          }

          .steri-label.label-bandeja .label-information {

            grid-template-columns:
              1fr;

            row-gap: 0.7mm;

          }

          .steri-label.label-bandeja .label-qr-area {

            width: 100%;

            min-width: 0;

            height: 10mm;

          }

          .steri-label.label-bandeja .label-qr {

            width: 8mm;

            height: 8mm;

          }

          .steri-label.label-bandeja .label-qr img,
          .steri-label.label-bandeja .label-qr canvas {

            width: 8mm !important;

            height: 8mm !important;

          }

        `
        : ""
    }


    /* =====================================================
       MANUAL
    ===================================================== */

    .steri-label.label-manual {

      width: ${width};

      height: ${height};

      min-width: ${width};

      min-height: ${height};

      max-width: ${width};

      max-height: ${height};

    }


    /* =====================================================
       FALLBACK QR
    ===================================================== */

    .qr-fallback {

      width: 8mm;

      height: 8mm;

      border:
        0.3mm solid #111111;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 2mm;

      font-weight: 900;

    }


    /* =====================================================
       IMPRESSÃO
    ===================================================== */

    @media print {

      @page {

        ${
          dedicated
            ? `
              size:
                ${width}mm
                ${height}mm;

              margin: 0;
            `
            : `
              size: A4;

              margin: 0;
            `
        }

      }


      html,
      body {

        margin: 0;

        padding: 0;

        width: auto;

        min-height: auto;

      }


      .print-document {

        ${
          dedicated
            ? `
              width: ${width}mm;

              height: ${height}mm;

              padding: 0;

              margin: 0;

              display: block;
            `
            : `
              width: 100%;

              padding: 8mm;
            `
        }

      }


      .steri-label {

        page-break-inside: avoid;

        break-inside: avoid;

        box-shadow: none !important;

      }


      ${
        dedicated
          ? `
            .steri-label {

              page-break-after: always;

            }

            .steri-label:last-child {

              page-break-after: auto;

            }
          `
          : ""
      }

    }

  `;

}

/* ============================================================
   SCRIPT DO QR CODE PARA IMPRESSÃO
============================================================ */

function getPrintQRCodeScript() {

  return `

    (function() {

      const qrContainers =
        document.querySelectorAll(
          "[data-qr-container]"
        );


      function loadQRCode() {

        const script =
          document.createElement("script");


        script.src =
          "${QR_CODE_LIBRARY}";


        script.onload =
          function() {

            generate();

          };


        script.onerror =
          function() {

            generateFallback();

          };


        document.head.appendChild(
          script
        );

      }


      function generate() {

        if (
          typeof QRCode ===
          "undefined"
        ) {

          generateFallback();

          return;

        }


        qrContainers.forEach(
          function(container) {

            const label =
              container.closest(
                ".steri-label"
              );


            if (!label) {

              return;

            }


            const value =
              label.dataset.qrValue ||
              "SteriApp";


            container.innerHTML =
              "";


            new QRCode(
              container,
              {

                text: value,

                width: 150,

                height: 150,

                correctLevel:
                  QRCode.CorrectLevel.M

              }
            );

          }
        );


        setTimeout(
          function() {

            window.print();

          },
          500
        );

      }


      function generateFallback() {

        qrContainers.forEach(
          function(container) {

            container.innerHTML =
              '<div class="qr-fallback">QR</div>';

          }
        );


        setTimeout(
          function() {

            window.print();

          },
          300
        );

      }


      loadQRCode();

    })();

  `;

}


/* ============================================================
   LOADING
============================================================ */

function setLoading(
  active,
  title = "Carregando...",
  message = "Aguarde."
) {

  state.isLoading =
    active;


  if (!elements.loadingOverlay) {

    return;

  }


  if (active) {

    setText(
      elements.loadingTitle,
      title
    );


    setText(
      elements.loadingMessage,
      message
    );


    elements.loadingOverlay.hidden =
      false;

  } else {

    elements.loadingOverlay.hidden =
      true;

  }

}


/* ============================================================
   STATUS DO SISTEMA
============================================================ */

function updateSystemStatus(
  text,
  online
) {

  setText(
    elements.systemStatus,
    text
  );


  if (
    elements.systemStatusIndicator
  ) {

    elements.systemStatusIndicator.classList.toggle(
      "offline",
      !online
    );

  }

}


/* ============================================================
   ERRO DA PÁGINA
============================================================ */

function showErrorState(message) {

  if (
    elements.cycleStatusBadge
  ) {

    elements.cycleStatusBadge.textContent =
      "ERRO";

    elements.cycleStatusBadge.className =
      "status-badge error";

  }


  if (
    elements.configurationMessageText
  ) {

    elements.configurationMessageText.textContent =
      message;

  }


  if (
    elements.previewPlaceholder
  ) {

    elements.previewPlaceholder.hidden =
      false;

  }


  if (
    elements.labelPreview
  ) {

    elements.labelPreview.hidden =
      true;

  }


  updateGenerateButton();

}


/* ============================================================
   LOGOUT
============================================================ */

function handleLogout() {

  try {

    localStorage.removeItem(
      "steriapp_user"
    );

    localStorage.removeItem(
      "steriapp_session"
    );

    localStorage.removeItem(
      "steriapp_token"
    );

  } catch (error) {

    console.warn(
      "Não foi possível limpar a sessão:",
      error
    );

  }


  window.location.href =
    "/index.html";

}


/* ============================================================
   SIDEBAR MOBILE
============================================================ */

function toggleSidebar() {

  if (
    !elements.sidebar
  ) {

    return;

  }


  elements.sidebar.classList.toggle(
    "mobile-open"
  );

}


/* ============================================================
   TOAST
============================================================ */

function showToast(
  title,
  message,
  type = "success"
) {

  if (
    !elements.toast
  ) {

    return;

  }


  setText(
    elements.toastTitle,
    title
  );


  setText(
    elements.toastMessage,
    message
  );


  if (
    elements.toastIcon
  ) {

    elements.toastIcon.textContent =
      getToastIcon(type);

  }


  elements.toast.className =
    `toast ${type}`;


  elements.toast.hidden =
    false;


  clearTimeout(
    showToast.timer
  );


  showToast.timer =
    setTimeout(
      hideToast,
      5000
    );

}


/* ============================================================
   ÍCONE DO TOAST
============================================================ */

function getToastIcon(type) {

  switch (type) {

    case "error":
      return "×";

    case "warning":
      return "!";

    case "success":
    default:
      return "✓";

  }

}


/* ============================================================
   ESCONDER TOAST
============================================================ */

function hideToast() {

  if (
    elements.toast
  ) {

    elements.toast.hidden =
      true;

  }

}


/* ============================================================
   FORMATAÇÃO DE DATA
============================================================ */

function formatDate(value) {

  if (!value) {

    return "—";

  }


  /*
   * Datas já no padrão brasileiro.
   */

  if (
    /^\d{2}\/\d{2}\/\d{4}/.test(
      String(value)
    )
  ) {

    return String(value);

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleDateString(
    "pt-BR"
  );

}


/* ============================================================
   TEMPERATURA
============================================================ */

function formatTemperature(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "—";

  }


  const stringValue =
    String(value);


  if (
    /°c|ºc|c$/i.test(
      stringValue.trim()
    )
  ) {

    return stringValue;

  }


  return `${stringValue} °C`;

}


/* ============================================================
   TEMPO
============================================================ */

function formatTime(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "—";

  }


  return String(value);

}


/* ============================================================
   RESULTADO
============================================================ */

function normalizeResult(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "—";

  }


  const stringValue =
    String(value);


  const normalized =
    stringValue.toLowerCase();


  if (
    normalized === "true" ||
    normalized === "success" ||
    normalized === "sucesso" ||
    normalized === "ok"
  ) {

    return "SUCESSO";

  }


  if (
    normalized === "false" ||
    normalized === "error" ||
    normalized === "erro" ||
    normalized === "falha"
  ) {

    return "ERRO";

  }


  return stringValue.toUpperCase();

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* ============================================================
   DEFINIR TEXTO
============================================================ */

function setText(
  element,
  value
) {

  if (!element) {

    return;

  }


  element.textContent =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : String(value);

}


/* ============================================================
   MENSAGEM DE ERRO AMIGÁVEL
============================================================ */

function getFriendlyErrorMessage(
  error
) {

  if (!error) {

    return "Ocorreu um erro inesperado.";

  }


  const message =
    String(
      error.message || ""
    );


  if (
    message.includes(
      "Failed to fetch"
    )
  ) {

    return (
      "Não foi possível conectar ao servidor. " +
      "Verifique a conexão com a internet e a API do SteriApp."
    );

  }


  if (
    message.includes(
      "404"
    )
  ) {

    return (
      "O ciclo não foi encontrado no servidor."
    );

  }


  if (
    message.includes(
      "500"
    )
  ) {

    return (
      "O servidor encontrou um erro ao buscar o ciclo."
    );

  }


  return (
    message ||
    "Não foi possível carregar os dados."
  );

}


/* ============================================================
   DELAY
============================================================ */

function delay(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


/* ============================================================
   IMPRESSÃO MANUAL VIA TECLADO
============================================================ */

window.addEventListener(
  "keydown",
  event => {

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "p"
    ) {

      /*
       * Não bloqueamos o Ctrl+P do navegador.
       * A página continua usando o sistema nativo
       * de impressão.
       */

    }

  }
);


/* ============================================================
   EXPOSIÇÃO OPCIONAL PARA DEBUG
============================================================ */

window.SteriAppLabelPrint = {

  state,

  LABEL_TYPES,

  reloadCycle: loadCycle,

  selectLabelType,

  setQuantity,

  setPrintMode,

  printLabels

};