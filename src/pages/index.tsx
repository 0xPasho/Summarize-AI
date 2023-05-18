import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useRef, useState } from 'react';
import useAutosizeTextArea from '../utils/useAutosizeTextArea';

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
          placeholder={`Bob: ...\nAlice: ...`}
          ref={textAreaRef}
          rows={1}
          value={value}
          className='textBox'
        />
        <button
          onClick={() => {
            //TODO: call api, probably something like below using awaits:
            //setSummary(res.body.summary);
            setSummary(value);
          }}
        >
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
