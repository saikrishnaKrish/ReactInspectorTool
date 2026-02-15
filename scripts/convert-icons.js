const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'icons');
const specs = [16, 32, 48, 128];

async function convert() {
    for (const size of specs) {
        const svgName = `icon${size}.svg`;
        const pngName = `icon${size}.png`;
        const svgPath = path.join(iconsDir, svgName);
        const pngPath = path.join(iconsDir, pngName);

        if (!fs.existsSync(svgPath)) {
            console.warn(`Skipping ${svgName}: not found`);
            continue;
        }

        try {
            await sharp(svgPath)
                .resize(size, size, { fit: 'contain' })
                .png({ quality: 100 })
                .toFile(pngPath);

            console.log(`Wrote ${pngPath}`);
        } catch (err) {
            console.error(`Failed to convert ${svgName}:`, err.message || err);
        }
    }
}

convert().catch(err => {
    console.error(err);
    process.exit(1);
});
