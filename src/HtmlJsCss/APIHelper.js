function apiCall(url, method = 'GET', body = null, contentType, customHeaders = {}, successCallback = () => { }
    , errorCallback = () => { }, isAlertOnError = true) {
    const headers = new Headers({
        ...(contentType && {'Content-Type': contentType}), ...customHeaders
    });

    return fetch(url, {
        method, headers, body
    })
        .then(async (response) => {
            const result = await response.json().catch(() => ({}));
            if (response.ok) {
                successCallback(result, response.code, response.message);
                return result
            } else {
                errorCallback(result, response.code, response.message);
                if (isAlertOnError) {
                    alert(`Error: ${response.message}`);
                }
            }
        })
        .catch(error => {
            errorCallback(error, 'Network Error');
            if (isAlertOnError) {
                alert(`Network Error: ${error.message}`);
            }
        });
}


// Using function call

export function getData(url, successCallback, errorCallback, customHeaders, isAlertOnError) {
    return apiCall(url, 'GET', null, 'application/json', customHeaders, successCallback, errorCallback, isAlertOnError);
}

export function postJSON(url, data, successCallback, errorCallback, customHeaders, isAlertOnError) {
    return apiCall(url, 'POST', JSON.stringify(data), 'application/json', customHeaders, successCallback, errorCallback, isAlertOnError);
}

export function postFormData(url, selector, successCallback, errorCallback, customHeaders, isAlertOnError) {
    const formData = new FormData(document.querySelector(selector));
    return apiCall(url, 'POST', formData, undefined, customHeaders, successCallback, errorCallback, isAlertOnError);
}

export function postJSONForm(url, selector, successCallback, errorCallback, customHeaders, isAlertOnError) {
    const jsonData = JSON.stringify(Object.fromEntries(new FormData(document.querySelector(selector))));
    return apiCall(url, 'POST', jsonData, 'application/json', customHeaders, successCallback, errorCallback, isAlertOnError);
}


// Using request object

export class APIRequest {
    constructor(url, data = {}, successCallback = () => {}, errorCallback = () => {}, customHeaders = {}, isAlertOnError = true) {
        this.url = url;
        this.data = {};

        if (typeof data === 'object') {
            this.data = {...data};
        } else {
            const dataElem = data instanceof HTMLElement ? data : document.querySelector(data);
            if (dataElem) dataElem instanceof HTMLFormElement ? this.setForm(dataElem) : this.setInput(dataElem);
            else console.error("[APIRequest] Invalid data parameter to Constructor : ", data)
        }

        this.successCallback = successCallback;
        this.errorCallback = errorCallback;
        this.customHeaders = customHeaders;
        this.isAlertOnError = isAlertOnError;
    }

    setData(name, value) {
        this.data[name] = value;
    }

    setCustomHeader(name, value) {
        if (!this.customHeaders) {
            this.customHeaders = {};
        }
        this.customHeaders[name] = value;
    }

    setForm(elemOrSelector) {
        const form = elemOrSelector instanceof HTMLElement ? elemOrSelector : document.querySelector(elemOrSelector);
        if (!form || !(form instanceof HTMLFormElement)) {
            console.error("[APIRequest] No match form from selector: ", elemOrSelector);
            return;
        }
        const formData = new FormData(form);

        formData.forEach((value, name) => {
            this.setData(name, value);
        });
    }

    setInput(elemOrSelector, name = null) {
        // An input with a name is recommended, but other types of elements will  also work if the value attribute is accessible.
        const input = elemOrSelector instanceof HTMLElement ? elemOrSelector : document.querySelector(elemOrSelector);
        if (!input) {
            console.error("[APIRequest] No match input from selector: ", elemOrSelector);
            return;
        }
        name = name || input.name || input.id;
        const value = input.value || input.innerText;
        if (!name) {
            console.error("[APIRequest] No name in : ", input);
            return;
        }
        if (!value) {
            console.error("[APIRequest] No value in : ", input);
            return;
        }
        this.setData(name, value);
    }

    sendGet() {
        const queryString = Object.entries(this.data)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        const urlWithQuery = `${this.url}?${queryString}`;
        return getData(urlWithQuery, this.successCallback, this.errorCallback, this.customHeaders, this.isAlertOnError);
    }

    sendPost() {
        return postJSON(this.url, this.data, this.successCallback, this.errorCallback, this.customHeaders, this.isAlertOnError);
    }

}
