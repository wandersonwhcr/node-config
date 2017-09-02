'use strict';

const fs = require('fs');
const merge = require('merge');
const minimatch = require('minimatch');

/**
 * Configurações
 *
 * @constructor
 * @param {string[]} pattern Padrão de Captura
 * @param {fs}       aFs     Manipulador de Sistema de Arquivos
 */
function Config(pattern, aFs) {
  this.setPattern(pattern);
  this.setFs(aFs);
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
 * Busca Nomes de Arquivos
 *
 * @return {string[]} Lista de Arquivos Encontrados
 */
Config.prototype.fetchFilenames = function fetchFilenames() {
  // Inicialização
  const aFs = this.getFs();
  const filenames = [];
  // Inclui Prefixo
  const pattern = this.getPattern().map((aPattern) => {
    // Inicialização
    let result = aPattern;
    // Prefixado?
    if (result.indexOf('./') === 0) {
      // Remove Prefixo
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
      const filepath = `${directory}/${filename}`;
      // Diretório?
      if (aFs.statSync(filepath).isDirectory()) {
        // Recursão
        fn(filepath);
        return;
      }
      // Captura
      filenames.push(filepath.substr(2));
    });
  };
  // Execução
  fn('.');
  // Apresentação
  return filenames.filter(filename =>
    pattern.filter(aPattern =>
      minimatch(filename, aPattern)
    ).length > 0
  );
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
  elements.sort((a, b) => a.filename.localeCompare(b.filename));

  // Apresentação
  return elements.reduce((container, item) => merge(container, item.content), {});
};

/**
 * Lê Arquivo de Forma Síncrona
 *
 * Executa a leitura do arquivo informado como parâmetro, apresentando um objeto que representa o
 * seu conteúdo. Caso algum problema seja encontrado, atira um objeto de erro. O objeto apresentado
 * possui dois atributos: `filename` com o valor idêntico ao primeiro parâmetro deste método, e
 * `content` com um objeto que representa o conteúdo JSON do arquivo.
 *
 * @param  {string} filename Nome do Arquivo
 * @throws {Error}  Erro Encontrado durante Processamento
 * @return {object} Objeto que Representa o Conteúdo do Arquivo
 */
Config.prototype.readAndBuildSync = function readAndBuildSync(filename) {
  return { filename, content: JSON.parse(this.getFs().readFileSync(filename)) };
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
  this.fetchFilenames().forEach(filename =>
    // Execução Assíncrona
    promises.push(new Promise((resolve, reject) => {
      // Tratamento
      try {
        // Apresentação
        resolve(self.readAndBuildSync(filename));
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
  return this.mergeElements(this.fetchFilenames().map(filename => this.readAndBuildSync(filename)));
};

// Configuração
module.exports = Config;
