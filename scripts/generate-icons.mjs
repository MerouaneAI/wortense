// One-time icon generator (spec §7). NOT part of `npm run build`.
// Run manually with `npm run icons` after editing public/icon.svg or
// public/og-image.svg. Requires the `sharp` devDependency.
//
// Emits into public/:
//   icon-192.png, icon-512.png, icon-maskable-512.png,
//   apple-touch-icon.png (180), og-image.png (1200x630)

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')

// A maskable variant: full-bleed background with the bars inside the safe
// zone (centre ~80%), so platform masking never clips the artwork.
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#211D18" />
  <g transform="translate(102 102) scale(0.6)">
    <rect x="10" y="30" width="128" height="52" rx="26" fill="#2DD4BF" />
    <rect x="10" y="120" width="184" height="52" rx="26" fill="#38BDF8" />
    <rect x="10" y="210" width="240" height="52" rx="26" fill="#FB923C" />
    <rect x="10" y="300" width="288" height="52" rx="26" fill="#EF4444" />
  </g>
</svg>`

async function svgToPng(source, width, height, outName) {
	await sharp(source)
		.resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toFile(join(publicDir, outName))
	console.log(`wrote public/${outName}`)
}

async function main() {
	const iconSvg = await readFile(join(publicDir, 'icon.svg'))
	const ogSvg = await readFile(join(publicDir, 'og-image.svg'))

	await svgToPng(iconSvg, 192, 192, 'icon-192.png')
	await svgToPng(iconSvg, 512, 512, 'icon-512.png')
	await svgToPng(Buffer.from(MASKABLE_SVG), 512, 512, 'icon-maskable-512.png')
	await svgToPng(iconSvg, 180, 180, 'apple-touch-icon.png')
	await svgToPng(ogSvg, 1200, 630, 'og-image.png')

	console.log('All icons generated.')
}

main().catch((error) => {
	console.error('Icon generation failed:', error)
	process.exitCode = 1
})