// ===== CONFIGURAÇÃO (altere estes valores) =====
var WIFI_SSID = "NOME_DA_REDE";
var WIFI_SENHA = "SENHA_DA_REDE";
var BROKER = "broker.hivemq.com";          // broker público de teste
var TOPICO = "meuprojeto123/teste";        // use um nome único seu
var CLIENT_ID = "esp32-teste-" + getSerial().slice(-6); // evita conflito de ID

var wifi = require("Wifi");
var contador = 0;
var mqtt;

// 1. Conecta no Wi-Fi
function conectarWifi() {
  console.log("Conectando ao Wi-Fi...");
  wifi.connect(WIFI_SSID, { password: WIFI_SENHA }, function (err) {
    if (err) {
      console.log("Erro no Wi-Fi:", err);
      setTimeout(conectarWifi, 5000); // tenta de novo em 5 s
      return;
    }
    console.log("Wi-Fi OK. IP:", wifi.getIP().ip);
    conectarBroker();
  });
}

// 2. Conecta no broker MQTT
function conectarBroker() {
  console.log("Conectando ao broker", BROKER);
  mqtt = require("MQTT").create(BROKER, {
    client_id: CLIENT_ID,
    keep_alive: 60
  });

  // 3. Quando conectar, se inscreve no tópico e começa a publicar
  mqtt.on("connected", function () {
    console.log("Broker OK. Inscrito em:", TOPICO);
    mqtt.subscribe(TOPICO);

    setInterval(function () {
      contador++;
      var msg = JSON.stringify({ id: CLIENT_ID, n: contador });
      mqtt.publish(TOPICO, msg);
      console.log("Publicado:", msg);
    }, 5000);
  });

  // 4. Quando chegar mensagem no tópico inscrito
  mqtt.on("publish", function (pub) {
    console.log("RECEBIDO ->", pub.topic, ":", pub.message);
  });

  mqtt.on("disconnected", function () {
    console.log("Broker desconectou. Reconectando...");
    setTimeout(function () { mqtt.connect(); }, 5000);
  });

  mqtt.connect();
}

conectarWifi();