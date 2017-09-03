'use strict';

const fs = require('fs');
const globParent = require('glob-parent');
const merge = require('merge');
const minimatch = require('minimatch');

/**
 * Configurações
 *
 * @constructor
 * @param {string[]} pattern Padrão de Captura
 */
function Config(pattern) {
  this.setPattern(pattern);
}

/**
 * Configura o Padrão de Captura
 *
 * @param  {string[]} pattern Valores para Configuração
 * @return undefined
 */
Config.prototype.setPattern = function setPattern(pattern) {
  this.pattern = pattern;
};

/**
 * Apresenta o Padrão de Captura
 *
 * @return {string[]} Valores Configurados
 */
Config.prototype.getPattern = function getPattern() {
  return this.pattern;
};

/**
 * Configura o Manipulador de Sistema de Arquivos
 *
 * @param  {fs}      aFs Elemento para Configuração
 * @return undefined
 */
Config.prototype.setFs = function setFs(aFs) {
  this.fs = aFs;
};

/**
 * Apresenta o Manipulador de Sistema de Arquivos
 *
 * @return {fs} Elemento Configurado
 */
Config.prototype.getFs = function getFs() {
  return this.fs || fs;
};

/**
 * Busca Informações de Arquivos
 *
 * Apresenta uma lista com informações sobre arquivos encontrados conforme padrões configurados.
 * Cada objeto da lista possui dois parâmetros: `filename` com o nome do arquivo encontrado e
 * `priority` com a prioridade inicial para posterior ordenação.
 *
 * @return {object[]} Lista de Informações Encontradas
 */
Config.prototype.fetchFilesInfo = function fetchFilesInfo() {
  // Inicialização
  const aFs = this.getFs();
  const filenames = [];
  // Limpeza de Padrões
  const pattern = this.getPattern().map((aPattern) => {
    // Inicialização
    let result = aPattern;
    // Prefixado Localmente?
    if (result.indexOf('./') === 0) {
      // Remover Prefixo
      result = result.substring(2);
    }
    // Apresentação
    return result;
  });
  // Função: Captura Recursiva
  const fn = (directory) => {
    // Leitura de Diretório
    aFs.readdirSync(directory).forEach((filename) => {
      // Caminho Completo
      let filepath = `${directory}/${filename}`;
      // Diretório?
      if (aFs.statSync(filepath).isDirectory()) {
        // Recursão
        fn(filepath);
        return;
      }
      // Prefixado Localmente?
      if (filepath.indexOf('./') === 0) {
        // Remover Prefixo
        filepath = filepath.substring(2);
      }
      // Captura
      filenames.push(filepath);
    });
  };
  // Capturar Arquivos dos Diretórios dos Padrões
  pattern.forEach((aPattern) => {
    // Inicialização
    const directoryPath = globParent(aPattern);
    // Execução
    fn(directoryPath);
  });
  // Filtro
  return pattern.map((aPattern, priority) =>
    filenames
      .filter(filename => minimatch(filename, aPattern))
      .map(filename => ({ filename, priority }))
  ).reduce((result, elements) => result.concat(elements), []);
};

/**
 * Lê Arquivo de Forma Síncrona
 *
 * Executa a leitura do arquivo informado como parâmetro, apresentando um objeto que representa o
 * seu conteúdo. Caso algum problema seja encontrado, atira um objeto de erro. O objeto apresentado
 * possui dois atributos: `filename` com o valor idêntico ao primeiro parâmetro deste método, e
 * `content` com um objeto que representa o conteúdo JSON do arquivo.
 *
 * @param  {object} fileInfo Informações do Arquivo
 * @throws {Error}  Erro Encontrado durante Processamento
 * @return {object} Objeto que Representa o Conteúdo do Arquivo
 */
Config.prototype.readAndBuildSync = function readAndBuildSync(fileInfo) {
  return {
    filename: fileInfo.filename,
    content: JSON.parse(this.getFs().readFileSync(fileInfo.filename)),
  };
};

/**
 * Mescla Elementos de Configuração
 *
 * Recebe como parâmetro um conjunto de objetos que possuem dois parâmetros: `filename` e `content`.
 * Apresenta como resultado os parâmetros `content` mesclados em ordem alfabética de `filename`.
 *
 * @param  {object[]} elements Informações para Mesclagem
 * @return {object}   Elemento Resultante
 */
Config.prototype.mergeElements = function mergeElements(elements) {
  // Ordenação
  elements.sort((a, b) => {
    // Inicialização
    const diff = a.priority - b.priority;
    // Diferentes?
    if (diff !== 0) {
      // Ordenar pela Diferença Primária
      return diff;
    }
    // Ordenar pelo Nome do Arquivo
    return a.filename.localeCompare(b.filename);
  });

  // Apresentação
  return elements.reduce((container, item) => merge(container, item.content), {});
};

/**
 * Busca Configurações
 *
 * @return {Promise} Execução Assíncrona
 */
Config.prototype.fetch = function fetch() {
  // Inicialização
  const self = this;
  const promises = [];

  // Consulta
  this.fetchFilesInfo().forEach(fileInfo =>
    // Execução Assíncrona
    promises.push(new Promise((resolve, reject) => {
      // Tratamento
      try {
        // Apresentação
        resolve(self.readAndBuildSync(fileInfo));
      } catch (error) {
        // Impossível Continuar
        reject(error);
      }
    }))
  );

  // Execução
  return Promise.all(promises).then(this.mergeElements);
};

/**
 * Busca Configurações de Forma Síncrona
 *
 * @return {object} Conteúdo Solicitado
 */
Config.prototype.fetchSync = function fetchSync() {
  // Execução
  return this.mergeElements(
    this.fetchFilesInfo().map(filename => this.readAndBuildSync(filename))
  );
};

// Configuração
module.exports = Config;
