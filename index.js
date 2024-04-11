const { Cluster } = require("puppeteer-cluster");
const fs = require("node:fs");

let words = [
	"carro",
	"lapis",
	"fogueira",
	"casaco",
	"lanche",
	"programador",
	"chefe",
	"navio",
	"cidade",
	"estado",
	"rua",
	"sinal",
	"hoje",
	"ano",
	"dia",
	"domingo",
	"sorvete",
	"pizza",
	"arroz",
	"melancia",
];

(async () => {
	console.log("Traduzindo termos para o ingles");
	console.time("cluster");
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_CONTEXT,
		maxConcurrency: 4,
	});

	let jsonResult = {};

	await cluster.task(async ({ page, data }) => {
		const { word } = data;
		await page.goto(
			`https://translate.google.com.br/?hl=pt-BR&sl=pt&tl=en&text=${word}&op=translate`,
			{ waitUntil: "domcontentloaded" }
		);

		let element = await page.waitForSelector(".ryNqvb");
		let result = await element.evaluate((el) => el.innerText);
		jsonResult[word] = result;
	});

	words.forEach((word) => {
		cluster.queue({ word });
	});

	await cluster.idle();
	await cluster.close();
	fs.writeFileSync("en.json", JSON.stringify(jsonResult));
	console.log("Traducao concluida com sucesso");
	console.timeEnd("cluster");
})();
