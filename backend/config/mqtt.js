import mqtt from 'mqtt';
import { createHash } from 'node:crypto';
import prisma from './prisma.js';
import { processarLeituraRfid } from '../models/TotemModel.js';

const brokerUrl = process.env.MQTT_URL;
const prefixoTopico = process.env.MQTT_TOPIC_PREFIX || 'refe/totens';
let clienteMqtt = null;

// Inicia a conexão com o broker e recebe leituras RFID publicadas pelos ESP32.
if (brokerUrl) {
  clienteMqtt = mqtt.connect(brokerUrl, {
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    reconnectPeriod: 5000,
  });

  clienteMqtt.on('connect', () => {
    clienteMqtt.subscribe(`${prefixoTopico}/+/eventos`, { qos: 1 }, (erro) => {
      if (erro) console.error('Falha ao assinar eventos MQTT:', erro.message);
      else console.log('Backend inscrito nos eventos MQTT dos totens.');
    });
  });

  clienteMqtt.on('error', (erro) => console.error('Erro MQTT:', erro.message));
  clienteMqtt.on('message', receberEventoTotem);
} else {
  console.warn('MQTT_URL não configurada; comandos MQTT do totem estão desativados.');
}

// Valida o equipamento, processa seu UID RFID e publica o resultado no tópico de resposta.
async function receberEventoTotem(topico, payload) {
  const totemId = topico.slice(prefixoTopico.length + 1).split('/')[0];
  const topicoResposta = `${prefixoTopico}/${totemId}/respostas`;

  try {
    const evento = JSON.parse(payload.toString());
    if (evento.tipo !== 'RFID_SCAN' || !evento.uidRfid || !evento.apiKey) return;

    // Confere a chave enviada pelo firmware com o hash gravado no cadastro do totem.
    const hashChave = createHash('sha256').update(String(evento.apiKey)).digest('hex');
    const totem = await prisma.totem.findUnique({ where: { id: totemId } });
    if (!totem || totem.status !== 'ATIVO' || totem.apiKeyHash !== hashChave) {
      publicarResposta(topicoResposta, { tipo: 'ERRO', mensagem: 'Totem não autorizado.' });
      return;
    }

    await prisma.totem.update({ where: { id: totemId }, data: { ultimoContatoEm: new Date() } });
    const resposta = await processarLeituraRfid(String(evento.uidRfid).trim(), totemId);
    publicarResposta(topicoResposta, resposta);
  } catch (erro) {
    console.error('Falha ao processar evento MQTT do totem:', erro.message);
    publicarResposta(topicoResposta, { tipo: 'ERRO', mensagem: 'Não foi possível processar a leitura RFID.' });
  }
}

// Publica um comando de liberação para o totem usando QoS 1.
export function publicarComandoTotem(totemId, comando) {
  return new Promise((resolve, reject) => {
    if (!clienteMqtt?.connected) return reject(new Error('Broker MQTT indisponível.'));
    const topico = `${prefixoTopico}/${totemId}/comandos`;
    clienteMqtt.publish(topico, JSON.stringify(comando), { qos: 1 }, (erro) => {
      if (erro) return reject(erro);
      return resolve();
    });
  });
}

// Envia uma resposta ao equipamento, se o cliente MQTT estiver conectado.
function publicarResposta(topico, resposta) {
  if (!clienteMqtt?.connected) return;
  clienteMqtt.publish(topico, JSON.stringify(resposta), { qos: 1 });
}
