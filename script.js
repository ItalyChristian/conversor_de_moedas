const firstCurrencyEl = document.querySelector('[data-js="first-currency"]');
const secondCurrencyEl = document.querySelector('[data-js="second-currency"]');
const currenciesContainer = document.querySelector('[data-js="currencies-container"]');
const convertedValue = document.querySelector('[data-js="converted-value"]');
const conversionPrecision = document.querySelector('[data-js="conversion-precision"]');
const currencyOneTimes = document.querySelector('[data-js="currency-one-times"]');

const showAlert = err => {
	const div = document.createElement('div');
	const button = document.createElement('button');

	div.textContent = err.message;
	div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
	div.setAttribute('role', 'alert');
	button.classList.add('btn-close');
	button.setAttribute('type', 'button');
	button.setAttribute('aria-label', 'Close');

	const removeAlert = () => div.remove()
	button.addEventListener('click', removeAlert)

	div.appendChild(button)
	currenciesContainer.insertAdjacentElement('afterend', div);
}

const state = (() =>  {
	let exchangeRate = {};

	return {
		getExchangeRate: () => exchangeRate,
		setExchangeRate: newExchangeRate => {
			if (!newExchangeRate.rates){
				showAlert({ message: 'O objeto precisa ter a propriedade "rates"'});
				return
			}

			exchangeRate = newExchangeRate;
			return exchangeRate;
		}
	}
})();

const getUrl = currency => `http://api.exchangeratesapi.io/v1/latest?access_key=a7fb1ed7552340e60ba3db83135d4c5a&${currency}`

const getErrorMessage = errorType => ({
	'unsupported-code': 'Esta moeda não existe em nosso banco de dados.',
	'base-code-only-on-pro': 'Códigos base diferentes de USD e EUR não podem ser acessados no plano atual.',
	'malformed-request': 'Requisição mal formulada.',
	'invalid-key': 'Chave de autorização inválida.',
	'not-available-on-plan': 'Moeda não disponível para este tipo de plano.'
})[errorType] || "Não foi possível obter as informações."

const fetchExchangeRate = async url => {
	try {
		const response = await fetch(url);

		if(!response.ok){
			throw new Error("Sua conexão falhou. Não foi possível obter as informações.");
		}

		const exchangeRateData = await response.json();

		if (exchangeRateData.result === 'error'){
			throw new Error(getErrorMessage(exchangeRateData['error-type']));
		}

		return state.setExchangeRate(exchangeRateData);
	}catch (err){
		showAlert(err);
	}

}

const getOptions = (selectedCurrency, rates) => {

	const setSelectedAttribute = currency => 
	currency === selectedCurrency ? 'selected' : ''
	const getOptionsArray = currency => `<option ${setSelectedAttribute(currency)}>${currency}</option>`;

 	return Object.keys(rates).map(getOptionsArray);
}

const getMultipliedExchangeRate = rates	=> {
	const secondCurrency = rates[secondCurrencyEl.value];
	return (currencyOneTimes.value * secondCurrency).toFixed(2);
}	

const getNotRoundedExchangeRate = rates => {
	const secondCurrency = rates[secondCurrencyEl.value];
	return `1 ${firstCurrencyEl.value} = ${1 * secondCurrency} ${secondCurrencyEl.value}`;
}

const showUpdatedRates = ({rates}) => {
	convertedValue.textContent = getMultipliedExchangeRate(rates);
	conversionPrecision.textContent = getNotRoundedExchangeRate(rates);
}

const showInitialInfo = ({rates}) => {
	
	firstCurrencyEl.innerHTML = getOptions('USD', rates);
	secondCurrencyEl.innerHTML = getOptions('BRL', rates);

	showUpdatedRates({rates});

} 


const init = async () => {
	const url = getUrl('USD');
	const exchangeRateFromAPI = await fetchExchangeRate(url);
	const exchangeRate = state.setExchangeRate(exchangeRateFromAPI);

	if (exchangeRate && exchangeRate.rates) {
		showInitialInfo(exchangeRate);
	}
}

const handleCurrencyOneTimes = () => {
	const {rates} = state.getExchangeRate();
	convertedValue.textContent = getMultipliedExchangeRate(rates);
}

const handleSecondCurrency = () => {
	const exchangeRate = state.getExchangeRate();
	showUpdatedRates(exchangeRate);
}

const handleFirstCurrency = async e => {
	const url = getUrl(e.target.value);
	const exchangeRate = await fetchExchangeRate(url);

	showUpdatedRates(exchangeRate);
}

currencyOneTimes.addEventListener('input', handleCurrencyOneTimes);
secondCurrencyEl.addEventListener('input', handleSecondCurrency);
firstCurrencyEl.addEventListener('input', handleFirstCurrency);

init()




