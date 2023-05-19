import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useRef, useState } from 'react';
import useAutosizeTextArea from '../utils/useAutosizeTextArea';
import axios from 'axios';
import { summarizeText } from '@/utils/summarize';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [value, setValue] = useState('');
  const [summary, setSummary] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textAreaRef.current, value);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = event.target?.value;
    setValue(val);
  };

  const handleAPICall = async() => {
    console.log('___summarizing');
    try{
      const resp = await axios.post('https://summarizeai.vercel.app//api/summarizeConversation',{
        content: value
       });
       const summary = await resp.data;
       console.log('___summary', summary)
       setSummary(summary.summary);
    }catch(err){
      console.log('Error requesting ai api - ', err);
    }
   

  }
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className='mainForm'>
        <h1>SUMMARIZE AI</h1>
        <label htmlFor='review-text'>
          Copy and paste your transcript below:
        </label>
        <textarea
          id='review-text'
          onChange={handleChange}
          placeholder={`Insert transcript here...`}
          ref={textAreaRef}
          rows={1}
          value={value}
          className='textBox'
        />
        <button onClick={handleAPICall}>
          Summarize!
        </button>
      </div>
      {summary && (
        <div className='summary'>
          <h2>Summary:</h2>
          <pre>{summary}</pre>
        </div>
      )}
    </main>
  );
}
