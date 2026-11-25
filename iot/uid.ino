#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  5    // SDA do RC522
#define RST_PIN 22
#define SCK_PIN 18
#define MISO_PIN 19
#define MOSI_PIN 23

MFRC522 rfid(SS_PIN, RST_PIN);

// Converte os bytes do UID em texto, ex: "A1:B2:C3:D4"
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

void setup() {
  Serial.begin(115200);
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);  // inicia o SPI
  rfid.PCD_Init();                                  // inicia o leitor
  Serial.println("Aproxime o cartao ou o chaveiro...");
}

void loop() {
  // Só continua se houver uma tag nova e ela puder ser lida
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print("Lido! UID: ");
  Serial.println(uidParaTexto(rfid.uid.uidByte, rfid.uid.size));

  rfid.PICC_HaltA();       // encerra a comunicação com a tag
  rfid.PCD_StopCrypto1();  // libera o leitor para a próxima leitura
}