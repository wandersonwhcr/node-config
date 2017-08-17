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
            var config = new Config();
            var fs     = new memfs.Volume();
            assert.equal(config.getFs(), undefined);
            assert.equal(config.setFs(fs), undefined);
            assert.deepEqual(config.getFs(), fs);
            assert.equal(config.setFs(), undefined);
            assert.equal(config.getFs(), undefined);
        });
    });
});
