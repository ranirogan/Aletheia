const _ = require('lodash');
const network = require('./network');
const _extractor = require('./_special/_extractor');

const getAllUrl = async function (sourceUrl) {
  const $ = network.getParsedHtml(sourceUrl);
  return _extractor._getAllUrls(await $);
};

/**
 *
 * @param {String} sourceUrl
 * @param {String} [localFileUrl] - For test, the local file url.
 * @param {Array} [categories]  - Categories url intrested in
 *
 */
const getCategoryUrls = async function (sourceUrl, categories = []) {
  // during test use the get all url from the local html file  but
  // when not testing get all url from source url.
  const urls = getAllUrl(sourceUrl);
  return _extractor._getCategoryUrls(sourceUrl, await urls, categories);
};

// Get article urls from a given category source
const getArticlesUrl = async function (categorySource) {
  const $ = network.getParsedHtml(categorySource);
  console.log(categorySource);
  return _extractor._getArticlesUrl(await $, categorySource);
};

const getCategoryName = function (link) {
  return _extractor._getCategoryName(link);
};
// Article
const getTitle = function ($) {
  // We extract title from any of these meta data
  const fbTitle = $("meta[property='og:title']").attr('content');
  const twitterTitle = $("meta[property='twitter:title']").attr('content');
  const pageTitle = $('title').text();
  const h1 = $('h1').text();
  if (fbTitle !== '' && fbTitle !== undefined && fbTitle != null) {
    return fbTitle;
  }
  if (twitterTitle !== '' && twitterTitle !== undefined && twitterTitle !== null) {
    return twitterTitle;
  }
  if (pageTitle !== '' && pageTitle !== undefined && pageTitle !== null) {
    return pageTitle;
  }
  if (h1 !== '' && h1 !== undefined && h1 !== null) {
    return h1;
  }
  return '';
};

const getDescription = function ($) {
  const fbDescription = $("meta[property='og:description']").attr('content');
  const twitterDescription = $("meta[property='twitter:description']").attr('content');

  if (fbDescription !== '' && fbDescription !== undefined && fbDescription !== null) {
    return fbDescription;
  }
  if (twitterDescription !== '' && twitterDescription !== undefined && twitterDescription !== null) {
    return twitterDescription;
  }
  return '';
};

const getTopImage = function ($) {
  // Extract image url from any of these meta data
  const fbImage = $("meta[property='og:image']").attr('content');
  const twitterImage = $("meta[property='twitter:image']").attr('content');
  if (fbImage !== '' && fbImage !== undefined && fbImage !== null) {
    return fbImage;
  }
  if (twitterImage !== '' && twitterImage !== undefined && twitterImage !== null) {
    return twitterImage;
  }
  return '';
};

const getText = function ($) {
  const p = $('p').text();
  if (p !== '' && p !== undefined && p !== null) {
    return p;
  }
  return '';
};

const getDate = function ($) {
  // Extract date from any of these meta data
  const avaliableDate1 = $("meta[property='article:published']").attr('content');
  const avaliableDate2 = $("meta[property='article:published_time']").attr('content');
  const avaliableDate3 = $("meta[property='og:pubdate']").attr('content');
  const avaliableDate4 = $("meta[name='sailthru.date']").attr('content');
  if (avaliableDate1 !== '' && avaliableDate1 !== undefined && avaliableDate1 !== null) {
    return avaliableDate1;
  }
  if (avaliableDate2 !== '' && avaliableDate2 !== undefined && avaliableDate2 !== null) {
    return avaliableDate2;
  }
  if (avaliableDate3 !== '' && avaliableDate3 !== undefined && avaliableDate3 !== null) {
    return avaliableDate3;
  }
  if (avaliableDate4 !== '' && avaliableDate4 !== undefined && avaliableDate4 !== null) {
    return avaliableDate4;
  }
  return '';
};

const getAuthor = function ($) {
  const availableAuthor1 = $("meta[name='author']").attr('content');
  const availableAuthor2 = $("meta[property='author']").attr('content');
  if (availableAuthor1 !== '' && availableAuthor1 !== undefined && availableAuthor1 !== null) {
    return availableAuthor1;
  }
  if (availableAuthor2 !== '' && availableAuthor2 !== undefined && availableAuthor2 !== null) {
    return availableAuthor2;
  }
  return '';
};

const getKeywords = function ($) {
  const availableKeywords1 = $("meta[name='keywords']").attr('content');
  const availableKeywords2 = $("meta[name='news_keywords']").attr('content');
  if (availableKeywords1 !== '' && availableKeywords1 !== undefined && availableKeywords1 !== null) {
    return _.split(availableKeywords1, ',');
  }
  if (availableKeywords2 !== '' && availableKeywords2 !== undefined && availableKeywords2 !== null) {
    return _.split(availableKeywords2, ',');
  }
  return '';
};

module.exports = {
  getTitle: getTitle,
  getText: getText,
  getDescription: getDescription,
  getDate: getDate,
  getTopImage: getTopImage,
  getKeywords: getKeywords,
  getAuthor: getAuthor,
  getAllUrl: getAllUrl,
  getCategoryUrls: getCategoryUrls,
  getArticlesUrl: getArticlesUrl,
  getCategoryName: getCategoryName
};
