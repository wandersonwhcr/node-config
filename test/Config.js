'use strict';

const assert = require('assert');
const fs = require('fs');
const memfs = require('memfs');

const Config = require('../lib/Config.js');

/* eslint-env mocha */

describe('Config', () => {
  describe('Constructor', () => {
    it('constructs with patterns', () => {
      const config = new Config(['foo.json']);
      assert.deepEqual(config.getPattern(), ['foo.json']);
    });

    it('constructs with filesystem', () => {
      const aFs = new memfs.Volume();
      const config = new Config(undefined, aFs);
      assert.deepEqual(config.getFs(), aFs);
    });
  });

  describe('Pattern', () => {
    it('uses encapsulation', () => {
      const config = new Config();
      assert.equal(config.getPattern(), undefined);
      assert.equal(config.setPattern(['foo.json']), undefined);
      assert.deepEqual(config.getPattern(), ['foo.json']);
      assert.equal(config.setPattern(), undefined);
      assert.equal(config.getPattern(), undefined);
    });
  });

  describe('Fs', () => {
    it('uses encapsulation', () => {
      const aFs = new memfs.Volume();
      const config = new Config();
      assert.notEqual(config.getFs(), undefined);
      assert.equal(config.setFs(aFs), undefined);
      assert.deepEqual(config.getFs(), aFs);
      assert.equal(config.setFs(), undefined);
      assert.notEqual(config.getFs(), undefined);
    });

    it('defaults to fs', () => {
      const config = new Config();
      assert.deepEqual(config.getFs(), fs);
    });
  });

  describe('Fetch', () => {
    it('fetches from filesystem', () => {
      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'foo.json': JSON.stringify({ foo: 'bar' }),
        'baz.json': JSON.stringify({ baz: 'qux' }),
      });

      // Inicialização
      const config = new Config(['foo.json', 'baz.json'], aFs);

      // Execução
      return config.fetch().then(aConfig => assert.deepEqual(aConfig, { foo: 'bar', baz: 'qux' }));
    });

    it('fetches alphabetically', () => {
      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'one.json': JSON.stringify({ id: 'one' }),
        'two.json': JSON.stringify({ id: 'two' }),
      });

      // Inicialização
      const config = new Config(['two.json', 'one.json'], aFs);

      // Execução
      return config.fetch().then(aConfig => assert.deepEqual(aConfig, { id: 'two' }));
    });

    it('fetches using glob', () => {
      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'foo.json': JSON.stringify({ foo: 'baz' }),
        'bar.json': JSON.stringify({ bar: 'qux' }),
      });

      // Inicialização
      const config = new Config(['*.json'], aFs);

      // Execução
      return config.fetch().then(aConfig => assert.deepEqual(aConfig, { foo: 'baz', bar: 'qux' }));
    });

    it('fetches using current path', () => {
      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'foo.json': JSON.stringify({ foo: 'bar' }),
      });

      // Inicialização
      const config = new Config(['./*.json'], aFs);

      // Execução
      return config.fetch().then((data) => {
        // Carregamento com Sucesso
        assert.deepEqual(data, { foo: 'bar' });
        // Mantém Configuração Idêntica
        assert.deepEqual(config.getPattern(), ['./*.json']);
      });
    });

    it('fetches directories', () => {
      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'config/default.d/00-default.json': JSON.stringify({ foo: 'bar' }),
        'config/default.d/10-baz.json': JSON.stringify({ baz: 'qux' }),
        'config/local.d/99-local.json': JSON.stringify({ foo: 'foo', one: 'two' }),
      });

      // Inicialização
      const config = new Config(['config/default.d/*.json', 'config/local.d/*.json'], aFs);

      // Execução
      return config.fetch().then(
        aConfig => assert.deepEqual(aConfig, { foo: 'foo', baz: 'qux', one: 'two' })
      );
    });

    it('handles errors', () => {
      // Capturador
      const handler = { hasSyntaxErrors: false };

      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'foo.json': 'Hello, Foo!',
      });

      // Inicialização
      const config = new Config(['*.json'], aFs);

      // Execução
      return config.fetch().catch(() => {
        // Erro Tratado Corretamente!
        handler.hasSyntaxErrors = true;
      }).then(() => {
        // Tratado Corretamente?
        assert.ok(handler.hasSyntaxErrors);
      });
    });
  });

  describe('FetchSync', () => {
    it('fetches synchronous', () => {
      // Mock: Manipulador de Sistema de Arquivos
      const aFs = memfs.Volume.fromJSON({
        'foobar.json': JSON.stringify({ foo: 'bar', baz: 'qux' }),
        'foobaz.json': JSON.stringify({ foo: 'baz' }),
      });

      // Inicialização
      const config = new Config(['*.json'], aFs);

      // Verificações
      assert.deepStrictEqual(config.fetchSync(), { foo: 'baz', baz: 'qux' });
    });
  });
});
