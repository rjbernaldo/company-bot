require('dotenv').config();

var username = process.env.ZENDESK_USERNAME;
var password = process.env.ZENDESK_PASSWORD;
var zendeskDomain = process.env.ZENDESK_DOMAIN;

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

module.exports = function(robot) {

  robot.respond(/hi|hello|help/i, function(res) {
    res.reply("Greetings! I am here to help Czech that we are helping our lovely customers.?\n`checkin` - Check in with all the Specialists.");
  });

  robot.respond(/czechin|checkin|check/i, function(res) {
    res.reply('Messaging a break-down of ZenDesk tickets to each of the Integration Support specialists.');
    
    var users = [{
        name: "RJ",
        zID: process.env.RJ_ZENDESK_ID,
        sID: process.env.RJ_SLACK_ID
    }, {
        name: "Terence",
        zID: process.env.TERENCE_ZENDESK_ID,
        sID: process.env.TERENCE_SLACK_ID
    }, {
        name: "Gerda",
        zID: process.env.GERDA_ZENDESK_ID,
        sID: process.env.GERDA_SLACK_ID
    }, {
        name: "Franz",
        zID: process.env.FRANZ_ZENDESK_ID,
        sID: process.env.FRANZ_SLACK_ID
    }, {
        name: "Andrew",
        zID: process.env.ANDREW_ZENDESK_ID,
        sID: process.env.ANDREW_SLACK_ID
    }];

    var summary = '*Summary:*\n';

    users.forEach(function(user) {
      var url = 'https://' + zendeskDomain + '.zendesk.com/api/v2/users/' + user.zID + '/tickets/assigned.json';

      robot
        .http(url)
        .header('Authorization', auth)
        .get()(function(err, response, body) {
          var jsonResponse = JSON.parse(body);
	        var ticketCount = jsonResponse.count;
          var message;
          /*
           * {
           *   "tickets": [
           *     {
           *       "id":      35436,
           *       "subject": "Help I need somebody!",
           *       ...
           *     },
           *     ...
           *   ],
           *   count: 1
           * }
           */

	        if (ticketCount > 0) {
	          message = "You have a total of " + ticketCount + " assigned tickets.\n";

            jsonResponse.tickets.forEach(function(ticket, index) {;
              message += index + ". " + ticket.subject + " (" + ticket.url + ")\n";
            });

	        } else {
            message = "You have no tickets today. Awesome!";
          }

	        robot.send({ room: user.sID }, message);

          summary += '*' + user.name + '* - `' + ticketCount + '` outstanding tickets.';
        });

      res.reply(summary);
    });
  });
}
