import React, { useState, useContext } from 'react';
import {ConnectProvider, Connect} from 'react-connect-lines'

const GlobalStateContext = React.createContext();

const Service = ({setConfig, id, connectWith}) => {
  const [device, service] = id.split(".");
  const { setConnections } = useContext(GlobalStateContext);
  
  return(
    <Connect id={id} connectWith={connectWith}>
      <textarea id={id} onChange={(e) => {
        setConfig((config) => ({...config, [device]: {
          ...config[device],
          [service]: e.target.value
        }}))
        setConnections((connections) => ({...connections, [device]: {
          ...connections[device],
          [service]: [{id: e.target.value}]
        }}))
      }}/>
    </Connect>
  )
}

const Device = ({setConfig, id, connections}) => (
    <div style={{display: "flex", flexDirection: "column", margin: "30px"}}>
      <textarea onChange={(e) =>
        setConfig((config) => ({...config, [id]: e.target.value}))
      }/>

      <div style={{height: 100 }}/>

      <Service id={`${id}.ser0`} setConfig={setConfig} connectWith={connections["ser0"]}/>

      <div style={{height: 300 }}/>

      <Service id={`${id}.ser1`} setConfig={setConfig} connectWith={connections["ser1"]}/>
    </div>
);

const App = () => {
  const [config, setConfig] = useState({dev0: { }, dev1: "b"})
  const [connections, setConnections ] = useState({ // global
    dev0: { ser0: [{id: 'dev1.ser1'}] },
    dev1: {}
  })
  let pins // global

  return (
    <ConnectProvider>
      <GlobalStateContext.Provider value={{ connections, setConnections }}>
      
        <div style={{display: "flex", flexDirection: "row"}}>
          <Device setConfig={setConfig} id="dev0" connections={connections["dev0"]}/>
          <Device setConfig={setConfig} id="dev1" connections={connections["dev1"]}/>
        </div>
        
        <p>{JSON.stringify(config)}</p>
        <p>{JSON.stringify(connections)}</p>
      </GlobalStateContext.Provider>
    </ConnectProvider>  
  );
};

export default App;


// gehen mehrere devices derselben art?
// 3er-connection: dasselbe wie 2 verbindungen?
// pins: welche einstellungen