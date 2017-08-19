"use strict";

const assert = require("assert");
const fs     = require("fs");
const memfs  = require("memfs")
const Config = require("../lib/Config.js");

describe("Config", function () {
    describe("Constructor", function () {
        it("constructs with patterns", function () {
            var config = new Config(["foo.json"]);
            assert.deepEqual(config.getPattern(), ["foo.json"]);
        });

        it("constructs with filesystem", function () {
            var fs     = new memfs.Volume();
            var config = new Config(undefined, fs);
            assert.deepEqual(config.getFs(), fs);
        });
    });

    describe("Pattern", function () {
        it("uses encapsulation", function () {
            var config = new Config();
            assert.equal(config.getPattern(), undefined);
            assert.equal(config.setPattern(["foo.json"]), undefined);
            assert.deepEqual(config.getPattern(), ["foo.json"]);
            assert.equal(config.setPattern(), undefined);
            assert.equal(config.getPattern(), undefined);
        });
    });

    describe("Fs", function () {
        it("uses encapsulation", function () {
            var fs     = new memfs.Volume();
            var config = new Config();
            assert.notEqual(config.getFs(), undefined);
            assert.equal(config.setFs(fs), undefined);
            assert.deepEqual(config.getFs(), fs);
            assert.equal(config.setFs(), undefined);
            assert.notEqual(config.getFs(), undefined);
        });

        it("defaults to fs", function () {
            var config = new Config();
            assert.deepEqual(config.getFs(), fs);
        });
    });

    describe("Fetch", function () {
        it("fetches from filesystem", function () {
            // Mock: Manipulador de Sistema de Arquivos
            var fs = memfs.Volume.fromJSON({
                "foo.json": JSON.stringify({ "foo": "bar" }),
                "baz.json": JSON.stringify({ "baz": "qux" })
            });

            // Inicialização
            var config = new Config(["foo.json", "baz.json"], fs);

            // Execução
            return config.fetch().then(function (config) {
                assert.deepEqual(config, { "foo": "bar", "baz": "qux" });
            });
        });

        it("fetches alphabetically", function () {
            // Mock: Manipulador de Sistema de Arquivos
            var fs = memfs.Volume.fromJSON({
                "one.json": JSON.stringify({ "id": "one" }),
                "two.json": JSON.stringify({ "id": "two" })
            });

            // Inicialização
            var config = new Config(["two.json", "one.json"], fs);

            // Execução
            return config.fetch().then(function (config) {
                assert.deepEqual(config, { "id": "two" });
            });
        });

        it("fetches using glob", function () {
            // Mock: Manipulador de Sistema de Arquivos
            var fs = memfs.Volume.fromJSON({
                "foo.json": JSON.stringify({ "foo": "baz" }),
                "bar.json": JSON.stringify({ "bar": "qux" })
            });

            // Inicialização
            var config = new Config(["*.json"], fs);

            // Execução
            return config.fetch().then(function (config) {
                assert.deepEqual(config, { "foo": "baz", "bar": "qux" });
            });
        });

        it("fetches directories", function () {
            // Mock: Manipulador de Sistema de Arquivos
            var fs = memfs.Volume.fromJSON({
                "config/default.d/00-default.json": JSON.stringify({ "foo": "bar" }),
                "config/default.d/10-baz.json": JSON.stringify({ "baz": "qux" }),
                "config/local.d/99-local.json": JSON.stringify({ "foo": "foo", "one": "two" })
            });

            // Inicialização
            var config = new Config(["config/default.d/*.json", "config/local.d/*.json"], fs);

            // Execução
            return config.fetch().then(function (config) {
                assert.deepEqual(config, { "foo": "foo", "baz": "qux", "one": "two" });
            });
        });

        it("handles errors", function () {
            // Capturador
            var handler = { "hasSyntaxErrors": false };

            // Mock: Manipulador de Sistema de Arquivos
            var fs = memfs.Volume.fromJSON({
                "foo.json": "Hello, Foo!"
            });

            // Inicialização
            var config = new Config(["*.json"], fs);

            // Execução
            return config.fetch().catch(function (error) {
                // Erro Tratado Corretamente!
                handler.hasSyntaxErrors = true;
            }).then(function () {
                // Tratado Corretamente?
                assert.ok(handler.hasSyntaxErrors);
            });
        });
    });

    describe("FetchSync", function () {
        it("fetches synchronous", function () {
            // Mock: Manipulador de Sistema de Arquivos
            var fs = memfs.Volume.fromJSON({
                "foobar.json": JSON.stringify({ "foo": "bar", "baz": "qux" }),
                "foobaz.json": JSON.stringify({ "foo": "baz" })
            });

            // Inicialização
            var config = new Config(["*.json"], fs);

            // Execução
            var data = config.fetchSync();

            // Verificações
            assert.deepStrictEqual(data, {"foo": "baz", "baz": "qux"});
        });
    });
});
