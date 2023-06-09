import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

const CHUNK_SIZE = 1050;
const BASE_PROMPT =
  "As an AI assistant, please carefully review the conversation and generate a comprehensive summary without any additional greetings that captures all important details, key decisions, action items, and any relevant information discussed in the thread or meeting transcript. Ensure that the summary provides a clear and concise overview while maintaining the context and chronological order of the conversation. Please make sure you don't add any other information that is not related to the summary, I don't want greetings or similars. Please do not omit any significant points or neglect important contributors. Your summary will help provide a concise reference to the entire conversation. Also the prompt I'm sending might have incompleted texts as is autogenerated, please try to understand the sentences and complete them.";

function chunkSubstr(str: string, size: number) {
  const numChunks = Math.ceil(str.length / size);
  const chunks: string[] = [];

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks.push(str.substr(o, size));
  }

  return chunks;
}

// Function to handle a chat completion API request
async function sendChatRequest(
  messages: ChatCompletionRequestMessage[]
): Promise<{ requestTextSummary?: string; error?: any }> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      n: 1,
      stop: "\n",
      max_tokens: 3000,
    });

    const requestTextSummary = response.data.choices[0].message?.content;
    return { requestTextSummary };
  } catch (error) {
    console.log({ error });
    return { error };
  }
}

function convertToPairs<T>(arr: Array<T>) {
  var pairs = [];
  for (var i = 0; i < arr.length; i += 2) {
    pairs.push(arr.slice(i, i + 2));
  }
  return pairs;
}

// Function to chunk the text and generate the summary
async function summarizeText(text: string) {
  const chunks = chunkSubstr(text, CHUNK_SIZE);

  let chunksInPairs = convertToPairs<string>(chunks);

  const INITIAL_CONVERSATION_DATA: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: BASE_PROMPT,
    },
  ];

  let conversation: ChatCompletionRequestMessage[] = INITIAL_CONVERSATION_DATA;

  let summary = "";

  for (const pair of chunksInPairs) {
    conversation.push({
      role: "user",
      content: pair[0],
    });
    if (pair[1]) {
      conversation.push({
        role: "user",
        content: pair[1],
      });
    }
    let { requestTextSummary: assistantReply, error } = await sendChatRequest(
      conversation
    );

    if (error) {
      // Let's try 3 times, if it fails, we throw the error
      for (let i = 0; i < 3; i++) {
        let { requestTextSummary: assistantReplyRetry, error: retryError } =
          await sendChatRequest(conversation);
        if (!error && assistantReplyRetry) {
          assistantReply = assistantReplyRetry;
          break;
        }
      }
      if (!assistantReply) {
        throw error;
      }
    }
    summary += assistantReply;
    conversation = INITIAL_CONVERSATION_DATA;
  }

  return summary;
}

export { summarizeText };
