import knex from 'knex';

const database = knex({
    client: 'sqlite3',
    connection: {
        filename: './sqlite (7).db',
    },
    useNullAsDefault: true,
});

export default database;