//
// _________________________
// 
//       _     _           
//   ___|_|___| |_ ___ ___ 
//  |  _| | . |   | -_|  _|
//  |___|_|  _|_|_|___|_|  
//        |_|              
// 
// _____________ lukhuber __
//  


import { ErrorMapper } from "utils/ErrorMapper";


export const loop = ErrorMapper.wrapLoop(() => {
  console.log('cipher is running')
});
