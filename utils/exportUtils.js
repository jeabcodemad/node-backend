const carbone = require('carbone');
const moment = require('moment');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');

exports.exportExcel = async (templateFilePath, data) => {

    const options = {
        convertTo: 'xlsx',
        characterSet: 'utf-8'
    };

    return new Promise(function (resolve, reject) {
        carbone.render(templateFilePath, data, options, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });

}

/* exports.exportPdf = async (templateFilePath, data) => {

    const options = {
        convertTo: 'pdf',
        characterSet: 'utf-8'
    };

    return new Promise(function (resolve, reject) {
        carbone.render(templateFilePath, data, options, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });

} */

exports.currentDate = () => {
    return moment(new Date(), moment.ISO_8601).format('DD/MM/YYYY');
}

exports.formatDate = (date) => {
    let strDate = '';

    try {
        strDate = moment(date, moment.ISO_8601).format('DD/MM/YYYY');
    } catch (error) { }

    return strDate === 'Invalid date' ? '' : strDate;
}

exports.formatDatetime = (date) => {
    let strDate = '';

    try {
        strDate = moment(date, moment.ISO_8601).format('DD/MM/YYYY hh:mm');
    } catch (error) { }

    return strDate === 'Invalid date' ? '' : strDate;
}

exports.calVat = (amount, vat) => {
    return amount * (vat / 100);
}

exports.formatDigit = (n, digits) => {
    return n ? n.toFixed(digits) : '';
}

exports.exportPdf = async (templateName, data, headerHeight, footerHeight) => {
    const templatePath = './export_templates/';
    const imageDir = path.join(process.cwd(), 'export_templates/images');

    const templateHeader = templatePath + templateName + '/' + templateName + '_header.hbs';
    const templateContent = templatePath + templateName + '/' + templateName + '_content.hbs';
    const templateFooter = templatePath + templateName + '/' + templateName + '_footer.hbs';

    try {

        hbs.registerHelper('dateFormat', function (value, format) {
            return moment(value).format(format);
        });

        data.imageDir = imageDir;

        const htmlHeader = await fs.readFile(templateHeader, 'utf-8');
        const header = await hbs.compile(htmlHeader)(data);

        const htmlContent = await fs.readFile(templateContent, 'utf-8');
        const content = await hbs.compile(htmlContent)(data);

        const htmlFooter = await fs.readFile(templateFooter, 'utf-8');

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(content);
        const pdf = await page.pdf({
            scale: 1,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: { top: `${headerHeight}px`, bottom: `${footerHeight}px` },
            headerTemplate: header,
            footerTemplate: htmlFooter,
        });

        console.log('done');
        await browser.close();

        return pdf;
    } catch (error) {
        console.log("error", error);
    }
}

exports.exportQuotation = async (templateName, dataSource) => {
    const templatePath = './export_templates/';

    const template = templatePath + templateName + '/' + templateName + '_content.hbs';

    try {

        const html = await fs.readFile(template, 'utf-8');
        const content = await hbs.compile(html)(dataSource);

        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        await page.setContent(content);

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        console.log('done');
        await browser.close();

        return pdf;

    } catch (error) {
        console.log("error", error);
    }
}

exports.exportReport = async (templateName, dataSource) => {
    const templatePath = './export_templates/';

    const template = templatePath + templateName + '/' + templateName + '_content.hbs';

    try {
        const html = await fs.readFile(template, 'utf-8');
        const content = await hbs.compile(html)(dataSource);

        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        await page.setContent(content);

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        console.log('done');
        await browser.close();

        return pdf;
    } catch (error) {
        console.log("error", error);
    }
}