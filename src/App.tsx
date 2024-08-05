import { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { Authenticator } from '@aws-amplify/ui-react'
import { InvokeCommand, InvokeWithResponseStreamCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { fetchAuthSession } from 'aws-amplify/auth'

import outputs from "../amplify_outputs.json"


function App() {
  const [text, setText] = useState("")
  const [prompt, setPrompt] = useState("")
  const [aiMessage, setAiMessage] = useState("")

  async function invokeHelloWorld() {

    const { credentials } = await fetchAuthSession()
    const awsRegion = outputs.auth.aws_region
    const functionName = outputs.custom.helloWorldFunctionName

    const labmda = new LambdaClient({ credentials: credentials, region: awsRegion })
    const command = new InvokeCommand({
      FunctionName: functionName,
    });
    const apiResponse = await labmda.send(command);

    if (apiResponse.Payload) {
      const payload = JSON.parse(new TextDecoder().decode(apiResponse.Payload))
      setText(payload.message)
    }
  }

  async function invokeBedrock() {

    const { credentials } = await fetchAuthSession()
    const awsRegion = outputs.auth.aws_region
    const functionName = outputs.custom.invokeBedrockFunctionName

    const labmda = new LambdaClient({ credentials: credentials, region: awsRegion })
    const command = new InvokeWithResponseStreamCommand({
      FunctionName: functionName,
      Payload: new TextEncoder().encode(JSON.stringify({ prompt: prompt }))
    })
    const apiResponse = await labmda.send(command);

    let completeMessage = ''
    if (apiResponse.EventStream) {
      for await (const item of apiResponse.EventStream) {
        if (item.PayloadChunk) {
          const payload = new TextDecoder().decode(item.PayloadChunk.Payload)
          completeMessage = completeMessage + payload
          setAiMessage(completeMessage)
        }
      }
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <div>
            <a href="https://docs.amplify.aws" target="_blank">
              <img src="https://docs.amplify.aws/assets/icon/favicon-purple-96x96.png" className="logo amplify" alt="Amplify logo" />
            </a>
            <a href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Amplify + Vite + React</h1>
          <p>
            Hello, {user?.signInDetails?.loginId}
            <br />
            <button onClick={signOut}>Sign Out</button>
          </p>
          <p>
            <button onClick={invokeHelloWorld}>invokeHelloWorld</button>
            <div>{text}</div>
          </p>
          <p>
            <textarea
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
              style={{ width: '50vw', textAlign: 'left' }}
            ></textarea>
            <br />
            <button onClick={invokeBedrock}>invokeBedrock</button>
            <div style={{ width: '50vw', textAlign: 'left' }}>{aiMessage}</div>
          </p>
        </>
      )}
    </Authenticator>
  )
}

export default App
