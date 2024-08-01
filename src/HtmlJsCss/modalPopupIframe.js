/*
Iframe modal module that returns a promise ES6 JS version

Calling example

openModal('url.html', '400px', '80%')
    .then(result => {
        handleResult(result);
        resolve(result);
    })
    .catch(error => {
        console.error('Error:', error);
        reject(error);
    });


Messaging example

let done = false;
function sendResult(a, b, c, d) {
    if (window.parent) {
        window.parent.postMessage({
            type: 'result',
            value: {
                a: a,
                b: b,
                c: c,
                d: d
            }
        }, '*');
        done = true;
        window.close();
    } else {
        alert('Parent window not be found.');
    }
}

function reportError(errorMessage) {
    if (window.parent) {
        window.parent.postMessage({
            type: 'error',
            message: errorMessage
        }, '*');
    }
}

window.addEventListener('beforeunload', function () {
    if (done === true) return;
    reportError('Popup was closed before submitting.');
});*/


export function initializeModal() {
    if (document.getElementById('modal')) return;

    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    const modalContent = document.createElement('div');
    modalContent.id = 'modalContent';
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '10vh auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.height = '80%';
    modalContent.style.maxHeight = '600px';
    modalContent.style.position = 'relative';
    modalContent.style.borderRadius = '8px';

    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.style.color = '#aaa';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '28px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.cursor = 'pointer';

    const iframe = document.createElement('iframe');
    iframe.id = 'modalFrame';
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 40px)';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '4px';
    modalContent.appendChild(closeButton);
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

export function openModal(url, width = '80%', height = '80%', cors = false) {
    initializeModal();

    return new Promise((resolve, reject) => {
        const modal = document.getElementById('modal');
        const iframe = document.getElementById('modalFrame');
        const closeButton = document.querySelector('.close-button');

        if (!modal || !iframe || !closeButton) {
            reject('Content not found.');
            return;
        }

        const modalContent = document.getElementById('modalContent');

        modalContent.style.width = width;
        modalContent.style.height = height;

        function messageHandler(event) {
            if (!cors && event.origin !== window.location.origin) {
                return;
            }

            if (event.data.type === 'result') {
                resolve(event.data.value);
                closeModal();
            } else if (event.data.type === 'error') {
                reject(event.data.message);
                closeModal();
            }
        }

        function openModal() {
            iframe.src = url;
            modal.style.display = 'block';
            window.addEventListener('message', messageHandler);
        }

        function closeModal() {
            modal.style.display = 'none';
            iframe.src = '';
            window.removeEventListener('message', messageHandler);
        }

        closeButton.onclick = closeModal;

        modal.onclick = function (event) {
            if (event.target === modal) {
                closeModal();
            }
        };

        openModal();
    });
}
