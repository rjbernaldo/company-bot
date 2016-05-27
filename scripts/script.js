require('dotenv').config();

var username = process.env.ZENDESK_USERNAME;
var password = process.env.ZENDESK_PASSWORD;
var zendeskDomain = process.env.ZENDESK_DOMAIN;

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

module.exports = function(robot) {
    // robot.listen(function(message) {
    //     console.log(message.user);
    //     return message.user.name === "Steve" && Math.random() > 0.8;
    // }, function(response) {
    //     // return response.reply("HI STEVE! YOU'RE MY BEST FRIEND! (but only like " + (response.match * 100) + "% of the time)");
    // });

    robot.respond(/hi|hello|help/i, function(res) {
        res.reply("Greetings! I am here to help Czech that we are helping our lovely customers.?\n`checkin` - Check in with all the Specialists.");
    });
    /*
     * bot sends out assigned ticket count when you @mention him and say 'zendesk ticket count' but this can easily be put inside a setTimeout every lunch time or something..
     */
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
            var url = 'https://' + zendeskDomain + '.zendesk.com/api/v2/users/' + user.zID + '/related.json';

            robot.http(url)
                .header('Authorization', auth)
                .get()(function(err, response, body) {
                    var jsonResponse = JSON.parse(body);
                    /*
                     * full response body
                     * {
                     *   user_related: {
                     *     ccd_tickets: 5,
                     *     assigned_tickets: 0,
                     *     topics: 0,
                     *     topic_comments: 0,
                     *     votes: 0,
                     *     subscriptions: 0,
                     *     entry_subscriptions: 0,
                     *     forum_subscriptions: 0,
                     *     organization_subscriptions: 0,
                     *     requested_tickets: 0
                     *   }
                     * }
                     */
                    var assignedTicketsCount = jsonResponse.user_related.assigned_tickets;
                    var message = '*' + user.name + '* - `' + assignedTicketsCount + '` outstanding tickets.';
                    summary += message + '\n';

                    robot.send({
                        room: user.sID
                    }, message);
                });
        });
        res.reply(summary);
    });
}
