import * as fs from 'fs'
import * as path from 'path'

import {JavaJunitParser} from '../src/parsers/java-junit/java-junit-parser'
import {ParseOptions} from '../src/test-parser'
import {ReportOptions, getReport} from '../src/report/get-report'
import {normalizeFilePath} from '../src/utils/path-utils'

describe('java-junit tests', () => {
  it('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'empty', 'java-junit.xml')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: []
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result.tests).toBe(0)
    expect(result.result).toBe('success')
  })

  it('report from apache/pulsar single suite test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      'fixtures',
      'external',
      'java',
      'TEST-org.apache.pulsar.AddMissingPatchVersionTest.xml'
    )
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'pulsar-test-results-no-merge.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result])
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })

  it('report from apache/pulsar test results matches snapshot', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'pulsar-test-report.xml')
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'pulsar-test-results.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result])
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })

  it('parses empty failures in test results', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'empty_failures.xml')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles: string[] = []
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)

    expect(result.result === 'failed')
    expect(result.failed === 1)
  })

  it('playwright test report - all tests', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'playwright-report.xml')
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'playwright-output-all.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const reportOpts: ReportOptions = {
      listSuites: 'all',
      listTests: 'all',
      baseUrl: '',
      onlySummary: false
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result], reportOpts)
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })
  it('playwright test report - ignore skipped tests', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'playwright-report.xml')
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'playwright-output-no-skipped.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const reportOpts: ReportOptions = {
      listSuites: 'all',
      listTests: 'non-skipped',
      baseUrl: '',
      onlySummary: false
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result], reportOpts)
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })
  it('playwright test report - only failed', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'playwright-report.xml')
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'playwright-output-failed.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const reportOpts: ReportOptions = {
      listSuites: 'failed',
      listTests: 'failed',
      baseUrl: '',
      onlySummary: false
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result], reportOpts)
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })
  it('playwright test report - only summary', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'playwright-report.xml')
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'playwright-output-summary.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const reportOpts: ReportOptions = {
      listSuites: 'all',
      listTests: 'all',
      baseUrl: '',
      onlySummary: true
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result], reportOpts)
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })
  it('playwright test report - default options', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'external', 'java', 'playwright-report.xml')
    const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'java', 'files.txt')
    const outputPath = path.join(__dirname, '__outputs__', 'playwright-output-default.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles
    }

    const parser = new JavaJunitParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result])
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })
})
