import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontRoot = path.resolve(__dirname, '..')
const target = path.join(frontRoot, 'functions', 'seoBrand.js')

const sourceCandidates = [
  path.join(frontRoot, 'shared', 'seoBrand.js'),
  path.join(frontRoot, '..', 'shared', 'seoBrand.js'),
]

const source = sourceCandidates.find((candidate) => fs.existsSync(candidate))

if (!source) {
  console.error(
    'copy-seo-brand: no se encontró seoBrand.js en front/shared/ ni en ../shared/'
  )
  process.exit(1)
}

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.copyFileSync(source, target)
console.log(`Copied ${path.relative(frontRoot, source)} → functions/seoBrand.js`)
