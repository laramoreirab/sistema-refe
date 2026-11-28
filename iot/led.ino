#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  5
#define RST_PIN 22
#define SCK_PIN 18
#define MISO_PIN 19
#define MOSI_PIN 23

#define LED_CARTAO   25   // verde
#define LED_CHAVEIRO 26   // vermelho

// SUBSTITUA pelos UIDs anotados no Código 1
const String UID_CARTAO   = "A1:B2:C3:D4";
const String UID_CHAVEIRO = "11:22:33:44";

MFRC522 rfid(SS_PIN, RST_PIN);

String uidParaTexto(byte *buffer, byte tamanho) {
  String uid = "";
  for (byte i = 0; i < tamanho; i++) {
    if (buffer[i] < 0x10) uid += "0";
    uid += String(buffer[i], HEX);
    if (i < tamanho - 1) uid += ":";
  }
  uid.toUpperCase();
  return uid;
}

// Acende o LED por 1 segundo e apaga
void piscar(int led) {
  digitalWrite(led, HIGH);
  delay(1000);
  digitalWrite(led, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_CARTAO, OUTPUT);
  pinMode(LED_CHAVEIRO, OUTPUT);

  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  rfid.PCD_Init();
  Serial.println("Aproxime o cartao ou o chaveiro...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  String uid = uidParaTexto(rfid.uid.uidByte, rfid.uid.size);
  Serial.println("UID: " + uid);

  if (uid == UID_CARTAO) {
    Serial.println("Cartao reconhecido");
    piscar(LED_CARTAO);
  } else if (uid == UID_CHAVEIRO) {
    Serial.println("Chaveiro reconhecido");
    piscar(LED_CHAVEIRO);
  } else {
    Serial.println("Tag desconhecida");
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}