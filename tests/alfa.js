/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
const {Rules} = require('@siteimprove/alfa-rules');
// Conducts and reports an alfa test.
exports.reporter = async page => {
  const data = {violations: []};
  // Get the data on the elements violating the default alfa rules.
  Scraper.with(async scraper => {
    for (const input of await scraper.scrape(page.url)) {
      data.violations.push(await Audit.of(input, Rules).evaluate());
    }
  });
  return {result: data};
};
