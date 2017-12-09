var sql = require('mssql');
var account = require('./account');
sql.connect(account.config, function(){




    var request = new sql.Request();
    request.query('select * from Students', function(err, records) {
        console.log(records);
    });
});
