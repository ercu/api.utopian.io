import Post from './server/models/post.model';
import Moderator from './server/models/moderator.model';
import Sponsor from './server/models/sponsor.model';
import { calculatePayout } from './server/steemitHelpers';

import * as R from 'ramda';

import config from './config/config';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect(`${config.mongo.host}`);

const conn = mongoose.connection;
conn.once('open', function ()
{

  const paidRewardsDate = '1969-12-31T23:59:59';

  Moderator.list()
    .then(moderators => {
      if (moderators.length > 0) {
        moderators.forEach((moderator, moderatorsIndex) => {

          setTimeout(function() {

            let total_paid_rewards = 0;

            const query = {
              beneficiaries: {
                $elemMatch: {
                  account: moderator.account
                }
              },
              cashout_time:
                {
                  $eq: paidRewardsDate
                },
            };
            Post
              .countAll({ query })
              .then(count => {

                if (moderator.account == 'elear') {
                  console.log("POST COUNT ELEAR", count)
                }

                Post
                  .list({ skip: 0, limit: count, query })
                  .then(posts => {

                    if (moderator.account == 'elear') {
                      console.log("POST ELEARRRR", posts.length)
                    }

                    if(posts.length > 0) {
                      posts.forEach((post, postsIndex) => {
                        const beneficiary = R.find(R.propEq('account', moderator.account))(post.beneficiaries);
                        const payoutDetails = calculatePayout(post);
                        const authorPayouts = payoutDetails.authorPayouts || 0;
                        const payoutModerator = (authorPayouts * (beneficiary.weight / 100)) / 100;

                        total_paid_rewards = total_paid_rewards + payoutModerator;
                      });
                    }

                    Sponsor
                      .get(moderator.account)
                      .then(sponsor => {
                        console.log("-----MODERATOR-----", moderator.account)
                        console.log("POST COUNT", count);
                        console.log("total_paid_rewards", total_paid_rewards)
                        console.log("SPONSOR", sponsor ? sponsor.account : "NO");
                        if (sponsor) {
                          moderator.total_paid_rewards = sponsor.total_paid_rewards > total_paid_rewards ? sponsor.total_paid_rewards : total_paid_rewards;
                        } else {
                          moderator.total_paid_rewards = total_paid_rewards;
                        }
                        moderator.save().then(savedModerator => {
                          if ((moderatorsIndex + 1) === moderators.length) {
                            conn.close();
                            process.exit(0);
                          }
                        });
                      });

                  })
              });
          }, moderatorsIndex * 30000);
        });
      }
    });
});
