SPI1.setup({ sck: D18, miso: D19, mosi: D23 });
var rfid = require("MFRC522").connect(SPI1, D5);

// LEDs
var ledCartao = D25;   // verde
var ledChaveiro = D26; // vermelho
pinMode(ledCartao, "output");
pinMode(ledChaveiro, "output");

// UIDs anotados no Programa 1 (SUBSTITUA pelos seus)
var UID_CARTAO = "A1:B2:C3:D4";
var UID_CHAVEIRO = "11:22:33:44";

function uidParaTexto(uid) {
  var partes = [];
  for (var i = 0; i < uid.length; i++) {
    partes.push(("0" + uid[i].toString(16)).slice(-2).toUpperCase());
  }
  return partes.join(":");
}

// Acende um LED por 1 segundo e depois apaga
function piscar(led) {
  digitalWrite(led, 1);
  setTimeout(function () { digitalWrite(led, 0); }, 1000);
}

setInterval(function () {
  rfid.findCards(function (card) {
    var uid = uidParaTexto(card);
    console.log("UID:", uid);

    if (uid === UID_CARTAO) {
      console.log("Cartão reconhecido");
      piscar(ledCartao);
    } else if (uid === UID_CHAVEIRO) {
      console.log("Chaveiro reconhecido");
      piscar(ledChaveiro);
    } else {
      console.log("Tag desconhecida");
    }
  });
}, 500);