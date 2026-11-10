const API_URL = 'https://api.frankfurter.dev/v2';

async function consultarAPI(caminho, signal) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, { signal });
  } catch (erro) {
    if (erro.name === 'AbortError') throw erro;
    throw new Error('Sem conexão com o serviço. Verifique sua internet.');
  }

  if (!resposta.ok) {
    throw new Error(`A consulta falhou (HTTP ${resposta.status}). Tente novamente.`);
  }

  try {
    return await resposta.json();
  } catch {
    throw new Error('A API retornou dados que não puderam ser lidos.');
  }
}

export async function listarMoedas(signal) {
  const dados = await consultarAPI('/currencies', signal);
  let moedas = [];

 
  if (Array.isArray(dados)) {
    moedas = dados.map((item) => ({
      codigo: item.iso_code || item.code,
      nome: item.name,
    }));
  } else if (dados && typeof dados === 'object') {
    moedas = Object.entries(dados).map(([codigo, nome]) => ({ codigo, nome }));
  }

  moedas = moedas
    .filter((moeda) =>
      typeof moeda.codigo === 'string' &&
      /^[A-Z]{3}$/.test(moeda.codigo) &&
      typeof moeda.nome === 'string' &&
      moeda.nome.trim().length > 0
    )
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  if (moedas.length < 2) {
    throw new Error('A API não retornou moedas suficientes para converter.');
  }

  return moedas;
}

export async function consultarTaxa(origem, destino, signal) {
  const caminho = `/rate/${encodeURIComponent(origem)}/${encodeURIComponent(destino)}`;
  const dados = await consultarAPI(caminho, signal);

  if (
    !dados ||
    typeof dados.rate !== 'number' ||
    !Number.isFinite(dados.rate) ||
    dados.rate <= 0 ||
    typeof dados.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dados.date) ||
    (dados.base && dados.base !== origem) ||
    (dados.quote && dados.quote !== destino)
  ) {
    throw new Error('A API retornou uma taxa ou data inválida. Tente novamente.');
  }

  return { taxa: dados.rate, data: dados.date };
}
