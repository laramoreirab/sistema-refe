// 1. Configura a comunicação SPI com os pinos do ESP32
SPI1.setup({ sck: D18, miso: D19, mosi: D23 });

// 2. Conecta o módulo MFRC522 usando o SPI e o pino CS (SDA)
var rfid = require("MFRC522").connect(SPI1, D5);

// 3. Converte o UID (lista de bytes) em texto hexadecimal, ex: "A1:B2:C3:D4"
function uidParaTexto(uid) {
  var partes = [];
  for (var i = 0; i < uid.length; i++) {
    partes.push(("0" + uid[i].toString(16)).slice(-2).toUpperCase());
  }
  return partes.join(":");
}

// 4. A cada 500 ms, procura por uma tag/cartão próximo ao leitor
setInterval(function () {
  rfid.findCards(function (card) {
    console.log("Lido! UID:", uidParaTexto(card));
  });
}, 500);

