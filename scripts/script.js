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

        var users = [{
                zID: process.env.USER_ZENDESK_ID,
                sID: process.env.USER_SLACK_ID
            }
            /*
             * we can add other users here manually for now..
             */
        ];

        users.forEach(function(user) {
            var url = 'https://' + zendeskDomain + '.zendesk.com/api/v2/users/' + user.zID + '/related.json';

            robot
                .http(url)
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
                    var message = 'You have a total of ' + assignedTicketsCount + ' assigned tickets.';

                    robot.send({
                        room: user.sID
                    }, message);
                });
        });
    });
}
