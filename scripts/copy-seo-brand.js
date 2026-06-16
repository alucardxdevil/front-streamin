import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..', '..')
const source = path.join(root, 'shared', 'seoBrand.js')
const target = path.join(__dirname, '..', 'functions', 'seoBrand.js')

fs.copyFileSync(source, target)
console.log('Copied shared/seoBrand.js → front/functions/seoBrand.js')
