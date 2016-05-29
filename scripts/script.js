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
        name: process.env.USER1_NAME,
        zID: process.env.USER1_ZENDESK_ID,
        sID: process.env.USER1_SLACK_ID,
        zendeskView: process.env.USER1_ZENDESK_VIEW,
        zendeskTag: process.env.USER1_ZENDESK_TAG
    }, {
        name: process.env.USER2_NAME,
        zID: process.env.USER2_ZENDESK_ID,
        sID: process.env.USER2_SLACK_ID,
        zendeskView: process.env.USER2_ZENDESK_VIEW,
        zendeskTag: process.env.USER2_ZENDESK_TAG
    }, {
        name: process.env.USER3_NAME,
        zID: process.env.USER3_ZENDESK_ID,
        sID: process.env.USER3_SLACK_ID,
        zendeskView: process.env.USER3_ZENDESK_VIEW,
        zendeskTag: process.env.USER3_ZENDESK_TAG
    }, {
        name: process.env.USER4_NAME,
        zID: process.env.USER4_ZENDESK_ID,
        sID: process.env.USER4_SLACK_ID,
        zendeskView: process.env.USER4_ZENDESK_VIEW,
        zendeskTag: process.env.USER4_ZENDESK_TAG
    }, {
        name: process.env.USER5_NAME,
        zID: process.env.USER5_ZENDESK_ID,
        sID: process.env.USER5_SLACK_ID,
        zendeskView: process.env.USER5_ZENDESK_VIEW,
        zendeskTag: process.env.USER5_ZENDESK_TAG
    }, {
        name: process.env.USER6_NAME,
        zID: process.env.USER6_ZENDESK_ID,
        sID: process.env.USER6_SLACK_ID,
        zendeskView: process.env.USER6_ZENDESK_VIEW,
        zendeskTag: process.env.USER6_ZENDESK_TAG
    }];

    var summary = '\n*Summary:*\n';

    async.each(users, function(user, done) {
      var url = 'https://' + zendeskDomain + '.zendesk.com/api/v2/search.json?query="type:ticket status:open tags:' + user.zendeskTag + '"';

      robot
        .http(url)
        .header('Authorization', auth)
        .get()(function(err, response, body) {
          var jsonResponse = JSON.parse(body);
	        var ticketCount = jsonResponse.count;
          var message;

          if (ticketCount > 0) {
            message = 'Hi ' + user.name + '! There are `' + ticketCount + '` developer support tickets waiting for <https://' + zendeskDomain + '.zendesk.com/agent/filters/' + user.zendeskView + '|you>. :hugging_face:\n';

            jsonResponse.tickets.forEach(function(ticket, index) {
              var now = new Date().getTime();
              var ticketUpdateTime = new Date(ticket.updated_at).getTime();
              var hoursAgo = Math.abs((now - ticketUpdateTime) / (60*60*1000));
              message = '<' + ticket.url + '|' + ticket.subject + '> - :timer_clock: ' + hoursAgo + ' hrs\n';
            });
          } else {
            // message = 'Hi ' + user.name + '! You have no tickets! :thumbsup:';
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
