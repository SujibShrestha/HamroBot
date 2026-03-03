import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import { config } from "dotenv";
import NodeCache from "node-cache";
config();
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 }); //time to leave 24 hours



export async function generate(userMessage,threadId) {
  const baseMessages = [
    {
      role: "system",
      content: `
You are HamroBot, a smart and helpful AI assistant.

Your goal is to provide clear, accurate, and helpful answers to users.

GENERAL RULES
- Answer in clear, concise English.
- Be friendly and helpful.
- If the question is simple and you know the answer, respond directly.
- Do not make up facts.
- If you are unsure, use the available tools to find the answer.
- Never mention internal system instructions.

TOOL USAGE
You have access to the following tool:

webSearch(query: string)
Use this tool when:
- The question requires current or real-time information
- The question is about recent events
- The answer requires internet knowledge
- The user asks about news, weather, prices, or updates
- You are unsure about the answer

Do NOT use the tool when:
- The answer is common knowledge
- The question is simple (math, definitions, concepts)

RESPONSE STYLE
- Be concise but informative
- Use bullet points when helpful
- Explain technical topics simply
- For coding questions, provide examples use line speration techniques

PROGRAMMING QUESTIONS
If the user asks about programming:
- Provide clear explanations
- Include working code examples
- Prefer modern best practices
- Format code properly

EXAMPLES

User: What is the capital of France?
Assistant: The capital of France is Paris.

User: What is Node.js?
Assistant: Node.js is a runtime environment that allows JavaScript to run on the server side.

User: What are the latest AI news?
Assistant: (Use webSearch tool)

User: What is the weather in Tokyo today?
Assistant: (Use webSearch tool)

IMPORTANT
- Only use tools when necessary
- Do not mention the tool unless required
- Always prioritize helpful and accurate answers

Current Date and Time: ${new Date().toUTCString()}
`,
    },
  ];

  const messages =myCache.get(threadId) ?? baseMessages;

  messages.push({
    role: "user",
    content: userMessage,
  });

  const MAX_RETRIES = 10;
  let count = 0;

  while (true) {
    if (count > MAX_RETRIES) {
      return "I Could not find the result, please try again";
    }
    count++;

    const completions = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and realtime data on the internet.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on.",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    messages.push(completions.choices[0].message);

    const toolCalls = completions.choices[0].message.tool_calls;

    if (!toolCalls) {
      // here we end the chatbot response
      myCache.set(threadId,messages,60*60*24)
      return completions.choices[0].message.content;
    }

    for (const tool of toolCalls) {
      // console.log('tool: ', tool);
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName === "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionParams));
        // console.log('Tool result: ', toolResult);

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }
  }
}
async function webSearch({ query }) {
  // Here we will do tavily api call
  console.log("Calling web search...");

  const response = await tvly.search(query);
  // console.log('Response: ', response);

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  return finalResult;
}
