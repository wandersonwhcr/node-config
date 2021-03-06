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
 * @param  {string[]}   pattern Valores para Configuração
 * @return {undefined}
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
 * @param  {fs}        aFs Elemento para Configuração
 * @return {undefined}
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
 * Busca Nomes de Arquivos
 *
 * Apresenta uma lista com nomes de arquivos encontrados conforme padrões configurados. Os nomes de
 * arquivos são apresentados pela ordem dos padrões e, após, pela ordem alfabética do nome.
 *
 * @private
 * @return {string[]} Lista de Nomes Encontrados
 */
function fetchFilenames() {
  // Inicialização
  const aFs = this.getFs();

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
    // Inicialização
    const filenames = [];
    // Leitura de Diretório
    aFs.readdirSync(directory).forEach((filename) => {
      // Caminho Completo
      let filepath = `${directory}/${filename}`;
      // Diretório?
      if (aFs.statSync(filepath).isDirectory()) {
        // Recursão e Mesclagem
        Array.prototype.push.apply(filenames, fn(filepath));
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
    // Apresentação
    return filenames;
  };

  // Filtro
  return pattern.map(aPattern =>
    fn(globParent(aPattern))
      .filter(filename => minimatch(filename, aPattern))
      .sort((a, b) => a.localeCompare(b))
  ).reduce((result, elements) => result.concat(elements), []);
}

/**
 * Lê Arquivo de Forma Síncrona
 *
 * Executa a leitura do arquivo informado como parâmetro, apresentando um objeto que representa o
 * seu conteúdo. Caso algum problema seja encontrado, atira um objeto de erro. O objeto apresentado
 * possui dois atributos: `filename` com o valor idêntico ao primeiro parâmetro deste método, e
 * `content` com um objeto que representa o conteúdo JSON do arquivo.
 *
 * @private
 * @param  {string} filename Nome do Arquivo
 * @throws {Error}  Erro Encontrado durante Processamento
 * @return {object} Objeto que Representa o Conteúdo do Arquivo
 */
function readAndBuildSync(filename) {
  return {
    filename,
    content: JSON.parse(this.getFs().readFileSync(filename)),
  };
}

/**
 * Mescla Elementos de Configuração
 *
 * Recebe como parâmetro um conjunto de objetos que possuem dois parâmetros: `filename` e `content`.
 * Apresenta como resultado os parâmetros `content` mesclados em ordem alfabética de `filename`.
 *
 * @private
 * @param  {object[]} elements Informações para Mesclagem
 * @return {object}   Elemento Resultante
 */
function mergeElements(elements) {
  // Apresentação
  return elements.reduce((container, item) => merge(container, item.content), {});
}

/**
 * Busca Configurações
 *
 * @return {Promise} Execução Assíncrona
 */
Config.prototype.fetch = function fetch() {
  // Inicialização
  const self = this;

  // Consulta
  const promises = fetchFilenames.call(self).map(filename =>
    // Execução Assíncrona
    new Promise((resolve, reject) => {
      // Tratamento
      try {
        // Apresentação
        resolve(readAndBuildSync.call(self, filename));
      } catch (error) {
        // Impossível Continuar
        reject(error);
      }
    })
  );

  // Execução
  return Promise.all(promises).then(mergeElements);
};

/**
 * Busca Configurações de Forma Síncrona
 *
 * @return {object} Conteúdo Solicitado
 */
Config.prototype.fetchSync = function fetchSync() {
  // Execução
  return mergeElements(
    fetchFilenames.call(this).map(filename => readAndBuildSync.call(this, filename))
  );
};

// Configuração
module.exports = Config;
