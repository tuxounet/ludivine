async function start() {
  // Config time
  const clientId = sessionStorage.getItem("clientId");
  const configUrl = clientId !== null ? "/connect?id=" + clientId : "/connect";
  const result = await fetch(configUrl);
  const body = await result.json();
  sessionStorage.setItem("clientId", body.clientId);
  await startServiceWorker();
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
  const msg = entry.message;

  let tag = "div";
  let body = "";
  switch (msg.type) {
    case "message":
      body = "* " + msg.body;
      break;
    case "object":
      body = JSON.stringify(msg.body);
      tag = "pre";
      break;
    default:
      body = JSON.stringify(entry);
      tag = "pre";
      break;
  }
  const output = document.getElementById("output");
  const appendix = document.createElement(tag);
  appendix.setAttribute("class", "panel-block");
  appendix.innerText = body;
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
async function startServiceWorker() {
  const pushServerPublicKey = vapi_pub;
  /**
   * checks if Push notification and service workers are supported by your browser
   */
  function isPushNotificationSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }
  function isServiceWorkerSupported() {
    return navigator && navigator.serviceWorker !== undefined;
  }
  /**
   * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
   */
  function initializePushNotifications() {
    // request user grant to show notification
    return Notification.requestPermission(function (result) {
      return result;
    });
  }
  /**
   * shows a notification
   */
  function sendWelcome() {
    const text = "Enregistrement du terminal effectué";
    const title = "Souscription";
    const options = {
      body: text,       
      vibrate: [200, 100, 200],
      tag: "welcome",
      actions: [{ action: "/", title: "Ouvrir" }],
    };
    navigator.serviceWorker.ready.then(function (serviceWorker) {
      serviceWorker.showNotification(title, options);
    });
  }
  let refreshing;
  /**
   *
   */
  const registerServiceWorker= ()=> {
    // The event listener that is fired when the service worker updates
    // Here we reload the page
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (refreshing) return;
      window.location.reload();
      refreshing = true;
    });
    navigator.serviceWorker.register("/sw.js").then(function (swRegistration) {
      //you can do something with the service wrker registration (swRegistration)
      console.info("sw registered");
      swRegistration.addEventListener("updatefound", () => {
        // An updated service worker has appeared in reg.installing!
        newWorker = swRegistration.installing;
        newWorker.addEventListener("statechange", () => {
          // Has service worker state changed?
          switch (newWorker.state) {
            case "installed":
              // There is a new service worker available, show the notification
              if (navigator.serviceWorker.controller) {
                console.info("new version available, updating");
                newWorker.postMessage({ action: "skipWaiting" });
              }
              break;
          }
        });
      });
    });
  }
  /**
   *
   * using the registered service worker creates a push notification subscription and returns it
   *
   */
  function createNotificationSubscription() {
    //wait for service worker installation to be ready, and then
    return navigator.serviceWorker.ready.then(function (serviceWorker) {
      // subscribe and return the subscription
      return serviceWorker.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: pushServerPublicKey,
        })
        .then(function (subscription) {
          console.log("User is subscribed.", subscription);
          return subscription;
        })
        .then((sub) => {
          return fetch("/subscribe", {
            headers: {
              "content-type": "application/json;charset=UTF-8",
              "sec-fetch-mode": "cors",
            },
            body: JSON.stringify(sub),
            method: "POST",
            mode: "cors",
          });
        })
        .then((data) => {
          if (data.status === 201) {
            console.info("user registered", data.status);
            sendWelcome();
          }
        })
        .catch((e) => console.error(e));
    });
  }
  const serviceWorkerSupported = isServiceWorkerSupported();
  const pushNotificationSuported = isPushNotificationSupported();
  if (serviceWorkerSupported && pushNotificationSuported) {
    registerServiceWorker();
    initializePushNotifications().then(function (consent) {
      if (consent === "granted") {
        createNotificationSubscription();
      }
    });
  }
}
start()
  .then(() => {
    console.info("started");
  })
  .catch((e) => {
    console.error("FATAL", e);
  });
