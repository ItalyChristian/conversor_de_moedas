const firstCurrency = document.querySelector('[data-js="first-currency"]');
const secondCurrency = document.querySelector('[data-js="second-currency"]');
const currenciesContainer = document.querySelector('[data-js="currencies-container"]');
const convertedValue = document.querySelector('[data-js="converted-value"]');
const conversionPrecision = document.querySelector('[data-js="conversion-precision"]');
const currencyOneTimes = document.querySelector('[data-js="currency-one-times"]');

const url = 'http://api.exchangeratesapi.io/v1/latest?//INSIRA AQUI A CHAVE DE AUTORIZAÇÃO DA API//';

const getErrorMessage = errorType => ({
	'unsupported-code': 'Esta moeda não existe em nosso banco de dados.',
	'base-code-only-on-pro': 'Códigos base diferentes de USD e EUR não podem ser acessados no plano atual.',
	'malformed-request': 'Requisição mal formulada.',
	'invalid-key': 'Chave de autorização inválida.',
	'not-available-on-plan': 'Moeda não disponível para este tipo de plano.'
})[errorType] || "Não foi possível obter as informações."

const fetchExchangeRate = async () => {
	try {
		const response = await fetch(url);

		if(!response.ok){
			throw new Error("Sua conexão falhou. Não foi possível obter as informações.");
		}

		const exchangeRateData = await response.json();

		if (exchangeRateData.result === 'error'){
			throw new Error(getErrorMessage(exchangeRateData['error-type']));
		}

		return exchangeRateData;

	} catch (err){
		const div = document.createElement('div');
		const button = document.createElement('button');

		div.textContent = err.message;
		div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
		div.setAttribute('role', 'alert');
		button.classList.add('btn-close');
		button.setAttribute('type', 'button');
		button.setAttribute('Attribute', 'Close');

		button.addEventListener('click', () => {
			div.remove();
		})

		div.appendChild(button)
		currenciesContainer = document.insertAdjacentElement('afterend', div);
	}
}

const init = async () => {
	const exchangeRateData = await fetchExchangeRate();

	internalExchangeRate = { ... exchangeRateData };
//	for (let key in exchangeRateData.rates) {
//		console.log(key,  exchangeRateData.rates[key]);
//	}

	const getOptions = selectedCurrency => Object.keys(exchangeRateData.rates).map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
	//join('')

	firstCurrency.innerHTML = getOptions('USD');
	secondCurrency.innerHTML = getOptions('BRL');

	const calculateConversion = exchangeRateData.rates ;
	convertedValue.textContent = exchangeRateData.rates.BRL.toFixed(2);
	conversionPrecision.textContent = `1 USD = ${exchangeRateData.rates.BRL.toFixed(4)} BRL`;

	currencyOneTimes.addEventListener('input', e => {
		convertedValue.textContent = (e.target.value * internalExchangeRate.rates[secondCurrency.value]).toFixed(2);
	})

	secondCurrency.addEventListener('input', e => {
		const secondValue =  internalExchangeRate.rates[e.target.value];

		convertedValue.textContent = (currencyOneTimes.value * secondValue).toFixed(2); 
	})
}

init();



