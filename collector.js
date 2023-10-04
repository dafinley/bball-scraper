const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const Excel = require('exceljs');

const options = new chrome.Options();
options.addArguments('--headless'); // run Chrome in headless mode

const eventUrlList = [
];

(async function scrapeEvents() {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    const eventDetailsList = [];

    for (let i = 0; i < eventUrlList.length; i++) {
      const eventUrl = eventUrlList[i];

      await driver.get(eventUrl);

      const contact = await driver.findElement(By.css('div[itemprop="performer"] a')).getText();

      const locationElement = await driver.findElement(By.css('a[href*="maps.apple.com/maps"]'));
      const location = await locationElement.getText();
      const locationUrl = await locationElement.getAttribute('href');

      const description = await driver.findElement(By.css('p[itemprop="description"]')).getText();

      const date = await driver.findElement(By.css('.date span')).getText();

      const eventData = {
        contact: contact,
        location: location,
        locationUrl: locationUrl,
        description: description,
        date: date
      };

      eventDetailsList.push(eventData);
    }

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Event Details');

    worksheet.columns = [
      { header: 'Contact', key: 'contact' },
      { header: 'Location', key: 'location' },
      { header: 'Location URL', key: 'locationUrl' },
      { header: 'Description', key: 'description' },
      { header: 'Date', key: 'date' }
    ];

    worksheet.addRows(eventDetailsList);

    await workbook.xlsx.writeFile('event_details.xlsx');

    console.log('Scraped data written to event_details.xlsx file');
  } catch (error) {
    console.log(error);
  } finally {
    await driver.quit();
  }
})();

