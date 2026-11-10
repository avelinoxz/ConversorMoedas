import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useConversorViewModel } from '../viewmodels/useConversorViewModel';


const cores = {
  fundo: '#F7F9F4',
  branco: '#FFFFFF',
  titulo: '#102F4B',
  texto: '#344B51',
  secundario: '#6D8183',
  borda: '#DCE8DF',
  azul: '#163F78',
  azulClaro: '#EAF2F5',
  verde: '#137D50',
  verdeEscuro: '#0B6240',
  verdeClaro: '#F1F8F2',
  amarelo: '#F1CD47',
  amareloClaro: '#FFF9E7',
  erro: '#A23D39',
  erroFundo: '#FFF2F0',
};


const fontes = {
  titulo: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  corpo: Platform.select({ ios: 'AvenirNext-Regular', android: 'sans-serif', default: 'sans-serif' }),
  destaque: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium', default: 'sans-serif' }),
  codigo: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export function ConversorView() {
  const vm = useConversorViewModel();
  const [seletorAberto, setSeletorAberto] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  const nomeDaMoeda = (codigo) =>
    vm.moedas.find((moeda) => moeda.codigo === codigo)?.nome || 'Selecione';

  const moedasFiltradas = vm.moedas.filter((moeda) =>
    `${moeda.codigo} ${moeda.nome}`.toLowerCase().includes(pesquisa.toLowerCase().trim())
  );

  function abrirSeletor(tipo) {
    if (vm.carregandoMoedas || !vm.moedas.length) return;
    setPesquisa('');
    setSeletorAberto(tipo);
  }

  function selecionarMoeda(codigo) {
    if (seletorAberto === 'origem') vm.alterarOrigem(codigo);
    if (seletorAberto === 'destino') vm.alterarDestino(codigo);
    setSeletorAberto(null);
  }

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <StatusBar barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'} backgroundColor={cores.azul} />
      <ScrollView
        contentContainerStyle={estilos.pagina}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.conteudo}>
          <View style={estilos.cabecalho}>
            <View style={estilos.faixaCores}>
              <View style={estilos.faixaVerde} />
              <View style={estilos.faixaAmarela} />
              <View style={estilos.faixaBranca} />
            </View>
            <Text style={estilos.titulo}>Conversor de moedas</Text>
            <Text style={estilos.subtitulo}>
              Converta valores usando taxas de câmbio de referência.
            </Text>
          </View>

          <View style={estilos.cartao}>
            <Text style={estilos.rotulo}>Valor para converter</Text>
            <TextInput
              style={estilos.campoValor}
              value={vm.valor}
              onChangeText={vm.alterarValor}
              keyboardType="decimal-pad"
              placeholder="Ex.: 100,50"
              placeholderTextColor={cores.secundario}
              accessibilityLabel="Valor para converter"
              autoCorrect={false}
              maxLength={20}
            />

            <View style={estilos.moedasLinha}>
              <View style={estilos.moedaColuna}>
                <Text style={estilos.rotulo}>De</Text>
                <Pressable
                  style={estilos.seletor}
                  onPress={() => abrirSeletor('origem')}
                  disabled={vm.carregandoMoedas || !vm.moedas.length}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar moeda de origem"
                >
                  <View style={estilos.seletorTextos}>
                    <Text style={estilos.codigoMoeda}>{vm.origem}</Text>
                    <Text style={estilos.nomeMoeda} numberOfLines={1}>
                      {nomeDaMoeda(vm.origem)}
                    </Text>
                  </View>
                  <Text style={estilos.seta}>⌄</Text>
                </Pressable>
              </View>

              <View style={estilos.moedaColuna}>
                <Text style={estilos.rotulo}>Para</Text>
                <Pressable
                  style={estilos.seletor}
                  onPress={() => abrirSeletor('destino')}
                  disabled={vm.carregandoMoedas || !vm.moedas.length}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar moeda de destino"
                >
                  <View style={estilos.seletorTextos}>
                    <Text style={estilos.codigoMoeda}>{vm.destino}</Text>
                    <Text style={estilos.nomeMoeda} numberOfLines={1}>
                      {nomeDaMoeda(vm.destino)}
                    </Text>
                  </View>
                  <Text style={estilos.seta}>⌄</Text>
                </Pressable>
              </View>
            </View>

            {vm.carregandoMoedas && (
              <View style={estilos.mensagemCarregando}>
                <ActivityIndicator size="small" color={cores.azul} />
                <Text style={estilos.textoAjuda}>Carregando moedas...</Text>
              </View>
            )}

            {!!vm.erroMoedas && (
              <View style={estilos.aviso}>
                <Text style={estilos.textoErro}>{vm.erroMoedas}</Text>
                <Pressable onPress={vm.tentarCarregarMoedas}>
                  <Text style={estilos.tentarNovamente}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}

            {!!vm.erro && (
              <View style={estilos.aviso}>
                <Text style={estilos.textoErro}>{vm.erro}</Text>
              </View>
            )}

            <Pressable
              onPress={vm.converter}
              disabled={vm.carregandoConversao || vm.carregandoMoedas || !vm.moedas.length}
              style={({ pressed }) => [
                estilos.botao,
                pressed && estilos.botaoPressionado,
                (vm.carregandoConversao || vm.carregandoMoedas || !vm.moedas.length) &&
                  estilos.botaoDesativado,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Converter moedas"
            >
              {vm.carregandoConversao ? (
                <View style={estilos.mensagemCarregando}>
                  <ActivityIndicator size="small" color={cores.branco} />
                  <Text style={estilos.textoBotao}>Consultando...</Text>
                </View>
              ) : (
                <Text style={estilos.textoBotao}>Converter</Text>
              )}
            </Pressable>
          </View>

          {vm.resultado && (
            <View style={estilos.resultado}>
              <Text style={estilos.resultadoRotulo}>Resultado da conversão</Text>
              <Text style={estilos.resultadoValor} adjustsFontSizeToFit numberOfLines={2}>
                {vm.resultado.convertido}
              </Text>
              <Text style={estilos.resultadoOrigem}>
                Valor original: {vm.resultado.original}
              </Text>
              <View style={estilos.divisoria} />
              <View style={estilos.infoLinha}>
                <Text style={estilos.infoRotulo}>Taxa utilizada</Text>
                <Text style={estilos.infoTexto}>{vm.resultado.taxa}</Text>
              </View>
              <View style={estilos.infoLinha}>
                <Text style={estilos.infoRotulo}>Data de referência</Text>
                <Text style={estilos.infoTexto}>{vm.resultado.data}</Text>
              </View>
              <Text style={estilos.avisoReferencia}>
                Taxa de referência da API, não uma cotação em tempo real.
              </Text>
            </View>
          )}

          <Text style={estilos.rodape}>Dados fornecidos pela Frankfurter API.</Text>
          <Text style={estilos.rodape}>Feito por Gustavo Avelino.
                https://github.com/avelinoxz
                 09/11/2026</Text>
        </View>
      </ScrollView>

      <Modal
        visible={seletorAberto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSeletorAberto(null)}
      >
        <View style={estilos.modalFundo}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSeletorAberto(null)} />
          <View style={estilos.modalCartao}>
            <View style={estilos.modalTopo}>
              <Text style={estilos.modalTitulo}>
                {seletorAberto === 'origem' ? 'Moeda de origem' : 'Moeda de destino'}
              </Text>
              <Pressable onPress={() => setSeletorAberto(null)} accessibilityRole="button">
                <Text style={estilos.fechar}>Fechar</Text>
              </Pressable>
            </View>
            <TextInput
              style={estilos.busca}
              value={pesquisa}
              onChangeText={setPesquisa}
              placeholder="Buscar por nome ou código"
              placeholderTextColor={cores.secundario}
              autoCorrect={false}
              accessibilityLabel="Buscar moedas"
            />
            <FlatList
              data={moedasFiltradas}
              keyExtractor={(item) => item.codigo}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={estilos.separadorMoeda} />}
              ListEmptyComponent={<Text style={estilos.listaVazia}>Nenhuma moeda encontrada.</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={estilos.itemMoeda}
                  onPress={() => selecionarMoeda(item.codigo)}
                  accessibilityRole="button"
                >
                  <Text style={estilos.itemCodigo}>{item.codigo}</Text>
                  <Text style={estilos.itemNome} numberOfLines={2}>{item.nome}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: cores.fundo },
  pagina: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 34,
  },
  conteudo: { width: '100%', maxWidth: 480 },
  cabecalho: {
    backgroundColor: cores.azul,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 50,
    marginBottom: 0,
    overflow: 'hidden',
  },
  faixaCores: {
    flexDirection: 'row',
    width: 112,
    height: 5,
    gap: 4,
    marginBottom: 21,
  },
  faixaVerde: { flex: 3, borderRadius: 8, backgroundColor: '#2FAA65' },
  faixaAmarela: { flex: 2, borderRadius: 8, backgroundColor: cores.amarelo },
  faixaBranca: { flex: 1, borderRadius: 8, backgroundColor: cores.branco },
  titulo: {
    fontFamily: fontes.titulo,
    color: cores.branco,
    fontSize: 31,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  subtitulo: {
    fontFamily: fontes.corpo,
    color: '#E2EDF5',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 300,
  },
  cartao: {
    backgroundColor: cores.branco,
    padding: 20,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: -20,
    marginHorizontal: 8,
    elevation: 3,
    shadowColor: '#14331E',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  rotulo: {
    fontFamily: fontes.destaque,
    fontSize: 12,
    color: cores.texto,
    fontWeight: '600',
    marginBottom: 9,
    letterSpacing: 0.15,
  },
  campoValor: {
    height: 67,
    borderWidth: 1,
    borderColor: '#C7DFC9',
    borderRadius: 12,
    color: cores.titulo,
    fontFamily: fontes.titulo,
    fontSize: 29,
    paddingHorizontal: 16,
    backgroundColor: '#FCFDF8',
  },
  moedasLinha: { flexDirection: 'row', gap: 12, marginTop: 23 },
  moedaColuna: { flex: 1, minWidth: 0 },
  seletor: {
    backgroundColor: cores.verdeClaro,
    borderWidth: 1,
    borderColor: '#D1E5D5',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  seletorTextos: { flex: 1, minWidth: 0 },
  codigoMoeda: {
    fontFamily: fontes.codigo,
    fontWeight: '700',
    fontSize: 17,
    color: cores.verdeEscuro,
  },
  nomeMoeda: { fontFamily: fontes.corpo, fontSize: 11, color: cores.secundario, marginTop: 5 },
  seta: { fontSize: 23, color: cores.verde, marginBottom: 9 },
  botao: {
    backgroundColor: cores.verde,
    borderRadius: 12,
    minHeight: 55,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: cores.verdeEscuro,
  },
  botaoPressionado: { opacity: 0.9 },
  botaoDesativado: { opacity: 0.6 },
  textoBotao: { fontFamily: fontes.destaque, color: cores.branco, fontSize: 16, fontWeight: '700' },
  mensagemCarregando: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  textoAjuda: { fontFamily: fontes.corpo, color: cores.secundario, fontSize: 13 },
  aviso: {
    borderRadius: 10,
    backgroundColor: cores.erroFundo,
    padding: 12,
    marginTop: 18,
    borderLeftWidth: 3,
    borderLeftColor: cores.erro,
  },
  textoErro: { fontFamily: fontes.corpo, fontSize: 13, color: cores.erro, lineHeight: 19 },
  tentarNovamente: { fontFamily: fontes.destaque, fontSize: 13, fontWeight: '700', color: cores.verde, marginTop: 9 },
  resultado: {
    marginTop: 18,
    marginHorizontal: 8,
    padding: 22,
    borderRadius: 18,
    backgroundColor: cores.amareloClaro,
    borderWidth: 1,
    borderColor: '#F1E2A8',
    borderLeftWidth: 4,
    borderLeftColor: cores.amarelo,
  },
  resultadoRotulo: {
    fontFamily: fontes.destaque,
    fontWeight: '700',
    color: cores.verdeEscuro,
    fontSize: 12,
  },
  resultadoValor: {
    fontFamily: fontes.titulo,
    color: cores.azul,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 7,
    letterSpacing: -0.4,
  },
  resultadoOrigem: { fontFamily: fontes.corpo, color: cores.texto, fontSize: 13 },
  divisoria: { height: 1, backgroundColor: '#EADFAF', marginVertical: 20 },
  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoRotulo: { fontFamily: fontes.corpo, color: cores.secundario, fontSize: 12, flex: 1 },
  infoTexto: {
    fontFamily: fontes.destaque,
    color: cores.titulo,
    fontWeight: '600',
    fontSize: 12,
    flex: 1.4,
    textAlign: 'right',
  },
  avisoReferencia: {
    fontFamily: fontes.corpo,
    color: cores.secundario,
    fontSize: 11,
    marginTop: 10,
    lineHeight: 16,
  },
  rodape: {
    fontFamily: fontes.corpo,
    color: cores.secundario,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 26,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(9,34,51,0.56)',
    justifyContent: 'flex-end',
  },
  modalCartao: {
    backgroundColor: cores.branco,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    height: '78%',
    borderTopWidth: 5,
    borderTopColor: cores.verde,
  },
  modalTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },
  modalTitulo: { fontFamily: fontes.titulo, color: cores.titulo, fontSize: 21, fontWeight: '700' },
  fechar: { fontFamily: fontes.destaque, color: cores.verde, fontSize: 14, fontWeight: '600' },
  busca: {
    fontFamily: fontes.corpo,
    borderWidth: 1,
    borderColor: '#CFE2D3',
    borderRadius: 11,
    height: 48,
    paddingHorizontal: 14,
    color: cores.titulo,
    backgroundColor: cores.verdeClaro,
    marginBottom: 12,
    fontSize: 14,
  },
  itemMoeda: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
  itemCodigo: { fontFamily: fontes.codigo, width: 50, fontSize: 14, fontWeight: '700', color: cores.verdeEscuro },
  itemNome: { fontFamily: fontes.corpo, flex: 1, fontSize: 13, color: cores.texto },
  separadorMoeda: { height: 1, backgroundColor: cores.borda },
  listaVazia: { fontFamily: fontes.corpo, paddingVertical: 25, textAlign: 'center', color: cores.secundario },
});
