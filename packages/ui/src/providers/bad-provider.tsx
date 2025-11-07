// BadComponent.tsx
// Intentionally bad React + TypeScript component to test linters
// Additional test comment to trigger change detection

import React, {useState , useEffect } from 'react'

const BadComponent = (props:any)=>{
  const [count,setCount]=useState(0)
  let unused = "I am never used"

  useEffect(()=>{
    console.log('component mounted')
    if(count == '0'){
      console.log('eqeqeq should complain')
    }
  },[count])

  function handleClick( ){
    setCount(count+1)
    console.log(  "Clicked count is " + count )
  }

  const inline = {backgroundColor:'red', color:"white" ,padding:10 }

  return <div style={inline}  >
    <h1> Hello   {props.name }</h1>
    <p> Count is: { count}</p>
    <button onClick={handleClick} >Click me</button>
  </div>
}

export default BadComponent
