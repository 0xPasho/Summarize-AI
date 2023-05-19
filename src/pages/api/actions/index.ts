import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import qs from 'qs';


const getUserInfo = async (user:any) => {
  
    const res = await axios.get(`https://slack.com/api/users.info?user=${user}`, {
     headers: {
       'Authorization': `Bearer ${process.env.ACCESS_TOKEN} `
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
   const username = await getUserInfo(user.id);

   const resp = await axios.post('https://summarizeai.vercel.app//api/summarizeConversation',{
    content: script
   });
   const summary = await resp.data;

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
         text: `*Summary✨*\n\n${summary.summary}`
       }
     }
   ];
 
   let message = {
     token: process.env.SLACK_ACCESS_TOKEN,
     channel: user.id,
     blocks: JSON.stringify(blocks)
   }
 
    await axios.post(`https://slack.com/api/chat.postMessage`, qs.stringify(message), {
     headers: {
       'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
    }});

 }
 

export default async function handler(req: NextApiRequest, response: NextApiResponse){
    const payload = JSON.parse(req.body.payload);
    const { user, message, channel} = payload; 

    axios.get(`https://slack.com/api/conversations.replies?channel=${channel.id}&ts=${message.ts}&include_all_metadata=true`, {
    headers: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
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

    response.status(200);

   
}