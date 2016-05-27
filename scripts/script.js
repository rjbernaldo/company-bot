var dotenv = require('dotenv').config();
var async = require('async');

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
        name: "Rj",
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

    var summary = '\n*Summary:*\n';

    async.each(users, function(user, done) {
      var url = 'https://' + zendeskDomain + '.zendesk.com/api/v2/users/' + user.zID + '/tickets/assigned.json';

      robot
        .http(url)
        .header('Authorization', auth)
        .get()(function(err, response, body) {
          var jsonResponse = JSON.parse(body);
	        var ticketCount = jsonResponse.count;
          var message;

          if (ticketCount > 0) {
            message = 'Hi ' + user.name + '! There are `' + ticketCount + '` developer support tickets waiting for <https://' + zendeskDomain + '.zendesk.com|you>. :hugging_face:\n';

            jsonResponse.tickets.forEach(function(ticket, index) {
              var now = new Date().getTime();
              var ticketUpdateTime = new Date(ticket.updated_at).getTime();
              var hoursAgo = Math.abs((now - ticketUpdateTime) / (60*60*1000));
              message = '<' + ticket.url + '|' + ticket.subject + '> - :timer_clock: ' + hoursAgo + ' hrs\n';
            });
          } else {
            // message = 'Hi ' + user.name + '! You have no tickets!';
          }

          robot.adapter.customMessage({
            channel: user.sID,
            attachments: [
              {
                title_link: 'Summary',
                fallback: message,
                text: message,
                mrkdwn_in: ['text']
              }
            ]
          });

          summary += '*' + user.name + '* - `' + ticketCount + '` outstanding tickets.\n';

          done();
        });
    }, function(err) {
      res.reply(summary);
    });
  });
}
