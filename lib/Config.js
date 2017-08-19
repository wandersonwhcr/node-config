"use strict";

const fs        = require("fs");
const merge     = require("merge");
const minimatch = require("minimatch");

/**
 * Configurações
 *
 * @constructor
 * @param {string[]} pattern Padrão de Captura
 * @param {fs}       fs      Manipulador de Sistema de Arquivos
 */
function Config (pattern, fs)
{
    this.setPattern(pattern);
    this.setFs(fs);
};

/**
 * Configura o Padrão de Captura
 *
 * @param  {string[]} pattern Valores para Configuração
 * @return undefined
 */
Config.prototype.setPattern = function (pattern)
{
    this._pattern = pattern;
};

/**
 * Apresenta o Padrão de Captura
 *
 * @return {string[]} Valores Configurados
 */
Config.prototype.getPattern = function ()
{
    return this._pattern;
};

/**
 * Configura o Manipulador de Sistema de Arquivos
 *
 * @param  {fs}      aFs Elemento para Configuração
 * @return undefined
 */
Config.prototype.setFs = function (aFs)
{
    this._fs = aFs || fs;
};

/**
 * Apresenta o Manipulador de Sistema de Arquivos
 *
 * @return {fs} Elemento Configurado
 */
Config.prototype.getFs = function ()
{
    return this._fs;
};

/**
 * Busca Nomes de Arquivos
 *
 * @return {string[]} Lista de Arquivos Encontrados
 */
Config.prototype._fetchFilenames = function ()
{
    // Inicialização
    var fs        = this.getFs();
    var pattern   = this.getPattern();
    var filenames = [];
    // Função: Captura Recursiva
    var fn = function (directory) {
        // Leitura de Diretório
        fs.readdirSync(directory).forEach(function (filename) {
            // Caminho Completo
            filename = directory + "/" + filename;
            // Diretório?
            if (fs.statSync(filename).isDirectory()) {
                // Recursão
                fn(filename);
                return;
            }
            // Captura
            filenames.push(filename.substr(2));
        });
    };
    // Execução
    fn(".");
    // Apresentação
    return filenames.filter(function (filename) {
        return pattern.filter(function (pattern) {
            return minimatch(filename, pattern);
        }).length > 0;
    });
};

/**
 * Busca Configurações
 *
 * @return {Promise} Execução Assíncrona
 */
Config.prototype.fetch = function ()
{
    // Inicialização
    var pattern = this.getPattern();
    var fs      = this.getFs();

    // Capturar Arquivos
    var filenames = this._fetchFilenames();

    // Execuções Assíncronas
    var promises = [];

    // Consulta
    filenames.forEach(function (filename) {
        // Execução Assíncrona
        promises.push(new Promise(function (resolve, reject) {
            // Carregar Arquivo
            fs.readFile(filename, function (error, data) {
                // Erro Encontrado?
                if (error) {
                    // Impossível Continuar
                    reject(error);
                    return;
                }
                // Sucesso!
                resolve({ "filename": filename, "content": JSON.parse(data) });
            });
        }));
    });

    // Execução
    return Promise.all(promises).then(function (elements) {
        // Ordenação
        elements.sort(function (a, b) {
            return a.filename.localeCompare(b.filename);
        });

        // Apresentação
        return elements.reduce(function (elements, item) {
            return merge(elements, item.content);
        }, {});
    });
};

// Configuração
module.exports = Config;
