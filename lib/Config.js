"use strict";

const merge = require("merge");

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
 * @param  {fs}      fs Elemento para Configuração
 * @return undefined
 */
Config.prototype.setFs = function (fs)
{
    this._fs = fs;
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
 * Busca Configurações
 *
 * @return {Promise} Execução Assíncrona
 */
Config.prototype.fetch = function ()
{
    // Inicialização
    var pattern = this.getPattern();
    var fs      = this.getFs();

    // Execuções Assíncronas
    var promises = [];

    // Consulta
    pattern.forEach(function (pattern) {
        // Execução Assíncrona
        promises.push(new Promise(function (resolve, reject) {
            // Carregar Arquivo
            fs.readFile(pattern, function (error, data) {
                // Erro Encontrado?
                if (error) {
                    // Impossível Continuar
                    reject(error);
                    return;
                }
                // Sucesso!
                resolve({ "filename": pattern, "content": JSON.parse(data) });
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
