import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import qs from 'qs';

const access_token = 'xoxb-5278004101669-5305980338800-HLXxTY7Fqhw4uisHENjeYnJa';
const getUserInfo = async (user:any) => {
  
    const res = await axios.get(`https://slack.com/api/users.info?user=${user}`, {
     headers: {
       'Authorization': `Bearer ${access_token} `
     }
   })
   const data = await res.data;
   const userdata = data.user;
   return userdata.real_name;
 }
 
 
 const processMessages =async (messages:any) => {
   let script = '';

     for (const message of messages) {
       const username = await getUserInfo(message.user);
       script = script.concat(`${username}: ${message.text} \n`)
     }
   return script;
 }
 
 const sendMessage= async(script:String, user:any, initalMessage:any) => {
   const username = await getUserInfo(user.id)
    let blocks = [
     {
       type: 'section',
       text: {
         type: 'mrkdwn',
         text: `*Hi 👋* \n *Here is your thread summary! 🧵✨ related to: _${username}: ${initalMessage.text}_*\n\n`
       }
     },
     {
       type: 'section',
       text: {
         type: 'mrkdwn',
         text: `*Summary✨*\n\n${script}`
       }
     }
   ];
 
   let message = {
     token: process.env.SLACK_ACCESS_TOKEN,
     channel: user.id,
     blocks: JSON.stringify(blocks)
   }
 
   axios.post(`https://slack.com/api/chat.postMessage`, qs.stringify(message), {
     headers: {
       'Authorization': `Bearer ${access_token}`
     }}).then(res => console.log('success!'));
 }
 

export default async function handler(req: NextApiRequest, _res: NextApiResponse){
    const payload = req.body.payload;
    console.log(payload); 
    const payloadFormat =  JSON.parse(payload);
    const { user, message, channel} = payloadFormat; 
    console.log({ "user": user, "message": message, "channel": channel})

    axios.get(`https://slack.com/api/conversations.replies?channel=${channel.id}&ts=${message.ts}&include_all_metadata=true`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
    }).then(async(res) => {
        const { messages} = res.data;
        processMessages(messages).then(script => {
            sendMessage(script, user, message);
        }).catch(error => {
            console.error('Error in process messages',error);
        });
    })
    .catch((error) => {
        console.error('Error in getting replies',error)
    })
   
}