"use strict";

const assert = require("assert");
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
            assert.equal(config.getFs(), undefined);
            assert.equal(config.setFs(fs), undefined);
            assert.deepEqual(config.getFs(), fs);
            assert.equal(config.setFs(), undefined);
            assert.equal(config.getFs(), undefined);
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
    });
});
