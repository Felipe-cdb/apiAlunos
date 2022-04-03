const {Pool} = require('pg');

const conect = new Pool({
    connectionString: process.env.BD_KEY
});

module.exports = conect;