async function start() {
  // Config time
  const clientId = sessionStorage.getItem("clientId");
  const configUrl = clientId !== null ? "/connect?id=" + clientId : "/connect";
  const result = await fetch(configUrl);
  const body = await result.json();
  sessionStorage.setItem("clientId", body.clientId);

  // channel output binding
  const evs = new EventSource("/events");
  evs.onopen = () => {
    document
      .getElementById("status")
      .setAttribute("class", "navbar is-fixed-top" + " is-primary");
  };
  evs.onmessage = function (ev) {
    const data = ev.data;
    if (data.done) {
      evs.close();
      return;
    }
    const evArray = JSON.parse(data);
    if (evArray && evArray.length > 0) {
      for (const ev of evArray) {
        appendOutput(ev);
      }
    }
  };
  evs.onerror = function (ev) {
    document
      .getElementById("status")
      .setAttribute("class", "navbar is-fixed-top" + " is-danger");
  };
}

function appendOutput(entry) {
  const output = document.getElementById("output");
  const appendix = document.createElement("div");
  appendix.setAttribute("class", "panel-block");
  appendix.innerText = JSON.stringify(entry.message);
  output.appendChild(appendix);
  window.scrollTo(0, document.body.scrollHeight);
}

async function sendInput(element) {
  element.setAttribute("disabled", "disabled");
  const message = element.value;
  try {
    await fetch("/input", {
      method: "POST",
      body: JSON.stringify({ command: message }),
      headers: {
        "content-type": "application/json",
      },
    });
    element.value = "";
  } catch (e) {
    console.error(e);
  }

  element.removeAttribute("disabled");
  element.focus();
}

start()
  .then(() => {
    console.info("started");
  })
  .catch((e) => {
    console.error("FATAL", e);
  });
