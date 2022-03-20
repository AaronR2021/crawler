//database config
const { Sequelize } = require('sequelize');
//sequalize takes care of pg $ pg-hstore in the background..so dont worry.
const db = new Sequelize("d5igsttch6bnnd","agnfbzzkabhywl","2f122db71d1f87a9b531c1bea787eeecde1374525fa767c7481c239251be74d7",
 {                      //database name   =>  username    =>    password//
    host: 'ec2-3-222-204-187.compute-1.amazonaws.com',
    dialect: 'postgres',//name of the engine

    pool: {  //collection of saved reusable connections
        max: 5, //never have more than 5 open connections
        min: 0, // t a minimum, have zero open connections/maintain no minimum number of connections
        acquire: 30000,
        idle: 10000//how long will sequalize hold the connection before terminating it>> 10seconds.
        //pool.timeout is how long if no response terminate connection
    },
    //got from stack overflow. but why?-->check it out!
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // <<<<<<< YOU NEED THIS
        }
      },
    logging:false,
});

module.exports = db;