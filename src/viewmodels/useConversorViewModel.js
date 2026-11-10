import { useEffect, useRef, useState } from 'react';
import { consultarTaxa, listarMoedas } from '../models/moedasModel';
import { validarValor } from './validarValor';

function formatarMoeda(valor, codigo) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: codigo,
    }).format(valor);
  } catch {
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor)} ${codigo}`;
  }
}

function formatarTaxa(valor) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 8,
  }).format(valor);
}

export function useConversorViewModel() {
  const [valor, setValor] = useState('100');
  const [origem, setOrigem] = useState('USD');
  const [destino, setDestino] = useState('BRL');
  const [moedas, setMoedas] = useState([]);
  const [carregandoMoedas, setCarregandoMoedas] = useState(true);
  const [erroMoedas, setErroMoedas] = useState('');
  const [carregandoConversao, setCarregandoConversao] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [novaTentativa, setNovaTentativa] = useState(0);
  const identificadorConsulta = useRef(0);
  const controleConsulta = useRef(null);
  const consultaEmAndamento = useRef(false);

  useEffect(() => {
    let ativo = true;
    const controller = new AbortController();

    setCarregandoMoedas(true);
    setErroMoedas('');

    listarMoedas(controller.signal)
      .then((lista) => {
        if (!ativo) return;

        const inicio = lista.some((item) => item.codigo === 'USD')
          ? 'USD' : lista[0].codigo;
        const fim = lista.some((item) => item.codigo === 'BRL') && inicio !== 'BRL'
          ? 'BRL' : lista.find((item) => item.codigo !== inicio).codigo;

        setMoedas(lista);
        setOrigem(inicio);
        setDestino(fim);
      })
      .catch((falha) => {
        if (!ativo) return;
        setMoedas([]);
        setErroMoedas(falha.message || 'Não foi possível carregar as moedas.');
      })
      .finally(() => {
        if (ativo) setCarregandoMoedas(false);
      });

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [novaTentativa]);

  useEffect(() => () => {
    identificadorConsulta.current += 1;
    controleConsulta.current?.abort();
  }, []);

 
  function limparConversao() {
    identificadorConsulta.current += 1;
    controleConsulta.current?.abort();
    controleConsulta.current = null;
    consultaEmAndamento.current = false;
    setCarregandoConversao(false);
    setResultado(null);
    setErro('');
  }

  function alterarValor(texto) {
    limparConversao();
    setValor(texto);
  }

  function alterarOrigem(codigo) {
    limparConversao();
    setOrigem(codigo);
  }

  function alterarDestino(codigo) {
    limparConversao();
    setDestino(codigo);
  }

  function tentarCarregarMoedas() {
    limparConversao();
    setNovaTentativa((atual) => atual + 1);
  }

  async function converter() {
    if (consultaEmAndamento.current || carregandoMoedas || moedas.length === 0) return;

    limparConversao();

    const validacao = validarValor(valor);
    if (validacao.erro) {
      setErro(validacao.erro);
      return;
    }

    if (!origem || !destino) {
      setErro('Selecione as moedas de origem e destino.');
      return;
    }

    if (origem === destino) {
      setErro('Selecione duas moedas diferentes.');
      return;
    }

    if (!moedas.some((item) => item.codigo === origem) ||
        !moedas.some((item) => item.codigo === destino)) {
      setErro('Selecione moedas disponíveis na lista.');
      return;
    }

    const id = ++identificadorConsulta.current;
    const controller = new AbortController();
    controleConsulta.current = controller;
    consultaEmAndamento.current = true;
    setCarregandoConversao(true);

    try {
      const { taxa, data } = await consultarTaxa(origem, destino, controller.signal);
      if (id !== identificadorConsulta.current) return;

      const convertido = validacao.valor * taxa;
      if (!Number.isFinite(convertido)) {
        throw new Error('O resultado é grande demais para ser calculado.');
      }

      setResultado({
        original: formatarMoeda(validacao.valor, origem),
        convertido: formatarMoeda(convertido, destino),
        taxa: `1 ${origem} = ${formatarTaxa(taxa)} ${destino}`,
        data: data.split('-').reverse().join('/'),
        origem,
        destino,
      });
    } catch (falha) {
      if (id !== identificadorConsulta.current) return;
      if (falha.name !== 'AbortError') {
        setErro(falha.message || 'Não foi possível realizar a conversão.');
      }
    } finally {
      if (id === identificadorConsulta.current) {
        consultaEmAndamento.current = false;
        controleConsulta.current = null;
        setCarregandoConversao(false);
      }
    }
  }

  return {
    valor,
    origem,
    destino,
    moedas,
    carregandoMoedas,
    erroMoedas,
    carregandoConversao,
    erro,
    resultado,
    alterarValor,
    alterarOrigem,
    alterarDestino,
    tentarCarregarMoedas,
    converter,
  };
}
