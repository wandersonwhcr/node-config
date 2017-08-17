"use strict";

/**
 * Configurações
 *
 * @constructor
 */
function Config ()
{
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

// Configuração
module.exports = Config;
