require('dotenv').config();

var username = process.env.ZENDESK_USERNAME;
var password = process.env.ZENDESK_PASSWORD;
var zendeskDomain = process.env.ZENDESK_DOMAIN;

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

module.exports = function(robot) {
  /*
   * bot sends out assigned ticket count when you @mention him and say 'zendesk ticket count' but this can easily be put inside a setTimeout every lunch time or something..
   */
  robot.respond(/zendesk ticket count/i, function(res) {
    res.reply('Sending zendesk ticket count to agents');
    
    var users = [
      {
        zID: process.env.RJ_ZENDESK_ID,
        sID: process.env.RJ_SLACK_ID
      },
      {
        zID: process.env.TERENCE_ZENDESK_ID,
        sID: process.env.TERENCE_SLACK_ID
      },
      {
        zID: process.env.GERDA_ZENDESK_ID,
        sID: process.env.GERDA_SLACK_ID
      },
      {
        zID: process.env.FRANZ_ZENDESK_ID,
        sID: process.env.FRANZ_SLACK_ID
      },
      {
        zID: process.env.ANDREW_ZENDESK_ID,
        sID: process.env.ANDREW_SLACK_ID
      }
    ];

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
        });
  });
}
