// example :
// htmlToPDF(
//     '#content'
//     , '.content-wrapper'
//     , 'a3'
//     , 20
//     , 'p'
//     , (progress) => {console.log(`Progress: ${progress}%`)};
// ).then(pdf => pdf.save('temp.pdf'))


export async function htmlToPDF(
    contentSelector,
    wrapperClasses,
    format = 'a3',
    margin = 20,
    orientation = 'p',
    progressCallback = null
) {
    async function loadDependency(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    await loadDependency('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadDependency('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    const { html2canvas } = window;
    const { jsPDF } = window.jspdf;

    const content = document.querySelector(contentSelector);
    const wrapperSelector = Array.isArray(wrapperClasses)
        ? wrapperClasses.join(', ')
        : wrapperClasses;
    const wrappers = document.querySelectorAll(`${contentSelector} ${wrapperSelector}`);

    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pdfContentWidth = pdfWidth - 2 * margin;
    const pdfContentHeight = pdfHeight - 2 * margin;
    const ratio = canvasWidth / pdfContentWidth;
    let position = 0;

    const canvasOffsetTop = content.offsetTop;

    const wrapperPositions = Array.from(wrappers).map(wrapper => {
        const offsetTop = wrapper.offsetTop - canvasOffsetTop;
        const offsetBottom = offsetTop + wrapper.offsetHeight;
        return {
            startY: offsetTop / ratio,
            endY: offsetBottom / ratio
        };
    });

    function getSectionHeight() {
        const defaultSectionHeight = pdfContentHeight;
        const leftCanvasHeight = canvasHeight - position;
        const truncatedWrapper = wrapperPositions.find(wrapper =>
            wrapper.startY > position && wrapper.endY > position + defaultSectionHeight
        );

        if (truncatedWrapper) {
            const wrapperStart = truncatedWrapper.startY;
            return wrapperStart - position;
        } else {
            return Math.min(defaultSectionHeight, leftCanvasHeight);
        }
    }

    const totalSections = Math.ceil(canvasHeight / (pdfContentHeight * ratio));

    while (position < canvasHeight) {
        const sourceY = position;
        const sectionHeight = getSectionHeight() * ratio;
        const sectionCanvas = document.createElement('canvas');
        sectionCanvas.width = canvasWidth;
        sectionCanvas.height = sectionHeight;

        const context = sectionCanvas.getContext('2d');
        context.drawImage(canvas, 0, sourceY, canvasWidth, sectionHeight, 0, 0, canvasWidth, sectionHeight);

        const sectionImgData = sectionCanvas.toDataURL('image/png');

        if (position > 0) {
            pdf.addPage();
        }

        pdf.addImage(sectionImgData, 'PNG', margin, margin, pdfContentWidth, sectionHeight / ratio);
        position += sectionHeight;

        console.log(progressCallback)
        if (progressCallback) {
            const currentSection = position / (pdfContentHeight * ratio);
            progressCallback(Math.min((currentSection / totalSections) * 100, 100));
        }
    }

    return pdf;
}

