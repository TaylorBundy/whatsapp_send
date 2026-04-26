const input = document.getElementById("numero");
const enviarBtn = document.getElementById("enviar");
const copiarBtn = document.getElementById("copiar");
const msgEl = document.getElementById("msg");
const successEl = document.getElementById("success");
const select = document.getElementById("customSelect");
const selected = select.querySelector(".selected");
const options = select.querySelector(".options");
const card = document.querySelector(".card");
let codigoPais = "54"; // default
let codigoPais2;
const flags = {
  54: "https://flagcdn.com/w20/ar.png",
  34: "https://flagcdn.com/w20/es.png",
  57: "https://flagcdn.com/w20/co.png",
  1: "https://flagcdn.com/w20/us.png",
  52: "https://flagcdn.com/w20/mx.png",
  56: "https://flagcdn.com/w20/cl.png",
};
const historialDiv = document.getElementById("historial");

function mostrarHistorial() {
  const lista = JSON.parse(localStorage.getItem("numeros")) || [];

  historialDiv.innerHTML = "";

  if (lista.length === 0) return;

  lista.forEach((num) => {
    const item = document.createElement("div");
    item.textContent = num;
    item.title = `Seleccione el numero: ${num}, para enviar mensaje.`;

    item.addEventListener("click", () => {
      input.value = num;
      historialDiv.style.display = "none";
      input.focus();
    });

    historialDiv.appendChild(item);
  });

  historialDiv.style.display = "block";
}

// Mostrar al hacer click o focus
//input.addEventListener("focus", mostrarHistorial);
card.addEventListener("mouseleave", () => {
  historialDiv.style.display = "none";
});
input.addEventListener("click", mostrarHistorial);

// Ocultar al hacer click fuera
document.addEventListener("click", (e) => {
  if (!historialDiv.contains(e.target) && e.target !== input) {
    historialDiv.style.display = "none";
  }
});

function guardarNumero(numero) {
  const key = "numeros";

  let lista = JSON.parse(localStorage.getItem(key)) || [];

  if (!lista.includes(numero)) {
    lista.push(numero);
    localStorage.setItem(key, JSON.stringify(lista));
  }
}

// focus al abrir
window.addEventListener("DOMContentLoaded", () => {
  input.focus();
  input.title = `Ingrese el número al cual desea enviar un mensaje.!`;
  selected.title = `Seleccione el código correspondiente a su país.!`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const mapaTZ = {
    "America/Buenos_Aires": "Argentina (+54)",
    "Europe/Madrid": "España (+34)",
    "America/Mexico_City": "México (+52)",
    "America/Bogota": "Colombia (+57)",
    "America/Lima": "51",
    "America/Santiago": "Chile (+56)",
    "America/New_York": "Us (+1)",
  };

  const codigo = mapaTZ[tz];

  if (codigo) {
    codigoPais2 = codigo
      .split(" ")[1]
      .replace("(", "")
      .replace(")", "")
      .replace("+", "");
    selected.innerHTML = `<img src="${flags[codigoPais2]}">${codigo}`;
  }
  // si viene ?num= en la URL, rellenar y abrir automáticamente
  const params = new URLSearchParams(location.search);
  const pre = params.get("num");
  if (pre) {
    input.value = pre;
    // pequeña demora para que el usuario vea el número
    setTimeout(() => abrirWhatsApp(), 300);
  }
});

// validar numero básico (al menos 6 dígitos)
function validarNumero(n) {
  const clean = n.replace(/\D/g, "");
  return clean.length >= 6 ? clean : null;
}

function abrirWhatsApp() {
  //const raw = input.value.trim();
  //const pais = document.getElementById("pais").value;
  const numeroLocal = input.value.trim();
  //   const raw = pais + numeroLocal;
  const raw = `+${codigoPais2} ${numeroLocal}`;
  const clean = validarNumero(raw);
  if (!clean) {
    alert("Por favor ingresa un número válido (incluye código de país).");
    input.focus();
    return;
  }
  const url = `https://wa.me/${encodeURIComponent(clean)}`;
  guardarNumero(numeroLocal);
  // abrir en pestaña nueva
  window.open(url, "_blank");

  // mostrar feedback
  successEl.textContent = `Abriendo chat con +${clean}`;
  successEl.style.display = "block";

  // si la página fue abierta por script como una ventana emergente, intentar cerrarla
  // la ventana se podrá cerrar sólo si window.opener existe o si fue creada por window.open
  setTimeout(() => {
    try {
      window.close();
    } catch (e) {
      /* no fais */
    }
  }, 350);
}

enviarBtn.addEventListener("click", abrirWhatsApp);

// enviar con Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") abrirWhatsApp();
});
// también Enter desde cualquier parte
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement !== copiarBtn) {
    // evita doble acción si el foco está en el copiarBtn
    abrirWhatsApp();
  }
});

// copiar numero limpia y copia al portapapeles
copiarBtn.addEventListener("click", async () => {
  const raw = input.value.trim();
  const clean = validarNumero(raw);
  if (!clean) {
    alert("Ingresa un número válido para copiar.");
    input.focus();
    return;
  }
  try {
    await navigator.clipboard.writeText(clean);
    msgEl.textContent = "Número copiado al portapapeles.";
    setTimeout(
      () => (msgEl.textContent = "Puedes presionar Enter para enviar."),
      1500,
    );
  } catch (err) {
    alert("No se pudo copiar. Usa Ctrl+C para copiar manualmente.");
  }
});

selected.addEventListener("click", () => {
  options.style.display = options.style.display === "block" ? "none" : "block";
});

options.querySelectorAll("div").forEach((opt) => {
  opt.addEventListener("click", () => {
    codigoPais = opt.dataset.code;
    selected.innerHTML = opt.innerHTML;
    options.style.display = "none";
  });
});

document.querySelectorAll(".options div").forEach((el) => {
  const code = el.dataset.code;
  const country = flags[code];

  if (country) {
    const img = el.querySelector("img");

    // CDN de banderas
    img.src = `${country}`;
  }
});

// window.addEventListener("DOMContentLoaded", () => {
//   //   const locale = navigator.language || navigator.userLanguage; // ej: "es-AR"
//   //   const pais = locale.split("-")[1]; // "AR"

//   //   const mapa = {
//   //     AR: "54",
//   //     ES: "34",
//   //     MX: "52",
//   //     CO: "57",
//   //     PE: "51",
//   //     CL: "56",
//   //     US: "1",
//   //   };

//   // const codigo = mapa[pais];

//   // if (codigo) {
//   //   //const select = document.getElementById("pais");
//   //   //select.value = codigo;
//   //   console.log(codigo);
//   // }

//   //document.getElementById("numero").focus();
//   const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const mapaTZ = {
//     "America/Buenos_Aires": "Argentina (+54)",
//     "Europe/Madrid": "España (+34)",
//     "America/Mexico_City": "México (+52)",
//     "America/Bogota": "Colombia (+57)",
//     "America/Lima": "51",
//     "America/Santiago": "Chile (+56)",
//     "America/New_York": "Us (+1)",
//   };

//   const codigo = mapaTZ[tz];

//   if (codigo) {
//     codigoPais2 = codigo
//       .split(" ")[1]
//       .replace("(", "")
//       .replace(")", "")
//       .replace("+", "");
//     //document.querySelector(".selected").textContent = `${codigo}`;
//     selected.innerHTML = `<img src="${flags[codigoPais2]}">${codigo}`;
//     //document.querySelector(`#selected`).src = flags[codigo];
//   }
// });
