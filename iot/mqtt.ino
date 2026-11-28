#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

// Configure os mesmos dados de broker e chave usados no backend.
const char* WIFI_SSID = "NOME_DA_REDE";
const char* WIFI_SENHA = "SENHA_DA_REDE";
const char* MQTT_BROKER = "192.168.1.10"; // IP/host do broker alcançável pelo backend e ESP32
const uint16_t MQTT_PORTA = 1883;
const char* MQTT_USUARIO = ""; // deixe vazio se o broker não exigir usuário
const char* MQTT_SENHA = "";
const char* TOTEM_ID = "UUID_DO_TOTEM_CADASTRADO_NO_BANCO";
const char* TOTEM_API_KEY = "CHAVE_PRIVADA_DO_TOTEM";
const char* PREFIXO_TOPICO = "refe/totens";

// Pinagem do leitor conforme os arquivos de referência em iot/.
constexpr uint8_t PINO_SDA_RFID = 5;
constexpr uint8_t PINO_RST_RFID = 22;
constexpr uint8_t PINO_ATUADOR = 26; // saída para módulo/driver externo, não para motor direto

WiFiClient clienteWifi;
PubSubClient mqtt(clienteWifi);
MFRC522 leitor(PINO_SDA_RFID, PINO_RST_RFID);
String topicoEventos;
String topicoComandos;
String topicoRespostas;
String clientId;
String ultimoUidPublicado;
unsigned long ultimaLeituraMs = 0;
unsigned long ultimaTentativaMqttMs = 0;

// Envia um evento RFID ao backend com a chave que identifica o equipamento.
void publicarUidRfid(const String& uid) {
  StaticJsonDocument<256> evento;
  evento["tipo"] = "RFID_SCAN";
  evento["uidRfid"] = uid;
  evento["apiKey"] = TOTEM_API_KEY;

  char payload[256];
  const size_t tamanho = serializeJson(evento, payload, sizeof(payload));
  if (tamanho == 0 || !mqtt.publish(topicoEventos.c_str(), payload, false)) {
    Serial.println("Falha ao publicar a leitura RFID.");
    return;
  }
  Serial.println("UID enviado ao backend: " + uid);
}

// Converte o UID do RC522 para o mesmo formato hexadecimal usado no banco.
String uidParaTexto(byte* bytes, byte tamanho) {
  String uid;
  for (byte i = 0; i < tamanho; i++) {
    if (bytes[i] < 0x10) uid += '0';
    uid += String(bytes[i], HEX);
    if (i < tamanho - 1) uid += ':';
  }
  uid.toUpperCase();
  return uid;
}

// Aciona a saída do dispenser depois de receber um comando válido do backend.
void liberarTag(int posicao) {
  if (posicao < 0) {
    Serial.println("Comando sem posição de tag; dispenser não acionado.");
    return;
  }

  Serial.printf("Liberando tag da posição %d.\n", posicao);
  // O GPIO aciona somente a entrada de um módulo/driver externo.
  // Ajuste o pino e a duração ao mecanismo instalado no dispenser.
  digitalWrite(PINO_ATUADOR, HIGH);
  delay(600);
  digitalWrite(PINO_ATUADOR, LOW);
}

// Trata comandos de liberação e mostra os resultados das consultas RFID.
void aoReceberMqtt(char* topico, byte* payload, unsigned int tamanho) {
  if (String(topico) == topicoRespostas) {
    Serial.println("Resposta do backend:");
    Serial.write(payload, tamanho);
    Serial.println();
    return;
  }

  StaticJsonDocument<512> mensagem;
  const DeserializationError erro = deserializeJson(mensagem, payload, tamanho);
  if (erro) {
    Serial.println("Comando MQTT inválido.");
    return;
  }

  if (String(topico) == topicoComandos && String(mensagem["acao"] | "") == "LIBERAR_TAG") {
    liberarTag(mensagem["posicao"] | -1);
  }
}
// Mantém o Wi-Fi conectado antes de iniciar o tráfego MQTT.
void conectarWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("Conectando ao Wi-Fi %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_SENHA);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.printf("\nWi-Fi conectado. IP: %s\n", WiFi.localIP().toString().c_str());
}

// Conecta ao broker e assina os comandos e respostas endereçados a este totem.
void conectarMqtt() {
  if (mqtt.connected() || WiFi.status() != WL_CONNECTED) return;
  if (millis() - ultimaTentativaMqttMs < 5000) return;
  ultimaTentativaMqttMs = millis();

  const String sufixoClientId = String((uint32_t)ESP.getEfuseMac(), HEX);
  clientId = "refe-" + sufixoClientId;
  Serial.printf("Conectando ao broker MQTT %s:%u...\n", MQTT_BROKER, MQTT_PORTA);

  bool conectado;
  if (strlen(MQTT_USUARIO) > 0) {
    conectado = mqtt.connect(clientId.c_str(), MQTT_USUARIO, MQTT_SENHA);
  } else {
    conectado = mqtt.connect(clientId.c_str());
  }

  if (!conectado) {
    Serial.printf("Falha MQTT, código %d. Nova tentativa em 5 s.\n", mqtt.state());
    return;
  }

  mqtt.subscribe(topicoComandos.c_str(), 1);
  mqtt.subscribe(topicoRespostas.c_str(), 1);
  Serial.println("MQTT conectado e inscrito nos tópicos do totem.");
}

// Inicializa RFID, Wi-Fi e tópicos exclusivos do totem cadastrado.
void setup() {
  Serial.begin(115200);
  pinMode(PINO_ATUADOR, OUTPUT);
  digitalWrite(PINO_ATUADOR, LOW);

  SPI.begin(18, 19, 23, PINO_SDA_RFID);
  leitor.PCD_Init();

  topicoEventos = String(PREFIXO_TOPICO) + "/" + TOTEM_ID + "/eventos";
  topicoComandos = String(PREFIXO_TOPICO) + "/" + TOTEM_ID + "/comandos";
  topicoRespostas = String(PREFIXO_TOPICO) + "/" + TOTEM_ID + "/respostas";

  mqtt.setServer(MQTT_BROKER, MQTT_PORTA);
  mqtt.setCallback(aoReceberMqtt);
  mqtt.setBufferSize(4096);
  conectarWifi();
  conectarMqtt();
  Serial.println("Totem pronto. Aproxime a carteirinha ou a tag RFID.");
}

// Mantém MQTT ativo e envia cada leitura RFID uma vez ao backend.
void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWifi();
  conectarMqtt();
  mqtt.loop();

  if (!leitor.PICC_IsNewCardPresent() || !leitor.PICC_ReadCardSerial()) return;

  const String uid = uidParaTexto(leitor.uid.uidByte, leitor.uid.size);
  const unsigned long agora = millis();
  if (uid != ultimoUidPublicado || agora - ultimaLeituraMs > 2000) {
    publicarUidRfid(uid);
    ultimoUidPublicado = uid;
    ultimaLeituraMs = agora;
  }

  leitor.PICC_HaltA();
  leitor.PCD_StopCrypto1();
}
