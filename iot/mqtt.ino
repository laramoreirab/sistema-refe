#include <WiFi.h>
#include <PubSubClient.h>

// ===== CONFIGURAÇÃO (altere estes valores) =====
const char* WIFI_SSID  = "NOME_DA_REDE";
const char* WIFI_SENHA = "SENHA_DA_REDE";
const char* BROKER     = "broker.hivemq.com";
const int   PORTA      = 1883;
const char* TOPICO     = "meuprojeto123/teste";  // use um nome único seu

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

String clientId;
unsigned long ultimoEnvio = 0;
int contador = 0;

// Chamada quando chega mensagem em um tópico inscrito
void aoReceber(char* topico, byte* payload, unsigned int tamanho) {
  Serial.print("RECEBIDO -> ");
  Serial.print(topico);
  Serial.print(" : ");
  for (unsigned int i = 0; i < tamanho; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void conectarWifi() {
  Serial.print("Conectando ao Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_SENHA);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\nWi-Fi OK. IP: ");
  Serial.println(WiFi.localIP());
}

void conectarBroker() {
  while (!mqtt.connected()) {
    Serial.print("Conectando ao broker ");
    Serial.println(BROKER);
    if (mqtt.connect(clientId.c_str())) {
      Serial.print("Broker OK. Inscrito em: ");
      Serial.println(TOPICO);
      mqtt.subscribe(TOPICO);
    } else {
      Serial.print("Falhou, codigo: ");
      Serial.print(mqtt.state());
      Serial.println(". Tentando de novo em 5 s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  // ID único baseado no endereço da placa, evita conflito no broker público
  clientId = "esp32-teste-" + String((uint32_t)ESP.getEfuseMac(), HEX);

  conectarWifi();
  mqtt.setServer(BROKER, PORTA);
  mqtt.setCallback(aoReceber);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWifi();
  if (!mqtt.connected()) conectarBroker();
  mqtt.loop();  // mantém a conexão viva e processa mensagens recebidas

  // Publica a cada 5 segundos
  if (millis() - ultimoEnvio >= 5000) {
    ultimoEnvio = millis();
    contador++;
    String msg = "{\"id\":\"" + clientId + "\",\"n\":" + String(contador) + "}";
    mqtt.publish(TOPICO, msg.c_str());
    Serial.println("Publicado: " + msg);
  }
}