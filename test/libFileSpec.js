const path = require("path")

const assert = require("chai").assert

const file = require("../app/lib/file")

describe('Library "file"', () => {
    const mdFilePath = path.join(__dirname, "documents", "testfile_utf8.md")
    const nonMdFilePath = path.join(__dirname, "mocking.js")
    const binFilePath = path.join(__dirname, "documents", "font1", "Daedric.ttf")

    describe("file.isText", () => {
        it("recognizes a Markdown file", () => {
            assert.isTrue(file.isText(mdFilePath))
        })

        it("recognizes a non Markdown file", () => {
            assert.isTrue(file.isText(nonMdFilePath))
        })

        it("does not recognize a binary file", () => {
            assert.isFalse(file.isText(binFilePath))
        })
    })

    describe("file.isMarkdown", () => {
        it("recognizes a Markdown file", () => {
            assert.isTrue(file.isMarkdown(mdFilePath))
        })

        it("recognizes a non Markdown file", () => {
            assert.isFalse(file.isMarkdown(nonMdFilePath))
        })
    })
})
