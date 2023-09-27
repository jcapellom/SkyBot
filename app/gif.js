const fs = require("fs");
const path = require("path");
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas')

const baseUrl = "http://alertario.rio.rj.gov.br/upload/Mapa/semfundo/radar";
const tempFolder = path.join(__dirname, "temp");

// Create temp folder if it doesn't exist
if (!fs.existsSync(tempFolder)) {
	fs.mkdirSync(tempFolder);
}

// Function to download an image
async function downloadImage(i) {
	const imageNumber = String(i).padStart(3, "0")
	const url =
		baseUrl + imageNumber + ".png?query=0"

	console.log("Downloading:", url);

	try {
		const response = await fetch(url)
		const blob = await response.blob();
		
		const filePath = path.join(tempFolder, `${imageNumber}.png`);

		// Transform the blob to Buffer and save on file system
		const buffer = Buffer.from(await blob.arrayBuffer());
		fs.writeFileSync(filePath, buffer);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

// Download all 20 images
async function downloadAlertaRioImages() {
	for (let i = 1; i <= 20; i++) {
		await downloadImage(i);
		// Throttle requests to avoid server overload
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	const width = 1024/2;
	const height = 768/2;

	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');
   
	const encoder = new GIFEncoder(width, height);
	encoder.createReadStream().pipe(fs.createWriteStream('./temp/result.gif'));
	encoder.start();
	encoder.setRepeat(0);
	encoder.setDelay(50);
	encoder.setQuality(10);
	// encoder.setTransparent(1);
   
	const imgList = fs.readdirSync('./temp/');
	imgList.forEach(async (f, i) => {
	const image = await loadImage(`./temp/${f}`);

	// add a image to the background from local file "./map.png"
	const fundo = await loadImage("./assets/map.jpg");
	context.drawImage(fundo, 0, 0, width, height);

	context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);


	  encoder.addFrame(context);
	  if (i === imgList.length - 1) {
		console.log("GIF Generated!")
		encoder.finish();
		return true;
	  }
	});

}

module.exports = {
	downloadAlertaRioImages
}