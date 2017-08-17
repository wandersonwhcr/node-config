"use strict";

const assert = require("assert");
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
});
