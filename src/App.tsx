import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Authenticator } from '@aws-amplify/ui-react'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { fetchAuthSession } from 'aws-amplify/auth'
import outputs from "../amplify_outputs.json"
import '@aws-amplify/ui-react/styles.css'

function App() {
  const [count, setCount] = useState(0)

  const [text, setText] = useState("")



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


  return (
    <Authenticator>
      {({signOut,}) => (
      <main>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <p>

        <button onClick={invokeHelloWorld}>invokeHelloWorld</button>

        <div>{text}</div>

      </p>
      <button onClick={signOut}>Sign out</button>

      </main>
      )}
    </Authenticator>
  )
}

export default App

