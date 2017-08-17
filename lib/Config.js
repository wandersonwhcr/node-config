"use strict";

/**
 * Configurações
 *
 * @constructor
 * @param {string[]} pattern Padrão de Captura
 */
function Config (pattern)
{
    this.setPattern(pattern);
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

// Configuração
module.exports = Config;
