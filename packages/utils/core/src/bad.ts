// bad-code.ts
// intentionally messy TypeScript code to test linting rules

let foo = 123
const bar:any = 'hello'

function   test(   x :number ,y:any )
{
  console.log(  "sum is:",x+y )
  return x + y
}


const unusedVar = 42


for(let i=0;i<5;i++){
  let i = "shadowed"
  console.log("i is now",i)
}


if(foo == '123'){
  console.log("loose equality check should be ===")
}else{
  console . log ( 'spaces are inconsistent')
}


class person{
  name:string
  constructor(name:string){
    this.name = name
  }
  sayHi( ){
    console.log('hi my name is ' + this.name )
  }
}

const p = new person('annsshahbaz')
p.sayHi()
