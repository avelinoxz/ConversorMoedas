import test from 'node:test';
import assert from 'node:assert/strict';
import { validarValor } from '../src/viewmodels/validarValor.js';
import { listarMoedas, consultarTaxa } from '../src/models/moedasModel.js';

test('aceita valores positivos com vírgula, ponto e sem casas decimais', () => {
  assert.equal(validarValor('100,50').valor, 100.5);
  assert.equal(validarValor('100.50').valor, 100.5);
  assert.equal(validarValor('100').valor, 100);
  assert.equal(validarValor(' 0,75 ').valor, 0.75);
});

test('bloqueia vazio, zero, negativos e separadores ambíguos', () => {
  for (const texto of ['', '  ', '0', '-2', '1.000', '1,234.56', 'abc', '5,']) {
    assert.ok(validarValor(texto).erro, `Deveria rejeitar: ${texto}`);
  }
});

test('moedas vêm da API e são ordenadas pelo código', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let consultado = '';
  globalThis.fetch = async (url) => {
    consultado = url;
    return { ok: true, json: async () => [
      { iso_code: 'USD', name: 'US Dollar' },
      { iso_code: 'BRL', name: 'Brazilian Real' },
      { iso_code: 'EUR', name: 'Euro' },
    ] };
  };
  assert.deepEqual((await listarMoedas()).map((item) => item.codigo), ['BRL', 'EUR', 'USD']);
  assert.equal(consultado, 'https://api.frankfurter.dev/v2/currencies');
});

test('modelo consulta taxa no sentido correto e lê taxa e data', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let consultado = '';
  globalThis.fetch = async (url) => {
    consultado = url;
    return { ok: true, json: async () => ({ base: 'USD', quote: 'BRL', rate: 5.35, date: '2026-11-09' }) };
  };
  assert.deepEqual(await consultarTaxa('USD', 'BRL'), { taxa: 5.35, data: '2026-11-09' });
  assert.equal(consultado, 'https://api.frankfurter.dev/v2/rate/USD/BRL');
});

test('modelo rejeita taxa ausente ou inválida', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ rate: 0, date: '2026-11-09' }) });
  await assert.rejects(() => consultarTaxa('USD', 'BRL'), /taxa ou data inválida/);
});

test('modelo comunica falha HTTP', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(() => listarMoedas(), /HTTP 503/);
});

test('modelo comunica falha de conexão', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new TypeError('Network request failed'); };
  await assert.rejects(() => consultarTaxa('USD', 'BRL'), /Sem conexão/);
});
