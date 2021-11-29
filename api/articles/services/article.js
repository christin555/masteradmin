'use strict';

module.exports = {
  delete(params) {
    console.log(params);

    return strapi.query('article').update({deletedAt: Date.now()});
  }
};
