const tables = require('./tables.json');
const fs = require('fs');
const path = require('path');
const plural = require('pluralize');

const basePath = 'api';

const types = {
  'int4': 'integer',
  'varchar': 'string',
  'text': 'text',
  'jsonb': 'json',
  'timestamptz': 'datetime',
  'bool': 'boolean',
  '_int4': 'array',
  'timestamp': 'datetime'
};

const createTableDir = (table) => {
  console.log(`create ${table} dirs`);

  fs.mkdirSync(path.resolve(process.cwd(), basePath, table, 'config'), {recursive: true});
  fs.mkdirSync(path.resolve(basePath, table, 'controllers'), {recursive: true});
  fs.mkdirSync(path.resolve(basePath, table, 'models'), {recursive: true});
  fs.mkdirSync(path.resolve(basePath, table, 'services'), {recursive: true});
};

const createConfig = (table) => {
  console.log(`create ${table} config`);

  const src = path.resolve('sample', 'config', 'routes.json');
  const dest = path.resolve(basePath, table, 'config', 'routes.json');

  const routes = fs.readFileSync(src).toString();
  const newRoutes = replaceRoutes(table, routes);

  fs.writeFileSync(dest, newRoutes);
};

const replaceRoutes = (table, routesStr) => {
  const singular = plural.singular(table);

  return routesStr
    .replace(/\$PATH/g, table)
    .replace(/\$HANDLER/g, singular);
};

const createControllers = (table) => {
  console.log(`create ${table} controllers`);

  const singular = plural.singular(table);
  const src = path.resolve('sample', 'controllers', 'sample.js');
  const dest = path.resolve(basePath, table, 'controllers', `${singular}.js`);

  fs.copyFileSync(src, dest);
};

const createModels = (table) => {
  console.log(`create ${table} models`);

  const singular = plural.singular(table);
  const src = path.resolve('sample', 'models', 'sample.js');
  const dest = path.resolve(basePath, table, 'models', `${singular}.js`);
  const settings = path.resolve(basePath, table, 'models', `${singular}.settings.json`);
  const model = createModel(table, singular);

  fs.copyFileSync(src, dest);
  fs.writeFileSync(settings, JSON.stringify(model, null, 2));
};

const createModel = (table, singular) => {
  const model = {
    'kind': 'collectionType',
    'collectionName': table,
    'info': {
      'name': singular
    },
    'options': {
      'increments': true
    },
    'pluginOptions': {},
    'attributes': {}
  };

  const attrs = tables[table];
  let hasId = false;

  attrs.forEach((attr) => {
    const {typname, attname, attnotnull} = attr;
    const params = {};

    if (attname === 'id') {
      hasId = true;

      return;
    }

    if (attnotnull === true) {
      params.required = true;
    }

    params.type = types[typname];
    model.attributes[attname] = params;
  });

  if (hasId === false) {
    model.options.increments = false;
  }

  return model;
};

const createServices = (table) => {
  console.log(`create ${table} services`);

  const singular = plural.singular(table);
  const src = path.resolve('sample', 'services', 'sample.js');
  const dest = path.resolve(basePath, table, 'services', `${singular}.js`);

  fs.copyFileSync(src, dest);
};

const keys = Object.keys(tables);

keys.forEach((table) => {
  createTableDir(table);
  createConfig(table);
  createControllers(table);
  createModels(table);
  createServices(table);
});
