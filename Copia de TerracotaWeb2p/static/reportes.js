const reportConfig = {
  ventas: {
    summary: "Reporte Consolidado de Ventas. Incluye la lista de transacciones cobradas y el ranking de ventas de productos con su stock actual.",
    category: ["Todos", "Reporte de Ventas", "Ventas por día", "Métodos de pago"],
    status: ["Todos", "Completado", "En proceso", "Cancelado"],
    start: "2026-07-01",
    end: "2026-07-04",
    hint: "Formato recomendado: PDF para presentar ventas del periodo.",
  },
  usuarios: {
    summary: "Actividad del personal. Muestra roles, usuarios activos y último acceso.",
    category: ["Todos los roles", "Administrador", "Mesero", "Cocina", "Cajero"],
    status: ["Todos", "Activo", "Inactivo"],
    start: "2026-07-01",
    end: "2026-07-04",
    hint: "Formato recomendado: PDF para entregar resumen de usuarios.",
  },
  inventario: {
    summary: "Estado actual del inventario. Incluye stock bajo, mínimos y disponibilidad.",
    category: ["Inventario general", "Bebidas", "Comida", "Insumos", "Limpieza"],
    status: ["Todos", "Disponible", "Bajo", "Urgente"],
    start: "2026-07-01",
    end: "2026-07-04",
    hint: "Formato recomendado: XLSX para revisar cantidades de inventario.",
  },
};

const buttons = document.querySelectorAll(".report-type[data-report]");
const typeInput = document.getElementById("tipoReporte");
const summary = document.getElementById("reportSummary");
const categorySelect = document.getElementById("categoriaReporte");
const statusSelect = document.getElementById("estadoReporte");
const startInput = document.getElementById("fechaInicio");
const endInput = document.getElementById("fechaFin");
const exportHint = document.getElementById("exportHint");

function fillSelect(select, options) {
  select.innerHTML = "";
  options.forEach((option) => {
    const element = document.createElement("option");
    element.textContent = option;
    select.appendChild(element);
  });
}

function selectReport(type) {
  const config = reportConfig[type];
  if (!config) return;

  buttons.forEach((button) => {
    const isActive = button.dataset.report === type;
    button.classList.toggle("selected", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  typeInput.value = type;
  summary.textContent = config.summary;
  startInput.value = config.start;
  endInput.value = config.end;
  exportHint.textContent = config.hint;
  fillSelect(categorySelect, config.category);
  fillSelect(statusSelect, config.status);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    selectReport(button.dataset.report);
  });
});
